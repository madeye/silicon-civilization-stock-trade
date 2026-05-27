// Snapshot the latest webapp results into docs/data/*.json for the static
// GitHub Pages site. Requires pyserver running and DEEPSEEK_API_KEY set
// (read from web/.env.local).
//
// Usage:
//   cd web && npx tsx scripts/snapshot.ts
//
// Env overrides:
//   SNAPSHOT_BACKTEST_START=2024-01-01  SNAPSHOT_BACKTEST_END=2026-05-14
//   SNAPSHOT_SKIP_SIGNALS=1  SNAPSHOT_SKIP_BACKTEST=1
//   SNAPSHOT_ONLY_SOCIAL_CARD=1  # rebuild social-card assets from docs/data/backtest.json
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import type { BacktestConfig, BacktestResult } from "../lib/backtest";

type SnapshotBacktest = {
  generated_at?: string;
  config: BacktestConfig;
  stats: BacktestResult["stats"];
  equityCurve: Array<{ date: string; equity: number; cash?: number }>;
  trades: BacktestResult["trades"];
};

function xml(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function pct(v: number, digits = 1): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function money(v: number): string {
  return `¥${Math.round(v).toLocaleString("en-US")}`;
}

function socialCardSvg(bt: SnapshotBacktest): string {
  const { config, stats, equityCurve } = bt;
  const values = equityCurve.map((b) => b.equity);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 390;
  const height = 78;
  const denom = equityCurve.length > 1 ? equityCurve.length - 1 : 1;
  const points = equityCurve.map((b, i) => {
    const x = 646 + (i / denom) * width;
    const y = 360 - ((b.equity - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = values.at(-1) ?? config.startCash;
  const lineColor = stats.totalReturnPct >= 0 ? "#63d471" : "#ff6b6b";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="硅基文明消费股交易系统">
  <defs>
    <linearGradient id="bg" x1="0" y1="630" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#101114"/>
      <stop offset=".58" stop-color="#17231d"/>
      <stop offset="1" stop-color="#263c32"/>
    </linearGradient>
    <filter id="soft-glow" x="-20%" y="-30%" width="140%" height="160%">
      <feGaussianBlur stdDeviation="9" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g opacity=".14" stroke="#f2f4f1" stroke-width="1">
    <path d="M0 122h1200M0 242h1200M0 362h1200M0 482h1200"/>
    <path d="M164 0v630M344 0v630M524 0v630M704 0v630M884 0v630M1064 0v630"/>
  </g>
  <rect x="74" y="70" width="1052" height="490" rx="34" fill="#181a1f" fill-opacity=".68" stroke="#f2f4f1" stroke-opacity=".14" stroke-width="2"/>
  <text x="112" y="150" fill="#f2b84b" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif" font-size="28" font-weight="700">DeepSeek · Tushare · A股股票池</text>
  <text x="112" y="252" fill="#f2f4f1" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif" font-size="84" font-weight="850">硅基文明消费股</text>
  <text x="112" y="352" fill="#f2f4f1" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif" font-size="84" font-weight="850">交易系统</text>
  <g font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif">
    <g transform="translate(112 470)">
      <rect width="956" height="54" rx="14" fill="#121418" stroke="#30343b"/>
      <text x="24" y="36" fill="${lineColor}" font-size="28" font-weight="800">${xml(pct(stats.totalReturnPct, 1))}</text>
      <text x="172" y="35" fill="#9ca39a" font-size="20">回测收益</text>
      <text x="320" y="35" fill="#f2f4f1" font-size="22" font-weight="700">年化 ${xml(pct(stats.cagrPct, 1))}</text>
      <text x="508" y="35" fill="#f2f4f1" font-size="22" font-weight="700">回撤 ${xml(pct(stats.maxDrawdownPct, 1))}</text>
      <text x="694" y="35" fill="#f2f4f1" font-size="22" font-weight="700">夏普 ${stats.sharpe.toFixed(2)}</text>
      <text x="820" y="35" fill="#9ca39a" font-size="18">${xml(money(last))}</text>
    </g>
  </g>
  <polyline points="${points}" fill="none" stroke="${lineColor}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#soft-glow)"/>
</svg>
`;
}

function writeSocialCard(bt: SnapshotBacktest) {
  const docsDir = path.resolve(__dirname, "..", "..", "docs");
  const publicDir = path.resolve(__dirname, "..", "public");
  const svg = socialCardSvg(bt);
  for (const dir of [docsDir, publicDir]) {
    fs.writeFileSync(path.join(dir, "social-card.svg"), svg);
  }
  try {
    for (const dir of [docsDir, publicDir]) {
      execFileSync("rsvg-convert", [
        "-w", "1200",
        "-h", "630",
        "-o", path.join(dir, "social-card.png"),
        path.join(dir, "social-card.svg"),
      ]);
    }
    console.log("  wrote social-card.svg/png");
  } catch (e) {
    console.warn(`  wrote social-card.svg; skipped png render: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// Load .env.local BEFORE importing modules that read process.env at module scope.
(() => {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, k, raw] = m;
    if (process.env[k]) continue;
    process.env[k] = raw.replace(/^["']|["']$/g, "");
  }
})();

async function main() {
  const OUT = path.resolve(__dirname, "..", "..", "docs", "data");
  fs.mkdirSync(OUT, { recursive: true });
  if (process.env.SNAPSHOT_ONLY_SOCIAL_CARD) {
    const existingBacktest = path.join(OUT, "backtest.json");
    if (!fs.existsSync(existingBacktest)) throw new Error("docs/data/backtest.json not found");
    writeSocialCard(JSON.parse(fs.readFileSync(existingBacktest, "utf-8")) as SnapshotBacktest);
    return;
  }

  // Dynamic imports so env loading above lands before any module-scope reads.
  const { readUniverse } = await import("../lib/universe");
  const { fetchAnalyst, fetchSpot, fetchKlines, fetchFundamental } = await import("../lib/pyserver");
  const { scoreSymbols } = await import("../lib/deepseek");
  const { runBacktest } = await import("../lib/backtest");
  const { mapPool } = await import("../lib/concurrent");
  type SymbolSnapshot = import("../lib/deepseek").SymbolSnapshot;
  type SymbolSeries = import("../lib/backtest").SymbolSeries;

  let latestBacktest: SnapshotBacktest | null = null;

  function write(name: string, value: unknown) {
    fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + "\n");
    console.log(`  wrote docs/data/${name}`);
  }

  console.log("== snapshot ==");
  const u = readUniverse();
  write("universe.json", u);

  // ----- analyst ---------------------------------------------------------
  console.log(`[analyst] fetching ${u.entries.length} symbols…`);
  const analyst = await mapPool(u.entries.map((e) => e.symbol), 4, async (sym, idx) => {
    try {
      const a = await fetchAnalyst(sym);
      process.stdout.write(`  ${idx + 1}/${u.entries.length} ${sym} ok\n`);
      return a;
    } catch (e) {
      try {
        const spot = await fetchSpot(sym);
        return {
          symbol: sym,
          current_price: spot.price,
          buy_count: null,
          total_count: null,
          buy_ratio: null,
          consensus_eps_next: null,
          implied_target: null,
          upside_pct: null,
        };
      } catch {
        process.stdout.write(`  ${idx + 1}/${u.entries.length} ${sym} FAIL\n`);
        return { symbol: sym, error: e instanceof Error ? e.message : String(e) };
      }
    }
  });
  write("analyst.json", { generated_at: new Date().toISOString(), items: analyst });

  // ----- signals ---------------------------------------------------------
  if (!process.env.SNAPSHOT_SKIP_SIGNALS) {
    console.log(`[signals] fetching klines + fundamentals for ${u.entries.length} symbols…`);
    const start90 = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      return d.toISOString().slice(0, 10).replaceAll("-", "");
    })();
    const snapshots = await mapPool(u.entries, 4, async (e): Promise<SymbolSnapshot> => {
      const [klines, fund] = await Promise.all([
        fetchKlines(e.symbol, start90).catch(() => []),
        fetchFundamental(e.symbol).catch(() => undefined),
      ]);
      return {
        symbol: e.symbol,
        name: e.name,
        theme: e.theme,
        closes: klines.map((k) => k.close),
        fundamental: fund
          ? { pe_ttm: fund.pe_ttm, pb: fund.pb, market_cap: fund.market_cap }
          : undefined,
      };
    });
    const usable = snapshots.filter((s) => s.closes.length >= 10);
    console.log(`[signals] scoring ${usable.length} symbols with DeepSeek…`);
    const signals = await scoreSymbols(usable);
    write("signals.json", {
      generated_at: new Date().toISOString(),
      fundamentals: snapshots.map((s) => ({
        symbol: s.symbol,
        pe_ttm: s.fundamental?.pe_ttm ?? null,
        pb: s.fundamental?.pb ?? null,
        market_cap: s.fundamental?.market_cap ?? null,
      })),
      signals,
    });
  } else {
    console.log("[signals] skipped");
  }

  // ----- backtest --------------------------------------------------------
  if (!process.env.SNAPSHOT_SKIP_BACKTEST) {
    const endDate = process.env.SNAPSHOT_BACKTEST_END ?? new Date().toISOString().slice(0, 10);
    const startDate = process.env.SNAPSHOT_BACKTEST_START
      ?? (() => {
        const d = new Date(endDate);
        d.setFullYear(d.getFullYear() - 1);
        return d.toISOString().slice(0, 10);
      })();
    const padStart = new Date(startDate);
    padStart.setDate(padStart.getDate() - 120);
    const aksStart = padStart.toISOString().slice(0, 10).replaceAll("-", "");
    const aksEnd = endDate.replaceAll("-", "");

    console.log(`[backtest] window ${startDate} → ${endDate} — loading bars…`);
    const series = (
      await mapPool(u.entries, 6, async (entry): Promise<SymbolSeries | null> => {
        const [klRes, fdRes] = await Promise.allSettled([
          fetchKlines(entry.symbol, aksStart, aksEnd),
          fetchFundamental(entry.symbol),
        ]);
        if (klRes.status !== "fulfilled" || klRes.value.length < 20) return null;
        const fd = fdRes.status === "fulfilled" ? fdRes.value : undefined;
        return {
          entry,
          klines: klRes.value,
          fundamental: fd
            ? { pe_ttm: fd.pe_ttm ?? null, pb: fd.pb ?? null, market_cap: fd.market_cap ?? null }
            : undefined,
        };
      })
    ).filter((s): s is SymbolSeries => s !== null);
    console.log(`[backtest] loaded ${series.length}/${u.entries.length}; running…`);

    const cfg = {
      startCash: 1_000_000,
      rebalanceEveryNDays: 10,
      startDate,
      endDate,
      feeBps: 10,
      maxPositions: 6,
    };
    const result = await runBacktest(series, cfg, (p) => {
      if (p.done === p.total || p.done % 5 === 0) {
        process.stdout.write(`  ${p.phase}: ${p.done}/${p.total}\n`);
      }
    });
    const snapshotBacktest = {
      generated_at: new Date().toISOString(),
      config: result.config,
      stats: result.stats,
      equityCurve: result.equityCurve.map((b) => ({ date: b.date, equity: b.equity, cash: b.cash })),
      trades: result.trades,
    };
    write("backtest.json", snapshotBacktest);
    latestBacktest = snapshotBacktest;
  } else {
    console.log("[backtest] skipped");
    const existingBacktest = path.join(OUT, "backtest.json");
    if (fs.existsSync(existingBacktest)) {
      latestBacktest = JSON.parse(fs.readFileSync(existingBacktest, "utf-8")) as SnapshotBacktest;
    }
  }

  if (latestBacktest) writeSocialCard(latestBacktest);

  write("meta.json", {
    generated_at: new Date().toISOString(),
    universe_count: u.entries.length,
  });
  console.log("done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
