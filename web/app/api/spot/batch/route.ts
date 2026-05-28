import { NextRequest, NextResponse } from "next/server";
import { fetchSpots } from "@/lib/pyserver";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { symbols?: unknown };
  const symbols = Array.isArray(body.symbols)
    ? [...new Set(body.symbols.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map((s) => s.trim()))]
    : [];
  if (symbols.length === 0) return NextResponse.json({ error: "symbols required" }, { status: 400 });

  try {
    return NextResponse.json(await fetchSpots(symbols));
  } catch {
    return NextResponse.json([]);
  }
}
