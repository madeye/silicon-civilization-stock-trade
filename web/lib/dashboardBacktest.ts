// Deterministic oversold scorer shared with live signal risk gates.
import type { Scorer } from "./backtest";
import { oversoldSignals, type ExitProfile } from "./oversoldStrategy";

export function ruleBasedScorer(exitProfile: ExitProfile = "rebound"): Scorer {
  return async (snapshots) => oversoldSignals(snapshots, undefined, exitProfile);
}
