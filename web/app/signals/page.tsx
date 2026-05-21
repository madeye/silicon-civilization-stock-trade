import { loadEntries } from "@/lib/universe";
import { fetchKlines, fetchFundamental, fetchSpot } from "@/lib/pyserver";
import { scoreSymbols, type SymbolSnapshot } from "@/lib/deepseek";
import Link from "next/link";

export const dynamic = "force-dynamic";

type LiveSnapshot = SymbolSnapshot & { spotPrice?: number };

async function loadSignals() {
  const universe = loadEntries();
  const start = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().slice(0, 10).replaceAll("-", "");
  })();

  const snapshots: LiveSnapshot[] = await Promise.all(
    universe.map(async (e) => {
      const [klines, fund, spot] = await Promise.all([
        fetchKlines(e.symbol, start).catch(() => []),
        fetchFundamental(e.symbol).catch(() => undefined),
        fetchSpot(e.symbol).catch(() => undefined),
      ]);
      return {
        symbol: e.symbol,
        name: e.name,
        theme: e.theme,
        spotPrice: spot?.price,
        closes: klines.map((k) => k.close),
        fundamental: fund
          ? { pe_ttm: fund.pe_ttm, pb: fund.pb, market_cap: fund.market_cap }
          : undefined,
      };
    }),
  );

  const usable = snapshots.filter((s) => s.closes.length >= 10);
  const signals = await scoreSymbols(usable);
  const byId = new Map(signals.map((s) => [s.symbol, s]));

  return universe.map((e) => ({
    entry: e,
    snapshot: snapshots.find((s) => s.symbol === e.symbol),
    signal: byId.get(e.symbol),
  }));
}

export default async function SignalsPage() {
  let rows: Awaited<ReturnType<typeof loadSignals>> = [];
  let error: string | null = null;
  try {
    rows = await loadSignals();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="container">
      <Link href="/" className="back-link">返回股票池</Link>
      <header className="page-header compact">
        <div>
          <div className="eyebrow">Live scoring</div>
          <h1>实时信号</h1>
          <p>基于近 90 日价格、估值和主题信息生成 5-20 个交易日动作建议。</p>
        </div>
      </header>
      {error && (
        <div className="card" style={{ borderColor: "var(--danger)" }}>
          <strong>加载失败：</strong> {error}
          <p style={{ color: "var(--muted)" }}>
            请确认 pyserver 运行在 <code>{process.env.PYSERVER_URL ?? "http://localhost:8001"}</code>，
            且 <code>DEEPSEEK_API_KEY</code> 已配置。
          </p>
        </div>
      )}
      {!error && (
        <div className="theme-panel">
          <div className="theme-title">
            <strong>信号列表</strong>
            <span>{rows.filter((r) => r.signal?.action === "buy").length} 买入 · {rows.filter((r) => r.signal?.action === "sell").length} 卖出</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>代码</th>
                  <th>名称</th>
                  <th>主题</th>
                  <th>动作</th>
                  <th className="num">现价</th>
                  <th className="num">置信度</th>
                  <th className="num">仓位</th>
                  <th className="num">PE(TTM)</th>
                  <th>理由</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ entry, signal, snapshot }) => (
                  <tr key={entry.symbol}>
                    <td className="mono">{entry.symbol}</td>
                    <td>{entry.name}</td>
                    <td>{entry.theme}</td>
                    <td>
                      {signal ? (
                        <span className={`badge ${signal.action}`}>{signal.action}</span>
                      ) : (
                        <span className="badge">n/a</span>
                      )}
                    </td>
                    <td className="num">{snapshot?.spotPrice?.toFixed(2) ?? snapshot?.closes.at(-1)?.toFixed(2) ?? "—"}</td>
                    <td className="num">{signal ? (signal.confidence * 100).toFixed(0) + "%" : "—"}</td>
                    <td className="num">{signal ? (signal.size * 100).toFixed(0) + "%" : "—"}</td>
                    <td className="num">{snapshot?.fundamental?.pe_ttm?.toFixed(1) ?? "—"}</td>
                    <td className="muted signal-reason">{signal?.rationale ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
