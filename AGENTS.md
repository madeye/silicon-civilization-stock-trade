# Repository Guidelines

## Project Structure & Module Organization

This repository contains a Chinese-market “silicon civilization consumer stocks” trading system.

- `web/`: Next.js 15 App Router frontend, API routes, TypeScript backtests, DeepSeek integration, SQLite cache, and tests.
- `web/app/`: UI pages and route handlers. Key pages include `page.tsx`, `signals/page.tsx`, `backtest/page.tsx`, and `dashboard/page.tsx`.
- `web/lib/`: shared domain logic such as `universe.ts`, `pyserver.ts`, `deepseek.ts`, `backtest.ts`, `dashboardBacktest.ts`, `dashboardData.ts`, and `cache.ts`.
- `web/test/`: Node test-runner TypeScript tests named `*.test.ts`.
- `web/data/universe.json`: editable stock universe data.
- `pyserver/`: FastAPI sidecar for Tushare Pro access and SQLite market-data caching.

## Build, Test, and Development Commands

- `cd pyserver && uv sync`: install locked Python dependencies.
- `cd pyserver && uv run uvicorn main:app --port 8001 --reload`: run the Tushare sidecar locally.
- `cd web && npm install`: install frontend dependencies.
- `cd web && npm run dev`: start the Next.js dev server at `http://localhost:3000`.
- `cd web && npm test`: run TypeScript unit tests via `node --test --import tsx`.
- `cd web && ./node_modules/.bin/tsc --noEmit`: type-check the frontend.
- `cd web && npm run build`: create a production Next.js build.
- Dashboard data build (agent-only): use the MCP kimi-datasource plugin to fetch daily prices and financial-index CSVs into `web/.cache/datasource/prices/` and `web/.cache/datasource/financials/`, then run `cd web && npx tsx scripts/build-dashboard.ts` to generate `web/data/dashboard-backtest.json`.

## Coding Style & Naming Conventions

Use TypeScript for frontend and shared web logic. Prefer small helpers in `web/lib/` and keep route handlers thin. Follow existing 2-space indentation in TS/TSX files, `camelCase` for variables/functions, and `PascalCase` for React components. Keep Python sidecar code typed where practical with Pydantic models for HTTP contracts. Do not commit generated caches such as `cache.db`, `.env`, `.env.local`, or dependency directories.

## Testing Guidelines

Frontend tests use Node’s built-in test runner. Place tests in `web/test/` with names like `backtest.test.ts` and cover regression-prone logic in `web/lib/`, especially caching, concurrency, universe refresh, and backtest behavior. Run `npm test` and `tsc --noEmit` before submitting changes that touch the web app.

## Commit & Pull Request Guidelines

Recent history uses concise imperative commit subjects, for example `Replace akshare with Tushare Pro` and `Fix backtest 500 + expand test coverage 1→18`. Keep commits focused and avoid mixing web, sidecar, and data-only changes unless they are part of one feature. Pull requests should include a behavior summary, test commands run, linked issue if available, screenshots for UI changes, and required environment variables.

## Security & Configuration Tips

Copy `pyserver/env.example` to `pyserver/.env` and set `TUSHARE_TOKEN`. Copy `web/env.example.txt` to `web/.env.local` and set `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, and `PYSERVER_URL` as needed. Keep API keys local only.
