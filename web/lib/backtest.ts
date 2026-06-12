// Bar-by-bar backtest engine. Walks the price series forward, asks DeepSeek
// for signals every `rebalanceEveryNDays` bars and applies them to a virtual
// portfolio. Look-ahead rules: signals at rebalance date D see closes strictly
// BEFORE D (you cannot compute a signal from a close and then trade at that
// same close), and fundamentals are excluded entirely — we only have today's
// snapshot, which would leak future valuations into historical decisions.
//
// Signals are cached by (model, messages) hash, so re-running the same
// backtest is free in tokens — only adding new bars or symbols pays cost.
import type { Kline } from "./pyserver";
import { scoreSymbols, type SymbolSnapshot, type Signal } from "./deepseek";
import type { UniverseEntry } from "./universe";

export interface BacktestConfig {
  startCash: number;
  rebalanceEveryNDays: number;
  startDate: string;         // YYYY-MM-DD
  endDate: string;
  feeBps: number;            // round-trip in basis points
  maxPositions: number;
}

export interface PortfolioBar {
  date: string;
  equity: number;
  cash: number;
  positions: Record<string, { shares: number; price: number }>;
}

export interface BacktestResult {
  config: BacktestConfig;
  equityCurve: PortfolioBar[];
  trades: Array<{
    date: string;
    symbol: string;
    side: "buy" | "sell";
    shares: number;
    price: number;
  }>;
  signalsByDate: Record<string, Signal[]>;
  stats: {
    totalReturnPct: number;
    cagrPct: number;
    maxDrawdownPct: number;
    sharpe: number;
    trades: number;
  };
}

export interface SymbolSeries {
  entry: UniverseEntry;
  klines: Kline[];
}

// Union of all series' dates. An intersection would let a single suspended
// (停牌) or late-listed symbol delete whole stretches of the portfolio clock —
// months of marks vanish and CAGR/Sharpe are computed over a warped calendar.
// Symbols without a bar on a given date simply can't trade that day.
function unionTradingDates(series: SymbolSeries[]): string[] {
  const all = new Set<string>();
  series.forEach((s) => s.klines.forEach((k) => all.add(k.date)));
  return [...all].sort();
}

function indexByDate(klines: Kline[]) {
  const m = new Map<string, Kline>();
  for (const k of klines) m.set(k.date, k);
  return m;
}

// A-share daily price-limit (涨跌停) thresholds by board, as a fraction of the
// prior close. Main board ±10% (ST ±5%), 科创板/创业板 ±20%, 北交所 ±30%.
export function priceLimitFraction(symbol: string, name: string): number {
  const code = symbol.replace(/^(sh|sz|bj)/i, "").replace(/\.(sh|sz|bj)$/i, "");
  if (/^(688|300|301)/.test(code)) return 0.2; // 科创板 / 创业板
  if (/^(4|8|92)/.test(code)) return 0.3; // 北交所
  return /ST/i.test(name) ? 0.05 : 0.1; // 主板（ST 减半）
}

// Klines are 前复权 (qfq) adjusted, which preserves daily returns, so a 涨/跌停
// lock still shows up as a move at the board limit. The 0.3pp slack absorbs the
// exchange's 0.01-yuan rounding of the limit price.
const LIMIT_SLACK = 0.003;

export type Progress =
  | { phase: "signals"; done: number; total: number }
  | { phase: "simulating"; done: number; total: number };

export type Scorer = (
  snapshots: SymbolSnapshot[],
  opts: { asOf: string; mode: "backtest" },
) => Promise<Signal[]>;

export interface RunBacktestOptions {
  onProgress?: (p: Progress) => void;
  /** Override the LLM scorer — used by tests to inject deterministic signals. */
  scorer?: Scorer;
}

