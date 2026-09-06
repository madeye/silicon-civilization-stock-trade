"""Fetch immutable raw Tushare inputs and normalize dated, adjusted series.

Run with the project's pyserver venv (pandas/tushare/python-dotenv installed).
Tokens remain local; output contains only market data and provenance.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import threading
import time

from dotenv import dotenv_values
from tushare.pro.client import DataApi


def iso(value):
    value = str(value)
    return f"{value[:4]}-{value[4:6]}-{value[6:8]}"


def finite(value):
    return value is not None and isinstance(value, (float, int)) and math.isfinite(value)


def ticker(symbol):
    if symbol.startswith(("60", "68")):
        return symbol + ".SH"
    if symbol.startswith(("4", "8", "92")):
        return symbol + ".BJ"
    return symbol + ".SZ"


def normalize(entry, raw):
    daily = sorted(raw["daily"], key=lambda r: r["trade_date"])
    factors = {r["trade_date"]: r["adj_factor"] for r in raw["adj_factor"]}
    if not daily:
        raise ValueError("No daily prices")
    anchor = factors.get(daily[-1]["trade_date"])
    if not finite(anchor) or anchor <= 0:
        raise ValueError("Missing adjustment anchor")
    basics = {r["trade_date"]: r for r in raw["daily_basic"]}
    reports = sorted((r for r in raw["fina_indicator"] if r.get("ann_date") and r.get("end_date")),
                     key=lambda r: (r["ann_date"], r["end_date"]))
    klines, fundamentals = [], []
    for row in daily:
        day = row["trade_date"]
        factor = factors.get(day)
        if not finite(factor) or factor <= 0:
            raise ValueError(f"Missing adjustment factor on {day}")
        prices = {k: row[k] * factor / anchor for k in ("open", "high", "low", "close")}
        if not all(finite(v) and v > 0 for v in prices.values()):
            raise ValueError(f"Invalid OHLC on {day}")
        if prices["low"] > min(prices["open"], prices["close"]) + 1e-7 or prices["high"] < max(prices["open"], prices["close"]) - 1e-7:
            raise ValueError(f"Inconsistent OHLC on {day}")
        klines.append({"date": iso(day), **prices, "volume": row["vol"]})
        # Choose the newest report period known on this date; later publication
        # of an older-period amendment must not displace a more recent period.
        available = [r for r in reports if r["ann_date"] <= day]
        latest = max(available, key=lambda r: (r["end_date"], r["ann_date"])) if available else None
        basic = basics.get(day, {})
        f = {"effective_date": iso(day)}
        for field in ("pe_ttm", "pb"):
            if finite(basic.get(field)):
                f[field] = basic[field]
        if latest:
            if finite(latest.get("netprofit_yoy")):
                f["profit_yoy"] = latest["netprofit_yoy"]
            # Tushare may omit PE for loss-making names. Preserve known losses
            # for the existing non-positive-PE veto; do not invent a TTM PE.
            if "pe_ttm" not in f and finite(latest.get("eps")) and latest["eps"] <= 0:
                f["pe_ttm"] = 0
        if len(f) > 1:
            fundamentals.append(f)
    return {"entry": entry, "klines": klines, "fundamentals": fundamentals}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--env-file", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--start", default="20230701")
    parser.add_argument("--end", default="20260904")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    entries = json.loads((root / "data/universe.json").read_text())["entries"]
    cfg = dotenv_values(args.env_file)
    token = cfg.get("TUSHARE_TOKEN")
    if not token:
        raise RuntimeError("TUSHARE_TOKEN is not configured")
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    throttle = threading.Lock()
    next_request = [0.0]
    # Keeping requests below 200/min avoids overwhelming the configured API.
    def query(api, symbol, fields):
        file = out / "raw" / symbol / f"{api}.json"
        if file.exists():
            saved = json.loads(file.read_text())
            if saved["start"] == args.start and saved["end"] == args.end:
                return saved["rows"]
        for attempt in range(3):
            with throttle:
                delay = next_request[0] - time.monotonic()
                if delay > 0:
                    time.sleep(delay)
                next_request[0] = time.monotonic() + 0.36
            try:
                client = DataApi(token, timeout=25)
                if cfg.get("TUSHARE_API_URL"):
                    client._DataApi__http_url = cfg["TUSHARE_API_URL"]
                df = client.query(api, ts_code=symbol, start_date=args.start,
                                  end_date=args.end, fields=fields)
                rows = json.loads(df.to_json(orient="records"))
                file.parent.mkdir(parents=True, exist_ok=True)
                temp = file.with_suffix(".tmp")
                temp.write_text(json.dumps({"api": api, "symbol": symbol,
                    "start": args.start, "end": args.end,
                    "fetched_at": datetime.now(timezone.utc).isoformat(), "rows": rows}, ensure_ascii=False))
                temp.replace(file)
                return rows
            except Exception as error:
                if attempt == 2:
                    raise RuntimeError(f"{api} {symbol}: {str(error).replace(token, '[redacted]')[:180]}") from None
                time.sleep(attempt + 1)
    apis = {
        "daily": "ts_code,trade_date,open,high,low,close,vol",
        "adj_factor": "ts_code,trade_date,adj_factor",
        "daily_basic": "ts_code,trade_date,pe_ttm,pb",
        "fina_indicator": "ts_code,ann_date,end_date,eps,netprofit_yoy",
    }
    def fetch_entry(entry):
        symbol = ticker(entry["symbol"])
        raw = {api: query(api, symbol, fields) for api, fields in apis.items()}
        if not raw["fina_indicator"] or not raw["daily_basic"]:
            raise ValueError(f"Missing financial inputs for {symbol}")
        return normalize(entry, raw)
    series, failures = [], []
    with ThreadPoolExecutor(max_workers=4) as pool:
        tasks = {pool.submit(fetch_entry, entry): entry for entry in entries}
        for job in as_completed(tasks):
            entry = tasks[job]
            try:
                s = job.result()
                series.append(s)
                print(f"{len(series)}/{len(entries)} {entry['symbol']} {len(s['klines'])} bars through {s['klines'][-1]['date']}", flush=True)
            except Exception as error:
                failures.append({"symbol": entry["symbol"], "error": str(error).replace(token, "[redacted]")})
                print(f"FAILED {entry['symbol']}: {failures[-1]['error']}", flush=True)
    index_rows = query("index_daily", "000300.SH", "ts_code,trade_date,open,high,low,close,vol")
    benchmark = [{"date": iso(r["trade_date"]), "equity": r["close"]} for r in sorted(index_rows, key=lambda r: r["trade_date"])]
    if not benchmark or benchmark[-1]["date"] != iso(args.end):
        raise RuntimeError("Benchmark does not reach requested end")
    missing = {r["symbol"] for r in failures}
    by_symbol = {s["entry"]["symbol"]: s for s in series}
    complete = [by_symbol.get(e["symbol"], {"entry": e, "klines": []}) for e in entries]
    source_files = [{"file": str(p.relative_to(out)), "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
                    for p in sorted((out / "raw").rglob("*.json"))]
    payload = {"fetchedAt": datetime.now(timezone.utc).isoformat(), "source": "Tushare Pro",
        "start": iso(args.start), "requestedEnd": iso(args.end), "series": complete, "benchmark": benchmark,
        "failures": failures, "sourceFiles": source_files,
        "universeSha256": hashlib.sha256((root / "data/universe.json").read_bytes()).hexdigest()}
    (out / "dataset.json").write_text(json.dumps(payload, ensure_ascii=False, allow_nan=False))
    print(json.dumps({"symbols": len(series), "failed": len(missing), "benchmarkEnd": benchmark[-1]["date"], "out": str(out / "dataset.json")}), flush=True)
    if failures:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
