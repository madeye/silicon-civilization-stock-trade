// Utilities for loading dashboard backtest inputs from data-source CSV caches.
//
// The CSVs themselves are produced by the agent via the kimi-datasource MCP
// plugin (stock_finance_data), because the plugin is only available in the
// agent runtime. This module reads the cached files and turns them into the
// SymbolSeries structure expected by lib/backtest.ts.
import fs from "node:fs";
import path from "node:path";
import type { Kline } from "./pyserver";
import type { FundamentalSnapshot, SymbolSeries } from "./backtest";
import type { UniverseEntry } from "./universe";

export interface PriceRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ticker: string;
  name?: string;
}

export interface FinancialRow {
  ticker: string;
  reportDate: string; // YYYYMMDD
  eps?: number | null;
  profitYoy?: number | null;
}

/** Convert project symbol (e.g. "300308") to data-source ticker ("300308.SZ"). */
export function toDataSourceTicker(symbol: string): string {
  const s = symbol.trim();
  if (/\.(SH|SZ|BJ|HK)$/i.test(s)) return s.toUpperCase();
  if (/^(60|68|9)/.test(s)) return `${s}.SH`;
  if (/^(00|30|20)/.test(s)) return `${s}.SZ`;
  if (/^(4|8|92)/.test(s)) return `${s}.BJ`;
  return s;
}

/** Inverse of toDataSourceTicker — strip the exchange suffix. */
export function toProjectSymbol(ticker: string): string {
  return ticker.replace(/\.(SH|SZ|BJ|HK)$/i, "");
}

function parseNumber(v: string | undefined): number | null {
  if (v == null || v === "" || v === "NA" || v === "null") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Parse a price CSV written by stock_finance_data_get_price. */
export function parsePriceCsv(content: string): PriceRow[] {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const idx = {
    open: headers.indexOf("open"),
    high: headers.indexOf("high"),
    low: headers.indexOf("low"),
    close: headers.indexOf("close"),
    volume: headers.indexOf("volume"),
    ticker: headers.indexOf("thscode"),
    time: headers.indexOf("time"),
    name: headers.indexOf("thsname_cn"),
  };
  const rows: PriceRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const date = cols[idx.time]?.trim();
    if (!date) continue;
    rows.push({
      date,
      open: parseNumber(cols[idx.open]) ?? 0,
      high: parseNumber(cols[idx.high]) ?? 0,
      low: parseNumber(cols[idx.low]) ?? 0,
      close: parseNumber(cols[idx.close]) ?? 0,
      volume: parseNumber(cols[idx.volume]) ?? 0,
      ticker: cols[idx.ticker]?.trim() ?? "",
      name: cols[idx.name]?.trim() || undefined,
    });
  }
  return rows;
}

/** Parse a growth or profitability CSV from stock_finance_data. */
export function parseFinancialCsv(content: string, category: "growth" | "profitability"): FinancialRow[] {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const tickerIdx = headers.indexOf("thscode");
  const timeIdx = headers.indexOf("time");

  const colMap: Record<string, string> = {
    growth: "ths_np_atsopc_yoy_stock",
    profitability: "ths_eps_basic_stock",
  };
  const valueIdx = headers.indexOf(colMap[category]);
  if (valueIdx < 0) return [];

  const rows: FinancialRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const ticker = cols[tickerIdx]?.trim();
    const reportDate = cols[timeIdx]?.trim();
    if (!ticker) continue;
    const value = parseNumber(cols[valueIdx]);
    const base: FinancialRow = { ticker, reportDate };
    if (category === "growth") base.profitYoy = value;
    else base.eps = value;
    rows.push(base);
  }
  return rows;
}

/** Report disclosure lag used to avoid look-ahead bias. */
function effectiveDateForReport(reportDate: string): string {
  if (reportDate.length !== 8) return reportDate;
  const year = Number(reportDate.slice(0, 4));
  const month = Number(reportDate.slice(4, 6));
  const day = Number(reportDate.slice(6, 8));
  // Construct in UTC: a local-time constructor plus UTC getters shifts the
  // date one day earlier on UTC+ hosts, leaking each report a day early.
  const d = new Date(Date.UTC(year, month - 1, day));
  // Approximate regulatory disclosure deadlines:
  // Annual (1231) -> end of April; H1 (0630) -> end of August;
  // Q1 (0331) -> end of April; Q3 (0930) -> end of October.
  if (month === 12) d.setUTCDate(d.getUTCDate() + 120);
  else if (month === 6) d.setUTCDate(d.getUTCDate() + 62);
  else d.setUTCDate(d.getUTCDate() + 30);
  return d.toISOString().slice(0, 10).replaceAll("-", "");
}

