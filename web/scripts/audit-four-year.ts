// Run after build-dashboard.ts with the frozen four-year run configuration.
import fs from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { compareBenchmark } from "../lib/benchmarkComparison";
import { validateFreshDataset, type FreshDataset } from "../lib/freshValidation";
import { oversoldMetrics } from "../lib/oversoldStrategy";
import type { DashboardData } from "../app/dashboard/types";

const sha256 = (file: string) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const datasetFile = process.env.FRESH_DATASET;
assert(datasetFile, "Set FRESH_DATASET");
const dataset: FreshDataset = JSON.parse(fs.readFileSync(datasetFile, "utf8"));
const run = JSON.parse(fs.readFileSync("data/four-year-run.json", "utf8"));
const dashboard: DashboardData = JSON.parse(fs.readFileSync("data/dashboard-latest.json", "utf8"));
for (const [file, hash] of Object.entries(run.rules_sha256)) assert.equal(sha256(`../${file}`), hash);
assert.equal(sha256("data/universe.json"), run.universe_sha256);
assert.equal(dataset.universeSha256, run.universe_sha256);
for (const key of ["startDate", "endDate", "exitProfile", "startCash", "feeBps", "maxPositions", "rebalanceEveryNDays"] as const) {
  assert.equal(dashboard.config[key], run[key], `Run configuration mismatch: ${key}`);
}
const entries = JSON.parse(fs.readFileSync("data/universe.json", "utf8")).entries as Array<{symbol: string}>;
const quality = validateFreshDataset(dataset, entries.map((e) => e.symbol), run.endDate);
const curve = dashboard.equityCurve;
const index = dataset.benchmark.filter((b) => b.date >= run.startDate && b.date <= run.endDate);
assert.deepEqual(curve.map((b) => b.date), index.map((b) => b.date), "Incomplete four-year trading calendar");
assert.equal(curve[0].date, "2022-09-05");
assert.equal(curve.at(-1)!.date, run.endDate);
for (const bar of curve) {
  const value = Object.values(bar.positions).reduce((sum, p) => sum + p.shares * p.price, 0);
  assert(Math.abs(value + bar.cash - bar.equity) < 1e-6);
  assert(bar.cash >= -1e-7);
  assert(value / bar.equity <= bar.exposureLimitPct! / 100 + 1e-8 || bar.riskBreach);
}
const buys = dashboard.trades.filter((t) => t.side === "buy");
for (const trade of buys) {
  const s = dataset.series.find((s) => s.entry.symbol === trade.symbol)!;
  const closes = s.klines.filter((k) => k.date < trade.date).map((k) => k.close);
  assert(oversoldMetrics({symbol: trade.symbol, closes})?.oversold, `Invalid entry: ${trade.symbol} ${trade.date}`);
}
const comparison = compareBenchmark(curve, dataset.benchmark, run.startCash)!;
assert.equal(comparison.observations, curve.length);
const annual = dashboard.annualComparison!;
assert(annual?.length === 5, "Four rolling years cross five calendar years");
for (const metric of ["strategyReturnPct", "benchmarkReturnPct"] as const) {
  const compounded = (annual.reduce((v, y) => v * (1 + y[metric] / 100), 1) - 1) * 100;
  assert(Math.abs(compounded - comparison[metric]) < 1e-8, `Annual returns do not reconcile: ${metric}`);
}
const limitedWarmup = dataset.series.map((s) => ({
  symbol: s.entry.symbol, firstDate: s.klines[0].date,
  warmupBars: s.klines.filter((k) => k.date < run.startDate).length,
})).filter((s) => s.warmupBars < 60);
const { curve: _, ...metrics } = comparison;
const audit = {
  generatedAt: new Date().toISOString(), run, source: dataset.source, fetchedAt: dataset.fetchedAt,
  datasetSha256: sha256(datasetFile), dashboardSha256: sha256("data/dashboard-latest.json"),
  sourceFiles: dataset.sourceFiles, quality, limitedWarmup,
  priceRows: dataset.series.reduce((sum, s) => sum + s.klines.length, 0),
  tradingDays: curve.length, auditedBuys: buys.length,
  riskBreachDays: curve.filter((b) => b.riskBreach).length,
  maxExposurePct: Math.max(...curve.map((b) => (b.equity - b.cash) / b.equity * 100)),
  metrics, annualComparison: annual, stats: dashboard.stats,
  methodology: "Rolling four-year continuous cash-start replay; current fixed universe; frozen trend120; actual announcement-date financials; price history before the start is warmup only. Historical descriptive backtest, not forward performance. Existing short-window validation retains its separate 2024-start path.",
};
fs.writeFileSync("data/four-year-audit.json", JSON.stringify(audit, null, 2) + "\n");
console.log(JSON.stringify({...metrics, tradingDays: curve.length, limitedWarmup, auditedBuys: buys.length, riskBreachDays: audit.riskBreachDays}));
console.table(annual);
