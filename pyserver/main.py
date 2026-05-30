"""FastAPI sidecar wrapping easy-tdx (通达信) + Tushare Pro + AkShare.

Data-source split:
- A-share (sh/sz/bj): easy-tdx (direct 通达信 TCP, no token/quota) is the
  preferred source for klines and realtime spot quotes, with the Tushare/
  AkShare paths kept as automatic fallbacks. AkShare's Eastmoney snapshot
  remains the source for spot/fundamental PE/PB/market-cap; Tushare Pro
  remains the fallback kline source plus daily_basic / report_rc.
- HK: akshare's stock_hk_hist — Tushare's hk_daily is hard-capped at
  10 calls/day on the free Pro tier (and 2/min within that), making it
  unusable for a HK watchlist beyond the first ~10 requests of the day.

All responses write through a SQLite cache so upstream is hit at most once
per symbol per trading day (klines/fundamentals/analyst) or per 30s (spot).
"""
from __future__ import annotations

import json
import os
import re
import sqlite3
import time
from contextlib import contextmanager
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

import akshare as ak
import pandas as pd
import requests
import tushare as ts
from dotenv import load_dotenv
from easy_tdx import Adjust, MacClient, Market, Period
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

# ---------- bootstrap ------------------------------------------------------

load_dotenv(Path(__file__).parent / ".env")
TUSHARE_TOKEN = os.environ.get("TUSHARE_TOKEN")
if not TUSHARE_TOKEN:
    raise RuntimeError(
        "TUSHARE_TOKEN not set. Put it in pyserver/.env or export it.",
    )
ts.set_token(TUSHARE_TOKEN)
_pro = ts.pro_api()

DB_PATH = Path(__file__).parent / "cache.db"

app = FastAPI(title="silicon-civ pyserver", version="0.2.0")

# ---------- cache ----------------------------------------------------------

SCHEMA = """
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  fetched_at INTEGER NOT NULL,
  ttl_seconds INTEGER NOT NULL
);
"""


@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(SCHEMA)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def cache_get(key: str) -> Any | None:
    with db() as conn:
        row = conn.execute(
            "SELECT payload, fetched_at, ttl_seconds FROM cache WHERE key = ?",
            (key,),
        ).fetchone()
    if not row:
        return None
    payload, fetched_at, ttl = row
    if ttl > 0 and time.time() - fetched_at > ttl:
        return None
    return json.loads(payload)


def cache_put(key: str, value: Any, ttl_seconds: int) -> None:
    with db() as conn:
        conn.execute(
            "REPLACE INTO cache (key, payload, fetched_at, ttl_seconds) VALUES (?, ?, ?, ?)",
            (key, json.dumps(value, ensure_ascii=False), int(time.time()), ttl_seconds),
        )


def seconds_until_next_trading_close() -> int:
    """TTL so daily klines refresh after the next 15:30 CN market close."""
    now = datetime.now()
    target = now.replace(hour=15, minute=30, second=0, microsecond=0)
    if now >= target:
        target += timedelta(days=1)
    return int((target - now).total_seconds())


# ---------- retry wrapper + per-endpoint rate limiter ----------------------

import threading
from collections import deque
from concurrent.futures import ThreadPoolExecutor, as_completed


class _TokenBucket:
    """Simple token bucket — at most `n` calls per `window_s` seconds."""

    def __init__(self, n: int, window_s: float) -> None:
        self.n = n
        self.window = window_s
        self.calls: deque[float] = deque()
        self.lock = threading.Lock()

    def acquire(self) -> None:
        while True:
            with self.lock:
                now = time.monotonic()
                while self.calls and now - self.calls[0] > self.window:
                    self.calls.popleft()
                if len(self.calls) < self.n:
                    self.calls.append(now)
                    return
                wait = self.window - (now - self.calls[0]) + 0.05
            time.sleep(wait)


# Tushare free tier caps hk_daily at 2/minute. Self-throttle to avoid 502s.
_HK_DAILY_LIMITER = _TokenBucket(n=2, window_s=65)
_REPORT_RC_LIMITER = _TokenBucket(n=2, window_s=65)
_SPOT_BATCH_CONCURRENCY = 12


def _with_retries(fn, *args, attempts: int = 3, base_delay: float = 0.5, **kwargs):
    last: Exception | None = None
    for i in range(attempts):
        try:
            return fn(*args, **kwargs)
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(base_delay * (2 ** i))
    assert last is not None
    raise last


