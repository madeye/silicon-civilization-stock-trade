import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { STRATEGY_SUMMARY, STRATEGY_VERSION } from "@/lib/oversoldStrategy";
import { compareBenchmark } from "@/lib/benchmarkComparison";
import { loadEntries } from "@/lib/universe";
import { EquityChart, ThemeChart } from "./Charts";
import type { FreshValidationReport } from "./freshTypes";
import type { DashboardData } from "./types";

export const dynamic = "force-dynamic";

function loadDashboardData(fileName = "dashboard-latest.json"): DashboardData | null {
  const file = path.join(process.cwd(), "data", fileName);
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, "utf-8")) as DashboardData;
  return data.config.strategy === STRATEGY_VERSION && data.config.exitProfile === "trend120" ? data : null;
}

function pct(v: number, digits = 2) {
  return `${v > 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function money(v: number) {
  return `¥${Math.round(v).toLocaleString("en-US")}`;
}

export default function DashboardPage() {
  const holdingsData = loadDashboardData();
  const freshFile = path.join(process.cwd(), "data", "fresh-validation.json");
  const fresh: FreshValidationReport | null = fs.existsSync(freshFile) ? JSON.parse(fs.readFileSync(freshFile,"utf8")) : null;
  const activeLabel = "trend120 趋势持有";
  const latestBar = holdingsData?.equityCurve.at(-1);
  const activeComparison = holdingsData
    ? compareBenchmark(holdingsData.equityCurve, holdingsData.benchmarkCurve, holdingsData.config.startCash)
    : null;
  const coldByDate = new Map(fresh?.cashStart.curve.map((bar) => [bar.date, bar.equity]) ?? []);
  const freshCurve = fresh?.continuous.curve.map((bar) => ({ ...bar, candidate: coldByDate.get(bar.date) ?? null })) ?? [];
  const universe = loadEntries();
  const nameMap = new Map(universe.map((e) => [e.symbol, e.name]));
  const themeMap = new Map(universe.map((e) => [e.symbol, e.theme]));

  const themeData = holdingsData
    ? holdingsData.themePerformance
        .map((t) => ({
          theme: t.theme,
          returnPct: Number(t.returnPct.toFixed(2)),
          realizedPct: Number(t.realizedPct.toFixed(2)),
          unrealizedPct: Number(t.unrealizedPct.toFixed(2)),
          avgWeightPct: Number(t.avgWeightPct.toFixed(2)),
        }))
        .sort((a, b) => b.returnPct - a.returnPct)
    : [];

  return (
    <div className="container">
      <Link href="/" className="back-link">返回股票池</Link>
      <header className="page-header compact">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1>{activeLabel} Dashboard</h1>
          <p>
            {STRATEGY_SUMMARY} {fresh ? "最新数据来自Tushare，财报按实际公告日期处理。" : "基于历史价格的规则回测；财报可用日期为估算值。"}
          </p>
        </div>
      </header>

      {holdingsData && latestBar && (
        <section style={{ marginTop: 16 }}>
          <div className="theme-title">
            <strong>最新策略回测</strong>
            <span>行情截止 {holdingsData.latestDate}</span>
          </div>
          <p className="muted">{holdingsData.sourceInfo?.name ?? "历史行情"} · 每边费用 {holdingsData.config.feeBps} bps ·
            最多持有 {holdingsData.config.maxPositions} 只 · 以下为模拟结果，包含策略选择期。</p>
          {holdingsData.config.exitProfile === "trend120" && <p className="muted">
            超跌入场，8%止损；盈利曾达到10%后，按持有期间最高价回落15%退出，最长持有120个交易日。
          </p>}
          <div className="row">
            <Kpi label="全期累计收益" value={pct(holdingsData.stats.totalReturnPct)} pos={holdingsData.stats.totalReturnPct >= 0} />
            <Kpi label="年化收益" value={pct(holdingsData.stats.cagrPct)} pos={holdingsData.stats.cagrPct >= 0} />
            <Kpi label="全期最大回撤" value={pct(holdingsData.stats.maxDrawdownPct)} pos={false} />
            <Kpi label="夏普比率" value={holdingsData.stats.sharpe.toFixed(2)} />
            <Kpi label="最新总仓位" value={`${((latestBar.equity - latestBar.cash) / latestBar.equity * 100).toFixed(1)}%`} />
            <Kpi label="可用现金" value={money(latestBar.cash)} />
          </div>
          <h2 className="subheading">最新净值：{activeLabel} vs 沪深300</h2>
          {activeComparison ? (
            <>
              <p className="muted">{activeComparison.startDate} → {activeComparison.endDate}，按共同交易日期比较，起始资金 {money(holdingsData.config.startCash)}。
                {activeComparison.endDate < holdingsData.latestDate && "指数较早截止，后续策略收益不计入同期比较。"}</p>
              <div className="row">
                <Kpi label="同期策略收益" value={pct(activeComparison.strategyReturnPct)} pos={activeComparison.strategyReturnPct >= 0} />
                <Kpi label="同期沪深300" value={pct(activeComparison.benchmarkReturnPct)} pos={activeComparison.benchmarkReturnPct >= 0} />
                <Kpi label="超额收益（百分点）" value={activeComparison.excessReturnPp.toFixed(2)} pos={activeComparison.excessReturnPp >= 0} />
                <Kpi label="同期平均仓位" value={`${activeComparison.averageExposurePct.toFixed(1)}%`} />
              </div>
              <div className="card chart-card" style={{ marginTop: 16 }}>
                <EquityChart data={activeComparison.curve} strategyLabel={activeLabel} />
              </div>
            </>
          ) : <p className="muted">缺少足够同期指数数据，无法计算超额收益。</p>}
        </section>
      )}

      {fresh && (
        <section className="card" style={{marginTop:16}}>
          <h2>新数据验证：锁定 trend120</h2>
          <p>{fresh.newDataStart} → {fresh.newDataEnd}，共{fresh.continuous.observations}个交易日；
            {fresh.quality.symbols}只股票和沪深300已更新，未重新选参数。</p>
          <div className="table-wrap"><table>
            <thead><tr><th>运行方式</th><th className="num">新期间收益</th><th className="num">超额（百分点）</th><th className="num">最大回撤</th><th className="num">平均仓位</th><th className="num">成交笔数</th></tr></thead>
            <tbody>
              {([["承接重算的历史持仓",fresh.continuous],["8月6日从空仓开始",fresh.cashStart]] as const).map(([label,m])=>(
                <tr key={label}><td>{label}</td><td className="num">{pct(m.strategyReturnPct)}</td><td className="num">{m.excessReturnPp.toFixed(2)}</td><td className="num">{pct(m.strategyDrawdownPct)}</td><td className="num">{m.averageExposurePct.toFixed(1)}%</td><td className="num">{m.trades.length}</td></tr>
              ))}
              <tr><td>同期沪深300</td><td className="num">{pct(fresh.continuous.benchmarkReturnPct)}</td><td className="num">—</td><td className="num">{pct(fresh.continuous.benchmarkDrawdownPct)}</td><td className="num">100%</td><td className="num">—</td></tr>
            </tbody>
          </table></div>
          <div className="chart-card" style={{ marginTop: 16 }}>
            <EquityChart data={freshCurve} strategyLabel="承接历史持仓" candidateLabel="空仓起步" />
          </div>
          <p className="muted">以{fresh.continuous.anchorDate}收盘为收益起点，曲线均归一到100万元。承接方式最高仓位{fresh.continuous.maxExposurePct.toFixed(1)}%，超限{fresh.continuous.riskBreachDays}天。
            本次是新增历史数据检验，样本仅{fresh.continuous.observations}天，不能替代真实前瞻或实盘验证。</p>
          <p className="muted">新来源的复权价格和实际公告日期会重算旧持仓，因此不能把历史重算差额计入新期间收益。</p>
        </section>
      )}

      {!holdingsData && (
        <div className="card" style={{ borderColor: "var(--warn)" }}>
          <strong>尚未生成当前超跌策略的回测数据</strong>
          <p className="muted">行情更新与回测完成后，这里将展示策略表现和模拟持仓。</p>
        </div>
      )}

      {holdingsData && (
        <>
          <h2 className="subheading">{activeLabel} 主题配置与收益贡献</h2>
          <div className="card chart-card">
            <ThemeChart data={themeData} />
          </div>

          <div className="theme-grid" style={{ marginTop: 16 }}>
            <div className="theme-panel">
              <div className="theme-title"><strong>{activeLabel} 最新模拟持仓</strong><span>{holdingsData.latestDate}</span></div>
              <div className="table-wrap compact-table">
                <table>
                  <thead>
                    <tr><th>代码</th><th>名称</th><th>主题</th><th className="num">数量</th><th className="num">市值</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(holdingsData.latestHoldings).length === 0 && (
                      <tr><td colSpan={5} className="muted">空仓</td></tr>
                    )}
                    {Object.entries(holdingsData.latestHoldings).map(([sym, pos]) => (
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
              <div className="theme-title"><strong>{activeLabel} 最近模拟交易</strong><span>共 {holdingsData.trades.length} 笔</span></div>
              <div className="table-wrap compact-table">
                <table>
                  <thead>
                    <tr><th>日期</th><th>代码</th><th>方向</th><th className="num">数量</th><th className="num">价格</th></tr>
                  </thead>
                  <tbody>
                    {holdingsData.trades.slice(-20).reverse().map((t, i) => (
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
