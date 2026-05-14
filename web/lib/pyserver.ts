// Typed client for the Python Tushare sidecar. Adds a thin in-process dedupe
// on top of pyserver's own SQLite cache to coalesce burst calls within a render.
const BASE = process.env.PYSERVER_URL ?? "http://localhost:8001";
// Default 180s — Tushare HK endpoints are rate-limited at 2/min, so a few
// HK symbols may need to wait in pyserver's token bucket before being served.
const TIMEOUT_MS = Number(process.env.PYSERVER_TIMEOUT_MS ?? 180_000);

export interface Kline {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Fundamental {
  symbol: string;
  name?: string | null;
  pe_ttm?: number | null;
  pb?: number | null;
  market_cap?: number | null;
  revenue_yoy?: number | null;
  profit_yoy?: number | null;
}

const inflight = new Map<string, Promise<unknown>>();

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const key = `${path}?${qs}`;
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const p = (async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const r = await fetch(`${BASE}${path}?${qs}`, { cache: "no-store", signal: ctrl.signal });
      if (!r.ok) throw new Error(`pyserver ${path} ${r.status}: ${await r.text()}`);
      return (await r.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  })();
  inflight.set(key, p);
  try {
    return await p;
  } finally {
    // brief dedupe only — release after settle so cache layer below handles repeats
    setTimeout(() => inflight.delete(key), 100);
  }
}

export function fetchKlines(symbol: string, start = "20230101", end?: string) {
  const params: Record<string, string> = { symbol, start, adjust: "qfq" };
  if (end) params.end = end;
  return get<Kline[]>("/klines", params);
}

export function fetchFundamental(symbol: string) {
  return get<Fundamental>("/fundamental", { symbol });
}

export interface Analyst {
  symbol: string;
  buy_count?: number;
  total_count?: number;
  buy_ratio?: number | null;
  consensus_eps_next?: number | null;
  implied_target?: number | null;
  current_price?: number | null;
  upside_pct?: number | null;
}

export function fetchAnalyst(symbol: string) {
  return get<Analyst>("/analyst", { symbol });
}

export function fetchSpot(symbol: string) {
  return get<{ symbol: string; name: string; price: number; change_pct: number }>(
    "/spot",
    { symbol },
  );
}
