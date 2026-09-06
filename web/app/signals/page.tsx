import { loadEntries } from "@/lib/universe";
import { fetchKlines, fetchFundamental, fetchSpot } from "@/lib/pyserver";
import { scoreSymbols, type SymbolSnapshot } from "@/lib/deepseek";
import { STRATEGY_SUMMARY } from "@/lib/oversoldStrategy";
import { mapPool } from "@/lib/concurrent";
import Link from "next/link";

export const dynamic = "force-dynamic";

const LOAD_CONCURRENCY = Number(process.env.SIGNALS_LOAD_CONCURRENCY ?? 6);

type LiveSnapshot = SymbolSnapshot & { spotPrice?: number };

function calcPeg(pe?: number | null, profitYoyPct?: number | null) {
  if (pe == null || profitYoyPct == null || pe <= 0 || profitYoyPct <= 0) {
    return null;
  }
  return pe / profitYoyPct;
}

async function loadSignals() {
  const universe = loadEntries();
  const start = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 180);
    return d.toISOString().slice(0, 10).replaceAll("-", "");
  })();

  const snapshots: LiveSnapshot[] = await mapPool(
    universe,
    LOAD_CONCURRENCY,
    async (e) => {
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
        priceDate: klines.at(-1)?.date,
        closes: klines.map((k) => k.close),
        fundamental: fund
          ? {
              pe_ttm: fund.pe_ttm,
              pb: fund.pb,
              market_cap: fund.market_cap,
              profit_yoy: fund.profit_yoy,
            }
          : undefined,
      };
    },
  );

  const usable = snapshots;
  const asOf = snapshots.map((s) => s.priceDate).filter((d): d is string => !!d).sort().at(-1);
  const signals = await scoreSymbols(usable, { exitProfile: "trend120", asOf });
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
  const priceDate = rows.map((r) => r.snapshot?.priceDate).filter((d): d is string => !!d).sort().at(-1);
  const freshCount = rows.filter((r) => priceDate && r.snapshot?.priceDate === priceDate && r.snapshot.closes.length >= 60).length;

  return (
    <div className="container">
      <Link href="/" className="back-link">返回股票池</Link>
      <header className="page-header compact">
        <div>
          <div className="eyebrow">trend120</div>
          <h1>交易信号 · 趋势持有</h1>
          <p>{STRATEGY_SUMMARY} 目标权重以总资产计算；已有持仓也占用组合额度。</p>
          <p className="muted">行情截至 {priceDate ?? "暂无数据"} · 有效日线覆盖 {freshCount}/{rows.length}。
            未接入真实持仓成本、持有期和历史最高价，止损与跟踪退出需结合持仓判断；不再因回到均线直接退出。</p>
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
                  <th>行情日期</th>
                  <th className="num">置信度</th>
                  <th className="num">目标权重</th>
                  <th className="num">PE(TTM)</th>
                  <th className="num">利润同比</th>
                  <th className="num">PEG</th>
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
                    <td>{snapshot?.priceDate ?? "—"}</td>
                    <td className="num">{signal ? (signal.confidence * 100).toFixed(0) + "%" : "—"}</td>
                    <td className="num">{signal ? (signal.size * 100).toFixed(0) + "%" : "—"}</td>
                    <td className="num">{snapshot?.fundamental?.pe_ttm?.toFixed(1) ?? "—"}</td>
                    <td className="num">{snapshot?.fundamental?.profit_yoy != null ? `${snapshot.fundamental.profit_yoy.toFixed(1)}%` : "—"}</td>
                    <td className="num">{calcPeg(snapshot?.fundamental?.pe_ttm, snapshot?.fundamental?.profit_yoy)?.toFixed(2) ?? "—"}</td>
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