def _hk_daily(**kwargs):
    """Rate-limited wrapper around pro.hk_daily."""
    _HK_DAILY_LIMITER.acquire()
    return _pro.hk_daily(**kwargs)


def _report_rc(**kwargs):
    """Rate-limited wrapper around pro.report_rc."""
    _REPORT_RC_LIMITER.acquire()
    return _pro.report_rc(**kwargs)


# ---------- easy-tdx (通达信) A-share datasource ----------------------------
# Direct TCP to a 通达信 quote server: no token, no daily quota. Preferred for
# A-share klines and realtime spot quotes; the Tushare/AkShare paths below are
# automatic fallbacks. HK is unaffected and still served by AkShare.

_TDX_MARKET = {"sh": Market.SH, "sz": Market.SZ, "bj": Market.BJ}
_TDX_ADJUST = {"": Adjust.NONE, "qfq": Adjust.QFQ, "hfq": Adjust.HFQ}

# A single socket speaks the TDX request/response protocol, so every call is
# serialized through this lock (the /spots batch fans out across threads).
_TDX_LOCK = threading.Lock()
_tdx_client: MacClient | None = None
_tdx_down_until = 0.0  # monotonic deadline; skip (re)connect attempts until then


def _tdx_call(method: str, *args, **kwargs):
    """Call a MacClient method under the lock, reconnecting once on failure.

    Returns None when the upstream is unreachable so callers fall back to the
    existing Tushare/AkShare path instead of erroring.
    """
    global _tdx_client, _tdx_down_until
    with _TDX_LOCK:
        for attempt in range(2):
            if _tdx_client is None:
                if time.monotonic() < _tdx_down_until:
                    return None
                try:
                    _tdx_client = MacClient.from_best_host(ping_timeout=3.0)
                except Exception:
                    _tdx_down_until = time.monotonic() + 120
                    return None
            try:
                return getattr(_tdx_client, method)(*args, **kwargs)
            except Exception:
                try:
                    _tdx_client.close()
                except Exception:
                    pass
                _tdx_client = None  # retry once with a fresh connection
        _tdx_down_until = time.monotonic() + 60
        return None


def _tdx_klines(
    market: str, ts_code: str, start: str, end: str, adjust: str
) -> list[dict[str, Any]] | None:
    """A-share daily klines via easy-tdx, filtered to [start, end] (YYYYMMDD)."""
    mkt = _TDX_MARKET.get(market)
    if mkt is None:
        return None
    # get_stock_kline returns the most-recent `count` bars; size the request
    # from the requested window (≈242 trading days/year) so a multi-year range
    # is still fully covered, with headroom and a sane ceiling.
    try:
        start_d = datetime.strptime(start, "%Y%m%d").date()
    except ValueError:
        start_d = date.today() - timedelta(days=365)
    span_days = max((date.today() - start_d).days, 1)
    count = min(int(span_days * 0.72) + 30, 2000)
    df = _tdx_call(
        "get_stock_kline", mkt, _compact_code(ts_code), Period.DAILY,
        count=count, adjust=_TDX_ADJUST.get(adjust, Adjust.NONE),
    )
    if df is None or df.empty:
        return None
    rows: list[dict[str, Any]] = []
    for r in df.itertuples():
        d = pd.Timestamp(r.datetime).strftime("%Y-%m-%d")
        ymd = d.replace("-", "")
        if ymd < start or ymd > end:
            continue
        rows.append({
            "date": d,
            "open": float(r.open),
            "high": float(r.high),
            "low": float(r.low),
            "close": float(r.close),
            # TDX klines report raw shares; Tushare pro_bar (the fallback) and
            # the rest of the API use 手 (lots = 100 shares). Normalize so the
            # volume field is identical regardless of which source served it.
            "volume": float(r.vol) / 100,
        })
    return rows or None


