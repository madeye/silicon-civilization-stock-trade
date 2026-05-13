# Silicon Civilization Stock Trade

A trading strategy system focused on **硅基文明消费股** — consumer stocks benefiting from the AI/silicon-civilization wave (AI hardware, AI-native consumer apps, smart-device makers, AI-enabled robotics consumer goods, etc.).

## Architecture

```
┌──────────────────────────┐       ┌──────────────────────────┐
│   Next.js webapp (web/)  │ HTTP  │  Python sidecar (pyserver/) │
│  - UI: watchlist, klines │ ────► │  - akshare wrapper           │
│  - Backtest engine (TS)  │       │  - SQLite kline + fundamental│
│  - DeepSeek strategy LLM │       │    cache (TTL-tiered)        │
│  - SQLite LLM cache      │       │  - FastAPI                   │
└──────────────────────────┘       └──────────────────────────┘
```

### Key design choices for API frugality

| Layer | Cache | TTL |
|-------|-------|-----|
| akshare daily klines | SQLite (`pyserver/cache.db`) | until next trading day close |
| akshare fundamentals (PE/PB/营收) | SQLite | 24h |
| akshare realtime quote | in-memory LRU | 30s |
| DeepSeek strategy calls | SQLite keyed by `sha256(prompt+model)` | 12h |
| Backtest LLM signals | replayed from cache, never re-asked | ∞ |

`DeepSeek v4 pro` is invoked **once per (symbol, trading-day)** for live signals, and once per (symbol, backtest bar) but resolved from cache on re-runs. Backtests stream cached signals; live mode batches symbols into a single prompt with multi-symbol JSON output.

## Quickstart

```bash
# 1. Python sidecar (akshare) — managed by uv
cd pyserver
uv sync
uv run uvicorn main:app --port 8001 --reload

# 2. Next.js webapp
cd web
npm install
cp env.example.txt .env.local     # add DEEPSEEK_API_KEY
npm run dev
```

Open http://localhost:3000.

## Configuration

`web/.env.local`:
```
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-v4-pro
PYSERVER_URL=http://localhost:8001
```

## Default watchlist

See `web/lib/universe.ts` — a curated set of A-share + HK consumer names tied to silicon-civilization themes (AI glasses, AI PC, AI toy/玩具, 机器人, smart appliances). Edit freely in the UI.
