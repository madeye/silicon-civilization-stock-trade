"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { BacktestResult } from "@/lib/backtest";

type Phase = "loading" | "signals" | "simulating";

interface Progress {
  phase: Phase;
  done: number;
  total: number;
}

const PHASE_LABEL: Record<Phase, string> = {
  loading: "加载行情与基本面",
  signals: "DeepSeek 信号生成",
  simulating: "回测撮合",
};

// Weights of each phase in the overall bar (must sum to 1).
const PHASE_WEIGHT: Record<Phase, number> = {
  loading: 0.15,
  signals: 0.75,
  simulating: 0.10,
};
const PHASE_ORDER: Phase[] = ["loading", "signals", "simulating"];

export default function BacktestPage() {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [rebalance, setRebalance] = useState(10);
  const [maxPositions, setMaxPositions] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  function overallPct(p: Progress | null): number {
    if (!p) return 0;
    let pct = 0;
    for (const ph of PHASE_ORDER) {
      if (ph === p.phase) {
        pct += PHASE_WEIGHT[ph] * (p.total > 0 ? p.done / p.total : 0);
        break;
      }
      pct += PHASE_WEIGHT[ph];
    }
    return Math.min(1, pct);
  }

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(null);
    setLogs([]);
    try {
      const r = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          rebalanceEveryNDays: rebalance,
          maxPositions,
          startCash: 1_000_000,
          feeBps: 10,
        }),
      });
      if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`);

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
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
            let evt:
              | { type: "progress"; phase: Phase; done: number; total: number }
              | { type: "log"; message: string }
              | { type: "result"; result: BacktestResult }
              | { type: "error"; message: string };
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            if (evt.type === "progress") {
              setProgress({ phase: evt.phase, done: evt.done, total: evt.total });
            } else if (evt.type === "log") {
              setLogs((prev) => [...prev, evt.message]);
            } else if (evt.type === "result") {
              setResult(evt.result);
            } else if (evt.type === "error") {
              setError(evt.message);
            }
          }
        }
      } finally {
        reader.cancel().catch(() => {});
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const pct = overallPct(progress);

  return (
    <div className="container">
      <Link href="/" className="back-link">返回股票池</Link>
      <header className="page-header compact">
        <div>
          <div className="eyebrow">Backtest</div>
          <h1>策略回测</h1>
          <p>滚动生成 DeepSeek 信号并按调仓周期撮合，行情与信号会被缓存。</p>
        </div>
      </header>

      <div className="toolbar">
        <label className="field">
          <span>起始</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="field">
          <span>结束</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <label className="field">
          <span>调仓周期</span>
          <input type="number" min={1} max={60} value={rebalance}
            onChange={(e) => setRebalance(+e.target.value)} />
        </label>
        <label className="field">
          <span>最大持仓数</span>
          <input type="number" min={1} max={20} value={maxPositions}
            onChange={(e) => setMaxPositions(+e.target.value)} />
        </label>
        <button onClick={run} disabled={loading}>
          {loading ? "运行中…" : "运行回测"}
        </button>
      </div>

      {(loading || progress) && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span>
              {progress ? PHASE_LABEL[progress.phase] : "准备中…"}
              {progress && `  ${progress.done} / ${progress.total}`}
            </span>
            <span style={{ color: "var(--muted)" }}>{(pct * 100).toFixed(0)}%</span>
          </div>
          <div style={{
            height: 8,
            marginTop: 8,
            background: "var(--field)",
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}>
            <div style={{
              height: "100%",
              width: `${pct * 100}%`,
              background: "var(--accent)",
              transition: "width 0.2s ease",
            }} />
          </div>
          {logs.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
              {logs.map((l, i) => <div key={i}>· {l}</div>)}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="card" style={{ marginTop: 16, borderColor: "var(--danger)" }}>
          <strong>失败：</strong> {error}
        </div>
      )}

      {result && (
        <>
          <div className="row" style={{ marginTop: 16 }}>
            <Kpi label="总收益" value={`${result.stats.totalReturnPct.toFixed(2)}%`} pos={result.stats.totalReturnPct >= 0} />
            <Kpi label="年化" value={`${result.stats.cagrPct.toFixed(2)}%`} pos={result.stats.cagrPct >= 0} />
            <Kpi label="最大回撤" value={`${result.stats.maxDrawdownPct.toFixed(2)}%`} pos={false} />
            <Kpi label="夏普" value={result.stats.sharpe.toFixed(2)} pos={result.stats.sharpe >= 0} />
            <Kpi label="交易次数" value={result.stats.trades.toString()} />
          </div>

          <h2 className="subheading">权益曲线</h2>
          <div className="card chart-card">
            <ResponsiveContainer>
              <LineChart data={result.equityCurve.map((b) => ({ date: b.date, equity: b.equity }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#8b96a8" minTickGap={40} />
                <YAxis stroke="#8b96a8" domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ background: "#131a26", border: "1px solid #1f2937" }}
                  formatter={(v: number) => v.toFixed(0)}
                />
                <Line type="monotone" dataKey="equity" stroke="#7cf0a0" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h2 className="subheading">最近交易</h2>
          <div className="theme-panel">
            <div className="table-wrap compact-table">
            <table>
              <thead>
                <tr><th>日期</th><th>代码</th><th>方向</th><th>数量</th><th>价格</th></tr>
              </thead>
              <tbody>
                {result.trades.slice(-30).reverse().map((t, i) => (
                  <tr key={i}>
                    <td>{t.date}</td>
                    <td>{t.symbol}</td>
                    <td><span className={`badge ${t.side}`}>{t.side}</span></td>
                    <td>{t.shares}</td>
                    <td>{t.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, pos }: { label: string; value: string; pos?: boolean }) {
  return (
    <div className="kpi">
      <span className="label">{label}</span>
      <span className={`value ${pos === undefined ? "" : pos ? "pos" : "neg"}`}>{value}</span>
    </div>
  );
}
