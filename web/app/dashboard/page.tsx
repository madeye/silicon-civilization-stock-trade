import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { loadEntries } from "@/lib/universe";
import { EquityChart, ThemeChart } from "./Charts";
import type { DashboardData } from "./types";

export const dynamic = "force-dynamic";

function loadDashboardData(): DashboardData | null {
  const file = path.join(process.cwd(), "data", "dashboard-backtest.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as DashboardData;
}

function pct(v: number, digits = 2) {
  return `${v > 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function money(v: number) {
  return `¥${Math.round(v).toLocaleString("en-US")}`;
}

export default function DashboardPage() {
  const data = loadDashboardData();
  const universe = loadEntries();
  const nameMap = new Map(universe.map((e) => [e.symbol, e.name]));
  const themeMap = new Map(universe.map((e) => [e.symbol, e.theme]));

  const equityData = data
    ? data.equityCurve.map((b, i) => ({
        date: b.date,
        equity: b.equity,
        benchmark: data.benchmarkCurve[i]?.equity ?? null,
      }))
    : [];

  const themeData = data
    ? data.themePerformance
        .map((t) => ({
          theme: t.theme,
          returnPct: Number(t.returnPct.toFixed(2)),
          realizedPct: Number(t.realizedPct.toFixed(2)),
          unrealizedPct: Number(t.unrealizedPct.toFixed(2)),
          avgWeightPct: Number(t.avgWeightPct.toFixed(2)),
        }))
        .sort((a, b) => b.returnPct - a.returnPct)
    : [];

  const benchmarkFinalEquity = data?.benchmarkCurve.at(-1)?.equity ?? data?.config.startCash ?? 0;
  const benchmarkReturnPct = data ? ((benchmarkFinalEquity / data.config.startCash) - 1) * 100 : 0;

  return (
    <div className="container">
      <Link href="/" className="back-link">返回股票池</Link>
      <header className="page-header compact">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1>策略 Dashboard</h1>
          <p>
            基于项目股票池与 40/30/30 选股逻辑的规则化回测。数据来自 stock_finance_data，
            前复权价格、财报披露延迟处理，避免未来信息泄露。
          </p>
        </div>
      </header>

      {!data && (
        <div className="card" style={{ borderColor: "var(--warn)" }}>
          <strong>尚未生成回测数据</strong>
          <p style={{ color: "var(--muted)" }}>
            请先由 agent 通过 kimi-datasource 拉取行情与财报 CSV 到{" "}
            <code>web/.cache/datasource/</code>，然后运行{" "}
            <code>cd web && npx tsx scripts/build-dashboard.ts</code>。
            详见 AGENTS.md。
          </p>
        </div>
      )}

      {data && (
        <>
          <div className="row" style={{ marginTop: 16 }}>
            <Kpi label="总收益" value={pct(data.stats.totalReturnPct)} pos={data.stats.totalReturnPct >= 0} />
            <Kpi label="年化" value={pct(data.stats.cagrPct)} pos={data.stats.cagrPct >= 0} />
            <Kpi label="最大回撤" value={pct(data.stats.maxDrawdownPct)} pos={false} />
            <Kpi label="夏普" value={data.stats.sharpe.toFixed(2)} pos={data.stats.sharpe >= 0} />
            <Kpi label="交易次数" value={data.stats.trades.toString()} />
            <Kpi label="沪深300基准" value={pct(benchmarkReturnPct)} pos={benchmarkReturnPct >= 0} />
          </div>

          <div className="row" style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
            <span>回测区间 {data.config.startDate} → {data.config.endDate}</span>
            <span>·</span>
            <span>每 {data.config.rebalanceEveryNDays} 个交易日调仓</span>
            <span>·</span>
            <span>最大持仓 {data.config.maxPositions} 只</span>
            <span>·</span>
            <span>手续费 {data.config.feeBps} bps</span>
            <span>·</span>
            <span>生成于 {new Date(data.generated_at).toLocaleString("zh-CN")}</span>
          </div>

          <h2 className="subheading">权益曲线 vs 沪深300</h2>
          <div className="card chart-card">
            <EquityChart data={equityData} />
          </div>

          <h2 className="subheading">主题配置与收益贡献</h2>
          <div className="card chart-card">
            <ThemeChart data={themeData} />
          </div>

          <div className="theme-grid" style={{ marginTop: 16 }}>
            <div className="theme-panel">
              <div className="theme-title"><strong>当前持仓</strong><span>{data.latestDate}</span></div>
              <div className="table-wrap compact-table">
                <table>
                  <thead>
                    <tr><th>代码</th><th>名称</th><th>主题</th><th className="num">数量</th><th className="num">市值</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.latestHoldings).length === 0 && (
                      <tr><td colSpan={5} className="muted">空仓</td></tr>
                    )}
                    {Object.entries(data.latestHoldings).map(([sym, pos]) => (
                      <tr key={sym}>
                        <td className="mono">{sym}</td>
                        <td>{nameMap.get(sym) ?? "—"}</td>
                        <td>{themeMap.get(sym) ?? "—"}</td>
                        <td className="num">{pos.shares}</td>
                        <td className="num">{money(pos.shares * pos.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="theme-panel">
              <div className="theme-title"><strong>最近交易</strong><span>共 {data.trades.length} 笔</span></div>
              <div className="table-wrap compact-table">
                <table>
                  <thead>
                    <tr><th>日期</th><th>代码</th><th>方向</th><th className="num">数量</th><th className="num">价格</th></tr>
                  </thead>
                  <tbody>
                    {data.trades.slice(-20).reverse().map((t, i) => (
                      <tr key={i}>
                        <td>{t.date}</td>
                        <td className="mono">{t.symbol}</td>
                        <td><span className={`badge ${t.side}`}>{t.side}</span></td>
                        <td className="num">{t.shares}</td>
                        <td className="num">{t.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
