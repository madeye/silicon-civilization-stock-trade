import { test } from "node:test";
import assert from "node:assert/strict";
import { ruleBasedScorer } from "../lib/dashboardBacktest";
import { oversoldMetrics, oversoldSignals, marketRegime, rsi14 } from "../lib/oversoldStrategy";
import { runBacktest, type BacktestConfig, type SymbolSeries, type Scorer } from "../lib/backtest";
import type { SymbolSnapshot } from "../lib/deepseek";

const closes = (price: number) => [...Array(59).fill(100), price];
const snapshot = (symbol: string, price = 70): SymbolSnapshot => ({ symbol, closes: closes(price) });
const config: BacktestConfig = {
  startCash: 1_000_000, rebalanceEveryNDays: 1, startDate: "2025-03-02",
  endDate: "2025-03-20", feeBps: 10, maxPositions: 6,
};
function series(prices: number[], count = 6, initial = 70): SymbolSeries[] {
  return Array.from({ length: count }, (_, n) => ({
    entry: { symbol: `60000${n}`, name: `Stock ${n}`, theme: "T" },
    klines: [...closes(initial), ...prices].map((close, i) => ({
      date: new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10),
      open: close, high: close, low: close, close, volume: 1_000_000,
    })),
  }));
}
const forceBuy: Scorer = async (snaps) => snaps.map((s) => ({
  symbol: s.symbol, action: "buy", confidence: 1, size: 1, rationale: "untrusted buy",
}));

function assertCaps(r: Awaited<ReturnType<typeof runBacktest>>) {
  for (const b of r.equityCurve) {
    assert.ok(b.cash >= 0, b.date);
    assert.ok(b.exposurePct! <= b.exposureLimitPct! + 1e-7, `${b.date}: ${b.exposurePct}/${b.exposureLimitPct}`);
    assert.ok(b.exposurePct! <= 80 + 1e-7);
    if (b.regime === "normal") assert.ok(b.exposurePct! < 50);
    for (const p of Object.values(b.positions)) assert.ok(p.shares * p.price / b.equity <= 0.15 + 1e-7);
  }
}

test("flat and rising prices never buy even when the model insists", async () => {
  assert.equal(rsi14(Array(60).fill(100)), 50);
  assert.equal(oversoldMetrics(snapshot("A", 100))!.oversold, false);
  const r = await runBacktest(series(Array(10).fill(100), 6, 100), config, { scorer: forceBuy });
  assert.equal(r.trades.length, 0);
  assert.equal(r.equityCurve.at(-1)!.cash, config.startCash);
});

test("warmup, invalid prices and known quality problems veto buys", () => {
  const snaps = [snapshot("GOOD"), { ...snapshot("ST"), name: "*ST风险" },
    { ...snapshot("NEG"), fundamental: { profit_yoy: -1 } },
    { symbol: "SHORT", closes: Array(59).fill(70) },
    { symbol: "BAD", closes: [...closes(70), NaN] }];
  assert.deepEqual(oversoldSignals(snaps).filter((s) => s.action === "buy").map((s) => s.symbol), ["GOOD"]);
  assert.equal(marketRegime([snapshot("A"), snapshot("B")]).extreme, false);
  assert.equal(marketRegime([snapshot("A"), snapshot("B"), snapshot("C"), {symbol: "D", closes: []}]).extreme, false);
});

test("ordinary oversold builds in steps and never exceeds 45% after fees", async () => {
  const r = await runBacktest(series(Array(10).fill(84), 6, 84), config, { scorer: ruleBasedScorer() });
  assert.ok(r.trades.some((t) => t.side === "buy"));
  assert.ok(Math.max(...r.equityCurve.map((b) => b.exposurePct!)) > 40);
  assert.ok(r.equityCurve.every((b) => b.regime === "normal"));
  assertCaps(r);
  for (const t of r.trades.filter((t) => t.side === "buy")) assert.ok(t.shares * t.price <= 50_000);
});

test("broad severe oversold can reach 80%, then daily risk trims restore 45%", async () => {
  const r = await runBacktest(series([...Array(5).fill(70), ...Array(5).fill(84)]),
    { ...config, minHoldBars: 45, rebalanceThresholdPct: 99 }, { scorer: ruleBasedScorer() });
  assert.ok(Math.max(...r.equityCurve.map((b) => b.exposurePct!)) > 79);
  assert.ok(r.equityCurve.some((b) => b.regime === "normal" && b.exposurePct! < 45));
  assert.ok(r.trades.some((t) => t.reason === "总仓位上限/超跌退潮"));
  assertCaps(r);
});