def _tdx_spot(symbol: str, ts_code: str, market: str) -> dict[str, Any] | None:
    """Realtime A-share quote via easy-tdx (live price, not last close)."""
    mkt = _TDX_MARKET.get(market)
    if mkt is None:
        return None
    df = _tdx_call("get_stock_quotes", [(mkt, _compact_code(ts_code))])
    if df is None or df.empty:
        return None
    r = df.iloc[0]
    price = _num_or_none(r.get("close"))
    if price is None or price <= 0:
        return None
    pre_close = _num_or_none(r.get("pre_close"))
    change_pct = round((price / pre_close - 1) * 100, 2) if pre_close and pre_close > 0 else 0
    # TDX names can carry padding spaces (e.g. "五 粮 液"); collapse them.
    name = "".join(str(r.get("name") or "").split()) or _resolve_name(ts_code, market) or ""
    return {
        "symbol": symbol,
        "name": name,
        "price": round(price, 3),
        "change_pct": change_pct,
        "volume": _num_or_none(r.get("vol")) or 0,
        "turnover": _num_or_none(r.get("amount")) or 0,
    }


def _latest_profit_yoy(ts_code: str) -> float | None:
    """Return the latest available net-profit growth percentage for PEG."""
    start = (date.today() - timedelta(days=540)).strftime("%Y%m%d")
    today = date.today().strftime("%Y%m%d")
    df = _with_retries(
        _pro.fina_indicator,
        ts_code=ts_code,
        start_date=start,
        end_date=today,
        fields="ts_code,ann_date,end_date,netprofit_yoy,q_netprofit_yoy,q_profit_yoy",
    )
    if df is None or df.empty:
        return None
    df = df.sort_values(["end_date", "ann_date"], na_position="first")
    latest = df.iloc[-1]
    for col in ("netprofit_yoy", "q_netprofit_yoy", "q_profit_yoy"):
        value = _num_or_none(latest.get(col))
        if value is not None:
            return value
    return None


def _attach_profit_yoy(out: dict[str, Any], ts_code: str, market: str) -> None:
    if market == "hk":
        return
    try:
        profit_yoy = _latest_profit_yoy(ts_code)
    except Exception:
        return
    if profit_yoy is not None:
        out["profit_yoy"] = profit_yoy


# ---------- models ---------------------------------------------------------


