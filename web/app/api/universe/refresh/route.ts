import { NextRequest } from "next/server";
import { readUniverse } from "@/lib/universe";
import { proposeRefresh, applyRefresh } from "@/lib/universe-refresh";

export const runtime = "nodejs";
export const maxDuration = 180;

// NDJSON: progress / log / result / error
export async function POST(req: NextRequest) {
  // This endpoint mutates data/universe.json and spends DeepSeek tokens
  // (bypassCache) on every call. Outside local dev it must not be anonymous:
  // require UNIVERSE_REFRESH_TOKEN via the x-refresh-token header. In dev the
  // token is optional but still enforced when configured.
  const token = process.env.UNIVERSE_REFRESH_TOKEN;
  if (token) {
    if (req.headers.get("x-refresh-token") !== token) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "universe refresh is disabled: set UNIVERSE_REFRESH_TOKEN to enable it in production" },
      { status: 403 },
    );
  }
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };
      try {
        const current = readUniverse();
        send({ type: "log", message: `当前股票池 ${current.entries.length} 只，请求 DeepSeek 提议变更…` });

        const proposal = await proposeRefresh(current);
        send({
          type: "log",
          message: `提议: +${proposal.adds.length} / -${proposal.removes.length} / 改类 ${proposal.reclassifies.length}`,
        });
        send({ type: "log", message: proposal.rationale });

        let validated = 0;
        const total = proposal.adds.filter(
          (a) => a.symbol && !current.entries.some((e) => e.symbol === a.symbol),
        ).length;
        send({ type: "progress", done: 0, total });

        const result = await applyRefresh(current, proposal, {
          onValidate: (symbol, ok) => {
            validated++;
            send({
              type: "log",
              message: `${ok ? "✓" : "✗"} 验证 ${symbol}`,
            });
            send({ type: "progress", done: validated, total });
          },
        });

        send({ type: "result", result });
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
