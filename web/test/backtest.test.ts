// Real backtest exercise with deterministic injected scorer.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Cache backend writes under cwd/.cache; sandbox it.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "scc-bt-"));
process.chdir(tmp);

import type { Kline } from "../lib/pyserver";
import { runBacktest, priceLimitFraction, type SymbolSeries, type Progress, type BacktestConfig, type Scorer } from "../lib/backtest";

// Deterministic scorer: always BUY A, SELL B with full size.
const scorer: Scorer = async (snapshots) =>
  snapshots.map((s) => ({
    symbol: s.symbol,
    action: s.symbol === "A" ? "buy" : "sell",
    confidence: 1,
    size: s.symbol === "A" ? 1 : 0,
    rationale: "test",
  }));

function makeKlines(start: string, closes: number[]): Kline[] {
  const d = new Date(start);
  return closes.map((c) => {
    // Skip weekends to mimic trading days.
    while (d.getUTCDay() === 0 || d.getUTCDay() === 6) {
      d.setUTCDate(d.getUTCDate() + 1);
    }
    const date = d.toISOString().slice(0, 10);
    d.setUTCDate(d.getUTCDate() + 1);
    return { date, open: c, high: c, low: c, close: c, volume: 1_000_000 };
  });
}

function makeSeries(): SymbolSeries[] {
  // A trends up (100→150), B trends down (100→70).
  const aCloses = Array.from({ length: 80 }, (_, i) => 100 + i * 0.625);
  const bCloses = Array.from({ length: 80 }, (_, i) => 100 - i * 0.375);
  return [
    { entry: { symbol: "A", name: "Up", theme: "T" }, klines: makeKlines("2025-01-01", aCloses) },
    { entry: { symbol: "B", name: "Down", theme: "T" }, klines: makeKlines("2025-01-01", bCloses) },
  ];
}

const cfg: BacktestConfig = {
  startCash: 1_000_000,
  rebalanceEveryNDays: 5,
  // dates from makeSeries start at 2025-01-01 (UTC); first business day is 01-01.
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  feeBps: 0,
  maxPositions: 5,
};

test("runBacktest produces a result with expected shape", async () => {
  const r = await runBacktest(makeSeries(), cfg, { scorer });
  assert.ok(r.equityCurve.length > 30);
  assert.ok(r.trades.length > 0);
  assert.ok(typeof r.stats.totalReturnPct === "number");
  assert.ok(typeof r.stats.maxDrawdownPct === "number");
});

test("backtest buys the up-trending symbol", async () => {
  const r = await runBacktest(makeSeries(), cfg, { scorer });
  const buys = r.trades.filter((t) => t.side === "buy");
  assert.ok(buys.length > 0, "expected at least one buy");
  assert.ok(buys.every((t) => t.symbol === "A"), "should only buy A (up trender)");
});

test("equity is monotonically tracking the chosen asset (no losses on uptrend)", async () => {
  const r = await runBacktest(makeSeries(), cfg, { scorer });
  const start = r.equityCurve[0].equity;
  const end = r.equityCurve.at(-1)!.equity;
  assert.ok(end > start, `expected end (${end}) > start (${start}) when buying uptrend`);
  // Total return should be positive and substantial — A goes 100→150 = +50%, we
  // capture most of it after the first rebalance lag.
  assert.ok(r.stats.totalReturnPct > 20, `got ${r.stats.totalReturnPct}%`);
});

test("progress callback fires for signals + simulating phases", async () => {
  const events: Progress[] = [];
  await runBacktest(makeSeries(), cfg, { scorer, onProgress: (p) => events.push(p) });
  const phases = new Set(events.map((e) => e.phase));
  assert.ok(phases.has("signals"), "expected signals events");
  assert.ok(phases.has("simulating"), "expected simulating events");
  // First and last simulating events should bracket [0, N].
  const sim = events.filter((e) => e.phase === "simulating");
  assert.equal(sim[0].done, 0);
  assert.equal(sim.at(-1)!.done, sim.at(-1)!.total);
});

test("throws when window has too few aligned trading days", async () => {
  const tinyCfg = { ...cfg, startDate: "2025-12-29", endDate: "2025-12-31" };
  await assert.rejects(() => runBacktest(makeSeries(), tinyCfg, { scorer }), /aligned/i);
});

// --- 涨停/跌停 (limit-up / limit-down) tradability ----------------------------

// Trading-day dates generated the same way makeKlines does, so tests can refer
// to the date at a given bar index.
function tradingDates(start: string, n: number): string[] {
  const d = new Date(start);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1);
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function flatWithJump(start: string, n: number, jumpIndex: number, jumpClose: number, base = 10): Kline[] {
  const closes = Array.from({ length: n }, (_, i) => (i < jumpIndex ? base : jumpClose));
  return makeKlines(start, closes);
}

// Main-board stock (±10%). Rebalances land on bar indices 0, 5, 10, … (every 5).
const N = 60;
const dates = tradingDates("2025-01-01", N);

