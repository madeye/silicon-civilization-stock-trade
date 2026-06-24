# Loading-speed & API-limit audit

_Scope: the data-loading path of the web front (`web/`) and the Tushare/AkShare
sidecar (`pyserver/`). Goal: faster page loads without tripping upstream rate
limits. Measured on a warm `cache.db` (37 MB), 87-symbol universe._

## TL;DR

The two goals are in tension only if you keep fetching live. The resolution is
to **serve from cache aggressively and bound every upstream burst centrally**.
Three changes do almost all the work:

1. Parallelize pyserver `/analysts` (today it's serial → unusable) and switch the
   frontend to it — collapses 87 HTTP requests into 1 and serves warm symbols
   instantly.
2. **[DONE]** Give sell-side consensus (target price, buy/total ratings,
   next-year EPS) a long TTL — it moves on the order of weeks, so a 7-day cache
   means a watchlist load is almost entirely SQLite-served and upstream is
   touched rarely. Upside % is recomputed on the frontend from the live `/spots`
   price so the long TTL never shows a stale number.
3. Stale-while-revalidate + single-flight in the pyserver cache — an expired
   entry serves stale instantly and refreshes once in the background, so user
   latency is decoupled from the 30 s upstream hangs.

## Measurements (warm cache)

| Path | Result |
|---|---|
| `/spots?symbols=…` (87, 12-wide threadpool) | **2.1 s** ✅ |
| `/analysts?symbols=…` (87, **serial** loop) | **>118 s timeout** ❌ |
| `/analyst?symbol=…` cache hit | 0.04 s |
| `/analyst?symbol=…` cache miss (688256, 300474) | **30 s timeout** ❌ |
| analyst cache entries | 95 total — **22 already expired** (rolling 24 h) |
| analyst TTL split | 94 × 24 h, 1 × 60 s |

## Findings

### F1 — `/analysts` batch is serial → the frontend can't use it (P0)
`pyserver/main.py:935` loops `for symbol in uniq: analyst(symbol)` with no
concurrency. 87 symbols took >118 s. Because of this, `UniverseTable.tsx:23`
hard-codes `ANALYST_BATCH_SIZE = 1` and fires **87 individual** requests at
`ANALYST_BATCH_CONCURRENCY = 8`. Even all-warm that's 87 browser→Next→pyserver
round-trips; with any expired symbols, several workers each block on a 30 s
upstream call (route timeout is 35 s, `analyst/batch/route.ts:7`).

Contrast `/spots` (`main.py:1019`): cache-hits served inline, only **misses**
fan out across a `ThreadPoolExecutor` — that's why it's 2 s. `/analysts` should
mirror it exactly, with the fan-out bounded by the existing `report_rc`/HK token
buckets so it stays under upstream limits.

### F2 — Rolling 24 h TTL scatters expiry → stampede every load (P0) — **analyst part DONE**
`analyst` and `fundamental` cached with flat `24 * 3600`. Daily-fetched data
expires at scattered times, so a fresh cohort is expired on most loads (22/95 at
audit time). Each expired symbol triggers a live refetch that can hang 30 s
**and** adds to a synchronized upstream burst — slow *and* rate-limit risk.

**Done for analyst:** `ANALYST_TTL = 7 days` for any payload carrying real
signal (target or ratings), `ANALYST_NEGATIVE_TTL = 12 h` for genuinely dataless
symbols (replaces the old 60 s churn, see F4). New writes verified at 604800 s;
existing entries migrate to the long TTL as they expire. The frontend recomputes
upside from the live price (`UniverseTable.upsideOf`) so the week-long cache
never surfaces a stale upside %.

**Still open — fundamental:** PE/PB/market-cap *do* move daily, so the right fix
there is trading-close alignment via the existing
`seconds_until_next_trading_close()` (`main.py:110`), not a multi-day TTL.

### F2b — Eastmoney-direct analyst source (P0) — **DONE**
The analyst endpoint previously chained three upstream calls —
`ak.stock_research_report_em` + `ak.stock_profit_forecast_ths` + the rate-limited
`_pro.report_rc` (2/min). Cold misses hung 30 s in the token bucket.

Replaced with `_em_research_consensus()`: one token-free call to
`reportapi.eastmoney.com/report/list` (6 s timeout) returning ratings, next-year
EPS forecast, forward PE and **real broker target prices** (`indvAimPriceT`),
aggregated by median. akshare stays as the fallback. `report_rc` is now reached
only for symbols with *no* research signal anywhere, with `attempts=1` so an
uncovered symbol can't pin a worker.

Measured (cold cache, 87 symbols, 8-wide — the frontend's load pattern):

| | before | after |
|---|---|---|
| per cold symbol | up to **30 s** hang | **0.45–0.78 s** |
| full cold universe | minutes | **6.8 s** |
| full warm universe | — | **0.2 s** |
| symbols hitting `report_rc` | most cold misses | **1 / 87** (the only uncovered name) |

Bonus: targets are now real published targets where available (e.g. 寒武纪 1676.5)
instead of always the EPS×PE estimate that needed the `PE > 300` sanity guard.

### F2c — Optional kimi-datasource realtime source (P2) — **DONE**
The Kimi Code CLI ships a `kimi-datasource` plugin (同花顺/iFinD data). Its MCP
server is a **pure HTTP proxy** (`api.kimi.com/coding/v1/tools`) — no LLM — so we
drive it directly over stdio rather than via `kimi -p` (whose LLM agent adds a
~20 s fixed floor: measured 21.7 s for 2 tickers vs **0.15 s** for a direct
3-ticker `query_stock` call).

Measured trade-off vs the existing sources:

| source | 87-symbol spot | notes |
|---|---|---|
| easy-tdx (current primary) | **2.1 s** | local, quota-free, parallel |
| kimi direct (sequential, 3/call) | ~5 s | realtime intraday + pct_change |
| `kimi -p` (LLM) | ~30 s+ | unusable in hot path |

So kimi is **not** made the A-share primary (tdx already wins). It is wired as
an *optional* accelerator, auto-detected (`_KimiDatasource.available()` — plugin
mjs + node + credentials; opt out with `PYSERVER_DISABLE_KIMI=1`):
- **A-share:** fallback after an easy-tdx miss, *before* the 3 s akshare and
  rate-limited Tushare `_pro.daily` paths — faster recovery and less Tushare load.
- **HK:** now the **primary realtime** source (verified: 腾讯 428.2 live), where
  before HK only had akshare's slow last-close.

Fail-safe: one long-lived subprocess serialized under a lock, per-call timeout,
60 s cooldown on error, and a hard availability gate — absent/broken kimi leaves
every existing path unchanged.

### F3 — Cache misses hang 30 s+; no stale-while-revalidate (P1)
On miss, `analyst()` makes several upstream calls (`_ak_a_spot`, `daily_basic`,
`stock_research_report_em`, `stock_profit_forecast_ths`, and rate-limited
`report_rc` at 2/min → up to 65 s in the token bucket). The request blocks the
user the whole time. There is no in-flight dedup at the cache layer, so N
concurrent requests for the same expired symbol all refetch (the `pyserver.ts`
`inflight` map only dedups within a single Next process and releases after
100 ms). Add: serve stale immediately + single-flight background refresh keyed
by cache key.

### F4 — 60 s negative-cache causes perpetual re-hang (P1) — **DONE**
When a symbol yielded no research data it was cached for only 60 s, so it
re-fetched — and re-hung on the slow upstream — on essentially every load. Now
`ANALYST_NEGATIVE_TTL = 12 h`. Still worth adding: a hard per-`analyst()`
upstream time budget so one symbol can't pin a worker for 30 s (relevant once
the `/analysts` parallelization in F1 lands).

### F5 — Signals page is a synchronous 261-call burst (P2)
`app/signals/page.tsx` server-renders **blocking**: `mapPool(universe, 6, …)`
over all 87 symbols, each doing `fetchKlines + fetchFundamental + fetchSpot` =
~261 upstream calls before the page paints. Cold/expired cache → minutes of TTFB
and a large synchronized burst. Make it incremental like `UniverseTable`
(render shell, stream snapshots client-side via a batch endpoint) or precompute
on a schedule.

## Recommended order of work

| # | Change | Files | Wins |
|---|---|---|---|
| 1 | Parallelize `/analysts` (cache-hit inline, miss → threadpool under token buckets) | `pyserver/main.py:935` | speed + limits |
| 2 | Frontend uses real batches (`ANALYST_BATCH_SIZE` 20–40, fewer concurrent) | `web/app/UniverseTable.tsx:23` | speed |
| 3 | Trading-close-aligned + multi-day TTL for analyst/fundamental | `pyserver/main.py` (TTL sites) | speed + limits |
| 4 | Stale-while-revalidate + single-flight in cache layer | `pyserver/main.py` (`cache_get`/new helper) | speed + limits |
| 5 | Longer negative-cache TTL; per-symbol upstream time cap | `pyserver/main.py:882` | limits |
| 6 | Make `/signals` incremental or precomputed | `web/app/signals/page.tsx` | speed + limits |

Items 1–4 are the high-leverage set: each one independently makes loads faster
*and* cuts upstream calls, so they push both goals the same direction instead of
trading off.
