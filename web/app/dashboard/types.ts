export interface DashboardData {
  generated_at: string;
  config: {
    startCash: number;
    rebalanceEveryNDays: number;
    startDate: string;
    endDate: string;
    feeBps: number;
    maxPositions: number;
  };
  stats: {
    totalReturnPct: number;
    cagrPct: number;
    maxDrawdownPct: number;
    sharpe: number;
    trades: number;
  };
  equityCurve: Array<{
    date: string;
    equity: number;
    cash: number;
    positions: Record<string, { shares: number; price: number }>;
  }>;
  benchmarkCurve: Array<{ date: string; equity: number }>;
  trades: Array<{
    date: string;
    symbol: string;
    side: "buy" | "sell";
    shares: number;
    price: number;
  }>;
  themePerformance: Array<{
    theme: string;
    returnPct: number;
    realizedPct: number;
    unrealizedPct: number;
    allocationDays: number;
    avgWeightPct: number;
  }>;
  latestHoldings: Record<string, { shares: number; price: number }>;
  latestDate: string;
}
