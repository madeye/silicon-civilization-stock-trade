import Link from "next/link";
import { readUniverse } from "@/lib/universe";
import RefreshUniverseButton from "./RefreshUniverseButton";
import UniverseTable from "./UniverseTable";

export const dynamic = "force-dynamic";

export default function Home() {
  const universe = readUniverse();
  const entries = universe.entries;
  const globalCount = entries.filter((e) => e.global_supply).length;
  const themeCount = new Set(entries.map((e) => e.theme)).size;

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <div className="eyebrow">DeepSeek · Tushare · A股股票池</div>
          <h1>硅基文明消费股交易系统</h1>
          <p>
            跟踪算力芯片、光模块、AI 服务器、液冷、电力、IDC、半导体材料与 AI-PCB 等供给侧标的。
          </p>
        </div>
        <div className="header-actions">
          <Link href="/signals" className="button secondary">实时信号</Link>
          <Link href="/backtest" className="button secondary">策略回测</Link>
          <Link href="/dashboard" className="button secondary">Dashboard</Link>
        </div>
      </header>

      <div className="summary-grid">
        <div className="metric">
          <span className="label">股票池</span>
          <strong>{entries.length}</strong>
          <span>仅 A 股</span>
        </div>
        <div className="metric">
          <span className="label">全球供应链</span>
          <strong>{globalCount}</strong>
          <span>{Math.round((globalCount / Math.max(entries.length, 1)) * 100)}% 覆盖</span>
        </div>
        <div className="metric">
          <span className="label">子主题</span>
          <strong>{themeCount}</strong>
          <span>按产业环节分组</span>
        </div>
        <div className="metric">
          <span className="label">更新时间</span>
          <strong>{universe.updated_at}</strong>
          <span>{universe.updated_by}</span>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>股票池</h2>
          <p>筛选、查看评级、目标价和上行空间。</p>
        </div>
        <RefreshUniverseButton />
      </div>

      <UniverseTable entries={entries} />
    </div>
  );
}
