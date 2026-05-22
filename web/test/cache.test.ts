import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Redirect the cache to a temp dir BEFORE importing the module.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "scc-cache-"));
process.chdir(tmp);

let cached: typeof import("../lib/cache").cached;
let cacheGet: typeof import("../lib/cache").cacheGet;
let cachePut: typeof import("../lib/cache").cachePut;
let hashKey: typeof import("../lib/cache").hashKey;
let getBacktestResult: typeof import("../lib/cache").getBacktestResult;
let listBacktestResults: typeof import("../lib/cache").listBacktestResults;
let saveBacktestResult: typeof import("../lib/cache").saveBacktestResult;

before(async () => {
  const mod = await import("../lib/cache");
  cached = mod.cached;
  cacheGet = mod.cacheGet;
  cachePut = mod.cachePut;
  hashKey = mod.hashKey;
  getBacktestResult = mod.getBacktestResult;
  listBacktestResults = mod.listBacktestResults;
  saveBacktestResult = mod.saveBacktestResult;
});

test("hashKey is deterministic and order-sensitive on objects", () => {
  const a = hashKey({ a: 1, b: 2 });
  const b = hashKey({ a: 1, b: 2 });
  const c = hashKey({ b: 2, a: 1 });
  assert.equal(a, b);
  // JSON.stringify preserves insertion order, so different orderings hash differently.
  assert.notEqual(a, c);
});

test("cacheGet returns null for missing key", () => {
  assert.equal(cacheGet("nonexistent-key"), null);
});

test("cachePut + cacheGet round-trips", () => {
  cachePut("k1", { hello: "world", n: 42 }, 60);
  const v = cacheGet<{ hello: string; n: number }>("k1");
  assert.deepEqual(v, { hello: "world", n: 42 });
});

test("cache expires after ttl", async () => {
  cachePut("k-expire", "x", 1);
  // Backdate fetched_at by 2s by reopening DB directly.
  const Database = (await import("better-sqlite3")).default;
  const db = new Database(path.join(tmp, ".cache", "web.db"));
  db.prepare("UPDATE cache SET fetched_at = fetched_at - 2 WHERE key = ?").run("k-expire");
  db.close();
  assert.equal(cacheGet("k-expire"), null);
});

test("cached() calls fetcher only on miss", async () => {
  let calls = 0;
  const fetcher = async () => {
    calls++;
    return { v: calls };
  };
  const a = await cached(["k-once", 1], 60, fetcher);
  const b = await cached(["k-once", 1], 60, fetcher);
  assert.deepEqual(a, { v: 1 });
  assert.deepEqual(b, { v: 1 });
  assert.equal(calls, 1);
});

test("saveBacktestResult stores and returns a full backtest result", () => {
  const result: import("../lib/backtest").BacktestResult = {
    config: {
      startCash: 1_000_000,
      rebalanceEveryNDays: 10,
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      feeBps: 10,
      maxPositions: 6,
    },
    equityCurve: [
      { date: "2025-01-01", equity: 1_000_000, cash: 1_000_000, positions: {} },
      { date: "2025-01-02", equity: 1_010_000, cash: 10_000, positions: { A: { shares: 9900, price: 101 } } },
    ],
    trades: [
      { date: "2025-01-02", symbol: "A", side: "buy", shares: 9900, price: 101 },
    ],
    signalsByDate: {
      "2025-01-02": [
        { symbol: "A", action: "buy", confidence: 0.9, size: 1, rationale: "test" },
      ],
    },
    stats: {
      totalReturnPct: 1,
      cagrPct: 12,
      maxDrawdownPct: 0,
      sharpe: 1.5,
      trades: 1,
    },
  };

  const stored = saveBacktestResult(result);
  assert.match(stored.id, /^[0-9a-f-]{36}$/);
  assert.deepEqual(stored.config, result.config);
  assert.deepEqual(stored.stats, result.stats);
  assert.deepEqual(getBacktestResult(stored.id), result);
});

test("listBacktestResults returns newest summaries first", () => {
  const base: import("../lib/backtest").BacktestResult = {
    config: {
      startCash: 1_000_000,
      rebalanceEveryNDays: 5,
      startDate: "2025-03-01",
      endDate: "2025-04-01",
      feeBps: 5,
      maxPositions: 3,
    },
    equityCurve: [],
    trades: [],
    signalsByDate: {},
    stats: {
      totalReturnPct: 2,
      cagrPct: 10,
      maxDrawdownPct: -1,
      sharpe: 0.8,
      trades: 0,
    },
  };
  const first = saveBacktestResult(base);
  const second = saveBacktestResult({
    ...base,
    config: { ...base.config, endDate: "2025-05-01" },
    stats: { ...base.stats, totalReturnPct: 3 },
  });

  const summaries = listBacktestResults(2);
  assert.deepEqual(summaries.map((s) => s.id), [second.id, first.id]);
  assert.equal(summaries[0].stats.totalReturnPct, 3);
  assert.equal(summaries[0].config.endDate, "2025-05-01");
});
