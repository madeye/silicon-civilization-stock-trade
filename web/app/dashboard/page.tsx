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

function loadDashboardData(fileName = "dashboard-backtest.json"): DashboardData | null {
  const file = path.join(process.cwd(), "data", fileName);
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, "utf-8")) as DashboardData;
  return data.config.strategy === STRATEGY_VERSION ? data : null;
}

type EvaluationRow = {
  profile: string; window: string; startDate: string; endDate: string;
  strategyReturnPct: number; benchmarkReturnPct: number; strategyDrawdownPct: number;
};
function loadEvaluation(): { selected: string; development: EvaluationRow[]; evaluation: EvaluationRow[] } | null {
  const file = path.join(process.cwd(), "data", "oversold-evaluation.json");
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) : null;
}

function pct(v: number, digits = 2) {
  return `${v > 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function money(v: number) {
  return `¥${Math.round(v).toLocaleString("en-US")}`;
}

export default function DashboardPage() {
  const data = loadDashboardData();
  const latest = loadDashboardData("dashboard-latest.json");
  const freshFile = path.join(process.cwd(), "data", "fresh-validation.json");
  const fresh: FreshValidationReport | null = fs.existsSync(freshFile) ? JSON.parse(fs.readFileSync(freshFile,"utf8")) : null;
  const candidate = loadDashboardData("dashboard-candidate.json");
  const evaluation = loadEvaluation();
  const holdingsData = latest ?? candidate ?? data;
  const universe = loadEntries();
  const nameMap = new Map(universe.map((e) => [e.symbol, e.name]));
  const themeMap = new Map(universe.map((e) => [e.symbol, e.theme]));

  const comparison = data ? compareBenchmark(data.equityCurve, data.benchmarkCurve, data.config.startCash) : null;
  const candidateComparison = candidate ? compareBenchmark(candidate.equityCurve, candidate.benchmarkCurve, candidate.config.startCash) : null;
  const candidateAligned = comparison && candidateComparison &&
    candidateComparison.startDate === comparison.startDate && candidateComparison.endDate === comparison.endDate &&
    candidate?.config.exitProfile === "trend120";
  const candidateByDate = new Map((candidateAligned ? candidateComparison.curve : []).map((b) => [b.date, b.equity]));
  const equityData = (comparison?.curve ?? []).map((b) => ({...b, candidate: candidateByDate.get(b.date) ?? null}));
  const candidateWindows = evaluation?.selected === "trend120"
    ? [...evaluation.development, ...evaluation.evaluation].filter((row) => row.profile === evaluation.selected)
    : [];

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
          <h1>策略 Dashboard</h1>
          <p>
            {STRATEGY_SUMMARY} {fresh ? "最新数据来自Tushare，财报按实际公告日期处理；旧数据结果保留作历史对照。" : "基于历史价格的规则回测；财报可用日期为估算值。"}
          </p>
        </div>
      </header>

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
          <p className="muted">以{fresh.continuous.anchorDate}收盘为收益起点。承接方式最高仓位{fresh.continuous.maxExposurePct.toFixed(1)}%，超限{fresh.continuous.riskBreachDays}天。
            本次是新增历史数据检验，样本仅{fresh.continuous.observations}天，不能替代真实前瞻或实盘验证。</p>
          <p className="muted">新来源的复权价格和实际公告日期会重算旧持仓，因此不能把历史重算差额计入新期间收益。</p>
        </section>
      )}

      {!data && (
        <div className="card" style={{ borderColor: "var(--warn)" }}>
          <strong>尚未生成当前超跌策略的回测数据</strong>
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
          {candidateAligned && candidateComparison && (
            <section className="card" style={{ marginTop: 16 }}>
              <h2>旧数据对照：趋势持有候选</h2>
              <p>
                超跌入场后继续持有趋势，保留8%止损；盈利曾达到10%后，按持有期间最高价回落15%退出，最长持有120个交易日。
                常态45%、深度超跌80%的组合上限与超跌买入门槛持续生效。
              </p>
              <p className="muted">同期比较 {comparison.startDate} → {comparison.endDate}；候选实验尚未替换实时信号规则。</p>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>方案</th><th className="num">收益</th><th className="num">最大回撤</th><th className="num">平均仓位</th></tr></thead>
                  <tbody>
                    <tr><td>原版：反弹清仓</td><td className="num">{pct(comparison.strategyReturnPct)}</td><td className="num">{pct(comparison.strategyDrawdownPct)}</td><td className="num">{comparison.averageExposurePct.toFixed(1)}%</td></tr>
                    <tr><td>候选：趋势持有</td><td className="num">{pct(candidateComparison.strategyReturnPct)}</td><td className="num">{pct(candidateComparison.strategyDrawdownPct)}</td><td className="num">{candidateComparison.averageExposurePct.toFixed(1)}%</td></tr>
                    <tr><td>沪深300</td><td className="num">{pct(comparison.benchmarkReturnPct)}</td><td className="num">{pct(comparison.benchmarkDrawdownPct)}</td><td className="num">100%</td></tr>
                  </tbody>
                </table>
              </div>
              {candidateWindows.length > 0 && <>
                <h3>分段检验</h3>
                <p className="muted">固定三个退出方案，仅按2024年收益选择；随后锁定方案。各段独立从现金开始。</p>
                <div className="table-wrap"><table>
                  <thead><tr><th>阶段</th><th>区间</th><th className="num">候选收益</th><th className="num">沪深300</th></tr></thead>
                  <tbody>{candidateWindows.map((row) => <tr key={row.window}>
                    <td>{row.window === "development" ? "2024 选择段" : row.window === "validation" ? "2025 验证段" : "2026 历史留出段"}</td>
                    <td>{row.startDate} → {row.endDate}</td><td className="num">{pct(row.strategyReturnPct)}</td><td className="num">{pct(row.benchmarkReturnPct)}</td>
                  </tr>)}</tbody>
                </table></div>
              </>}
              <p className="muted">当前股票池存在幸存者偏差，历史区间已被查看过；历史留出表现不能替代新数据或实盘检验。</p>
            </section>
          )}
          <h2 className="subheading">旧数据对照：原版策略全期结果</h2>
          <div className="row" style={{ marginTop: 16 }}>
            <Kpi label="总收益" value={pct(data.stats.totalReturnPct)} pos={data.stats.totalReturnPct >= 0} />
            <Kpi label="年化" value={pct(data.stats.cagrPct)} pos={data.stats.cagrPct >= 0} />
            <Kpi label="最大回撤" value={pct(data.stats.maxDrawdownPct)} pos={false} />
            <Kpi label="夏普" value={data.stats.sharpe.toFixed(2)} pos={data.stats.sharpe >= 0} />
            <Kpi label="最新总仓位" value={`${(data.equityCurve.at(-1)?.exposurePct ?? 0).toFixed(1)}%`} />
            <Kpi label="仓位超限天数" value={String(data.equityCurve.filter((b) => b.riskBreach).length)} />
            <Kpi label="交易次数" value={data.stats.trades.toString()} />

          </div>

          <div className="row" style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
            <span>回测区间 {data.config.startDate} → {data.latestDate}（实际行情截止日）</span>
            <span>·</span>
            <span>每 {data.config.rebalanceEveryNDays} 个交易日调仓</span>
            <span>·</span>
            <span>最大持仓 {data.config.maxPositions} 只</span>
            <span>·</span>
            <span>手续费 {data.config.feeBps} bps</span>
            <span>·</span>
            <span>生成于 {new Date(data.generated_at).toLocaleString("zh-CN")}</span>
          </div>

          <h2 className="subheading">旧数据同期比较：原版策略 vs 沪深300</h2>
          {comparison ? (
            <>
              <p className="muted">
                {comparison.startDate} → {comparison.endDate}，仅比较双方均有数据的日期。
                {comparison.endDate < data.latestDate && "指数数据较早截止，后续策略收益不计入超额收益。"}
              </p>
              <div className="row">
                <Kpi label="同期策略收益" value={pct(comparison.strategyReturnPct)} pos={comparison.strategyReturnPct >= 0} />
                <Kpi label="同期沪深300" value={pct(comparison.benchmarkReturnPct)} pos={comparison.benchmarkReturnPct >= 0} />
                <Kpi label="超额收益（百分点）" value={comparison.excessReturnPp.toFixed(2)} pos={comparison.excessReturnPp >= 0} />
                <Kpi label="同期平均仓位" value={`${comparison.averageExposurePct.toFixed(1)}%`} />
                <Kpi label="空仓天数" value={`${comparison.cashDays} / ${comparison.observations}`} />
              </div>
              <p className="muted">
                仓位影响参考：45%沪深300＋55%现金（每日再平衡）收益 {pct(comparison.fixed45ReturnPct)}；
                按策略前一观察日仓位配置沪深300收益 {pct(comparison.matchedExposureReturnPct)}。
                现金利息和参考组合交易费均按零计算。这两项用于分析仓位影响，跑赢目标仍是全仓沪深300。
              </p>
            </>
          ) : <p className="muted">缺少足够同期指数数据，无法计算超额收益。</p>}
          <div className="card chart-card">
            <EquityChart data={equityData} />
          </div>

          <h2 className="subheading">trend120 主题配置与收益贡献</h2>
          <div className="card chart-card">
            <ThemeChart data={themeData} />
          </div>

          <div className="theme-grid" style={{ marginTop: 16 }}>
            <div className="theme-panel">
              <div className="theme-title"><strong>trend120 最新模拟持仓</strong><span>{holdingsData!.latestDate}</span></div>
              <div className="table-wrap compact-table">
                <table>
                  <thead>
                    <tr><th>代码</th><th>名称</th><th>主题</th><th className="num">数量</th><th className="num">市值</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(holdingsData!.latestHoldings).length === 0 && (
                      <tr><td colSpan={5} className="muted">空仓</td></tr>
                    )}
                    {Object.entries(holdingsData!.latestHoldings).map(([sym, pos]) => (
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
              <div className="theme-title"><strong>trend120 最近模拟交易</strong><span>共 {holdingsData!.trades.length} 笔</span></div>
              <div className="table-wrap compact-table">
                <table>
                  <thead>
                    <tr><th>日期</th><th>代码</th><th>方向</th><th className="num">数量</th><th className="num">价格</th></tr>
                  </thead>
                  <tbody>
                    {holdingsData!.trades.slice(-20).reverse().map((t, i) => (
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
