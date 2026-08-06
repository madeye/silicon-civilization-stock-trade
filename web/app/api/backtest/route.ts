import { NextRequest } from "next/server";
import { loadEntries } from "@/lib/universe";
import { fetchKlines, type Kline } from "@/lib/pyserver";
import { runBacktest, type BacktestConfig, type SymbolSeries } from "@/lib/backtest";
import { mapPool } from "@/lib/concurrent";
import { saveBacktestResult } from "@/lib/cache";

const LOAD_CONCURRENCY = Number(process.env.BACKTEST_LOAD_CONCURRENCY ?? 6);

export const runtime = "nodejs";
export const maxDuration = 300;

// NDJSON streaming protocol. Each line is one JSON object, one of:
//   { type: "progress", phase, done, total }
//   { type: "log", message }
//   { type: "result", result, stored }    // terminal — full BacktestResult
//   { type: "error", message }            // terminal
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<BacktestConfig>;

  const isDate = (s: unknown): s is string =>
    typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
  if (!isDate(body.startDate) || !isDate(body.endDate) || body.startDate >= body.endDate) {
    return Response.json(
      { error: "startDate and endDate are required as YYYY-MM-DD with startDate < endDate" },
      { status: 400 },
    );
  }
  const num = (v: unknown, fallback: number, min: number): number => {
    const n = typeof v === "number" && Number.isFinite(v) ? v : fallback;
    return Math.max(min, n);
  };

  const cfg: BacktestConfig = {
    startCash: num(body.startCash, 1_000_000, 1),
    rebalanceEveryNDays: Math.floor(num(body.rebalanceEveryNDays, 10, 1)),
    startDate: body.startDate,
    endDate: body.endDate,
    feeBps: num(body.feeBps, 10, 0),
    maxPositions: Math.floor(num(body.maxPositions, 6, 1)),
  };

  const padStart = new Date(cfg.startDate);
  padStart.setDate(padStart.getDate() - 120);
  const aksStart = padStart.toISOString().slice(0, 10).replaceAll("-", "");
  const aksEnd = cfg.endDate.replaceAll("-", "");

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };
      try {
        const universe = loadEntries();
        send({ type: "progress", phase: "loading", done: 0, total: universe.length });
        let loaded = 0;
        let failed = 0;
        // No fundamentals here: only today's snapshot exists, and feeding it
        // to historical rebalances is look-ahead (see lib/backtest.ts header).
        const loadedSeries = await mapPool(universe, LOAD_CONCURRENCY, async (entry): Promise<SymbolSeries | null> => {
          let klines: Kline[] | null = null;
          let why = "";
          try {
            klines = await fetchKlines(entry.symbol, aksStart, aksEnd);
            if (klines.length < 20) {
              why = `only ${klines.length} bars`;
              klines = null;
            }
          } catch (e) {
            why = e instanceof Error ? e.message : String(e);
          }
          loaded++;
          send({ type: "progress", phase: "loading", done: loaded, total: universe.length });
          if (!klines) {
            failed++;
            send({ type: "log", message: `skip ${entry.symbol} ${entry.name}: ${why.slice(0, 120)}` });
            return null;
          }
          return { entry, klines };
        });
        const series: SymbolSeries[] = loadedSeries.filter((x): x is SymbolSeries => x !== null);

        send({ type: "log", message: `${series.length} symbols loaded (${failed} failed/skipped)` });

        if (series.length === 0) {
          send({ type: "error", message: "no data loaded from pyserver" });
          controller.close();
          return;
        }

        const result = await runBacktest(series, cfg, (p) => {
          send({ type: "progress", ...p });
        });
        const stored = saveBacktestResult(result);
        send({ type: "log", message: `stored backtest ${stored.id}` });
        send({ type: "result", result, stored });
        controller.close();
      } catch (e) {
        send({ type: "error", message: e instanceof Error ? e.message : String(e) });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