class Kline(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class Fundamental(BaseModel):
    symbol: str
    name: str | None = None
    pe_ttm: float | None = None
    pb: float | None = None
    market_cap: float | None = None  # 亿元
    revenue_yoy: float | None = None
    profit_yoy: float | None = None


class Analyst(BaseModel):
    symbol: str
    buy_count: int | None = None
    total_count: int | None = None
    buy_ratio: float | None = None
    consensus_eps_next: float | None = None
    implied_target: float | None = None
    current_price: float | None = None
    upside_pct: float | None = None


# ---------- symbol normalization -------------------------------------------


def _to_ts_code(symbol: str) -> tuple[str, str]:
    """Convert internal symbol -> (ts_code, market). market in {sh, sz, bj, hk}."""
    s = symbol.lower().strip()
    if s.startswith(("sh", "sz", "bj")):
        code, mkt = s[2:], s[:2]
    elif s.startswith("hk"):
        code, mkt = s[2:].zfill(5), "hk"
    elif s.startswith(("60", "68", "9")):
        code, mkt = s, "sh"
    elif s.startswith(("00", "30", "20")):
        code, mkt = s, "sz"
    elif s.startswith(("8", "4")):
        code, mkt = s, "bj"
    else:
        code, mkt = s.zfill(5), "hk"
    suffix = {"sh": ".SH", "sz": ".SZ", "bj": ".BJ", "hk": ".HK"}[mkt]
    return code + suffix, mkt


# Tushare expects YYYYMMDD; the route accepts both forms.
def _date(s: str) -> str:
    s = s.replace("-", "")
    return s


def _num_or_none(value: Any) -> float | None:
    if value is None or pd.isna(value):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    matches = re.findall(r"-?\d+(?:\.\d+)?", str(value))
    if not matches:
        return None
    nums = [float(x) for x in matches]
    return sum(nums) / len(nums)


def _compact_code(ts_code: str) -> str:
    return ts_code.split(".")[0]


def _ak_col(row: pd.Series, *names: str) -> Any:
    for name in names:
        if name in row and pd.notna(row.get(name)):
            return row.get(name)
    return None


def _market_cap_to_yi(value: float | None) -> float | None:
    if value is None:
        return None
    # AkShare's Eastmoney spot endpoint reports market cap in yuan. Keep this
    # defensive in case an alternate backend already returns 亿元.
    if abs(value) > 1_000_000:
        return value / 1e8
    return value


def _eastmoney_market_code(market: str) -> int:
    # Eastmoney uses 1 for Shanghai and 0 for Shenzhen/Beijing in these quote
    # endpoints.
    return 1 if market == "sh" else 0


def _ak_a_spot_rows(ts_code: str, market: str) -> dict[str, Any] | None:
    """Fetch/cached A-share spot quote with a hard timeout.

    AkShare's whole-market spot helpers paginate thousands of rows and can take
    tens of seconds. This mirrors the single-symbol Eastmoney endpoint used by
    AkShare so a slow upstream can fall back to Tushare quickly.
    """
    code = _compact_code(ts_code)
    key = f"ak:a:spot:em:{code}"
    cached = cache_get(key)
    if cached is not None:
        return cached
    url = "https://push2.eastmoney.com/api/qt/stock/get"
    params = {
        "fltt": "2",
        "invt": "2",
        "fields": "f43,f57,f58,f116,f117,f162,f167,f168,f47,f48,f170",
        "secid": f"{_eastmoney_market_code(market)}.{code}",
    }
    try:
        response = requests.get(url, params=params, timeout=3)
        response.raise_for_status()
        data = response.json().get("data")
    except Exception:
        cache_put(key, None, 10)
        return None
    if not data:
        cache_put(key, None, 10)
        return None
    row = {
        "代码": data.get("f57") or code,
        "名称": data.get("f58"),
        "最新价": data.get("f43"),
        "涨跌幅": data.get("f170"),
        "成交量": data.get("f47"),
        "成交额": data.get("f48"),
        "总市值": data.get("f116"),
        "流通市值": data.get("f117"),
        "市盈率-动态": data.get("f162"),
        "市净率": data.get("f167"),
        "换手率": data.get("f168"),
    }
    cache_put(key, row, 30)
    return row


def _ak_a_spot(ts_code: str, market: str) -> dict[str, Any] | None:
    if market not in {"sh", "sz", "bj"}:
        return None
    try:
        return _ak_a_spot_rows(ts_code, market)
    except Exception:
        return None


def _spot_price_from_ak(row: dict[str, Any]) -> float | None:
    return _num_or_none(row.get("最新价"))


def _spot_change_pct_from_ak(row: dict[str, Any]) -> float | None:
    return _num_or_none(row.get("涨跌幅"))


def _ak_consensus_eps(symbol: str) -> tuple[float | None, int | None]:
    """Fetch nearest annual EPS forecast from 同花顺 via akshare."""
    try:
        df = _with_retries(
            ak.stock_profit_forecast_ths,
            symbol=symbol,
            indicator="预测年报每股收益",
            attempts=2,
            base_delay=0.2,
        )
    except Exception:
        return None, None
    if df is None or df.empty or "年度" not in df.columns or "均值" not in df.columns:
        return None, None

    current_year = date.today().year
    work = df.copy()
    work["年度"] = pd.to_numeric(work["年度"], errors="coerce")
    work["均值"] = pd.to_numeric(work["均值"], errors="coerce")
    work = work.dropna(subset=["年度", "均值"])
    work = work[work["年度"].astype(int) >= current_year]
    if work.empty:
        return None, None

    row = work.sort_values("年度").iloc[0]
    count = None
    if "预测机构数" in row and pd.notna(row.get("预测机构数")):
        count = int(row["预测机构数"])
    return round(float(row["均值"]), 4), count


def _ak_research_consensus(symbol: str) -> dict[str, Any]:
    """Fetch per-stock research reports from Eastmoney via akshare."""
    try:
        df = _with_retries(
            ak.stock_research_report_em,
            symbol=symbol,
            attempts=2,
            base_delay=0.2,
        )
    except Exception:
        return {}
    if df is None or df.empty:
        return {}

    out: dict[str, Any] = {"total_count": int(len(df))}

    if "东财评级" in df.columns:
        ratings = df["东财评级"].fillna("").astype(str)
        bullish = ratings.isin(["买入", "推荐", "强烈推荐", "增持"]).sum()
        out["buy_count"] = int(bullish)
        out["buy_ratio"] = round(out["buy_count"] / out["total_count"], 3)

    current_year = date.today().year
    eps_cols: list[tuple[int, str]] = []
    for col in df.columns:
        m = re.match(r"^(\d{4})-盈利预测-收益$", str(col))
        if m and int(m.group(1)) >= current_year:
            eps_cols.append((int(m.group(1)), str(col)))

    if eps_cols:
        _, eps_col = sorted(eps_cols)[0]
        eps_series = pd.to_numeric(df[eps_col], errors="coerce").dropna()
        if not eps_series.empty:
            out["consensus_eps_next"] = round(float(eps_series.median()), 4)

    return out


def _implied_target_from_eps_pe(eps: Any, pe_ttm: Any) -> float | None:
    """Return an EPS * PE target only when both inputs are economically valid."""
    eps_value = _num_or_none(eps)
    pe_value = _num_or_none(pe_ttm)
    if eps_value is None or pe_value is None or eps_value <= 0 or pe_value <= 0:
        return None
    return round(eps_value * pe_value, 3)


def _sanitize_analyst_payload(out: dict[str, Any]) -> dict[str, Any]:
    out = dict(out)
    target = _num_or_none(out.get("implied_target"))
    current_price = _num_or_none(out.get("current_price"))
    if target is None or target <= 0:
        out["implied_target"] = None
        out["upside_pct"] = None
        return out
    out["implied_target"] = target
    if current_price is not None and current_price > 0:
        out["upside_pct"] = round((target / current_price - 1) * 100, 2)
    return out


def _prefer_richer_analyst_payload(
    primary: dict[str, Any],
    fallback: dict[str, Any] | None,
) -> dict[str, Any]:
    primary = _sanitize_analyst_payload(primary)
    if fallback is None:
        return primary
    fallback = _sanitize_analyst_payload(fallback)
    primary_has_research = primary.get("buy_count") is not None or primary.get("implied_target") is not None
    fallback_has_research = fallback.get("buy_count") is not None or fallback.get("implied_target") is not None
    if fallback_has_research and not primary_has_research:
        return {
            **fallback,
            "current_price": primary.get("current_price") or fallback.get("current_price"),
        }
    return primary


# Cache the stock_basic / hk_basic name lookups once per process startup.
_NAME_CACHE: dict[str, str] = {}


def _resolve_name(ts_code: str, market: str) -> str | None:
    if ts_code in _NAME_CACHE:
        return _NAME_CACHE[ts_code]
    try:
        if market == "hk":
            df = _pro.hk_basic(fields="ts_code,name")
        else:
            df = _pro.stock_basic(list_status="L", fields="ts_code,name")
    except Exception:
        return None
    if df is None or df.empty:
        return None
    for r in df.itertuples():
        _NAME_CACHE[r.ts_code] = r.name
    return _NAME_CACHE.get(ts_code)


# ---------- endpoints ------------------------------------------------------


@app.get("/health")
def health():
    return {"ok": True, "time": datetime.now().isoformat(), "source": "tushare"}


@app.get("/klines", response_model=list[Kline])
def klines(
    symbol: str = Query(..., description="e.g. sh600519, 000858, hk00700"),
    start: str = Query("20230101"),
    end: str | None = Query(None),
    adjust: str = Query("qfq", pattern="^(|qfq|hfq)$"),
):
    end = end or date.today().strftime("%Y%m%d")
    start, end = _date(start), _date(end)
    key = f"kline:{symbol}:{start}:{end}:{adjust}"
    cached = cache_get(key)
    if cached is not None:
        return cached

    ts_code, market = _to_ts_code(symbol)

    # easy-tdx first for A-shares (no token/quota); Tushare is the fallback.
    if market in {"sh", "sz", "bj"}:
        tdx_rows = _tdx_klines(market, ts_code, start, end, adjust)
        if tdx_rows is not None:
            cache_put(key, tdx_rows, seconds_until_next_trading_close())
            return tdx_rows

    try:
        if market == "hk":
            # akshare for HK — Tushare's hk_daily is capped at 10/day.
            ak_code = ts_code.split(".")[0]  # "00700"
            df = _with_retries(
                ak.stock_hk_hist,
                symbol=ak_code, period="daily",
                start_date=start, end_date=end, adjust=(adjust or ""),
            )
        else:
            df = _with_retries(
                ts.pro_bar,
                ts_code=ts_code, adj=(adjust or None), start_date=start, end_date=end,
            )
    except Exception as e:
        raise HTTPException(502, f"upstream error: {e}") from e

    if df is None or df.empty:
        cache_put(key, [], 3600)
        return []

    if market == "hk":
        # akshare HK schema: 日期 / 开盘 / 最高 / 最低 / 收盘 / 成交量 ...
        df = df.rename(columns={
            "日期": "date", "开盘": "open", "最高": "high",
            "最低": "low", "收盘": "close", "成交量": "volume",
        })
        df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
        rows = df[["date", "open", "high", "low", "close", "volume"]].to_dict(orient="records")
    else:
        df = df.sort_values("trade_date")
        rows = [
            {
                "date": f"{d[:4]}-{d[4:6]}-{d[6:]}",
                "open": float(r.open),
                "high": float(r.high),
                "low": float(r.low),
                "close": float(r.close),
                "volume": float(r.vol),
            }
            for r in df.itertuples()
            for d in [str(r.trade_date)]
        ]
    cache_put(key, rows, seconds_until_next_trading_close())
    return rows


@app.get("/fundamental", response_model=Fundamental)
def fundamental(symbol: str):
    key = f"fund:v2:{symbol}"
    cached = cache_get(key)
    if cached is not None:
        return cached

    ts_code, market = _to_ts_code(symbol)
    out: dict[str, Any] = {"symbol": symbol, "name": _resolve_name(ts_code, market)}

    ak_spot = _ak_a_spot(ts_code, market)
    if ak_spot is not None:
        out["name"] = str(ak_spot.get("名称") or out.get("name") or "")
        pe_ttm = _num_or_none(_ak_col(pd.Series(ak_spot), "市盈率-动态", "市盈率", "PE"))
        pb = _num_or_none(_ak_col(pd.Series(ak_spot), "市净率", "PB"))
        market_cap = _market_cap_to_yi(_num_or_none(_ak_col(pd.Series(ak_spot), "总市值")))
        if pe_ttm is not None:
            out["pe_ttm"] = pe_ttm
        if pb is not None:
            out["pb"] = pb
        if market_cap is not None:
            out["market_cap"] = market_cap
        _attach_profit_yoy(out, ts_code, market)
        if out.get("pe_ttm") is not None and out.get("pb") is not None and out.get("market_cap") is not None:
            cache_put(key, out, 24 * 3600 if out.get("profit_yoy") is not None else 30)
            return out

    try:
        if market == "hk":
            # daily_basic is A-share only; for HK we leave fundamentals blank.
            cache_put(key, out, 24 * 3600)
            return out
        # Latest trading day's basic metrics. Pull last 5 days then take tail.
        today = date.today().strftime("%Y%m%d")
        start = (date.today() - timedelta(days=10)).strftime("%Y%m%d")
        df = _with_retries(
            _pro.daily_basic,
            ts_code=ts_code, start_date=start, end_date=today,
            fields="ts_code,trade_date,close,pe_ttm,pb,total_mv",
        )
    except Exception as e:
        raise HTTPException(502, f"tushare error: {e}") from e

    if df is not None and not df.empty:
        latest = df.sort_values("trade_date").iloc[-1]
        if pd.notna(latest.get("pe_ttm")):
            out["pe_ttm"] = float(latest["pe_ttm"])
        if pd.notna(latest.get("pb")):
            out["pb"] = float(latest["pb"])
        if pd.notna(latest.get("total_mv")):
            # tushare returns 万元 -> convert to 亿元
            out["market_cap"] = float(latest["total_mv"]) / 1e4
        _attach_profit_yoy(out, ts_code, market)

    cache_put(key, out, 24 * 3600)
    return out


@app.get("/analyst", response_model=Analyst)
def analyst(symbol: str):
    """Sell-side consensus from Tushare `report_rc` broker reports.

    Aggregates EPS forecasts for next fiscal year across recent analyst
    reports; implied target = consensus EPS * current PE(TTM).
    """
    key = f"analyst:v2:{symbol}"
    cached = cache_get(key)
    legacy_cached = cache_get(f"analyst:{symbol}")
    if cached is not None:
        out = _prefer_richer_analyst_payload(cached, legacy_cached)
        cache_put(key, out, 24 * 3600)
        return out
    if legacy_cached is not None:
        out = _sanitize_analyst_payload(legacy_cached)
        cache_put(key, out, 24 * 3600)
        return out

    ts_code, market = _to_ts_code(symbol)
    out: dict[str, Any] = {"symbol": symbol}
    if market == "hk":
        # report_rc covers A-share only.
        cache_put(key, out, 24 * 3600)
        return out

    # Always fetch most-recent close first so the UI can show current price even
    # when sell-side reports are absent or Tushare report_rc is rate-limited.
    pe_ttm: float | None = None
    ak_spot = _ak_a_spot(ts_code, market)
    if ak_spot is not None:
        price = _spot_price_from_ak(ak_spot)
        if price is not None:
            out["current_price"] = round(price, 3)
        pe_ttm = _num_or_none(_ak_col(pd.Series(ak_spot), "市盈率-动态", "市盈率", "PE"))
    try:
        if out.get("current_price") is None or pe_ttm is None:
            today = date.today().strftime("%Y%m%d")
            start_d = (date.today() - timedelta(days=10)).strftime("%Y%m%d")
            db = _with_retries(
                _pro.daily_basic,
                ts_code=ts_code, start_date=start_d, end_date=today,
                fields="ts_code,trade_date,close,pe_ttm",
            )
            if db is not None and not db.empty:
                latest = db.sort_values("trade_date").iloc[-1]
                if out.get("current_price") is None and pd.notna(latest.get("close")):
                    out["current_price"] = round(float(latest["close"]), 3)
                if pe_ttm is None and pd.notna(latest.get("pe_ttm")):
                    pe_ttm = float(latest["pe_ttm"])
    except Exception:
        pass

    compact_symbol = ts_code.split(".")[0]
    research = _ak_research_consensus(compact_symbol)
    out.update(research)

    if out.get("consensus_eps_next") is None:
        eps, forecast_count = _ak_consensus_eps(compact_symbol)
        if eps is not None:
            out["consensus_eps_next"] = eps
            if forecast_count is not None and out.get("total_count") is None:
                out["total_count"] = forecast_count

    implied_target = _implied_target_from_eps_pe(out.get("consensus_eps_next"), pe_ttm)
    if implied_target is not None:
        out["implied_target"] = implied_target
        if out.get("current_price"):
            out["upside_pct"] = round(
                (out["implied_target"] / out["current_price"] - 1) * 100, 2
            )

    if out.get("implied_target") is not None and out.get("buy_count") is not None:
        cache_put(key, out, 24 * 3600)
        return out

    # Pull last ~180 days of broker reports.
    start = (date.today() - timedelta(days=180)).strftime("%Y%m%d")
    try:
        rc = _with_retries(_report_rc, ts_code=ts_code, start_date=start)
    except Exception as e:
        # Keep current_price usable; do not poison the cache for a full day
        # because rate-limit errors are transient.
        cache_put(key, out, 60)
        return out

    if rc is None or rc.empty:
        cache_put(key, out, 24 * 3600)
        return out

    out["total_count"] = int(len(rc))
    if "rating" in rc.columns:
        # tushare ratings: 买入/推荐/增持/中性/减持/卖出 etc.
        bullish = rc["rating"].isin(["买入", "推荐", "强烈推荐", "增持"]).sum()
        out["buy_count"] = int(bullish)
        out["buy_ratio"] = round(out["buy_count"] / out["total_count"], 3)

    # Consensus next-year EPS: pick the median forecast for the soonest
    # forward fiscal year present in the data.
    next_year = date.today().year + 1
    yr_str = f"{next_year}Q4"
    pool = rc[rc.get("quarter") == yr_str]
    if pool.empty:
        # fall back to nearest available future year
        future = rc[rc["quarter"].str.match(r"^\d{4}Q4$", na=False)]
        future = future[future["quarter"].str[:4].astype(int) > date.today().year]
        if not future.empty:
            soonest = future["quarter"].min()
            pool = future[future["quarter"] == soonest]
    eps_series = pd.to_numeric(pool.get("eps"), errors="coerce").dropna() if not pool.empty else pd.Series(dtype=float)
    if not eps_series.empty:
        out["consensus_eps_next"] = round(float(eps_series.median()), 4)

    # Prefer explicit sell-side target-price fields when Tushare provides them;
    # otherwise fall back to EPS * PE(TTM).
    target_cols = [c for c in rc.columns if str(c).lower() in {"target_price", "target", "tp"}]
    targets: list[float] = []
    for col in target_cols:
        targets.extend(x for x in (_num_or_none(v) for v in rc[col]) if x is not None and x > 0)
    if targets:
        out["implied_target"] = round(float(pd.Series(targets).median()), 3)
    else:
        implied_target = _implied_target_from_eps_pe(out.get("consensus_eps_next"), pe_ttm)
        if implied_target is not None:
            out["implied_target"] = implied_target

    if out.get("implied_target") is not None and out.get("current_price"):
        out["upside_pct"] = round(
            (out["implied_target"] / out["current_price"] - 1) * 100, 2
        )

    cache_put(key, out, 24 * 3600)
    return out


@app.get("/analysts", response_model=list[Analyst])
def analysts(symbols: str = Query(..., description="comma-separated symbols")):
    uniq = [s.strip() for s in symbols.split(",") if s.strip()]
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for symbol in uniq:
        if symbol in seen:
            continue
        seen.add(symbol)
        try:
            out.append(analyst(symbol))
        except Exception:
            # Keep a batch refresh useful even if one upstream symbol fails.
            out.append({"symbol": symbol})
    return out


@app.get("/spot")
def spot(symbol: str):
    """Most-recent close (Tushare Pro has no realtime quote). 30s cache."""
    key = f"spot:{symbol}"
    cached = cache_get(key)
    if cached is not None:
        return cached

    ts_code, market = _to_ts_code(symbol)
    start = (date.today() - timedelta(days=10)).strftime("%Y%m%d")
    end = date.today().strftime("%Y%m%d")
    try:
        if market in {"sh", "sz", "bj"}:
            tdx_spot = _tdx_spot(symbol, ts_code, market)
            if tdx_spot is not None:
                cache_put(key, tdx_spot, 30)
                return tdx_spot
            ak_spot = _ak_a_spot(ts_code, market)
            price = _spot_price_from_ak(ak_spot) if ak_spot is not None else None
            if ak_spot is not None and price is not None:
                out = {
                    "symbol": symbol,
                    "name": str(ak_spot.get("名称") or _resolve_name(ts_code, market) or ""),
                    "price": price,
                    "change_pct": _spot_change_pct_from_ak(ak_spot) or 0,
                    "volume": _num_or_none(ak_spot.get("成交量")) or 0,
                    "turnover": _num_or_none(ak_spot.get("成交额")) or 0,
                }
                cache_put(key, out, 30)
                return out
        if market == "hk":
            ak_code = ts_code.split(".")[0]
            df = _with_retries(
                ak.stock_hk_hist,
                symbol=ak_code, period="daily", start_date=start, end_date=end, adjust="",
            )
            if df is None or df.empty:
                raise HTTPException(404, f"symbol {symbol} not found")
            df = df.rename(columns={
                "日期": "trade_date", "开盘": "open", "最高": "high",
                "最低": "low", "收盘": "close", "成交量": "vol",
                "成交额": "amount", "涨跌幅": "pct_chg",
            })
        else:
            # A-share fallback when the AkShare/Eastmoney realtime quote is
            # unavailable or too slow.
            df = _with_retries(_pro.daily, ts_code=ts_code, start_date=start, end_date=end)
            if df is None or df.empty:
                raise HTTPException(404, f"symbol {symbol} not found")
            df = df.sort_values("trade_date")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"upstream error: {e}") from e
    r = df.iloc[-1]
    out = {
        "symbol": symbol,
        "name": _resolve_name(ts_code, market) or "",
        "price": float(r.get("close", 0) or 0),
        "change_pct": float(r.get("pct_chg", 0) or 0),
        "volume": float(r.get("vol", 0) or 0),
        "turnover": float(r.get("amount", 0) or 0),
    }
    cache_put(key, out, 30)
    return out


