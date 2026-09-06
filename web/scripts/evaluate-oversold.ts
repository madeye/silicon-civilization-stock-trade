// Small, declared exit-only experiment. Select on 2024; never reselect using
// 2025/2026 results. These dates have already been inspected in this project,
// so this is historical holdout analysis, not genuinely unseen live evidence.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { buildSymbolSeries } from "../lib/dashboardData";
import { loadEntries } from "../lib/universe";
import { ruleBasedScorer } from "../lib/dashboardBacktest";
import { runBacktest } from "../lib/backtest";
import { compareBenchmark } from "../lib/benchmarkComparison";
import { oversoldMetrics, type ExitProfile } from "../lib/oversoldStrategy";

async function main() {
  const cache = path.resolve(process.env.DASHBOARD_CACHE ?? ".cache/datasource");
  const universe = loadEntries();
  const { series: loaded, benchmark } = buildSymbolSeries(universe, cache);
  const bySymbol = new Map(loaded.map((s) => [s.entry.symbol, s]));
  const series = universe.map((entry) => bySymbol.get(entry.symbol) ?? { entry, klines: [] });
  const index = benchmark.map((b) => ({date: b.date, equity: b.close}));
  const indexEnd = index.at(-1)?.date;
  if (!indexEnd || indexEnd < "2026-01-05") throw new Error("Insufficient 2026 index data");
  const windows = {
    development: ["2024-01-01", "2024-12-31"],
    validation: ["2025-01-01", "2025-12-31"],
    holdout: ["2026-01-01", indexEnd],
  } as const;
  const run = async (profile: ExitProfile, window: keyof typeof windows, feeBps = 10) => {
    const [startDate, endDate] = windows[window];
    const result = await runBacktest(series, {
      startCash: 1_000_000, startDate, endDate, feeBps,
      maxPositions: 6, rebalanceEveryNDays: 1, exitProfile: profile,
    }, {scorer: ruleBasedScorer(profile)});
    const comparison = compareBenchmark(result.equityCurve, index, result.config.startCash);
    if (!comparison) throw new Error("No comparable dates");
    const {curve: _, ...metrics} = comparison;
    for (const bar of result.equityCurve) {
      const exposure = (bar.equity - bar.cash) / bar.equity * 100;
      assert(exposure <= bar.exposureLimitPct! + 1e-7 || bar.riskBreach);
    }
    for (const t of result.trades.filter((t) => t.side === "buy")) {
      const s = bySymbol.get(t.symbol)!;
      assert(oversoldMetrics({symbol: t.symbol, closes: s.klines.filter((k) => k.date < t.date).map((k) => k.close)})?.oversold);
    }
    const row = {profile, window, feeBps, ...metrics, trades: result.trades.length,
      riskBreachDays: result.equityCurve.filter((b) => b.riskBreach).length};
    console.log(JSON.stringify(row));
    return row;
  };
  const profiles: ExitProfile[] = ["rebound", "trend60", "trend120"];
  const development = [];
  for (const profile of profiles) development.push(await run(profile, "development"));
  // Fixed ex-ante objective: highest development return vs fully invested CSI300.
  // No selection based on drawdown, 45%-index or validation performance.
  const selected = [...development].sort((a, b) => b.excessReturnPp - a.excessReturnPp)[0].profile;
  console.log(`Locked development selection: ${selected}`);
  const evaluation = [];
  for (const window of ["validation", "holdout"] as const) {
    evaluation.push(await run("rebound", window));
    if (selected !== "rebound") evaluation.push(await run(selected, window));
  }
  const feeStress = await run(selected, "holdout", 20);
  const files = ["prices", "financials"].flatMap((dir) => fs.readdirSync(path.join(cache, dir)).sort()
    .filter((name) => name.endsWith(".csv")).map((name) => ({
      file: `${dir}/${name}`,
      sha256: createHash("sha256").update(fs.readFileSync(path.join(cache, dir, name))).digest("hex"),
    })));
  const output = {generatedAt: new Date().toISOString(),
    methodology: "Three fixed exit profiles; select highest 2024 excess return, lock before 2025 validation and 2026 historical holdout. Each window starts in cash. Zero cash interest; diagnostic index allocations exclude fees. Current universe and previously inspected historical data limit evidence.",
    selected, profiles, development, evaluation, feeStress, sources: files};
  fs.writeFileSync("data/oversold-evaluation.json", JSON.stringify(output, null, 2) + "\n");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
