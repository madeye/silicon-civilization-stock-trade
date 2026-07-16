import { NextRequest, NextResponse } from "next/server";
import { fetchAnalyst, fetchSpot } from "@/lib/pyserver";

export const runtime = "nodejs";

const ANALYST_TIMEOUT_MS = 25_000;
const SPOT_FALLBACK_TIMEOUT_MS = 5_000;

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`analyst timeout after ${ms}ms`)), ms);
  });
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
  try {
    const data = await Promise.race([fetchAnalyst(symbol), timeout(ANALYST_TIMEOUT_MS)]);
    return NextResponse.json(data);
  } catch (e) {
    try {
      const spot = await Promise.race([fetchSpot(symbol), timeout(SPOT_FALLBACK_TIMEOUT_MS)]);
      return NextResponse.json({
        symbol,
        current_price: spot.price,
        buy_count: null,
        total_count: null,
        buy_ratio: null,
        consensus_eps_next: null,
        implied_target: null,
        upside_pct: null,
      });
    } catch {
      // Fall through to the generic error below.
    }
    // Log the detail server-side; the raw message can embed the internal
    // pyserver URL and upstream response bodies (see lib/pyserver.ts get()).
    console.error(`[api/analyst] ${symbol}:`, e);
    return NextResponse.json({ error: "analyst service unavailable" }, { status: 502 });
  }
}
