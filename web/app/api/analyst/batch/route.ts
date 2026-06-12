import { NextRequest, NextResponse } from "next/server";
import { fetchAnalysts, fetchAnalyst, type Analyst } from "@/lib/pyserver";
import { mapPool } from "@/lib/concurrent";

export const runtime = "nodejs";

const ANALYST_TIMEOUT_MS = 35_000;
const FALLBACK_CONCURRENCY = 4;
const FALLBACK_PER_SYMBOL_TIMEOUT_MS = 10_000;

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`analyst batch timeout after ${ms}ms`)), ms);
  });
}

function nullAnalyst(symbol: string): Analyst {
  return {
    symbol,
    buy_count: null,
    total_count: null,
    buy_ratio: null,
    consensus_eps_next: null,
    implied_target: null,
    current_price: null,
    upside_pct: null,
  };
}

export interface FallbackResult {
  data: Analyst[];
  anySucceeded: boolean;
}

// Per-symbol fallback when the batch endpoint times out. Each call is bounded so
// one stuck symbol can't pin a worker for the lib default (180s). `anySucceeded`
// lets the caller distinguish a real pyserver outage from "no analyst data".
export async function fallback(
  symbols: string[],
  fetchOne: (symbol: string) => Promise<Analyst> = fetchAnalyst,
): Promise<FallbackResult> {
  let anySucceeded = false;
  const data = await mapPool(symbols, FALLBACK_CONCURRENCY, async (symbol) => {
    try {
      const result = await Promise.race([
        fetchOne(symbol),
        timeout(FALLBACK_PER_SYMBOL_TIMEOUT_MS),
      ]);
      anySucceeded = true;
      return result;
    } catch {
      return nullAnalyst(symbol);
    }
  });
  return { data, anySucceeded };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { symbols?: unknown };
  const symbols = Array.isArray(body.symbols)
    ? [...new Set(body.symbols.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map((s) => s.trim()))]
    : [];
  if (symbols.length === 0) return NextResponse.json({ error: "symbols required" }, { status: 400 });

  try {
    if (symbols.length === 1) {
      const data = await Promise.race([fetchAnalyst(symbols[0]), timeout(ANALYST_TIMEOUT_MS)]);
      return NextResponse.json([data]);
    }
    const data = await Promise.race([fetchAnalysts(symbols), timeout(ANALYST_TIMEOUT_MS)]);
    return NextResponse.json(data);
  } catch {
    const { data, anySucceeded } = await fallback(symbols);
    if (!anySucceeded) {
      return NextResponse.json({ error: "analyst service unavailable" }, { status: 504 });
    }
    return NextResponse.json(data);
  }
}
