// SQLite-backed cache for DeepSeek responses and pyserver fetches.
// Keys are sha256(input); TTLs are per-call.
import Database from "better-sqlite3";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import type { BacktestConfig, BacktestResult } from "./backtest";

const DIR = path.join(process.cwd(), ".cache");
fs.mkdirSync(DIR, { recursive: true });
const db = new Database(path.join(DIR, "web.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    fetched_at INTEGER NOT NULL,
    ttl_seconds INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS backtest_results (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    rebalance_every_n_days INTEGER NOT NULL,
    start_cash REAL NOT NULL,
    fee_bps REAL NOT NULL,
    max_positions INTEGER NOT NULL,
    total_return_pct REAL NOT NULL,
    cagr_pct REAL NOT NULL,
    max_drawdown_pct REAL NOT NULL,
    sharpe REAL NOT NULL,
    trades INTEGER NOT NULL,
    config_json TEXT NOT NULL,
    result_json TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_backtest_results_created_at
    ON backtest_results (created_at DESC);
`);

const getStmt = db.prepare(
  "SELECT payload, fetched_at, ttl_seconds FROM cache WHERE key = ?",
);
const putStmt = db.prepare(
  "INSERT OR REPLACE INTO cache (key, payload, fetched_at, ttl_seconds) VALUES (?, ?, ?, ?)",
);

const saveBacktestStmt = db.prepare(`
  INSERT INTO backtest_results (
    id,
    created_at,
    start_date,
    end_date,
    rebalance_every_n_days,
    start_cash,
    fee_bps,
    max_positions,
    total_return_pct,
    cagr_pct,
    max_drawdown_pct,
    sharpe,
    trades,
    config_json,
    result_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getBacktestStmt = db.prepare(
  "SELECT result_json FROM backtest_results WHERE id = ?",
);

const listBacktestsStmt = db.prepare(`
  SELECT
    id,
    created_at,
    start_date,
    end_date,
    rebalance_every_n_days,
    start_cash,
    fee_bps,
    max_positions,
    total_return_pct,
    cagr_pct,
    max_drawdown_pct,
    sharpe,
    trades,
    config_json
  FROM backtest_results
  ORDER BY created_at DESC, rowid DESC
  LIMIT ?
`);

export function hashKey(parts: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

export function cacheGet<T>(key: string): T | null {
  const row = getStmt.get(key) as
    | { payload: string; fetched_at: number; ttl_seconds: number }
    | undefined;
  if (!row) return null;
  if (row.ttl_seconds > 0 && Date.now() / 1000 - row.fetched_at > row.ttl_seconds) {
    return null;
  }
  return JSON.parse(row.payload) as T;
}

export function cachePut<T>(key: string, value: T, ttlSeconds: number): void {
  putStmt.run(key, JSON.stringify(value), Math.floor(Date.now() / 1000), ttlSeconds);
}

export async function cached<T>(
  parts: unknown,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const key = hashKey(parts);
  const hit = cacheGet<T>(key);
  if (hit !== null) return hit;
  const value = await fetcher();
  cachePut(key, value, ttlSeconds);
  return value;
}

export interface StoredBacktestSummary {
  id: string;
  createdAt: number;
  config: BacktestConfig;
  stats: BacktestResult["stats"];
}

export function saveBacktestResult(result: BacktestResult): StoredBacktestSummary {
  const id = crypto.randomUUID();
  const createdAt = Math.floor(Date.now() / 1000);
  saveBacktestStmt.run(
    id,
    createdAt,
    result.config.startDate,
    result.config.endDate,
    result.config.rebalanceEveryNDays,
    result.config.startCash,
    result.config.feeBps,
    result.config.maxPositions,
    result.stats.totalReturnPct,
    result.stats.cagrPct,
    result.stats.maxDrawdownPct,
    result.stats.sharpe,
    result.stats.trades,
    JSON.stringify(result.config),
    JSON.stringify(result),
  );
  return {
    id,
    createdAt,
    config: result.config,
    stats: result.stats,
  };
}

export function getBacktestResult(id: string): BacktestResult | null {
  const row = getBacktestStmt.get(id) as { result_json: string } | undefined;
  return row ? JSON.parse(row.result_json) as BacktestResult : null;
}

export function listBacktestResults(limit = 20): StoredBacktestSummary[] {
  const rows = listBacktestsStmt.all(Math.max(1, Math.min(limit, 100))) as Array<{
    id: string;
    created_at: number;
    total_return_pct: number;
    cagr_pct: number;
    max_drawdown_pct: number;
    sharpe: number;
    trades: number;
    config_json: string;
  }>;
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    config: JSON.parse(row.config_json) as BacktestConfig,
    stats: {
      totalReturnPct: row.total_return_pct,
      cagrPct: row.cagr_pct,
      maxDrawdownPct: row.max_drawdown_pct,
      sharpe: row.sharpe,
      trades: row.trades,
    },
  }));
}
