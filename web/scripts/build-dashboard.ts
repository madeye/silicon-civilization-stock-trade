// Build the dashboard backtest data file using cached data-source CSVs.
//
// Data fetching is done by the agent via the kimi-datasource MCP plugin because
// the plugin is only available in the agent runtime. The fetched CSVs should be
// placed in:
//   web/.cache/datasource/prices/      (one CSV per batch from get_price)
//   web/.cache/datasource/financials/  (growth + profitability CSVs)
//
// Then run:
//   cd web && npx tsx scripts/build-dashboard.ts
//
// Env overrides:
//   DASHBOARD_START=2024-01-01  DASHBOARD_END=2026-06-12
//   DASHBOARD_REBALANCE=30      DASHBOARD_MAX_POSITIONS=6
//   DASHBOARD_MIN_HOLD_BARS=45  DASHBOARD_REBALANCE_THRESHOLD_PCT=5
//   DASHBOARD_CACHE=.cache/datasource
import fs from "node:fs";
import path from "node:path";
import { loadEntries } from "../lib/universe";
import { runBacktest, type BacktestConfig, type BacktestResult } from "../lib/backtest";
import { ruleBasedScorer } from "../lib/dashboardBacktest";
import { buildSymbolSeries, type PriceRow } from "../lib/dashboardData";

const today = new Date().toISOString().slice(0, 10);
const startDate = process.env.DASHBOARD_START ?? "2024-01-01";
const endDate = process.env.DASHBOARD_END ?? today;
const rebalanceEveryNDays = Number(process.env.DASHBOARD_REBALANCE ?? 30);
const maxPositions = Number(process.env.DASHBOARD_MAX_POSITIONS ?? 6);
const minHoldBars = Number(process.env.DASHBOARD_MIN_HOLD_BARS ?? 45);
const rebalanceThresholdPct = Number(process.env.DASHBOARD_REBALANCE_THRESHOLD_PCT ?? 5);
const cacheDir = path.resolve(process.cwd(), process.env.DASHBOARD_CACHE ?? ".cache/datasource");
const outFile = path.resolve(process.cwd(), "data", "dashboard-backtest.json");

interface DashboardOutput {
  generated_at: string;
  config: BacktestConfig;
  stats: BacktestResult["stats"];
  equityCurve: BacktestResult["equityCurve"];
  benchmarkCurve: Array<{ date: string; equity: number }>;
  trades: BacktestResult["trades"];
  themePerformance: Array<{
    theme: string;
    returnPct: number;
    realizedPct: number;
    unrealizedPct: number;
    allocationDays: number;
    avgWeightPct: number;
  }>;
  signalsByDate: BacktestResult["signalsByDate"];
  latestHoldings: BacktestResult["equityCurve"][number]["positions"];
  latestDate: string;
}

function computeBenchmarkCurve(benchmark: PriceRow[], cfg: BacktestConfig) {
  const sorted = [...benchmark].sort((a, b) => (a.date < b.date ? -1 : 1));
  const inWindow = sorted.filter((r) => r.date >= cfg.startDate && r.date <= cfg.endDate);
  if (inWindow.length === 0) return [];
  const startCash = cfg.startCash;
  const startPrice = inWindow[0].close;
  const shares = startCash / startPrice;
  return inWindow.map((r) => ({ date: r.date, equity: shares * r.close }));
}

