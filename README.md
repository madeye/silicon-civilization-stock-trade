# 硅基文明消费股交易系统

一个聚焦 **硅基文明消费股** 的中国市场交易策略系统。

## 主题定义

"硅基文明消费" 并不是指人类购买 AI 产品，而是指假设人工智能形成基于硅基的文明，**它们自身为了存在与扩张所需要消费的东西**：算力芯片、光模块/高速互连、AI 服务器、液冷散热、电力（绿电与核电）、IDC 数据中心、HBM/存储、半导体设备与材料、高速 PCB、晶圆代工、云计算。我们做多这些"喂养"硅基文明的卖铲人。

## 架构

```
┌──────────────────────────┐       ┌──────────────────────────────┐
│   Next.js 网站 (web/)     │ HTTP  │  Python sidecar (pyserver/)      │
│  - 自选/K 线/信号 UI      │ ────► │  - Tushare Pro 封装               │
│  - 回测引擎 (TS)          │       │  - SQLite K 线/基本面缓存     │
│  - DeepSeek 策略大模型    │       │    (分层 TTL)                 │
│  - SQLite 大模型回包缓存  │       │  - FastAPI                    │
└──────────────────────────┘       └──────────────────────────────┘
```

### 节流策略（最小化 API 调用）

| 层 | 缓存位置 | TTL |
|---|---|---|
| Tushare 日 K | SQLite (`pyserver/cache.db`) | 直到下一个交易日收盘 |
| Tushare 基本面 (PE/PB/市值) | SQLite | 24 小时 |
| Tushare 最近收盘 | 内存 LRU | 30 秒 |
| DeepSeek 策略回包 | SQLite，键为 `sha256(prompt+model)` | 12 小时 |
| 回测中的大模型信号 | 命中本地缓存后永不重问 | ∞ |

- **批量打分**：每次调仓 DeepSeek 仅调用一次，返回多只股票的 JSON 数组。
- **服务端 KV 缓存**：稳定的中文系统提示词放在 `messages[0]`，DeepSeek 自带的 prompt cache 会自动命中（参见返回里的 `prompt_cache_hit_tokens`），重复调仓几乎免费。
- **实盘 vs 回测分模型**：实盘信号默认使用 `deepseek-v4-pro`，回测扫参默认使用 `deepseek-v4-flash`，可通过环境变量覆盖。

## 快速开始

```bash
# 1. Python sidecar (Tushare) —— 使用 uv 管理依赖
cd pyserver
echo "TUSHARE_TOKEN=xxx" > .env       # 从 https://tushare.pro/register 获取
uv sync
uv run uvicorn main:app --port 8001 --reload

# 2. Next.js 网站
cd web
npm install
cp env.example.txt .env.local       # 填入 DEEPSEEK_API_KEY
npm run dev
```

打开 http://localhost:3000 。

## 配置

`web/.env.local` 示例：
```
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-v4-pro              # 实盘信号
DEEPSEEK_MODEL_BACKTEST=deepseek-v4-flash   # 回测降本
DEEPSEEK_BASE_URL=https://api.deepseek.com
PYSERVER_URL=http://localhost:8001
```

## 默认股票池

详见 `web/lib/universe.ts` —— 围绕 算力 / 光模块 / AI 服务器 / 液冷 / 电力 / IDC / 存储 / 半导体设备 / AI-PCB / 晶圆代工 / 云 等子主题精选的 A 股 + 港股名单，可在 UI 中自由编辑。

## 目录结构

```
silicon-civilization-stock-trade/
├── README.md
├── pyserver/              # FastAPI + Tushare sidecar
│   ├── main.py
│   ├── pyproject.toml     # uv 管理
│   └── uv.lock
└── web/                   # Next.js 15 App Router
    ├── app/
    │   ├── page.tsx                  # 首页（按主题展示股票池）
    │   ├── signals/page.tsx          # 实时信号（服务端渲染）
    │   ├── backtest/page.tsx         # 回测界面
    │   └── api/backtest/route.ts     # 回测 API
    └── lib/
        ├── universe.ts               # 股票池
        ├── pyserver.ts               # Tushare sidecar 客户端
        ├── deepseek.ts               # DeepSeek 客户端 + 策略提示词
        ├── backtest.ts               # 走向无未来函数的回测引擎
        └── cache.ts                  # SQLite KV 缓存
```

## 开发命令

| 目的 | 命令 |
|---|---|
| 类型检查 | `cd web && ./node_modules/.bin/tsc --noEmit` |
| 单元测试 | `cd web && npm test` |
| 生产构建 | `cd web && npm run build` |
| Python 依赖升级 | `cd pyserver && uv lock --upgrade` |

## 停止后台进程

```
lsof -ti:3000,8001 | xargs kill
```
