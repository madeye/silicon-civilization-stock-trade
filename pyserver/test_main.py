"""Offline unit tests for pyserver's pure helpers.

No network: only symbol normalization, number coercion and payload
sanitization are exercised. Run with `uv run pytest -q`.
"""
import importlib.util
import math
import os
from datetime import datetime

import pytest

os.environ.setdefault("TUSHARE_TOKEN", "dummy-test-token")
os.environ.setdefault("PYSERVER_DISABLE_KIMI", "1")

_spec = importlib.util.spec_from_file_location(
    "main", os.path.join(os.path.dirname(__file__), "main.py")
)
main = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(main)


# ---------- _to_ts_code ------------------------------------------------------

@pytest.mark.parametrize(
    ("symbol", "expected"),
    [
        ("sh600519", ("600519.SH", "sh")),
        ("sz000858", ("000858.SZ", "sz")),
        ("600519", ("600519.SH", "sh")),
        ("688041", ("688041.SH", "sh")),
        ("900901", ("900901.SH", "sh")),   # Shanghai B-share
        ("000858", ("000858.SZ", "sz")),
        ("300308", ("300308.SZ", "sz")),
        ("200596", ("200596.SZ", "sz")),   # Shenzhen B-share
        ("830799", ("830799.BJ", "bj")),
        ("430047", ("430047.BJ", "bj")),
        ("920008", ("920008.BJ", "bj")),   # BSE 920 must not hit the sh "9" branch
        ("bj920008", ("920008.BJ", "bj")),
        ("hk00700", ("00700.HK", "hk")),
        ("hk700", ("00700.HK", "hk")),
    ],
)
def test_to_ts_code(symbol, expected):
    assert main._to_ts_code(symbol) == expected


# ---------- _num_or_none -----------------------------------------------------

def test_num_or_none_none_and_nan():
    assert main._num_or_none(None) is None
    assert main._num_or_none(float("nan")) is None


def test_num_or_none_numbers():
    assert main._num_or_none(3) == 3.0
    assert main._num_or_none(3.5) == 3.5
    assert main._num_or_none(-2.25) == -2.25


def test_num_or_none_strings():
    assert main._num_or_none("12.5") == 12.5
    assert main._num_or_none("-3") == -3.0
    assert main._num_or_none("about 10 to 20") == 15.0  # averages all numbers
    assert main._num_or_none("no digits") is None
    assert main._num_or_none("") is None


# ---------- _market_cap_to_yi ------------------------------------------------

def test_market_cap_to_yi():
    assert main._market_cap_to_yi(None) is None
    # Yuan input converts to 亿元
    assert main._market_cap_to_yi(2.5e11) == pytest.approx(2500.0)
    # Already-亿元 input passes through
    assert main._market_cap_to_yi(880.0) == 880.0


# ---------- implied target / analyst payload sanitization --------------------

def test_implied_target_rejects_bad_inputs():
    assert main._implied_target_from_eps_pe(None, 20) is None
    assert main._implied_target_from_eps_pe(1.0, None) is None
    assert main._implied_target_from_eps_pe(-1.0, 20) is None
    assert main._implied_target_from_eps_pe(1.0, -5) is None
    # near-zero-earnings PE must not produce an absurd target
    assert main._implied_target_from_eps_pe(1.0, main.MAX_PE_FOR_IMPLIED_TARGET + 1) is None


def test_implied_target_happy_path():
    assert main._implied_target_from_eps_pe(2.0, 25.0) == 50.0


def test_sanitize_analyst_payload_nulls_absurd_upside():
    out = main._sanitize_analyst_payload(
        {"implied_target": 6250.0, "current_price": 136.0, "upside_pct": 4495.0}
    )
    assert out["implied_target"] is None
    assert out["upside_pct"] is None


def test_sanitize_analyst_payload_recomputes_upside():
    out = main._sanitize_analyst_payload(
        {"implied_target": 150.0, "current_price": 100.0, "upside_pct": 0.0}
    )
    assert out["implied_target"] == 150.0
    assert out["upside_pct"] == pytest.approx(50.0)


def test_prefer_richer_analyst_payload_keeps_price():
    primary = {"symbol": "x", "current_price": 10.0}
    fallback = {"symbol": "x", "buy_count": 3, "total_count": 4}
    out = main._prefer_richer_analyst_payload(primary, fallback)
    assert out["buy_count"] == 3
    assert out["current_price"] == 10.0


# ---------- misc helpers -----------------------------------------------------

def test_kimi_norm_zero_padding():
    assert main._kimi_norm("00700.HK") == main._kimi_norm("0700.HK")
    assert main._kimi_norm("600519.SH") == "600519.SH"


def test_seconds_until_next_trading_close_targets_weekday():
    ttl = main.seconds_until_next_trading_close()
    assert 0 < ttl <= 4 * 24 * 3600
    target = datetime.now(main._CN_TZ).timestamp() + ttl
    assert datetime.fromtimestamp(target, main._CN_TZ).weekday() < 5


def test_json_safety_of_num_or_none_guard():
    # The /spot NaN guard depends on this behaviour: NaN is truthy but must
    # coerce to None, never survive into a JSON payload.
    assert bool(float("nan")) is True  # the trap
    assert main._num_or_none(float("nan")) is None
    assert not math.isnan(main._num_or_none("nan") or 0)
