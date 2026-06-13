// Deterministic, rule-based strategy implementation of the project's 40/30/30
// selection logic. Used by the Dashboard backtest path so results are reproducible
// and do not consume LLM tokens.
//
// Scoring weights follow the DeepSeek system prompt in lib/deepseek.ts:
//   40% fundamentals (PEG + profit growth / valuation match)
//   30% theme momentum (average 20-day return of the sub-theme)
//   30% price momentum (individual 20-day return vs 20-day MA)
//
// All inputs are point-in-time: rebalance at date D only sees closes before D
// and fundamentals whose effective_date <= D (handled in runBacktest).
import type { Signal, SymbolSnapshot } from "./deepseek";
import type { Scorer } from "./backtest";

export interface RuleBasedScorerOptions {
  /** Minimum number of historical closes required to score a symbol. */
  minCloses?: number;
  /** Lookback window for momentum calculations. */
  momentumDays?: number;
  /** Fundamental weight (0-1). */
  fundamentalWeight?: number;
  /** Theme momentum weight (0-1). */
  themeWeight?: number;
  /** Price momentum weight (0-1). */
  priceWeight?: number;
}

interface ScoredStock {
  symbol: string;
  name?: string | null;
  theme?: string;
  momentum20: number;
  maRatio: number;
  peg: number | null;
  fundamentalRaw: number | null;
}

function rankNormalize(values: (number | null)[]): number[] {
  const valid = values
    .map((v, i) => ({ v, i }))
    .filter((x): x is { v: number; i: number } => x.v != null);
  if (valid.length === 0) return values.map(() => 0);
  valid.sort((a, b) => a.v - b.v);
  const ranks = new Array<number>(values.length).fill(0);
  // Average-rank ties so identical values receive identical scores.
  let start = 0;
  for (let i = 1; i <= valid.length; i++) {
    if (i === valid.length || valid[i].v !== valid[start].v) {
      const avgRank = (start + i - 1) / 2;
      const normalized = avgRank / Math.max(valid.length - 1, 1);
      for (let j = start; j < i; j++) {
        ranks[valid[j].i] = normalized;
      }
      start = i;
    }
  }
  return ranks;
}

/** Build a scorer that ranks the universe by the 40/30/30 rule. */
export function ruleBasedScorer(options: RuleBasedScorerOptions = {}): Scorer {
  const {
    minCloses = 25,
    momentumDays = 20,
    fundamentalWeight = 0.4,
    themeWeight = 0.3,
    priceWeight = 0.3,
  } = options;
  const totalWeight = fundamentalWeight + themeWeight + priceWeight;

  return async (snapshots: SymbolSnapshot[], { asOf: _asOf }): Promise<Signal[]> => {
    const scored: ScoredStock[] = [];
    for (const s of snapshots) {
      const closes = s.closes;
      if (closes.length < minCloses) continue;
      const current = closes[closes.length - 1];
      const past = closes[closes.length - 1 - momentumDays];
      const momentum20 = current / past - 1;
      const ma20 = closes.slice(-momentumDays).reduce((a, b) => a + b, 0) / momentumDays;
      const maRatio = current / ma20;

      const pe = s.fundamental?.pe_ttm;
      const profitYoy = s.fundamental?.profit_yoy;
      let peg: number | null = null;
      let fundamentalRaw: number | null = null;
      if (pe != null && pe > 0 && profitYoy != null && profitYoy > 0) {
        peg = pe / profitYoy;
        fundamentalRaw = peg > 0 ? 1 / peg : null;
      }

      scored.push({
        symbol: s.symbol,
        name: s.name,
        theme: s.theme,
        momentum20,
        maRatio,
        peg,
        fundamentalRaw,
      });
    }
    if (scored.length === 0) return [];

    // Theme-level momentum: average 20-day return of members.
    const themeSum = new Map<string, number>();
    const themeCount = new Map<string, number>();
    for (const s of scored) {
      const theme = s.theme || "未分类";
      themeSum.set(theme, (themeSum.get(theme) ?? 0) + s.momentum20);
      themeCount.set(theme, (themeCount.get(theme) ?? 0) + 1);
    }
    const themeAvg = new Map<string, number>();
    for (const [theme, sum] of themeSum) {
      themeAvg.set(theme, sum / (themeCount.get(theme) ?? 1));
    }

    // Normalize each component by rank so weights are regime-invariant.
    const fScores = rankNormalize(scored.map((s) => s.fundamentalRaw));
    const pScores = rankNormalize(scored.map((s) => s.momentum20));
    const tScores = rankNormalize(
      scored.map((s) => themeAvg.get(s.theme || "未分类") ?? 0),
    );

    const signals: Signal[] = scored.map((s, i) => {
      const total =
        (fundamentalWeight * fScores[i] +
          themeWeight * tScores[i] +
          priceWeight * pScores[i]) /
        totalWeight;
      const pegText = s.peg != null ? s.peg.toFixed(2) : "-";
      const momText = `${(s.momentum20 * 100).toFixed(1)}%`;
      return {
        symbol: s.symbol,
        action: "buy",
        confidence: Math.max(0, Math.min(1, total)),
        size: 1,
        rationale: `PEG${pegText} 动量${momText} 主题${(tScores[i] * 100).toFixed(0)}分`,
      };
    });

    return signals.sort((a, b) => b.confidence - a.confidence);
  };
}