/** Merge growth and profitability rows into point-in-time fundamentals. */
export function buildFundamentals(
  growthRows: FinancialRow[],
  profitRows: FinancialRow[],
  priceMap: Map<string, PriceRow[]>,
): Map<string, FundamentalSnapshot[]> {
  const bySymbol = new Map<string, FundamentalSnapshot[]>();

  // Index profit rows by ticker+reportDate
  const profitByKey = new Map<string, FinancialRow>();
  for (const r of profitRows) {
    if (r.eps == null) continue;
    profitByKey.set(`${r.ticker}|${r.reportDate}`, r);
  }

  for (const g of growthRows) {
    if (g.profitYoy == null) continue;
    const p = profitByKey.get(`${g.ticker}|${g.reportDate}`);
    if (!p || p.eps == null || p.eps <= 0) continue;

    const ticker = g.ticker;
    const prices = priceMap.get(ticker);
    const effective = effectiveDateForReport(g.reportDate);

    // Approximate PE using the close on the effective date (or next available bar).
    let pe_ttm: number | null = null;
    if (prices && prices.length > 0) {
      const row = prices.find((r) => r.date.replaceAll("-", "") >= effective);
      if (row) {
        pe_ttm = row.close / p.eps;
        if (!Number.isFinite(pe_ttm) || pe_ttm < 0) pe_ttm = null;
      }
    }

    const sym = toProjectSymbol(ticker);
    if (!bySymbol.has(sym)) bySymbol.set(sym, []);
    bySymbol.get(sym)!.push({
      pe_ttm,
      profit_yoy: g.profitYoy,
      effective_date: effective,
    });
  }

  // Sort each symbol's fundamentals by effective_date ascending.
  for (const [, arr] of bySymbol) {
    arr.sort((a, b) => (a.effective_date! < b.effective_date! ? -1 : 1));
  }

  return bySymbol;
}

/** Load all price CSVs in a directory and group by project symbol. */
export function loadPriceMap(cacheDir: string): Map<string, PriceRow[]> {
  const dir = path.join(cacheDir, "prices");
  const map = new Map<string, PriceRow[]>();
  if (!fs.existsSync(dir)) return map;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".csv")) continue;
    const content = fs.readFileSync(path.join(dir, file), "utf-8");
    for (const row of parsePriceCsv(content)) {
      const sym = toProjectSymbol(row.ticker);
      if (!map.has(sym)) map.set(sym, []);
      map.get(sym)!.push(row);
    }
  }
  for (const [sym, rows] of map) {
    rows.sort((a, b) => (a.date < b.date ? -1 : 1));
    map.set(sym, rows);
  }
  return map;
}

/** Load all financial CSVs in a directory. */
export function loadFinancialRows(cacheDir: string): {
  growth: FinancialRow[];
  profitability: FinancialRow[];
} {
  const dir = path.join(cacheDir, "financials");
  const growth: FinancialRow[] = [];
  const profitability: FinancialRow[] = [];
  if (!fs.existsSync(dir)) return { growth, profitability };
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".csv")) continue;
    const content = fs.readFileSync(path.join(dir, file), "utf-8");
    if (file.includes("growth")) {
      growth.push(...parseFinancialCsv(content, "growth"));
    } else if (file.includes("profit")) {
      profitability.push(...parseFinancialCsv(content, "profitability"));
    }
  }
  return { growth, profitability };
}

/** Build SymbolSeries list ready for runBacktest. */
export function buildSymbolSeries(
  entries: UniverseEntry[],
  cacheDir: string,
): { series: SymbolSeries[]; benchmark: PriceRow[] } {
  const priceMap = loadPriceMap(cacheDir);
  const { growth, profitability } = loadFinancialRows(cacheDir);
  const fundamentals = buildFundamentals(growth, profitability, priceMap);

  const series: SymbolSeries[] = [];
  for (const entry of entries) {
    const rows = priceMap.get(entry.symbol);
    if (!rows || rows.length < 30) continue;
    const klines: Kline[] = rows.map((r) => ({
      date: r.date,
      open: r.open,
      high: r.high,
      low: r.low,
      close: r.close,
      volume: r.volume,
    }));
    series.push({
      entry,
      klines,
      fundamentals: fundamentals.get(entry.symbol),
    });
  }

  const benchmark = priceMap.get("000300") ?? [];
  return { series, benchmark };
}
