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
      // Preserve the original analyst error; it is more useful for debugging.
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    );
  }
}
