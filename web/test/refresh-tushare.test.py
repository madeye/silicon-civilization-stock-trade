"""Point-in-time financial and price adjustment tests without network access."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("refresh_tushare", Path(__file__).parents[1] / "scripts/refresh-tushare.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class NormalizeTest(unittest.TestCase):
    def test_actual_announcement_dates_and_adjustments(self):
        raw = {
            "daily": [{"trade_date": d, "open": 100, "high": 100, "low": 100, "close": 100, "vol": 10} for d in ["20260821", "20260822", "20260824"]],
            "adj_factor": [{"trade_date": d, "adj_factor": f} for d, f in [("20260821", 1), ("20260822", 2), ("20260824", 2)]],
            "daily_basic": [{"trade_date": d, "pe_ttm": 20} for d in ["20260821", "20260822", "20260824"]],
            "fina_indicator": [
                {"ann_date": "20260430", "end_date": "20260331", "netprofit_yoy": 10, "eps": 1},
                {"ann_date": "20260822", "end_date": "20260630", "netprofit_yoy": -10, "eps": -1},
                {"ann_date": "20260824", "end_date": "20251231", "netprofit_yoy": 100, "eps": 10},
            ],
        }
        s = module.normalize({"symbol": "A"}, raw)
        self.assertEqual([k["close"] for k in s["klines"]], [50, 100, 100])
        self.assertEqual([f["profit_yoy"] for f in s["fundamentals"]], [10, -10, -10])
        self.assertEqual(s["fundamentals"][1]["effective_date"], "2026-08-22")
        raw["adj_factor"] = raw["adj_factor"][1:]
        with self.assertRaisesRegex(ValueError, "Missing adjustment factor"):
            module.normalize({"symbol": "A"}, raw)

    def test_known_loss_is_not_treated_as_unknown_quality(self):
        raw = {"daily": [{"trade_date": "20260822", "open": 10, "high": 10, "low": 10, "close": 10, "vol": 1}],
               "adj_factor": [{"trade_date": "20260822", "adj_factor": 1}], "daily_basic": [],
               "fina_indicator": [{"ann_date": "20260821", "end_date": "20260630", "netprofit_yoy": 10, "eps": -1}]}
        self.assertEqual(module.normalize({"symbol": "A"}, raw)["fundamentals"][0]["pe_ttm"], 0)


if __name__ == "__main__":
    unittest.main()
