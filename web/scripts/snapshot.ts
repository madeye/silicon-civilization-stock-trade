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
import fs from "node:fs";
import path from "node:path";

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
  // Dynamic imports so env loading above lands before any module-scope reads.
  const { readUniverse } = await import("../lib/universe");
  const { fetchAnalyst, fetchSpot, fetchKlines, fetchFundamental } = await import("../lib/pyserver");
  const { scoreSymbols } = await import("../lib/deepseek");
  const { runBacktest } = await import("../lib/backtest");
  const { mapPool } = await import("../lib/concurrent");
  type SymbolSnapshot = import("../lib/deepseek").SymbolSnapshot;
  type SymbolSeries = import("../lib/backtest").SymbolSeries;

  const OUT = path.resolve(__dirname, "..", "..", "docs", "data");
  fs.mkdirSync(OUT, { recursive: true });

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
    write("backtest.json", {
      generated_at: new Date().toISOString(),
      config: result.config,
      stats: result.stats,
      equityCurve: result.equityCurve.map((b) => ({ date: b.date, equity: b.equity, cash: b.cash })),
      trades: result.trades,
    });
  } else {
    console.log("[backtest] skipped");
  }

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
