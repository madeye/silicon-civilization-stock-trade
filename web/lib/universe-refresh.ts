// DeepSeek-driven universe refresh.
//
// Asks the model to act as a sector curator: given the current watchlist
// and the 硅基文明消费 thesis, propose ADDS / REMOVES / RECLASSIFIES.
// Every proposed symbol is validated against pyserver before being written
// (DeepSeek will otherwise hallucinate codes that don't trade).
import { chat } from "./deepseek";
import { fetchFundamental } from "./pyserver";
import type { UniverseEntry, UniverseFile } from "./universe";
import { readUniverse, writeUniverse } from "./universe";

export interface RefreshProposal {
  adds: UniverseEntry[];
  removes: string[];                       // symbols to drop
  reclassifies: { symbol: string; theme: string }[];
  rationale: string;
}

export interface RefreshResult {
  proposal: RefreshProposal;
  applied: {
    added: UniverseEntry[];
    rejected: { symbol: string; reason: string }[];
    removed: string[];
    reclassified: { symbol: string; from: string; to: string }[];
  };
  finalCount: number;
}

const CURATOR_SYSTEM = `你是中国 A 股与港股的硅基文明消费股研究员。

主题：硅基文明（AI 算力体）自身为了存在与扩张需要"消费"的东西 ——
算力芯片、光模块/高速互连、AI 服务器、液冷散热、功率半导体（IGBT/SiC/MOSFET）、
电力(绿电+核电)、IDC、HBM/存储、半导体设备与材料、高速 PCB/CCL、晶圆代工、云。

任务：审阅当前股票池，发现遗漏的子主题与未覆盖的龙头，识别需要剔除的标的或重新分类的标的。

要求：
- 添加项必须是 A 股或港股真实上市公司，给出股票代码（A 股 6 位数字或 hk 前缀港股）、中文简称、所属子主题、一句话说明。
- 每个添加项必须标注 global_supply (布尔)：是否进入全球 AI 供应链（向 NVIDIA / AMD / Apple / Google /
  Microsoft / TSMC / 三星 / 海力士 / 全球 IDM 大批量供货）。纯内销标 false。
- 优先补齐"龙头缺失"的子主题，举例：之前漏了 胜宏科技 (300476) 在 AI-PCB、工业富联 (601138) 在 AI 服务器、
  整条 AIDC 功率半导体链 (IGBT/SiC/MOSFET)。
- 不要包含 ST、暂停上市、纯人类消费品（白酒/食品/服饰）。
- 子主题命名沿用当前列表（算力/AI芯片、光模块、AI服务器、液冷、电力、IDC、功率半导体、存储/HBM、半导体设备、半导体材料、AI-PCB、晶圆代工、云/AI基建）。

严格输出 JSON：
{
  "adds": [{"symbol":"...","name":"...","theme":"...","note":"...","global_supply":true|false}, ...],
  "removes": ["symbol", ...],
  "reclassifies": [{"symbol":"...","theme":"新主题"}, ...],
  "rationale": "中文,<=200字,总结主要变更与逻辑"
}
不要输出其他文本。`;

export async function proposeRefresh(current: UniverseFile): Promise<RefreshProposal> {
  const userPayload = {
    current_entries: current.entries.map((e) => ({
      symbol: e.symbol,
      name: e.name,
      theme: e.theme,
    })),
    distinct_themes: [...new Set(current.entries.map((e) => e.theme))],
  };
  const raw = await chat(
    [
      { role: "system", content: CURATOR_SYSTEM },
      { role: "user", content: JSON.stringify(userPayload) },
    ],
    { responseFormat: "json_object", temperature: 0.3, bypassCache: true },
  );
  const parsed = JSON.parse(raw) as Partial<RefreshProposal>;
  return {
    adds: parsed.adds ?? [],
    removes: parsed.removes ?? [],
    reclassifies: parsed.reclassifies ?? [],
    rationale: parsed.rationale ?? "",
  };
}

/** Validate a symbol by calling pyserver /fundamental. Returns true if pyserver
 *  knows it (200) regardless of whether all fields populated. */
async function validateSymbol(symbol: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    const f = await fetchFundamental(symbol);
    // Even if fields are null, pyserver returned 200 -> symbol parses + tushare didn't 502.
    if (!f) return { ok: false, reason: "pyserver returned empty" };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

export async function applyRefresh(
  current: UniverseFile,
  proposal: RefreshProposal,
  opts: { onValidate?: (symbol: string, ok: boolean) => void } = {},
): Promise<RefreshResult> {
  const known = new Map(current.entries.map((e) => [e.symbol, e]));

  // 1. Validate adds in parallel (bounded).
  const added: UniverseEntry[] = [];
  const rejected: { symbol: string; reason: string }[] = [];
  const ADD_CONCURRENCY = 6;
  const candidates = proposal.adds.filter((a) => a.symbol && !known.has(a.symbol));
  for (let i = 0; i < candidates.length; i += ADD_CONCURRENCY) {
    const slice = candidates.slice(i, i + ADD_CONCURRENCY);
    const results = await Promise.all(
      slice.map(async (a) => {
        const v = await validateSymbol(a.symbol);
        opts.onValidate?.(a.symbol, v.ok);
        return { add: a, v };
      }),
    );
    for (const { add, v } of results) {
      if (v.ok) added.push(add);
      else rejected.push({ symbol: add.symbol, reason: v.reason ?? "unknown" });
    }
  }

  // 2. Apply removes (only if currently present).
  const removeSet = new Set(proposal.removes.filter((s) => known.has(s)));

  // 3. Apply reclassifies.
  const reclassMap = new Map(
    proposal.reclassifies
      .filter((r) => known.has(r.symbol) && !removeSet.has(r.symbol))
      .map((r) => [r.symbol, r.theme]),
  );
  const reclassified: { symbol: string; from: string; to: string }[] = [];

  const newEntries: UniverseEntry[] = [];
  for (const e of current.entries) {
    if (removeSet.has(e.symbol)) continue;
    const newTheme = reclassMap.get(e.symbol);
    if (newTheme && newTheme !== e.theme) {
      reclassified.push({ symbol: e.symbol, from: e.theme, to: newTheme });
      newEntries.push({ ...e, theme: newTheme });
    } else {
      newEntries.push(e);
    }
  }
  newEntries.push(...added);

  const next: UniverseFile = {
    ...current,
    updated_at: new Date().toISOString().slice(0, 10),
    updated_by: "deepseek-refresh",
    entries: newEntries,
  };
  writeUniverse(next);

  return {
    proposal,
    applied: { added, rejected, removed: [...removeSet], reclassified },
    finalCount: newEntries.length,
  };
}

export async function refreshUniverse(
  opts: { onValidate?: (symbol: string, ok: boolean) => void } = {},
): Promise<RefreshResult> {
  const current = readUniverse();
  const proposal = await proposeRefresh(current);
  return applyRefresh(current, proposal, opts);
}
