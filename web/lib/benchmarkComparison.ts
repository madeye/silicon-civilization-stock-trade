type EquityPoint = { date: string; equity: number };
type PortfolioPoint = EquityPoint & { cash: number };

function drawdown(equities: number[]) {
  let peak = equities[0];
  let worst = 0;
  for (const equity of equities) {
    peak = Math.max(peak, equity);
    worst = Math.min(worst, equity / peak - 1);
  }
  return worst * 100;
}

/** Compare only observed common dates. Never zip unrelated array indices or
 * forward-fill an index beyond its last observation. Diagnostic cash benchmarks
 * do not replace the fully invested index as the outperformance objective. */
export function compareBenchmark(
  portfolio: PortfolioPoint[], benchmark: EquityPoint[], startCash: number,
) {
  const indexByDate = new Map(benchmark.filter((b) => Number.isFinite(b.equity) && b.equity > 0)
    .map((b) => [b.date, b.equity]));
  const sorted = [...portfolio].sort((a, b) => a.date.localeCompare(b.date));
  const common = sorted.filter((b) => indexByDate.has(b.date));
  if (common.length < 2) return null;
  const first = common[0];
  const last = common.at(-1)!;
  const initial = first.date === sorted[0].date ? startCash : first.equity;
  const indexInitial = indexByDate.get(first.date)!;
  let fixed45 = startCash;
  let matchedExposure = startCash;
  let previousIndex = indexInitial;
  let previousExposure = (first.equity - first.cash) / first.equity;
  const curve = common.map((bar, i) => {
    const index = indexByDate.get(bar.date)!;
    if (i > 0) {
      const indexReturn = index / previousIndex - 1;
      fixed45 *= 1 + 0.45 * indexReturn;
      // Prior observation's exposure: today's portfolio cannot time today's index return.
      matchedExposure *= 1 + previousExposure * indexReturn;
    }
    previousExposure = (bar.equity - bar.cash) / bar.equity;
    previousIndex = index;
    return {
      date: bar.date, equity: startCash * bar.equity / initial,
      benchmark: startCash * index / indexInitial, fixed45, matchedExposure,
    };
  });
  const final = curve.at(-1)!;
  const strategyReturnPct = (final.equity / startCash - 1) * 100;
  const benchmarkReturnPct = (final.benchmark / startCash - 1) * 100;
  return {
    startDate: first.date, endDate: last.date, observations: common.length,
    strategyReturnPct, benchmarkReturnPct, excessReturnPp: strategyReturnPct - benchmarkReturnPct,
    fixed45ReturnPct: (final.fixed45 / startCash - 1) * 100,
    matchedExposureReturnPct: (final.matchedExposure / startCash - 1) * 100,
    strategyDrawdownPct: drawdown([startCash, ...curve.map((b) => b.equity)]),
    benchmarkDrawdownPct: drawdown([startCash, ...curve.map((b) => b.benchmark)]),
    averageExposurePct: common.reduce((sum, b) => sum + (b.equity - b.cash) / b.equity * 100, 0) / common.length,
    cashDays: common.filter((b) => Math.abs(b.equity - b.cash) < 1e-7).length,
    curve,
  };
}
