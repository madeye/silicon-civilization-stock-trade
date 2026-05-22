// DeepSeek v4 client with aggressive caching.
//
// API-frugality strategy:
//   1. SQLite-cache every (model, messages) tuple for 12h by default.
//   2. Batch multi-symbol scoring into ONE prompt with JSON-array output.
//   3. Stable system prompt sits at messages[0] so DeepSeek's own server-side
//      KV-cache (free) hits on every rebalance during a backtest.
//   4. Backtest mode: never set bypassCache — historical bars are deterministic,
//      so the first run pays the token cost and every subsequent run is free.
//   5. `DEEPSEEK_MODEL_BACKTEST` overrides the model for backtest sweeps —
//      default to v4-flash there to halve token spend on large windows.
import { cached } from "./cache";

const API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-pro";
const BACKTEST_MODEL = process.env.DEEPSEEK_MODEL_BACKTEST ?? "deepseek-v4-flash";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  responseFormat?: "json_object" | "text";
  ttlSeconds?: number;
  bypassCache?: boolean;
}

export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<string> {
  if (!API_KEY) throw new Error("DEEPSEEK_API_KEY is not set");
  const model = opts.model ?? MODEL;
  const temperature = opts.temperature ?? 0.2;
  const responseFormat = opts.responseFormat ?? "text";
  const ttl = opts.ttlSeconds ?? 12 * 3600;

  const cacheParts = { model, temperature, responseFormat, messages };
  const doFetch = async () => {
    const body: Record<string, unknown> = {
      model,
      messages,
      temperature,
      stream: false,
    };
    if (responseFormat === "json_object") {
      body.response_format = { type: "json_object" };
    }
    const r = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      throw new Error(`deepseek ${r.status}: ${await r.text()}`);
    }
    const j = (await r.json()) as {
      choices: { message: { content: string } }[];
    };
    return j.choices[0]?.message?.content ?? "";
  };

  if (opts.bypassCache) return doFetch();
  return cached(cacheParts, ttl, doFetch);
}

// ----- Strategy-specific helpers ------------------------------------------

export interface SymbolSnapshot {
  symbol: string;
  name?: string | null;
  theme?: string;
  closes: number[];      // last ~60 daily closes, oldest first
  fundamental?: {
    pe_ttm?: number | null;
    pb?: number | null;
    market_cap?: number | null;
    profit_yoy?: number | null;
  };
}

export interface Signal {
  symbol: string;
  action: "buy" | "hold" | "sell";
  confidence: number;    // 0..1
  size: number;          // 0..1 fraction of available capital
  rationale: string;
}

function calcPeg(pe?: number | null, profitYoyPct?: number | null): number | null {
  if (pe == null || profitYoyPct == null || pe <= 0 || profitYoyPct <= 0) {
    return null;
  }
  return Number((pe / profitYoyPct).toFixed(3));
}

const STRATEGY_SYSTEM = `你是一名专注于"硅基文明消费"主题的中国市场量化策略师。

主题定义：将 AI / 硅基文明视为一个新兴文明，其自身需要"消费"的不是人类消费品，
而是支撑算力存在与扩张的基础投入——算力芯片、光模块/高速互连、AI 服务器、
液冷散热、电力(尤其绿电与核电)、IDC 数据中心、HBM/存储、半导体设备与材料、
高速 PCB、晶圆代工、云计算。我们做多这些"喂养"硅基文明的卖铲人。

任务：给定一组上述主题股票的近期价格序列与基本面快照，输出 5-20 个交易日的
交易动作。三大维度平衡评估：基本面估值（PEG/利润增速/估值匹配）、主题景气度
（算力需求边际变化、订单/出货传导、市值位置）、价格动量（趋势、均线、动量与
拥挤度）。

决策权重：基本面估值约 40%，主题景气度约 30%，价格动量与择时约 30%。三者中
任意一项强势均可成为买入理由；高 PE 但利润增速与主题景气度同时强、且价格处于
有效突破的标的可以买入；PEG 偏低但主题/动量同时走弱的标的不必强买。卖出条件：
PEG 显著恶化、或主题景气度反转、或价格跌破关键均线且伴随成交萎缩。

严格输出 JSON：{"signals":[{"symbol":"...","action":"buy|hold|sell","confidence":0..1,"size":0..1,"rationale":"中文,<=60字"}]}
不要输出任何其他文本。`;

/** Score a batch of symbols in ONE DeepSeek call (token-efficient). */
export async function scoreSymbols(
  snapshots: SymbolSnapshot[],
  opts: { asOf?: string; bypassCache?: boolean; mode?: "live" | "backtest" } = {},
): Promise<Signal[]> {
  if (snapshots.length === 0) return [];
  const userPayload = {
    as_of: opts.asOf ?? new Date().toISOString().slice(0, 10),
    scoring_rule: "40/30/30 三维平衡：基本面(PEG=pe_ttm/profit_yoy_pct,越低越优)40%、主题景气30%、价格动量30%。任一维度强势可作买入触发。",
    symbols: snapshots.map((s) => ({
      symbol: s.symbol,
      name: s.name ?? undefined,
      theme: s.theme,
      // truncate to last 30 closes to keep prompt small while preserving trend
      closes_tail30: s.closes.slice(-30).map((x) => Number(x.toFixed(3))),
      pe_ttm: s.fundamental?.pe_ttm ?? null,
      pb: s.fundamental?.pb ?? null,
      market_cap_yi: s.fundamental?.market_cap ?? null,
      profit_yoy_pct: s.fundamental?.profit_yoy ?? null,
      peg: calcPeg(s.fundamental?.pe_ttm, s.fundamental?.profit_yoy),
    })),
  };

  const raw = await chat(
    [
      { role: "system", content: STRATEGY_SYSTEM },
      { role: "user", content: JSON.stringify(userPayload) },
    ],
    {
      model: opts.mode === "backtest" ? BACKTEST_MODEL : MODEL,
      responseFormat: "json_object",
      temperature: 0.2,
      bypassCache: opts.bypassCache,
    },
  );

  try {
    const parsed = JSON.parse(raw) as { signals?: Signal[] };
    return parsed.signals ?? [];
  } catch {
    return [];
  }
}
