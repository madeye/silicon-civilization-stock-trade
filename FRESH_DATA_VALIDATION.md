# 新数据验证：trend120（2026-09-06）

96只股票与沪深300已更新至2026-09-04。冻结最新候选 `trend120` 后验证新增的2026-08-06至2026-09-04数据，没有重新选股池、搜索参数或修改策略引擎。

| 运行方式 | 新期间收益 | 同期沪深300 | 超额收益 | 最大回撤 | 平均仓位 | 成交笔数 |
|---|---:|---:|---:|---:|---:|---:|
| 承接重算的历史持仓 | +0.58% | -2.36% | +2.94个百分点 | -5.35% | 38.84% | 3 |
| 8月6日从100万元空仓开始 | +0.53% | -2.36% | +2.89个百分点 | -0.51% | 4.76% | 4 |

两种方式均以8月5日收盘为收益基点，观察22个新增交易日。承接方式最高仓位43.68%，空仓起步最高14.68%，均无仓位超限。按每日现金加持仓市值核对净值，检查了两次回放合计3笔新买入的前一日超跌门槛。每边交易费10bps，现金收益为零。

近期跑赢指数，但只有22天且新买入很少；空仓方式平均仓位仅4.76%，下跌期间的现金保护对结果有明显影响，不能据此推断牛市参与能力或长期超额收益。这是新取得的历史数据，验证发生时该区间已经结束，不是真实前瞻或实盘业绩。固定股票池仍有幸存者偏差，简化成交模型也未覆盖真实滑点、冲击和所有交易限制。

## 数据与比较口径

- 原Kimi/iFinD数据接口本次返回登录令牌失效，改用项目已配置的Tushare Pro。行情从2023-07-01整体重取用于指标预热，没有拼接两个来源的不同复权基准。
- 96/96只股票均到9月4日，无失败或滞后标的；共74,063条个股日线、773条指数日线，另取得公告日期在8月6日之后的165条财务指标记录。
- 使用 `daily`、`adj_factor`、`daily_basic`、`fina_indicator` 和 `index_daily`。股票OHLC按最新复权因子归一化；财务指标按实际 `ann_date` 可用日期处理，晚到的旧报告期修订不会覆盖较新报告期。策略仅使用成交日前已知信息。接口的历史记录仍可能包含事后修订，不能视为不可修订的当时快照。
- 每日PE/PB来自对应交易日。缺失PE但已知报告EPS非正时，用非正标记保留原策略的亏损过滤；没有将季度EPS伪装成TTM估值。
- 原股票数据截止8月5日，原指数数据只到6月12日；本次比较使用完整新增共同日期。锚点只用于计算收益和回撤，不计入新增交易日数、平均仓位或空仓天数。
- 新来源与财报日期会重算历史路径：8月5日旧候选净值为1,917,230.30元，新来源重算为1,908,381.02元。承接方式继承后者对应持仓，以后者为分母；这项历史重算差额没有计入新增期间收益。另设空仓起步方式，避免把承接持仓当作新入场表现。

来源方法：[Tushare财务指标与公告日期](https://tushare.pro/document/2?doc_id=79)、[Tushare复权因子](https://tushare.pro/document/2?doc_id=28)。收益数字来自本仓库计算。

## 冻结与复现

`web/data/fresh-validation-lock.json` 在完整下载前记录策略提交 `51cab87`、四个策略文件和股票池的SHA-256，以及交易配置。验证脚本会拒绝规则、股票池或截止日期变化。常态45%/深度超跌80%组合上限、15%单股上限、5%买入步长、8%止损和最长120日持有均未更改。

原始385个接口响应、下载时间和标准化数据保存在忽略目录 `web/.cache/tushare-refresh-20260906/`；报告保存原始文件及数据集哈希。缓存不含令牌，不提交到Git。旧的 `dashboard-backtest.json` 与 `dashboard-candidate.json` 保留为历史对照，最新模拟持仓写入 `dashboard-latest.json`，新增区间结果写入 `fresh-validation.json`。

在仓库根目录运行（Python环境需先安装 `pyserver` 的依赖；将环境文件路径换为本机配置）：

```sh
pyserver/.venv/bin/python web/scripts/refresh-tushare.py --env-file pyserver/.env --out web/.cache/tushare-refresh-20260906 --start 20230701 --end 20260904
cd web
FRESH_DATASET=.cache/tushare-refresh-20260906/dataset.json npx tsx scripts/validate-fresh-strategy.ts
FRESH_DATASET=.cache/tushare-refresh-20260906/dataset.json DASHBOARD_EXIT_PROFILE=trend120 DASHBOARD_OUTPUT=dashboard-latest.json npx tsx scripts/build-dashboard.ts
npm run lint
npm test
./node_modules/.bin/tsc --noEmit
../pyserver/.venv/bin/python test/refresh-tushare.test.py
npm run build
```

重复下载同一缓存目录会复用同区间原始响应。未来刷新应使用新目录并另建验证锁，以保留本次审计材料。Dashboard展示新数据验证和最新模拟持仓；本次没有修改实时信号的退出配置。

本次验证：62项TypeScript测试、2项Python数据归一化测试、ESLint、TypeScript类型检查及生产构建均通过。生产服务 `/dashboard` 返回HTTP 200，已核对页面输出包含新日期、22天、96只股票、两种策略收益和最新模拟持仓；未进行浏览器截图验收。
