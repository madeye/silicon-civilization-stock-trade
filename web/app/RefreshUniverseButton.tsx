"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RefreshResult {
  proposal: { rationale: string };
  applied: {
    added: { symbol: string; name: string; theme: string }[];
    rejected: { symbol: string; reason: string }[];
    removed: string[];
    reclassified: { symbol: string; from: string; to: string }[];
  };
  finalCount: number;
}

export default function RefreshUniverseButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<RefreshResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setLogs([]);
    setProgress(null);
    setResult(null);
    setError(null);
    try {
      const r = await fetch("/api/universe/refresh", { method: "POST" });
      if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`);
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let gotResult = false;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl);
            buf = buf.slice(nl + 1);
            if (!line) continue;
            let evt;
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            if (evt.type === "log") setLogs((p) => [...p, evt.message]);
            else if (evt.type === "progress") setProgress({ done: evt.done, total: evt.total });
            else if (evt.type === "result") { setResult(evt.result); gotResult = true; }
            else if (evt.type === "error") setError(evt.message);
          }
        }
      } finally {
        reader.cancel().catch(() => {});
      }
      // Only re-render the page when the refresh actually applied changes.
      if (gotResult) router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const pct = progress && progress.total > 0 ? progress.done / progress.total : 0;

  return (
    <div>
      <button onClick={run} disabled={busy}>
        {busy ? "刷新中…" : "✨ DeepSeek 刷新股票池"}
      </button>

      {(busy || logs.length > 0 || result || error) && (
        <div className="card" style={{ marginTop: 12, fontSize: 12 }}>
          {progress && progress.total > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>校验新增标的 {progress.done} / {progress.total}</span>
                <span style={{ color: "var(--muted)" }}>{(pct * 100).toFixed(0)}%</span>
              </div>
              <div style={{
                height: 6, marginTop: 6, background: "#0d1320",
                borderRadius: 3, overflow: "hidden", border: "1px solid var(--border)",
              }}>
                <div style={{
                  height: "100%", width: `${pct * 100}%`,
                  background: "var(--accent)", transition: "width 0.2s ease",
                }} />
              </div>
            </>
          )}
          <div style={{ marginTop: 8, color: "var(--muted)", maxHeight: 200, overflow: "auto" }}>
            {logs.map((l, i) => <div key={i}>· {l}</div>)}
          </div>
          {error && <div style={{ color: "var(--danger)", marginTop: 8 }}>{error}</div>}
          {result && (
            <div style={{ marginTop: 10 }}>
              <strong>变更已应用</strong> · 当前 {result.finalCount} 只
              <div style={{ marginTop: 4 }}>
                新增 {result.applied.added.length} · 移除 {result.applied.removed.length} · 改类 {result.applied.reclassified.length} · 拒绝 {result.applied.rejected.length}
              </div>
              {result.applied.added.length > 0 && (
                <div style={{ marginTop: 6, color: "var(--accent)" }}>
                  + {result.applied.added.map((a) => `${a.symbol} ${a.name}(${a.theme})`).join("、")}
                </div>
              )}
              {result.applied.rejected.length > 0 && (
                <div style={{ marginTop: 6, color: "var(--danger)" }}>
                  ✗ {result.applied.rejected.map((r) => `${r.symbol}: ${r.reason}`).join("; ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
