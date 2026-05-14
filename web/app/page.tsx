import Link from "next/link";
import { loadEntries } from "@/lib/universe";
import RefreshUniverseButton from "./RefreshUniverseButton";
import UniverseTable from "./UniverseTable";

export const dynamic = "force-dynamic";

export default function Home() {
  const entries = loadEntries();

  return (
    <div className="container">
      <h1>硅基文明消费股 · 交易策略系统</h1>
      <p style={{ color: "var(--muted)", marginTop: -8 }}>
        DeepSeek v4 pro · Tushare · 回测 · 缓存优先
      </p>

      <div className="row" style={{ marginTop: 16 }}>
        <Link href="/signals" className="card" style={{ flex: 1, textDecoration: "none" }}>
          <h2 style={{ margin: 0 }}>实时信号</h2>
          <p>调用 DeepSeek 对全部 watchlist 一次性打分（每股票每日仅 1 次 API）。</p>
        </Link>
        <Link href="/backtest" className="card" style={{ flex: 1, textDecoration: "none" }}>
          <h2 style={{ margin: 0 }}>策略回测</h2>
          <p>滚动调仓回测；信号缓存，重跑零成本。</p>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32 }}>
        <h2 style={{ margin: 0 }}>股票池（共 {entries.length} 只）</h2>
        <RefreshUniverseButton />
      </div>

      <UniverseTable entries={entries} />
    </div>
  );
}