@app.get("/spots")
def spots(symbols: str = Query(..., description="comma-separated symbols")):
    """Batch spot quotes for the frontend table.

    This endpoint keeps caching authoritative in pyserver while avoiding the
    Next.js layer fanning one browser batch out into dozens of HTTP requests.
    """
    uniq: list[str] = []
    seen: set[str] = set()
    for raw in symbols.split(","):
        symbol = raw.strip()
        if not symbol or symbol in seen:
            continue
        seen.add(symbol)
        uniq.append(symbol)

    out: list[dict[str, Any]] = []
    missing: list[str] = []
    for symbol in uniq:
        cached = cache_get(f"spot:{symbol}")
        if cached is not None:
            out.append(cached)
        else:
            missing.append(symbol)

    if missing:
        with ThreadPoolExecutor(max_workers=min(_SPOT_BATCH_CONCURRENCY, len(missing))) as executor:
            futures = {executor.submit(spot, symbol): symbol for symbol in missing}
            for future in as_completed(futures):
                try:
                    out.append(future.result())
                except Exception:
                    # Keep a batch refresh useful even if one upstream symbol fails.
                    continue

    by_symbol = {str(row.get("symbol")): row for row in out}
    return [by_symbol[symbol] for symbol in uniq if symbol in by_symbol]