function computeThemePerformance(
  result: BacktestResult,
  series: Array<{ entry: { symbol: string; theme: string } }>,
): DashboardOutput["themePerformance"] {
  const themeMap = new Map(series.map((s) => [s.entry.symbol, s.entry.theme]));
  const realized: Record<string, number> = {};
  const unrealized: Record<string, number> = {};
  const allocationDays: Record<string, number> = {};
  const weights: Record<string, number> = {};

  // Track cost basis per symbol using FIFO so we can compute both realized and
  // unrealized P&L per theme.
  const positions: Record<string, { shares: number; cost: number }> = {};
  for (const t of result.trades) {
    const theme = themeMap.get(t.symbol) ?? "未分类";
    realized[theme] ??= 0;
    positions[t.symbol] ??= { shares: 0, cost: 0 };
    if (t.side === "buy") {
      positions[t.symbol].shares += t.shares;
      positions[t.symbol].cost += t.shares * t.price;
    } else {
      const pos = positions[t.symbol];
      if (pos.shares > 0) {
        const avgCost = pos.cost / pos.shares;
        const sold = Math.min(t.shares, pos.shares);
        realized[theme] += sold * (t.price - avgCost);
        pos.cost -= sold * avgCost;
        pos.shares -= sold;
      }
    }
  }

  // Unrealized P&L for positions still open at the end of the backtest.
  const lastBar = result.equityCurve[result.equityCurve.length - 1];
  for (const [sym, pos] of Object.entries(positions)) {
    if (pos.shares <= 0) continue;
    const theme = themeMap.get(sym) ?? "未分类";
    const latestPrice = lastBar.positions[sym]?.price;
    if (latestPrice === undefined) continue;
    const avgCost = pos.cost / pos.shares;
    unrealized[theme] ??= 0;
    unrealized[theme] += pos.shares * (latestPrice - avgCost);
  }

  // Average allocation weight per theme.
  for (const bar of result.equityCurve) {
    const totalEquity = bar.equity || 1;
    for (const [sym, pos] of Object.entries(bar.positions)) {
      const theme = themeMap.get(sym) ?? "未分类";
      allocationDays[theme] ??= 0;
      weights[theme] ??= 0;
      allocationDays[theme] += 1;
      weights[theme] += (pos.shares * pos.price) / totalEquity;
    }
  }

  const allThemes = new Set([
    ...Object.keys(realized),
    ...Object.keys(unrealized),
    ...Object.keys(allocationDays),
  ]);
  return [...allThemes].map((theme) => {
    const r = realized[theme] ?? 0;
    const u = unrealized[theme] ?? 0;
    return {
      theme,
      returnPct: (r + u) / (result.config.startCash || 1) * 100,
      realizedPct: r / (result.config.startCash || 1) * 100,
      unrealizedPct: u / (result.config.startCash || 1) * 100,
      allocationDays: allocationDays[theme] ?? 0,
      avgWeightPct: allocationDays[theme] ? (weights[theme] / allocationDays[theme]) * 100 : 0,
    };
  });
}

async function main() {
  if (!fs.existsSync(cacheDir)) {
    console.error(`Cache directory not found: ${cacheDir}`);
    console.error(
      "Please fetch data-source CSVs first. See AGENTS.md for the dashboard data-fetching steps.",
    );
    process.exit(1);
  }

  const universe = loadEntries();
  console.log(`Loaded ${universe.length} universe entries`);

  const { series, benchmark } = buildSymbolSeries(universe, cacheDir);
  console.log(`Built ${series.length} price series, benchmark ${benchmark.length} bars`);

  if (series.length === 0) {
    console.error("No usable price series found. Check cached CSVs in", cacheDir);
    process.exit(1);
  }

  const cfg: BacktestConfig = {
    startCash: 1_000_000,
    rebalanceEveryNDays,
    startDate,
    endDate,
    feeBps: 10,
    maxPositions,
    autoSellUnselected: true,
    minHoldBars,
    rebalanceThresholdPct,
  };

  const result = await runBacktest(series, cfg, { scorer: ruleBasedScorer() });
  const benchmarkCurve = computeBenchmarkCurve(benchmark, cfg);

  const lastBar = result.equityCurve[result.equityCurve.length - 1];
  const output: DashboardOutput = {
    generated_at: new Date().toISOString(),
    config: cfg,
    stats: result.stats,
    equityCurve: result.equityCurve,
    benchmarkCurve,
    trades: result.trades,
    themePerformance: computeThemePerformance(result, series),
    signalsByDate: result.signalsByDate,
    latestHoldings: lastBar.positions,
    latestDate: lastBar.date,
  };

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(`Wrote dashboard backtest to ${outFile}`);
  console.log(
    `Return: ${result.stats.totalReturnPct.toFixed(2)}%  ` +
      `CAGR: ${result.stats.cagrPct.toFixed(2)}%  ` +
      `MaxDD: ${result.stats.maxDrawdownPct.toFixed(2)}%  ` +
      `Sharpe: ${result.stats.sharpe.toFixed(2)}  ` +
      `Trades: ${result.stats.trades}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
