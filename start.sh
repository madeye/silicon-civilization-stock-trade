#!/usr/bin/env bash
# Start pyserver (FastAPI on :8001) and web (Next.js on :3000) together.
# Any existing listener on either port is killed first (assumed to be a stale
# instance of these servers) so the fresh server can bind.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY_PORT="${PY_PORT:-8001}"
WEB_PORT="${WEB_PORT:-3000}"

free_port() {
  local port="$1" label="$2"
  # lsof may report several PIDs (one per line); keep them word-splittable.
  local pids
  pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN || true)"
  if [[ -z "$pids" ]]; then
    return 0
  fi
  echo "[start] port $port ($label) busy (pid ${pids//$'\n'/ }) — killing"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
  for _ in 1 2 3 4 5; do
    sleep 0.5
    lsof -ti tcp:"$port" -sTCP:LISTEN >/dev/null || return 0
  done
  echo "[start] listener did not exit, sending SIGKILL"
  # shellcheck disable=SC2086
  kill -9 $pids 2>/dev/null || true
  sleep 0.5
}

free_port "$PY_PORT" pyserver
free_port "$WEB_PORT" web

cleanup() {
  echo "[start] shutting down"
  # $! captured the wrapper subshells; the real servers are their children
  # (uv → uvicorn, npm → next). Kill the trees, then whatever still holds the
  # ports, or Ctrl+C leaves orphaned listeners behind.
  for pid in "${PY_PID:-}" "${WEB_PID:-}"; do
    [[ -n "$pid" ]] || continue
    pkill -TERM -P "$pid" 2>/dev/null || true
    kill "$pid" 2>/dev/null || true
  done
  sleep 1
  for port in "$PY_PORT" "$WEB_PORT"; do
    local_pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN || true)"
    # shellcheck disable=SC2086
    [[ -n "$local_pids" ]] && kill $local_pids 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "[start] launching pyserver on :$PY_PORT"
( cd "$ROOT/pyserver" && uv run uvicorn main:app --port "$PY_PORT" ) &
PY_PID=$!

echo "[start] launching web on :$WEB_PORT"
( cd "$ROOT/web" && npm run dev -- --port "$WEB_PORT" ) &
WEB_PID=$!

# Exit when either server dies. (`wait -n` with PIDs needs bash 5.1+; stock
# macOS bash is 3.2, where it errors out and instantly kills both servers.)
while kill -0 "$PY_PID" 2>/dev/null && kill -0 "$WEB_PID" 2>/dev/null; do
  sleep 1
done
