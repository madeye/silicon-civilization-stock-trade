# pyserver —— Tushare sidecar

基于 FastAPI 的轻量sidecar，封装 [Tushare Pro](https://tushare.pro)，只对外暴露 Next.js 网站需要的端点。

所有响应都写入 `cache.db`（SQLite），按端点设置分层 TTL：

| 端点 | TTL | Tushare API |
|---|---|---|
| `GET /klines` | 直到下一个 15:30 A 股收盘 | `ts.pro_bar(adj='qfq')` 或 `pro.hk_daily` |
| `GET /fundamental` | 24 小时 | `pro.daily_basic` + `pro.stock_basic` |
| `GET /analyst` | 24 小时 | `pro.report_rc` (券商研报) |
| `GET /spot` | 30 秒 | 最近一日 daily 收盘（Pro 无实时） |

## Token

需要 [Tushare Pro 账号](https://tushare.pro/register)。把 token 放进 `pyserver/.env`（已 gitignore）：

```
TUSHARE_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

启动时通过 `python-dotenv` 自动加载。

## 运行

依赖通过 [uv](https://docs.astral.sh/uv/) 管理 —— `pyproject.toml` 为依赖清单，`uv.lock` 锁定精确版本。

```bash
uv sync                                      # 创建 .venv 并安装锁定的依赖
uv run uvicorn main:app --port 8001 --reload
```

新增/升级依赖：

```bash
uv add <pkg>           # 写入 pyproject.toml + uv.lock
uv lock --upgrade      # 整体升级
```

## 为什么用sidecar？

Tushare 仅有 Python SDK。把它放进一个独立的 FastAPI 进程，可以让 Next.js 端保持纯 TypeScript，同时通过稳定、强类型、自带缓存的 HTTP 接口消费它。sidecar还集中处理：

- 符号格式归一化（`688256` ↔ `688256.SH`，`hk00700` ↔ `00700.HK`）。
- 退避重试（3 次指数退避），吸收 Tushare 偶发抖动。
- HK 接口的 token-bucket 限速（`pro.hk_daily` 免费档 2 次/分钟）。
- 名称缓存（`stock_basic` / `hk_basic` 进程内 LRU）。

## 端点速查

```bash
# 健康检查
curl http://localhost:8001/health

# 日 K（前复权）
curl 'http://localhost:8001/klines?symbol=688256&start=20240101'

# 基本面（PE/PB/市值，24h 缓存）
curl 'http://localhost:8001/fundamental?symbol=300476'

# 卖方一致预期（24h 缓存）
curl 'http://localhost:8001/analyst?symbol=300476'

# 最近收盘（30 秒缓存）
curl 'http://localhost:8001/spot?symbol=hk00700'
```

## 代码符号规则

所有端点接受同一套符号写法（与 ts_code 自动互转）：

| 市场 | 输入 | 内部 ts_code |
|---|---|---|
| 沪市 A 股 | `sh600519` 或 `600519` | `600519.SH` |
| 深市 A 股 | `sz000858` 或 `000858` | `000858.SZ` |
| 北交所 | `bj430...` 或 `8...` / `4...` | `430xxx.BJ` |
| 港股 | `hk00700` 或 `hk09988` | `00700.HK` |
