import { NextRequest } from "next/server";
import { loadEntries } from "@/lib/universe";
import { fetchKlines, fetchFundamental } from "@/lib/pyserver";
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
  const body = (await req.json()) as Partial<BacktestConfig> & {
    startDate: string;
    endDate: string;
  };

  const cfg: BacktestConfig = {
    startCash: body.startCash ?? 1_000_000,
    rebalanceEveryNDays: body.rebalanceEveryNDays ?? 10,
    startDate: body.startDate,
    endDate: body.endDate,
    feeBps: body.feeBps ?? 10,
    maxPositions: body.maxPositions ?? 6,
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
        const loadedSeries = await mapPool(universe, LOAD_CONCURRENCY, async (entry): Promise<SymbolSeries | null> => {
          const [klinesRes, fundRes] = await Promise.allSettled([
            fetchKlines(entry.symbol, aksStart, aksEnd),
            fetchFundamental(entry.symbol),
          ]);
          loaded++;
          send({ type: "progress", phase: "loading", done: loaded, total: universe.length });
          if (klinesRes.status !== "fulfilled" || klinesRes.value.length < 20) {
            failed++;
            const why = klinesRes.status === "rejected"
              ? (klinesRes.reason instanceof Error ? klinesRes.reason.message : String(klinesRes.reason))
              : `only ${klinesRes.value.length} bars`;
            send({ type: "log", message: `skip ${entry.symbol} ${entry.name}: ${why.slice(0, 120)}` });
            return null;
          }
          const fund = fundRes.status === "fulfilled" ? fundRes.value : undefined;
          return {
            entry,
            klines: klinesRes.value,
            fundamental: fund
              ? {
                  pe_ttm: fund.pe_ttm ?? null,
                  pb: fund.pb ?? null,
                  market_cap: fund.market_cap ?? null,
                  profit_yoy: fund.profit_yoy ?? null,
                }
              : undefined,
          };
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