test("skips buying a stock locked at 涨停 (limit-up)", async () => {
  // +15% jump at bar 5 → above the 10% main-board limit, so unfillable.
  const series: SymbolSeries[] = [
    { entry: { symbol: "600000", name: "X", theme: "T" }, klines: flatWithJump("2025-01-01", N, 5, 11.5) },
  ];
  // Only signal a BUY on the limit-up day.
  const buyOnLimitUp: Scorer = async (snaps, { asOf }) =>
    snaps.map((s) => ({
      symbol: s.symbol,
      action: asOf === dates[5] ? "buy" : "hold",
      confidence: 1,
      size: asOf === dates[5] ? 1 : 0,
      rationale: "t",
    }));
  const r = await runBacktest(series, cfg, { scorer: buyOnLimitUp });
  assert.equal(r.trades.filter((t) => t.side === "buy").length, 0, "must not buy into 涨停");
});

test("buys when the same-day move stays below the limit", async () => {
  // +5% jump at bar 5 → within the 10% limit, so the buy fills as normal.
  const series: SymbolSeries[] = [
    { entry: { symbol: "600000", name: "X", theme: "T" }, klines: flatWithJump("2025-01-01", N, 5, 10.5) },
  ];
  const buyOnBar5: Scorer = async (snaps, { asOf }) =>
    snaps.map((s) => ({
      symbol: s.symbol,
      action: asOf === dates[5] ? "buy" : "hold",
      confidence: 1,
      size: asOf === dates[5] ? 1 : 0,
      rationale: "t",
    }));
  const r = await runBacktest(series, cfg, { scorer: buyOnBar5 });
  const buys = r.trades.filter((t) => t.side === "buy");
  assert.equal(buys.length, 1, "a sub-limit move is buyable");
  assert.equal(buys[0].date, dates[5]);
});

// Prepend 5 flat bars before the window so the first rebalance date has
// history (signals only see closes strictly BEFORE the rebalance date).
// 2024-12-25 (Wed) + 5 weekday bars lands exactly on 2024-12-31, so window
// closes[i] stays aligned with dates[i].
function padded(windowCloses: number[], base = 10): Kline[] {
  return makeKlines("2024-12-25", [...Array(5).fill(base), ...windowCloses]);
}

test("defers selling a stock locked at 跌停 (limit-down) until it can trade", async () => {
  // Buy at bar 0 (price 10), then bar 5 gaps -15% (跌停) and holds flat after,
  // so the deferred sell should execute at bar 6, not bar 5.
  const closes = Array.from({ length: N }, (_, i) => (i < 5 ? 10 : 8.5));
  const series: SymbolSeries[] = [
    { entry: { symbol: "600000", name: "X", theme: "T" }, klines: padded(closes) },
  ];
  const buyThenSell: Scorer = async (snaps, { asOf }) =>
    snaps.map((s) => ({
      symbol: s.symbol,
      action: asOf === dates[0] ? "buy" : asOf === dates[5] ? "sell" : "hold",
      confidence: 1,
      size: asOf === dates[0] ? 1 : 0,
      rationale: "t",
    }));
  const r = await runBacktest(series, cfg, { scorer: buyThenSell });
  const sells = r.trades.filter((t) => t.side === "sell");
  assert.equal(sells.length, 1, "exactly one sell, executed once tradable");
  assert.equal(sells[0].date, dates[6], "sell deferred past the 跌停 bar to the next tradable bar");
  assert.equal(sells[0].price, 8.5);
});

test("a fresh buy signal cancels a sell deferred by a 跌停 lock", async () => {
  // Hold from bar 0. Sell signaled at bar 5 while locked 跌停, and the lock
  // persists through bar 10 (-15% each bar), where a new rebalance says BUY.
  // The stale deferral must not dump the position once trading resumes.
  const closes: number[] = [];
  let px = 10;
  for (let i = 0; i < N; i++) {
    if (i >= 5 && i <= 10) px *= 0.85;
    closes.push(Number(px.toFixed(4)));
  }
  const series: SymbolSeries[] = [
    { entry: { symbol: "600000", name: "X", theme: "T" }, klines: padded(closes) },
  ];
  const sellThenRebuy: Scorer = async (snaps, { asOf }) =>
    snaps.map((s) => ({
      symbol: s.symbol,
      action: asOf === dates[0] || asOf === dates[10] ? "buy" : asOf === dates[5] ? "sell" : "hold",
      confidence: 1,
      size: asOf === dates[0] || asOf === dates[10] ? 1 : 0,
      rationale: "t",
    }));
  const r = await runBacktest(series, cfg, { scorer: sellThenRebuy });
  assert.equal(r.trades.filter((t) => t.side === "sell").length, 0, "superseded sell must not fire");
  const last = r.equityCurve.at(-1)!;
  assert.ok(Object.keys(last.positions).includes("600000"), "position retained to the end");
});