export async function runBacktest(
  series: SymbolSeries[],
  cfg: BacktestConfig,
  optsOrOnProgress?: RunBacktestOptions | ((p: Progress) => void),
): Promise<BacktestResult> {
  const opts: RunBacktestOptions = typeof optsOrOnProgress === "function"
    ? { onProgress: optsOrOnProgress }
    : (optsOrOnProgress ?? {});
  const onProgress = opts.onProgress;
  const scorer: Scorer = opts.scorer ?? scoreSymbols;
  const dates = unionTradingDates(series).filter(
    (d) => d >= cfg.startDate && d <= cfg.endDate,
  );
  if (dates.length < 5) {
    throw new Error(`Not enough aligned trading days (${dates.length}) in window`);
  }

  const byDate = series.map((s) => indexByDate(s.klines));
  const symbols = series.map((s) => s.entry.symbol);
  const symbolIndex = new Map(symbols.map((s, j) => [s, j] as const));

  // Prior-close lookup built from the FULL series so the first in-window bar
  // still resolves a previous close for limit detection.
  const prevCloseByDate = series.map((s) => {
    const sorted = [...s.klines].sort((a, b) => (a.date < b.date ? -1 : 1));
    const m = new Map<string, number>();
    for (let k = 1; k < sorted.length; k++) m.set(sorted[k].date, sorted[k - 1].close);
    return m;
  });
  const limitFrac = series.map((s) => priceLimitFraction(s.entry.symbol, s.entry.name));
  const dayReturn = (j: number, date: string, close: number): number | null => {
    const prev = prevCloseByDate[j].get(date);
    if (prev === undefined || prev <= 0) return null;
    return close / prev - 1;
  };
  const atLimitUp = (j: number, date: string, close: number): boolean => {
    const r = dayReturn(j, date, close);
    return r !== null && r >= limitFrac[j] - LIMIT_SLACK;
  };
  const atLimitDown = (j: number, date: string, close: number): boolean => {
    const r = dayReturn(j, date, close);
    return r !== null && r <= -(limitFrac[j] - LIMIT_SLACK);
  };

  const t0 = Date.now();
  // Pre-fetch ALL rebalance signals in parallel. Signals at date D depend
  // only on price history <= D, never on what we held — independent calls.
  // Cached entries return instantly; uncached fire concurrently (bounded).
  const rebalanceDates = dates.filter((_, i) => i % cfg.rebalanceEveryNDays === 0);
  const signalsByDate: Record<string, Signal[]> = {};
  const CONCURRENCY = 6;
  let signalsDone = 0;
  onProgress?.({ phase: "signals", done: 0, total: rebalanceDates.length });
  for (let i = 0; i < rebalanceDates.length; i += CONCURRENCY) {
    const slice = rebalanceDates.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      slice.map(async (d) => {
        const snapshots: SymbolSnapshot[] = series
          .map((s) => {
            // Strictly before d: the decision is made knowing yesterday's
            // close, then executed at today's. No fundamentals — see header.
            const upto = s.klines.filter((k) => k.date < d);
            return {
              symbol: s.entry.symbol,
              name: s.entry.name,
              theme: s.entry.theme,
              closes: upto.map((k) => k.close),
            };
          })
          .filter((s) => s.closes.length > 0); // not yet listed as of d
        const sigs = await scorer(snapshots, { asOf: d, mode: "backtest" });
        signalsDone++;
        onProgress?.({ phase: "signals", done: signalsDone, total: rebalanceDates.length });
        return [d, sigs] as const;
      }),
    );
    for (const [d, sigs] of results) signalsByDate[d] = sigs;
  }
  console.log(
    `[backtest] fetched ${rebalanceDates.length} rebalance signals in ${
      ((Date.now() - t0) / 1000).toFixed(1)
    }s (concurrency=${CONCURRENCY})`,
  );

  let cash = cfg.startCash;
  const shares: Record<string, number> = Object.fromEntries(symbols.map((s) => [s, 0]));
  // Sells blocked by a 跌停 lock or 停牌; retried each bar until tradable.
  const pendingSell: Record<string, boolean> = {};
  // Last traded close per symbol, for marking positions on days it has no bar.
  const lastPrice: Record<string, number> = {};
  const equityCurve: PortfolioBar[] = [];
  const trades: BacktestResult["trades"] = [];
  const fee = cfg.feeBps / 10_000;

  const progressEvery = Math.max(1, Math.floor(dates.length / 20));
  onProgress?.({ phase: "simulating", done: 0, total: dates.length });
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    if (i % progressEvery === 0 || i === dates.length - 1) {
      onProgress?.({ phase: "simulating", done: i + 1, total: dates.length });
    }
    // Symbols without a bar today (停牌, not yet listed) get no price entry
    // and are untradable; held positions mark at their last traded close.
    const prices: Record<string, number> = {};
    for (let j = 0; j < symbols.length; j++) {
      const k = byDate[j].get(date);
      if (k) {
        prices[symbols[j]] = k.close;
        lastPrice[symbols[j]] = k.close;
      }
    }

    const isRebalance = i % cfg.rebalanceEveryNDays === 0;
    const signals = isRebalance ? signalsByDate[date] ?? [] : [];

    // A fresh buy decision supersedes a sell deferred from an earlier
    // rebalance — otherwise the stale deferral force-dumps the position the
    // newer signal just (re)built, paying fees both ways.
    for (const sig of signals) {
      if (sig.action === "buy" && pendingSell[sig.symbol]) {
        pendingSell[sig.symbol] = false;
      }
    }

    // Retry sells deferred by a prior 跌停/停牌 as soon as the name trades again.
    for (const sym of symbols) {
      if (!pendingSell[sym]) continue;
      const held = shares[sym] ?? 0;
      if (held <= 0) {
        pendingSell[sym] = false;
        continue;
      }
      const j = symbolIndex.get(sym)!;
      const px = prices[sym];
      if (px === undefined) continue; // 停牌 — keep waiting
      if (atLimitDown(j, date, px)) continue; // still 跌停 — keep waiting
      cash += held * px * (1 - fee);
      trades.push({ date, symbol: sym, side: "sell", shares: held, price: px });
      shares[sym] = 0;
      pendingSell[sym] = false;
    }

    if (isRebalance) {
      // Sells first to free cash
      for (const sig of signals) {
        if (sig.action !== "sell") continue;
        const held = shares[sig.symbol] ?? 0;
        if (held <= 0) continue;
        const j = symbolIndex.get(sig.symbol);
        const px = prices[sig.symbol];
        // 停牌 — no market today; defer like a 跌停 lock.
        if (px === undefined) {
          pendingSell[sig.symbol] = true;
          continue;
        }
        // 跌停 — no buyers, can't sell today; defer and retry on later bars.
        if (j !== undefined && atLimitDown(j, date, px)) {
          pendingSell[sig.symbol] = true;
          continue;
        }
        cash += held * px * (1 - fee);
        trades.push({ date, symbol: sig.symbol, side: "sell", shares: held, price: px });
        shares[sig.symbol] = 0;
        pendingSell[sig.symbol] = false;
      }

      // Rank buys by confidence*size, cap at maxPositions. 涨停 names are
      // unfillable (no sellers), so drop them here and let a tradable name
      // take the slot rather than reserving cash for an order that can't fill.
      const buys = signals
        .filter((s) => {
          if (s.action !== "buy" || s.size <= 0) return false;
          if (prices[s.symbol] === undefined) return false; // 停牌/未上市
          const j = symbolIndex.get(s.symbol);
          return !(j !== undefined && atLimitUp(j, date, prices[s.symbol]));
        })
        .sort((a, b) => b.confidence * b.size - a.confidence * a.size)
        .slice(0, cfg.maxPositions);

      const totalWeight = buys.reduce((sum, s) => sum + s.size * s.confidence, 0) || 1;
      const budget = cash;
      for (const sig of buys) {
        const weight = (sig.size * sig.confidence) / totalWeight;
        const alloc = budget * weight;
        const px = prices[sig.symbol];
        if (!px || alloc <= 0) continue;
        const sh = Math.floor(alloc / (px * (1 + fee)) / 100) * 100; // round to 100-lot
        if (sh <= 0) continue;
        const cost = sh * px * (1 + fee);
        if (cost > cash) continue;
        cash -= cost;
        shares[sig.symbol] = (shares[sig.symbol] ?? 0) + sh;
        trades.push({ date, symbol: sig.symbol, side: "buy", shares: sh, price: px });
        pendingSell[sig.symbol] = false;
      }
    }

    // Mark-to-market (suspended names mark at last traded close)
    let equity = cash;
    const positions: PortfolioBar["positions"] = {};
    for (const sym of symbols) {
      if (shares[sym] > 0) {
        const px = prices[sym] ?? lastPrice[sym];
        equity += shares[sym] * px;
        positions[sym] = { shares: shares[sym], price: px };
      }
    }
    equityCurve.push({ date, equity, cash, positions });
  }

  // Stats
  const equities = equityCurve.map((b) => b.equity);
  const start = equities[0];
  const end = equities[equities.length - 1];
  const totalReturnPct = (end / start - 1) * 100;
  // Calendar span, not bar count: bar count undercounts elapsed time whenever
  // the union calendar has gaps (suspensions, holidays), overstating CAGR.
  const spanMs = Date.parse(equityCurve.at(-1)!.date) - Date.parse(equityCurve[0].date);
  const years = Math.max(spanMs / (365.25 * 24 * 3600 * 1000), 1 / 252);
  const cagrPct = (Math.pow(end / start, 1 / years) - 1) * 100;

  let peak = start;
  let maxDD = 0;
  for (const e of equities) {
    peak = Math.max(peak, e);
    maxDD = Math.min(maxDD, e / peak - 1);
  }

  const rets: number[] = [];
  for (let i = 1; i < equities.length; i++) {
    rets.push(equities[i] / equities[i - 1] - 1);
  }
  const mean = rets.reduce((a, b) => a + b, 0) / (rets.length || 1);
  const variance =
    rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length || 1);
  const std = Math.sqrt(variance);
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;

  return {
    config: cfg,
    equityCurve,
    trades,
    signalsByDate,
    stats: {
      totalReturnPct,
      cagrPct,
      maxDrawdownPct: maxDD * 100,
      sharpe,
      trades: trades.length,
    },
  };
}
