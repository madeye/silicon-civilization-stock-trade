import type { BacktestResult } from "./backtest";
import type { Signal, SymbolSnapshot } from "./deepseek";
import { marketRegime, oversoldSignals, POSITION_RULES } from "./oversoldStrategy";

export interface OversoldState {
  cash: number;
  shares: Record<string, number>;
  cost: Record<string, number>;
  opened: Record<string, number>;
  pendingExit: Set<string>;
}

/** One close-execution simulation step. Decisions see only previous closes;
 * today's quotes are used solely for fills and portfolio valuation. */
export function executeOversoldDay(state: OversoldState, args: {
  date: string;
  bar: number;
  snapshots: SymbolSnapshot[];
  proposals: Signal[] | undefined;
  prices: Record<string, number>;
  marks: Record<string, number>;
  fee: number;
  maxPositions: number;
  canBuy: (symbol: string) => boolean;
  canSell: (symbol: string) => boolean;
  trades: BacktestResult["trades"];
}) {
  const { date, bar, snapshots, proposals, prices, marks, fee, trades } = args;
  const { cap, extreme } = marketRegime(snapshots);
  const signals = oversoldSignals(snapshots, proposals);
  const sold = new Set<string>();
  const value = (sym: string) => (state.shares[sym] ?? 0) * (marks[sym] ?? 0);
  const exposure = () => Object.keys(state.shares).reduce((sum, sym) => sum + value(sym), 0);
  const equity = () => state.cash + exposure();
  const sell = (sym: string, count: number, reason: string) => {
    if (!args.canSell(sym) || state.opened[sym] === bar) return false;
    const held = state.shares[sym] ?? 0;
    const sh = Math.min(held, Math.ceil(count / 100) * 100);
    if (sh <= 0) return true;
    state.cash += sh * prices[sym] * (1 - fee);
    state.cost[sym] *= (held - sh) / held;
    state.shares[sym] -= sh;
    sold.add(sym);
    trades.push({ date, symbol: sym, side: "sell", shares: sh, price: prices[sym], reason });
    if (state.shares[sym] === 0) state.pendingExit.delete(sym);
    return true;
  };

  // Exit requests survive suspension/limit-down and take priority over new buys.
  for (const s of snapshots) {
    const held = state.shares[s.symbol] ?? 0;
    if (!held) continue;
    const prev = s.closes.at(-1);
    const avgCost = state.cost[s.symbol] / held;
    const ruleSignal = signals.find((sig) => sig.symbol === s.symbol);
    if (ruleSignal?.action === "sell" ||
      (prev !== undefined && prev <= avgCost * (1 - POSITION_RULES.stopLoss)) ||
      bar - state.opened[s.symbol] >= POSITION_RULES.maxHoldBars) {
      state.pendingExit.add(s.symbol);
    }
  }
  for (const sym of state.pendingExit) sell(sym, state.shares[sym], "退出/止损/持有期届满");

  // Daily risk reduction ignores discretionary minimum holds/drift thresholds.
  // Round UP the shares sold and include fees in the post-trade denominator.
  for (const sym of Object.keys(state.shares).sort((a, b) => value(b) - value(a))) {
    const singleExcess = value(sym) - POSITION_RULES.singleCap * equity() * (1 - fee);
    if (singleExcess > 1e-8) {
      sell(sym, singleExcess / (1 - POSITION_RULES.singleCap * fee) / marks[sym], "单股仓位上限");
    }
  }
  for (const sym of Object.keys(state.shares).sort((a, b) => value(b) - value(a))) {
    const excess = exposure() - cap * equity();
    if (excess <= 1e-8) break;
    sell(sym, excess / (1 - cap * fee) / marks[sym], "总仓位上限/超跌退潮");
  }

  // Only rebalance dates have model/rule proposals. Other days are risk-only.
  const unresolvedRisk = exposure() > cap * equity() + 1e-8 ||
    Object.keys(state.shares).some((sym) => value(sym) > POSITION_RULES.singleCap * equity() + 1e-8);
  if (proposals !== undefined && !unresolvedRisk) {
    for (const sig of signals) {
      if (sig.action !== "buy" || sold.has(sig.symbol) || state.pendingExit.has(sig.symbol) ||
        !args.canBuy(sig.symbol)) continue;
      const held = state.shares[sig.symbol] ?? 0;
      if (!held && Object.values(state.shares).filter((n) => n > 0).length >= args.maxPositions) continue;
      const eq = equity();
      const target = Math.min(sig.size, POSITION_RULES.singleCap);
      const budget = Math.min(
        state.cash / (1 + fee),
        (cap * eq - exposure()) / (1 + cap * fee),
        (target * eq * (1 - fee) - value(sig.symbol)) / (1 + target * fee),
        POSITION_RULES.buyStep * eq / (1 + fee),
      );
      const px = prices[sig.symbol];
      const sh = Math.floor(Math.max(0, budget) / px / 100) * 100;
      if (!sh) continue;
      const cost = sh * px * (1 + fee);
      state.cash -= cost;
      state.cost[sig.symbol] = (state.cost[sig.symbol] ?? 0) + cost;
      state.shares[sig.symbol] = held + sh;
      if (!held) state.opened[sig.symbol] = bar;
      trades.push({ date, symbol: sig.symbol, side: "buy", shares: sh, price: px, reason: sig.rationale });
    }
  }
  const exposurePct = exposure() / equity() * 100;
  const riskBreach = exposurePct > cap * 100 + 1e-7 ||
    Object.keys(state.shares).some((sym) => value(sym) > POSITION_RULES.singleCap * equity() + 1e-7);
  return { exposurePct, exposureLimitPct: cap * 100, regime: extreme ? "extreme" as const : "normal" as const, riskBreach };
}
