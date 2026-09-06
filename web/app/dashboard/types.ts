import type { compareCalendarYears } from "@/lib/benchmarkComparison";

export interface DashboardData {
  annualComparison?: ReturnType<typeof compareCalendarYears>;
  generated_at: string;
  sourceInfo?: { name: string; fetchedAt: string; financialDates: string };
  config: {
    strategy?: string;
    exitProfile?: string;
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
    exposurePct?: number;
    exposureLimitPct?: number;
    riskBreach?: boolean;
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
