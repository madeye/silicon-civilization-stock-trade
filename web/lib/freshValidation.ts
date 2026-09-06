import type { SymbolSeries, PortfolioBar } from "./backtest";
import { compareBenchmark } from "./benchmarkComparison";

export interface FreshDataset {
  fetchedAt: string;
  source: string;
  requestedEnd: string;
  series: SymbolSeries[];
  benchmark: Array<{date: string; equity: number}>;
  failures: Array<{symbol: string; error: string}>;
  sourceFiles: Array<{file: string; sha256: string}>;
  universeSha256: string;
}

export function validateFreshDataset(dataset: FreshDataset, symbols: string[], newStart: string) {
  if (dataset.failures.length) throw new Error("Fresh dataset has failed downloads");
  if (dataset.series.length !== symbols.length || new Set(dataset.series.map((s) => s.entry.symbol)).size !== symbols.length ||
    dataset.series.some((s) => !symbols.includes(s.entry.symbol))) throw new Error("Fresh universe differs from frozen universe");
  const stale: Array<{symbol: string; lastDate: string}> = [];
  for (const s of dataset.series) {
    if (s.klines.length < 60) throw new Error(`Insufficient history: ${s.entry.symbol}`);
    let previous = "";
    for (const k of s.klines) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k.date) || k.date <= previous || k.date > dataset.requestedEnd ||
        ![k.open,k.high,k.low,k.close].every((v) => Number.isFinite(v) && v > 0)) {
        throw new Error(`Invalid/duplicate/out-of-order price: ${s.entry.symbol} ${k.date}`);
      }
      previous = k.date;
    }
    if (previous < newStart) throw new Error(`No new data: ${s.entry.symbol}`);
    if (previous < dataset.requestedEnd) stale.push({symbol: s.entry.symbol,lastDate: previous});
    if (!s.fundamentals?.length || s.fundamentals.some((f) => !f.effective_date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(f.effective_date) || f.effective_date > dataset.requestedEnd)) {
      throw new Error(`Invalid dated financials: ${s.entry.symbol}`);
    }
  }
  if (dataset.benchmark.at(-1)?.date !== dataset.requestedEnd) throw new Error("Benchmark is stale");
  for (let i = 0; i < dataset.benchmark.length; i++) {
    const b = dataset.benchmark[i];
    if (!Number.isFinite(b.equity) || b.equity <= 0 || (i > 0 && b.date <= dataset.benchmark[i-1].date)) {
      throw new Error("Invalid benchmark dates or prices");
    }
  }
  return {symbols: symbols.length, stale, benchmarkEnd: dataset.requestedEnd};
}

/** Isolate new-period returns using the last pre-period mark as denominator.
 * Scale cash and equity together; exclude the anchor from activity statistics. */
export function compareNewWindow(curve: PortfolioBar[], benchmark: FreshDataset["benchmark"], newStart: string) {
  const anchor = curve.filter((b) => b.date < newStart).at(-1);
  if (!anchor || !benchmark.some((b) => b.date === anchor.date)) throw new Error("Missing common pre-period anchor");
  const period = curve.filter((b) => b.date >= newStart);
  if (period.length < 5) throw new Error("Insufficient new trading days");
  const scale = 1_000_000 / anchor.equity;
  const comparison = compareBenchmark([anchor,...period].map((b) => ({...b,equity:b.equity*scale,cash:b.cash*scale})),benchmark,1_000_000);
  if (!comparison || comparison.observations !== period.length+1) throw new Error("Incomplete new-period benchmark coverage");
  return {
    ...comparison,
    anchorDate: anchor.date, startDate: period[0].date, observations: period.length,
    averageExposurePct: period.reduce((sum,b) => sum+(b.equity-b.cash)/b.equity*100,0)/period.length,
    cashDays: period.filter((b) => Object.keys(b.positions).length===0).length,
    riskBreachDays: period.filter((b) => b.riskBreach).length,
    maxExposurePct: Math.max(...period.map((b) => (b.equity-b.cash)/b.equity*100)),
  };
}
