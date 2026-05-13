# pyserver

FastAPI sidecar that wraps [akshare](https://github.com/akfamily/akshare) and exposes only the endpoints the webapp needs.

All responses are cached in `cache.db` (SQLite) with tiered TTLs:

| Endpoint | TTL |
|---|---|
| `GET /klines` | until next 15:30 CN market close |
| `GET /fundamental` | 24h |
| `GET /spot` | 30s |

## Run

Dependencies are managed with [uv](https://docs.astral.sh/uv/) — `pyproject.toml` is the source of truth, `uv.lock` pins exact versions.

```bash
uv sync                                 # create .venv + install locked deps
uv run uvicorn main:app --port 8001 --reload
```

To add or upgrade a dep:

```bash
uv add <pkg>           # adds to pyproject.toml + uv.lock
uv lock --upgrade      # bump all
```

## Why a sidecar?

`akshare` is Python-only. Running it in a tiny FastAPI process keeps the
Next.js code pure JS/TS while letting the webapp consume a stable, typed,
cache-friendly HTTP interface. The sidecar absorbs all upstream akshare
quirks and rate limits.