test("a suspended (停牌) symbol defers sells and marks at last close without warping the calendar", async () => {
  // A trades every day; B has no bars for window indices 10..19. The portfolio
  // calendar must keep those dates (union, not intersection), B's deferred
  // sell fills on its first bar back, and equity marks B at its last close.
  const aCloses = Array.from({ length: N }, () => 10);
  const bDates = [...dates.slice(0, 10), ...dates.slice(20)];
  const bKlines: Kline[] = [
    ...makeKlines("2024-12-25", Array(5).fill(10)),
    ...bDates.map((date) => ({ date, open: 10, high: 10, low: 10, close: 10, volume: 1_000_000 })),
  ];
  const series: SymbolSeries[] = [
    { entry: { symbol: "600001", name: "A", theme: "T" }, klines: padded(aCloses) },
    { entry: { symbol: "600002", name: "B", theme: "T" }, klines: bKlines },
  ];
  const buyBSellB: Scorer = async (snaps, { asOf }) =>
    snaps.map((s) => ({
      symbol: s.symbol,
      action: s.symbol !== "600002" ? "hold" : asOf === dates[0] ? "buy" : asOf === dates[10] ? "sell" : "hold",
      confidence: 1,
      size: s.symbol === "600002" && asOf === dates[0] ? 1 : 0,
      rationale: "t",
    }));
  const r = await runBacktest(series, cfg, { scorer: buyBSellB });
  assert.equal(r.equityCurve.length, N, "suspension must not delete portfolio dates");
  const sells = r.trades.filter((t) => t.side === "sell");
  assert.equal(sells.length, 1);
  assert.equal(sells[0].date, dates[20], "sell fills on the first bar after suspension");
  const during = r.equityCurve.find((b) => b.date === dates[15])!;
  assert.equal(during.equity, 1_000_000, "suspended position marks at last traded close");
});

test("signals see closes strictly before the rebalance date and no fundamentals", async () => {
  // Window closes are 100, 101, 102, … so the last visible close reveals
  // exactly how many bars the snapshot included.
  const closes = Array.from({ length: N }, (_, i) => 100 + i);
  const series: SymbolSeries[] = [
    { entry: { symbol: "600000", name: "X", theme: "T" }, klines: padded(closes, 99) },
  ];
  const seen = new Map<string, { lastClose: number; fundamental: unknown }>();
  const capture: Scorer = async (snaps, { asOf }) => {
    for (const s of snaps) {
      seen.set(asOf, { lastClose: s.closes.at(-1)!, fundamental: (s as { fundamental?: unknown }).fundamental });
    }
    return [];
  };
  await runBacktest(series, cfg, { scorer: capture });
  // At rebalance date dates[5], the latest visible close is bar 4's (= 104),
  // not bar 5's (= 105): the decision precedes the execution price.
  assert.equal(seen.get(dates[5])!.lastClose, 104);
  assert.equal(seen.get(dates[10])!.lastClose, 109);
  assert.equal(seen.get(dates[5])!.fundamental, undefined, "backtests must not see today's fundamentals");
});

test("CAGR is computed over the calendar span, not the bar count", async () => {
  const closes = Array.from({ length: N }, (_, i) => 100 + i);
  const series: SymbolSeries[] = [
    { entry: { symbol: "600000", name: "X", theme: "T" }, klines: padded(closes, 99) },
  ];
  const buyOnce: Scorer = async (snaps, { asOf }) =>
    snaps.map((s) => ({
      symbol: s.symbol,
      action: asOf === dates[0] ? "buy" : "hold",
      confidence: 1,
      size: asOf === dates[0] ? 1 : 0,
      rationale: "t",
    }));
  const r = await runBacktest(series, cfg, { scorer: buyOnce });
  const start = r.equityCurve[0];
  const end = r.equityCurve.at(-1)!;
  const years = (Date.parse(end.date) - Date.parse(start.date)) / (365.25 * 24 * 3600 * 1000);
  const expected = (Math.pow(end.equity / start.equity, 1 / Math.max(years, 1 / 252)) - 1) * 100;
  assert.ok(Math.abs(r.stats.cagrPct - expected) < 1e-9, `${r.stats.cagrPct} vs ${expected}`);
});

// --- 涨跌停 board tiers -------------------------------------------------------

test("priceLimitFraction reflects board tiers", () => {
  assert.equal(priceLimitFraction("688256", "寒武纪"), 0.2); // 科创板
  assert.equal(priceLimitFraction("300308", "中际旭创"), 0.2); // 创业板
  assert.equal(priceLimitFraction("920002", "万达轴承"), 0.3); // 北交所
  assert.equal(priceLimitFraction("836826", "盖世食品"), 0.3); // 北交所
  assert.equal(priceLimitFraction("600519", "贵州茅台"), 0.1); // 主板
  assert.equal(priceLimitFraction("600000", "ST浦发"), 0.05); // 主板 ST
});
