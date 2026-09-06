import type { Signal, SymbolSnapshot } from "./deepseek";

export const STRATEGY_VERSION = "oversold-v1" as const;
// Exit-only research profiles. Entry thresholds and portfolio limits stay fixed.
export type ExitProfile = "rebound" | "trend60" | "trend120";
export const EXIT_PROFILES = Object.freeze({
  rebound: { maxHoldBars: 20, trailingStop: null },
  trend60: { maxHoldBars: 60, trailingStop: 0.12 },
  trend120: { maxHoldBars: 120, trailingStop: 0.15 },
});
export const POSITION_RULES = Object.freeze({
  normalCap: 0.45,
  extremeCap: 0.8,
  singleCap: 0.15,
  buyStep: 0.05,
  stopLoss: 0.08,
  maxHoldBars: 20,
});
export const STRATEGY_SUMMARY = "仅超跌买入；常态总仓位上限 45%，广泛深度超跌时上限 80%；单股上限 15%，每次加仓不超过总资产的 5%。";

/** Wilder RSI, initialized with the first 14 changes. Flat prices give 50. */
export function rsi14(closes: number[]): number {
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (i <= 14) {
      gain += Math.max(0, change) / 14;
      loss += Math.max(0, -change) / 14;
    } else {
      gain = (gain * 13 + Math.max(0, change)) / 14;
      loss = (loss * 13 + Math.max(0, -change)) / 14;
    }
  }
  return loss === 0 ? (gain === 0 ? 50 : 100) : 100 - 100 / (1 + gain / loss);
}

export function oversoldMetrics(snapshot: SymbolSnapshot) {
  const closes = snapshot.closes;
  if (snapshot.stale || closes.length < 60 || closes.some((v) => !Number.isFinite(v) || v <= 0)) return null;
  const close = closes.at(-1)!;
  const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const deviation = close / ma20 - 1;
  const drawdown = close / Math.max(...closes.slice(-60)) - 1;
  const rsi = rsi14(closes);
  const oversold = rsi <= 30 && deviation <= -0.08 && drawdown <= -0.15;
  const severe = rsi <= 20 && deviation <= -0.12 && drawdown <= -0.25;
  return { close, ma20, rsi, deviation, drawdown, oversold, severe };
}

export function qualityAllowed(s: SymbolSnapshot): boolean {
  if (/^(?:\*?ST)(?![A-Za-z])|退/i.test(s.name ?? "")) return false;
  // Missing point-in-time financials do not masquerade as known good reports.
  // Price-only backtests are allowed; known negative/invalid values veto buys.
  return [s.fundamental?.pe_ttm, s.fundamental?.profit_yoy]
    .every((v) => v == null || (Number.isFinite(v) && v > 0));
}

export function marketRegime(snapshots: SymbolSnapshot[]) {
  const metrics = snapshots.map((s) => ({ s, m: oversoldMetrics(s) }));
  const valid = metrics.filter(({ m }) => m !== null);
  const severeCount = valid.filter(({ s, m }) => m!.severe && qualityAllowed(s)).length;
  // Coverage requirement prevents a small surviving subset from enabling 80%.
  const extreme = valid.length >= 3 && valid.length >= snapshots.length * 0.8 &&
    severeCount >= 3 && severeCount / valid.length >= 0.3;
  return { cap: extreme ? POSITION_RULES.extremeCap : POSITION_RULES.normalCap, extreme, severeCount };
}

/** Absolute target weights of total equity, never fractions of free cash. */
export function oversoldSignals(snapshots: SymbolSnapshot[], proposals?: Signal[], exitProfile: ExitProfile = "rebound"): Signal[] {
  const cap = marketRegime(snapshots).cap;
  const proposed = new Map((Array.isArray(proposals) ? proposals : [])
    .filter((s) => s && typeof s.symbol === "string")
    .map((s) => [s.symbol, s]));
  const signals: Signal[] = snapshots.map((s) => {
    const m = oversoldMetrics(s);
    const p = proposed.get(s.symbol);
    const base = { symbol: s.symbol, confidence: 0, size: 0 };
    if (!qualityAllowed(s)) return { ...base, action: "sell", rationale: "风险标记或已知基本面不合格" };
    if (!m) return { ...base, action: "hold", rationale: "日线不足60根、无效或停更，禁止新买入" };
    if (p?.action === "sell" || (exitProfile === "rebound" && (m.close >= m.ma20 || m.rsi >= 50))) {
      return { ...base, action: "sell", rationale: p?.action === "sell" ? "模型建议退出" : "反弹至MA20或RSI恢复至50，退出" };
    }
    if (!m.oversold) return { ...base, action: "hold", rationale: "未同时满足RSI≤30、MA20偏离≤-8%、60日回撤≥15%" };
    if (proposals !== undefined && (p?.action !== "buy" || !Number.isFinite(p.confidence) ||
      p.confidence <= 0 || !Number.isFinite(p.size) || p.size <= 0)) {
      return { ...base, action: "hold", rationale: "超跌已出现，模型未确认买入" };
    }
    return {
      symbol: s.symbol, action: "buy", size: 0,
      confidence: proposals ? Math.min(1, p!.confidence) : Math.min(1, 0.5 + (-m.drawdown) / 2),
      rationale: `${m.severe ? "深度" : "普通"}超跌 RSI${m.rsi.toFixed(0)} 偏离${(m.deviation * 100).toFixed(1)}% 回撤${(-m.drawdown * 100).toFixed(1)}%`,
    };
  });
  const buys = signals.filter((s) => s.action === "buy");
  // Equal targets avoid a model's confidence/size changing the risk budget.
  for (const s of buys) s.size = Math.min(POSITION_RULES.singleCap, cap / buys.length);
  return signals.sort((a, b) => b.confidence - a.confidence);
}
