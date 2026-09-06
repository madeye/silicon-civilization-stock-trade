// Deterministic oversold scorer shared with live signal risk gates.
import type { Scorer } from "./backtest";
import { oversoldSignals } from "./oversoldStrategy";

export function ruleBasedScorer(): Scorer {
  return async (snapshots) => oversoldSignals(snapshots);
}
