// Per-symbol analyst fallback, kept out of the route file because Next.js
// route modules may only export route handlers.
import { fetchAnalyst, type Analyst } from "./pyserver";
import { mapPool } from "./concurrent";

const FALLBACK_CONCURRENCY = 4;
const FALLBACK_PER_SYMBOL_TIMEOUT_MS = 10_000;

export function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`analyst batch timeout after ${ms}ms`)), ms);
  });
}

function nullAnalyst(symbol: string): Analyst {
  return {
    symbol,
    buy_count: null,
    total_count: null,
    buy_ratio: null,
    consensus_eps_next: null,
    implied_target: null,
    current_price: null,
    upside_pct: null,
  };
}

export interface FallbackResult {
  data: Analyst[];
  anySucceeded: boolean;
}

// Per-symbol fallback when the batch endpoint times out. Each call is bounded so
// one stuck symbol can't pin a worker for the lib default (180s). `anySucceeded`
// lets the caller distinguish a real pyserver outage from "no analyst data".
export async function fallback(
  symbols: string[],
  fetchOne: (symbol: string) => Promise<Analyst> = fetchAnalyst,
): Promise<FallbackResult> {
  let anySucceeded = false;
  const data = await mapPool(symbols, FALLBACK_CONCURRENCY, async (symbol) => {
    try {
      const result = await Promise.race([
        fetchOne(symbol),
        timeout(FALLBACK_PER_SYMBOL_TIMEOUT_MS),
      ]);
      anySucceeded = true;
      return result;
    } catch {
      return nullAnalyst(symbol);
    }
  });
  return { data, anySucceeded };
}