test("suspension prevents phantom fills and reports unavoidable exposure breaches until tradable", async () => {
  const data = series([...Array(4).fill(70), ...Array(6).fill(90)]);
  const suspendedDates = new Set(["2025-03-06", "2025-03-07", "2025-03-08"]);
  // Two still-trading names recover, leaving only four severe names: use their
  // prior-price history to clear the broad signal while four positions are locked.
  for (let n = 0; n < 4; n++) data[n].klines = data[n].klines.filter((k) => !suspendedDates.has(k.date));
  const r = await runBacktest(data, config, { scorer: ruleBasedScorer() });
  assert.ok(r.trades.length > 0);
  assert.ok(!r.trades.some((t) => Number(t.symbol.at(-1)) < 4 && suspendedDates.has(t.date)));
  assert.ok(r.equityCurve.at(-1)!.exposurePct! <= 45);
});

test("signals cannot use the execution day's crash and foreign/duplicate proposals cannot bypass gates", async () => {
  const data = series([70,70,70,70,70,70], 6, 100);
  const malicious: Scorer = async (s, o) => [...await forceBuy(s, o), ...await forceBuy(s, o),
    {symbol: "UNKNOWN", action: "buy", size: 1, confidence: 1, rationale: ""}];
  const r = await runBacktest(data, config, { scorer: malicious });
  assert.equal(r.equityCurve[0].exposurePct, 0);
  assert.ok(r.trades.filter((t) => t.side === "buy").every((t) => t.date > config.startDate));
  assert.ok(r.trades.length > 0);
  assertCaps(r);
});

test("maximum positions counts existing holdings and no new buys occur on risk-only days", async () => {
  const r = await runBacktest(series(Array(12).fill(70)), { ...config, maxPositions: 2, rebalanceEveryNDays: 3 }, { scorer: forceBuy });
  assert.ok(r.trades.some((t) => t.side === "buy"));
  assert.ok(r.equityCurve.every((b) => Object.keys(b.positions).length <= 2));
  assert.ok(r.trades.filter((t) => t.side === "buy").every((t) => Object.hasOwn(r.signalsByDate, t.date)));
  assertCaps(r);
});

test("non-finite model sizes and confidence do not generate buys", () => {
  const snaps = [snapshot("A"), snapshot("B"), snapshot("C")];
  const signals = oversoldSignals(snaps, [
    {symbol: "A", action: "buy", size: NaN, confidence: 1, rationale: ""},
    {symbol: "B", action: "buy", size: 1, confidence: Infinity, rationale: ""},
  ]);
  assert.ok(signals.every((s) => s.action !== "buy"));
});

test("future fundamentals cannot change earlier decisions", async () => {
  const data = series(Array(8).fill(70));
  const baseline = await runBacktest(data, config, { scorer: ruleBasedScorer() });
  for (const s of data) s.fundamentals = [{ effective_date: "2026-01-01", profit_yoy: -100 }];
  const future = await runBacktest(data, config, { scorer: ruleBasedScorer() });
  assert.deepEqual(future.trades, baseline.trades);
});

test("blocked risk reduction is recorded and retried without increasing exposure", async () => {
  const { executeOversoldDay } = await import("../lib/oversoldExecution");
  const snaps = Array.from({length: 6}, (_, n) => snapshot(`A${n}`, 84));
  const shares = Object.fromEntries(snaps.map((s) => [s.symbol, 1500]));
  const marks = Object.fromEntries(snaps.map((s) => [s.symbol, 84]));
  const state = {cash: 244_000, shares, cost: {...marks}, opened: {}, pendingExit: new Set<string>()};
  const args = {date: "2025-03-02", bar: 1, snapshots: snaps, proposals: await forceBuy(snaps, {asOf:"2025-03-02", mode:"backtest"}),
    prices: marks, marks, fee: 0.001, maxPositions: 6, canBuy: () => true, canSell: () => false, trades: [] as Awaited<ReturnType<typeof runBacktest>>["trades"]};
  const blocked = executeOversoldDay(state, args);
  assert.equal(blocked.riskBreach, true);
  assert.equal(blocked.exposurePct, 75.6);
  assert.equal(args.trades.length, 0);
  const retried = executeOversoldDay(state, {...args, bar: 2, date: "2025-03-03", proposals: undefined, canSell: () => true});
  assert.equal(retried.riskBreach, false);
  assert.ok(retried.exposurePct <= 45);
  assert.ok(args.trades.every((t) => t.side === "sell"));
});

test("stop losses retry after limit-down and do not get cancelled by a fresh buy", async () => {
  const data = series([70,70,70,60,60,60,60,60], 1);
  const r = await runBacktest(data, config, {scorer: forceBuy});
  assert.ok(!r.trades.some((t) => t.side === "sell" && t.date === "2025-03-05"));
  assert.ok(r.trades.some((t) => t.side === "sell" && t.date === "2025-03-06" && t.reason?.includes("止损")));
  assert.ok(!r.trades.some((t) => t.side === "buy" && t.date === "2025-03-06"));
});

test("stale severe prices cannot activate the 80% regime", () => {
  const snaps = [snapshot("A"), snapshot("B"), {...snapshot("C"), stale: true}];
  assert.equal(marketRegime(snaps).cap, 0.45);
  assert.equal(oversoldSignals(snaps).find((s) => s.symbol === "C")!.action, "hold");
});
