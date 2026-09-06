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
import { oversoldSignals, oversoldMetrics, STRATEGY_SUMMARY, STRATEGY_VERSION, type ExitProfile } from "./oversoldStrategy";

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
    const content = j.choices[0]?.message?.content ?? "";
    // Validate BEFORE returning: cached() persists whatever doFetch resolves to,
    // so an empty or unparseable json_object response must throw here rather than
    // poison the cache for 12h with a string that downstream JSON.parse rejects.
    if (responseFormat === "json_object") {
      if (!content.trim()) throw new Error("deepseek returned empty content");
      try {
        JSON.parse(content);
      } catch {
        throw new Error("deepseek returned unparseable json_object content");
      }
    }
    return content;
  };

  if (opts.bypassCache) return doFetch();
  return cached(cacheParts, ttl, doFetch);
}

// ----- Strategy-specific helpers ------------------------------------------

export interface SymbolSnapshot {
  symbol: string;
  name?: string | null;
  theme?: string;
  priceDate?: string;   // latest completed daily bar, YYYY-MM-DD
  stale?: boolean;      // missing the latest market session
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
  size: number;          // target fraction of total portfolio equity after risk gating
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

硬性规则：只有超跌信号才能买入：RSI14≤30、收盘价低于MA20至少8%、
距60日最高收盘价回撤至少15%，三项必须同时满足。突破、强动量、低PEG本身不能触发买入。
不足60根有效日线禁止买入，风险警示/ST/退市或已知PE、利润增速非正禁止买入。
基本面与主题用于否决风险；不得编造未提供的订单、财报或景气数据。
反弹至MA20或RSI恢复到50时退出，其他非超跌情况观望，不追涨。
${STRATEGY_SUMMARY}
size表示总资产目标权重，不是可用现金比例。组合上限由代码决定，模型不能放宽。

严格输出 JSON：{"signals":[{"symbol":"...","action":"buy|hold|sell","confidence":0..1,"size":0..1,"rationale":"中文,<=60字"}]}
不要输出任何其他文本。`;

/** Score a batch of symbols in ONE DeepSeek call (token-efficient). */
export async function scoreSymbols(
  snapshots: SymbolSnapshot[],
  opts: { asOf?: string; bypassCache?: boolean; mode?: "live" | "backtest"; exitProfile?: ExitProfile } = {},
): Promise<Signal[]> {
  if (snapshots.length === 0) return [];
  const exitProfile = opts.exitProfile ?? "rebound";
  const system = exitProfile === "rebound" ? STRATEGY_SYSTEM : STRATEGY_SYSTEM.replace(
    "反弹至MA20或RSI恢复到50时退出，其他非超跌情况观望，不追涨。",
    `采用${exitProfile}趋势持有规则，不因反弹至MA20或RSI恢复50而退出。非超跌时不追涨。\n` +
    "此处未提供真实持仓、成本和持有期，不得臆测止损或跟踪退出是否触发；这些退出由持仓执行层判断。",
  );
  const latestDate = snapshots.map((s) => s.priceDate).filter((d): d is string => !!d).sort().at(-1);
  snapshots = snapshots.map((s) => ({ ...s, stale: s.stale || (!!latestDate && s.priceDate !== latestDate) }));
  const userPayload = {
    as_of: opts.asOf ?? new Date().toISOString().slice(0, 10),
    strategy_version: STRATEGY_VERSION,
    exit_profile: exitProfile,
    scoring_rule: STRATEGY_SUMMARY,
    symbols: snapshots.map((s) => ({
      symbol: s.symbol,
      name: s.name ?? undefined,
      theme: s.theme,
      oversold_metrics: oversoldMetrics(s),
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
      { role: "system", content: system },
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
    return oversoldSignals(snapshots, parsed.signals ?? [], exitProfile);
  } catch {
    return oversoldSignals(snapshots, [], exitProfile);
  }
}
