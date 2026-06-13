# 股票池买方研报包（初版）

生成日期：2026-06-13

> 研究属性：买方内部初筛 memo，不构成个性化投资建议。除已注明的本地快照字段外，逐家公司最新公告、财报、电话会、机构调研和一致预期来源仍需人工复核。

## 0. 数据边界与来源纪律

- 覆盖范围：web/data/universe.json 股票池 87 只，按主题分组。
- 本地快照：docs/data/analyst.json（2026-06-12T08:53:15.852Z，87/87 analyst 字段覆盖）；docs/data/signals.json（2026-06-12T08:34:33.809Z，fundamentals/signals）；web/data/dashboard-backtest.json（2026-06-13T08:51:32.376Z，latestDate 2026-06-12）。
- Dashboard 回测：2024-01-01 至 2026-06-13，总收益 +551.24%，最大回撤 -31.66%，Sharpe 1.73；该结果用于组合线索，不直接等同未来收益。
- 外部核验入口：上交所上市公司公告、深交所上市公司公告、巨潮资讯。本文未逐一下载 PDF 核验，任何“目标价/上行空间”均应视为本地模型和快照口径。
- 评级口径：Buy / Accumulate / Hold / Watchlist / Reduce 是研究优先级和仓位倾向，不是面向个人投资者的交易指令。

## 1. 组合优先级摘要

| Rank | Symbol | Name | Theme | Bias | Price | Base Target | Upside | PE(TTM) | Dashboard |
| ---: | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| 1 | 603083 | 剑桥科技 | 光模块 | Buy | ¥171.08 | ¥453.11 | +164.8% | 179.8x | signal #13 |
| 2 | 000063 | 中兴通讯 | AI服务器 | Buy | ¥37.81 | ¥96.80 | +156.0% | 40.4x | signal #71 |
| 3 | 603678 | 火炬电子 | 功率器件 | Buy | ¥61.91 | ¥153.75 | +148.3% | 116.5x | signal #78 |
| 4 | 301018 | 申菱环境 | 液冷 | Buy | ¥97.59 | ¥254.41 | +160.7% | 191.3x | signal #81 |
| 5 | 002049 | 紫光国微 | 算力/AI芯片 | Buy / Active position | ¥71.42 | ¥147.28 | +106.2% | 36.7x | holding |
| 6 | 002371 | 北方华创 | 半导体设备 | Buy | ¥637.50 | ¥1430.32 | +124.4% | 82.9x | signal #16 |
| 7 | 688347 | 华虹公司 | 晶圆代工 | Buy | ¥221.35 | ¥510.60 | +130.7% | 779.5x | signal #34 |
| 8 | 002364 | 中恒电气 | 电力设备 | Accumulate | ¥48.97 | ¥112.69 | +130.1% | 210.6x | signal #53 |
| 9 | 300499 | 高澜股份 | 液冷 | Buy | ¥34.40 | ¥72.22 | +109.9% | 343.9x | signal #84 |
| 10 | 600584 | 长电科技 | 存储/HBM | Buy | ¥71.95 | ¥132.48 | +84.1% | 77.9x | signal #15 |
| 11 | 688012 | 中微公司 | 半导体设备 | Buy / Active position | ¥303.12 | ¥539.12 | +77.9% | 104.1x | signal #9 |
| 12 | 605111 | 新洁能 | 功率器件 | Buy | ¥58.39 | ¥106.35 | +82.1% | 63.8x | signal #46 |
| 13 | 300738 | 奥飞数据 | IDC | Buy | ¥18.95 | ¥34.47 | +81.9% | 107.7x | signal #65 |
| 14 | 688019 | 安集科技 | 半导体材料 | Buy | ¥230.45 | ¥432.03 | +87.5% | 63.7x | signal #36 |
| 15 | 688256 | 寒武纪 | 算力/AI芯片 | Buy | ¥1219.50 | ¥2399.87 | +96.8% | 282.0x | signal #25 |
| 16 | 600460 | 士兰微 | 功率器件 | Buy | ¥33.18 | ¥58.97 | +77.7% | 120.3x | signal #60 |
| 17 | 603228 | 景旺电子 | AI-PCB | Buy | ¥75.80 | ¥136.02 | +79.4% | 65.6x | signal #41 |
| 18 | 301205 | 联特科技 | 光模块 | Buy | ¥335.03 | ¥636.39 | +90.0% | 497.2x | signal #48 |
| 19 | 300394 | 天孚通信 | 光模块 | Buy | ¥412.30 | ¥721.82 | +75.1% | 147.9x | signal #35 |
| 20 | 300476 | 胜宏科技 | AI-PCB | Buy | ¥325.48 | ¥551.27 | +69.4% | 68.4x | signal #47 |
| 21 | 688082 | 盛美上海 | 半导体设备 | Buy | ¥284.00 | ¥467.83 | +64.7% | 109.3x | signal #31 |
| 22 | 688008 | 澜起科技 | 存储/HBM | Buy / Active position | ¥228.70 | ¥272.67 | +19.2% | 109.3x | holding |
| 23 | 002409 | 雅克科技 | 半导体材料 | Buy | ¥134.81 | ¥203.94 | +51.3% | 63.7x | signal #12 |
| 24 | 300502 | 新易盛 | 光模块 | Buy / Active position | ¥526.00 | ¥689.84 | +31.1% | 68.3x | holding |
| 25 | 002185 | 华天科技 | 存储/HBM | Buy | ¥16.75 | ¥27.29 | +63.0% | 68.2x | signal #33 |

## 2. 分主题买方 Memo

## 功率器件

### 603290 斯达半导（上交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥111.45 / 未核验
- Core Thesis: IGBT 龙头，主题为功率器件。本地 analyst 快照显示买入占比 +95.7%（90/94），当前价 ¥111.45，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 81.3x，PB 3.8x，市值 266.9亿元。Dashboard 最新信号排名 #49，PEG- 动量22.4% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 81.3x；PB 3.8x；市值 266.9亿元；next EPS consensus 5.39。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=603290
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688187 时代电气（上交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥35.61 / ¥63.79 / ¥79.74 Bear/Base/Bull
- Current Price / Upside: ¥54.78 / +16.4%
- Core Thesis: 高压 IGBT/SiC，主题为功率器件。本地 analyst 快照显示买入占比 +100.0%（48/48），当前价 ¥54.78，隐含目标 ¥63.79，上行 +16.4%。本地 fundamentals 快照：PE(TTM) 18.0x，PB 1.7x，市值 738.3亿元。Dashboard 最新信号排名 #66，PEG- 动量8.8% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 18.0x；PB 1.7x；市值 738.3亿元；next EPS consensus 3.55。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥35.61 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥63.79 | +16.4% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥79.74 | +45.6% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688187
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688711 宏微科技（上交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥34.63 / 未核验
- Core Thesis: IGBT/SiC 模块，主题为功率器件。本地 analyst 快照显示买入占比 +96.0%（24/25），当前价 ¥34.63，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 435.6x，PB 7.0x，市值 73.8亿元。Dashboard 最新信号排名 #56，PEG- 动量15.8% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 435.6x；PB 7.0x；市值 73.8亿元；next EPS consensus 0.96。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688711
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 605111 新洁能（上交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥58.49 / ¥106.35 / ¥132.94 Bear/Base/Bull
- Current Price / Upside: ¥58.39 / +82.1%
- Core Thesis: MOSFET，主题为功率器件。本地 analyst 快照显示买入占比 +100.0%（94/94），当前价 ¥58.39，隐含目标 ¥106.35，上行 +82.1%。本地 fundamentals 快照：PE(TTM) 63.8x，PB 5.6x，市值 242.5亿元。Dashboard 最新信号排名 #46，PEG- 动量24.4% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 63.8x；PB 5.6x；市值 242.5亿元；next EPS consensus 1.67。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥58.49 | +0.2% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥106.35 | +82.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥132.94 | +127.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=605111
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 600460 士兰微（上交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥32.43 / ¥58.97 / ¥73.71 Bear/Base/Bull
- Current Price / Upside: ¥33.18 / +77.7%
- Core Thesis: IDM 功率器件，主题为功率器件。本地 analyst 快照显示买入占比 +97.7%（86/88），当前价 ¥33.18，隐含目标 ¥58.97，上行 +77.7%。本地 fundamentals 快照：PE(TTM) 120.3x，PB 4.5x，市值 552.1亿元。Dashboard 最新信号排名 #60，PEG- 动量14.9% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 120.3x；PB 4.5x；市值 552.1亿元；next EPS consensus 0.49。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥32.43 | -2.3% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥58.97 | +77.7% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥73.71 | +122.1% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600460
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688396 华润微（上交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥47.70 / ¥86.73 / ¥108.41 Bear/Base/Bull
- Current Price / Upside: ¥63.03 / +37.6%
- Core Thesis: IDM 功率/MEMS，主题为功率器件。本地 analyst 快照显示买入占比 +90.7%（68/75），当前价 ¥63.03，隐含目标 ¥86.73，上行 +37.6%。本地 fundamentals 快照：PE(TTM) 92.3x，PB 3.6x，市值 837.2亿元。Dashboard 最新信号排名 #44，PEG- 动量25.7% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 92.3x；PB 3.6x；市值 837.2亿元；next EPS consensus 0.94。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥47.70 | -24.3% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥86.73 | +37.6% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥108.41 | +72.0% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688396
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 600745 闻泰科技（上交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥17.94 / 未核验
- Core Thesis: 安世 IGBT/MOSFET，主题为功率器件。本地 analyst 快照显示买入占比 +95.3%（81/85），当前价 ¥17.94，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 未核验x，PB 1.0x，市值 223.3亿元。Dashboard 最新信号排名 #80，PEG- 动量-41.1% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 未核验x；PB 1.0x；市值 223.3亿元；next EPS consensus 2.58。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600745
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688261 东微半导（上交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥80.40 / 未核验
- Core Thesis: 高压超级结MOSFET龙头，AI服务器电源核心功率器件供应商，主题为功率器件。本地 analyst 快照显示买入占比 +100.0%（42/42），当前价 ¥80.40，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 224.2x，PB 3.3x，市值 98.6亿元。Dashboard 最新信号排名 #63，PEG- 动量10.6% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 224.2x；PB 3.3x；市值 98.6亿元；next EPS consensus 1.55。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688261
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 600563 法拉电子（上交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥114.77 / ¥208.67 / ¥260.84 Bear/Base/Bull
- Current Price / Upside: ¥150.25 / +38.9%
- Core Thesis: 薄膜电容龙头，广泛应用于服务器电源及新能源，受益AI电源链，主题为功率器件。本地 analyst 快照显示买入占比 +95.9%（70/73），当前价 ¥150.25，隐含目标 ¥208.67，上行 +38.9%。本地 fundamentals 快照：PE(TTM) 28.3x，PB 5.4x，市值 338.1亿元。Dashboard 最新信号排名 #70，PEG- 动量6.1% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 28.3x；PB 5.4x；市值 338.1亿元；next EPS consensus 7.38。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥114.77 | -23.6% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥208.67 | +38.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥260.84 | +73.6% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600563
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002138 顺络电子（深交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥42.92 / ¥78.03 / ¥97.54 Bear/Base/Bull
- Current Price / Upside: ¥55.63 / +40.3%
- Core Thesis: 电感龙头，全球消费电子及汽车核心供应商，可延伸至AI服务器，主题为功率器件。本地 analyst 快照显示买入占比 +99.2%（121/122），当前价 ¥55.63，隐含目标 ¥78.03，上行 +40.3%。本地 fundamentals 快照：PE(TTM) 46.4x，PB 7.8x，市值 448.6亿元。Dashboard 最新信号排名 #75，PEG- 动量0.5% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 46.4x；PB 7.8x；市值 448.6亿元；next EPS consensus 1.68。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥42.92 | -22.9% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥78.03 | +40.3% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥97.54 | +75.3% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002138
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 603678 火炬电子（上交所，功率器件）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥84.57 / ¥153.75 / ¥192.19 Bear/Base/Bull
- Current Price / Upside: ¥61.91 / +148.3%
- Core Thesis: MLCC及特种电容，受益于AI服务器对被动元件需求激增，主题为功率器件。本地 analyst 快照显示买入占比 +94.1%（64/68），当前价 ¥61.91，隐含目标 ¥153.75，上行 +148.3%。本地 fundamentals 快照：PE(TTM) 116.5x，PB 4.8x，市值 294.4亿元。Dashboard 最新信号排名 #78，PEG- 动量-3.4% 主题23分。核心研究问题是：SiC/IGBT 放量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在新能源车、光储、工控和电力电子功率半导体环节，利润池受 SiC/IGBT 供需与国产替代驱动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +5.41%，平均仓位 +15.11%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 116.5x；PB 4.8x；市值 294.4亿元；next EPS consensus 1.32。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- SiC/IGBT 放量
- 新能源车和光储需求
- 产能利用率与产品结构
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥84.57 | +36.6% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥153.75 | +148.4% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥192.19 | +210.4% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 车规价格战传导；SiC 供给增加压低毛利；下游新能源周期波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=603678
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 光模块

### 300308 中际旭创（深交所，光模块）

**0. Executive Investment View**
- Rating Bias: Reduce / Avoid chase
- 12M Target Price Range: ¥730.60 / ¥931.83 / ¥1164.78 Bear/Base/Bull
- Current Price / Upside: ¥1124.00 / -17.1%
- Core Thesis: 全球 800G/1.6T 龙头，主题为光模块。本地 analyst 快照显示买入占比 +94.5%（275/291），当前价 ¥1124.00，隐含目标 ¥931.83，上行 -17.1%。本地 fundamentals 快照：PE(TTM) 83.9x，PB 36.2x，市值 12535.2亿元。Dashboard 最新信号排名 #17，PEG- 动量36.0% 主题67分。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 83.9x；PB 36.2x；市值 12535.2亿元；next EPS consensus 11.11。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥730.60 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥931.83 | -17.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥1164.78 | +3.6% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300308
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300502 新易盛（深交所，光模块）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: ¥379.41 / ¥689.84 / ¥862.30 Bear/Base/Bull
- Current Price / Upside: ¥526.00 / +31.1%
- Core Thesis: 800G 第二梯队，主题为光模块。本地 analyst 快照显示买入占比 +97.9%（95/97），当前价 ¥526.00，隐含目标 ¥689.84，上行 +31.1%。本地 fundamentals 快照：PE(TTM) 68.3x，PB 37.8x，市值 7333.8亿元。Dashboard 最新持仓包含该股，按 ¥506.46 标记。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 68.3x；PB 37.8x；市值 7333.8亿元；next EPS consensus 10.10。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥379.41 | -27.9% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥689.84 | +31.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥862.30 | +63.9% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300502
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300394 天孚通信（深交所，光模块）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥397.00 / ¥721.82 / ¥902.28 Bear/Base/Bull
- Current Price / Upside: ¥412.30 / +75.1%
- Core Thesis: 光器件，光模块板块联动，主题为光模块。本地 analyst 快照显示买入占比 +94.5%（138/146），当前价 ¥412.30，隐含目标 ¥721.82，上行 +75.1%。本地 fundamentals 快照：PE(TTM) 147.9x，PB 53.4x，市值 3212.5亿元。Dashboard 最新信号排名 #35，PEG- 动量15.7% 主题67分。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 147.9x；PB 53.4x；市值 3212.5亿元；next EPS consensus 4.88。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥397.00 | -3.7% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥721.82 | +75.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥902.28 | +118.8% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300394
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 000988 华工科技（深交所，光模块）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥106.28 / ¥193.24 / ¥241.55 Bear/Base/Bull
- Current Price / Upside: ¥150.50 / +28.4%
- Core Thesis: 光模块/激光，主题为光模块。本地 analyst 快照显示买入占比 +100.0%（59/59），当前价 ¥150.50，隐含目标 ¥193.24，上行 +28.4%。本地 fundamentals 快照：PE(TTM) 89.1x，PB 12.9x，市值 1513.3亿元。Dashboard 最新信号排名 #40，PEG- 动量11.1% 主题67分。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 89.1x；PB 12.9x；市值 1513.3亿元；next EPS consensus 2.17。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥106.28 | -29.4% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥193.24 | +28.4% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥241.55 | +60.5% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=000988
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002281 光迅科技（深交所，光模块）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥158.76 / ¥288.66 / ¥360.83 Bear/Base/Bull
- Current Price / Upside: ¥205.40 / +40.5%
- Core Thesis: 光器件+光模块，主题为光模块。本地 analyst 快照显示买入占比 +86.6%（97/112），当前价 ¥205.40，隐含目标 ¥288.66，上行 +40.5%。本地 fundamentals 快照：PE(TTM) 159.9x，PB 16.0x，市值 1656.9亿元。Dashboard 最新信号排名 #11，PEG- 动量76.4% 主题67分。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 159.9x；PB 16.0x；市值 1656.9亿元；next EPS consensus 1.80。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥158.76 | -22.7% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥288.66 | +40.5% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥360.83 | +75.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002281
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 603083 剑桥科技（上交所，光模块）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥249.21 / ¥453.11 / ¥566.39 Bear/Base/Bull
- Current Price / Upside: ¥171.08 / +164.8%
- Core Thesis: 光模块新势力，主题为光模块。本地 analyst 快照显示买入占比 +91.7%（11/12），当前价 ¥171.08，隐含目标 ¥453.11，上行 +164.8%。本地 fundamentals 快照：PE(TTM) 179.8x，PB 6.9x，市值 630.0亿元。Dashboard 最新信号排名 #13，PEG- 动量56.0% 主题67分。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 179.8x；PB 6.9x；市值 630.0亿元；next EPS consensus 2.52。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥249.21 | +45.7% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥453.11 | +164.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥566.39 | +231.1% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=603083
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 301205 联特科技（深交所，光模块）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥350.01 / ¥636.39 / ¥795.49 Bear/Base/Bull
- Current Price / Upside: ¥335.03 / +90.0%
- Core Thesis: 联特科技，主题为光模块。本地 analyst 快照显示买入占比 +100.0%（1/1），当前价 ¥335.03，隐含目标 ¥636.39，上行 +90.0%。本地 fundamentals 快照：PE(TTM) 497.2x，PB 26.7x，市值 434.7亿元。Dashboard 最新信号排名 #48，PEG- 动量6.4% 主题67分。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 497.2x；PB 26.7x；市值 434.7亿元；next EPS consensus 1.28。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥350.01 | +4.5% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥636.39 | +89.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥795.49 | +137.4% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=301205
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300620 光库科技（深交所，光模块）

**0. Executive Investment View**
- Rating Bias: Reduce / Avoid chase
- 12M Target Price Range: ¥190.74 / ¥227.46 / ¥284.32 Bear/Base/Bull
- Current Price / Upside: ¥293.45 / -22.5%
- Core Thesis: 铌酸锂调制器芯片及器件，薄膜铌酸锂光子集成，主题为光模块。本地 analyst 快照显示买入占比 +96.2%（25/26），当前价 ¥293.45，隐含目标 ¥227.46，上行 -22.5%。本地 fundamentals 快照：PE(TTM) 347.3x，PB 33.9x，市值 731.2亿元。Dashboard 最新信号排名 #27，PEG- 动量18.1% 主题67分。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 347.3x；PB 33.9x；市值 731.2亿元；next EPS consensus 0.66。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥190.74 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥227.46 | -22.5% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥284.32 | -3.1% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300620
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002222 福晶科技（深交所，光模块）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: ¥58.97 / ¥101.61 / ¥127.01 Bear/Base/Bull
- Current Price / Upside: ¥90.72 / +12.0%
- Core Thesis: 铌酸锂等光学晶体材料，主题为光模块。本地 analyst 快照显示买入占比 +100.0%（22/22），当前价 ¥90.72，隐含目标 ¥101.61，上行 +12.0%。本地 fundamentals 快照：PE(TTM) 145.2x，PB 23.3x，市值 426.6亿元。Dashboard 最新信号排名 #24，PEG- 动量23.7% 主题67分。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 145.2x；PB 23.3x；市值 426.6亿元；next EPS consensus 0.70。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥58.97 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥101.61 | +12.0% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥127.01 | +40.0% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002222
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688498 源杰科技（上交所，光模块）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: ¥943.80 / ¥1393.71 / ¥1742.14 Bear/Base/Bull
- Current Price / Upside: ¥1452.00 / -4.0%
- Core Thesis: 光芯片龙头，为AI光模块提供激光器芯片，主题为光模块。本地 analyst 快照显示买入占比 +88.4%（38/43），当前价 ¥1452.00，隐含目标 ¥1393.71，上行 -4.0%。本地 fundamentals 快照：PE(TTM) 507.7x，PB 73.3x，市值 1807.7亿元。Dashboard 最新持仓包含该股，按 ¥1400.01 标记。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 507.7x；PB 73.3x；市值 1807.7亿元；next EPS consensus 2.75。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥943.80 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥1393.71 | -4.0% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥1742.14 | +20.0% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688498
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688205 德科立（上交所，光模块）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥236.37 / 未核验
- Core Thesis: 光模块及光放大器供应商，AI数据中心光互联重要环节，主题为光模块。本地 analyst 快照显示买入占比 +83.3%（5/6），当前价 ¥236.37，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 491.0x，PB 16.0x，市值 376.4亿元。Dashboard 最新信号排名 #51，PEG- 动量5.9% 主题67分。核心研究问题是：海外云厂商资本开支与 AI 集群部署 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 位于 AI 数据中心高速互联链条，利润池集中在 800G/1.6T 光模块、光器件、硅光/薄膜铌酸锂等高端环节。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +541.52%，平均仓位 +19.68%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 491.0x；PB 16.0x；市值 376.4亿元；next EPS consensus 1.84。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 海外云厂商资本开支与 AI 集群部署
- 800G/1.6T 产品良率、交付份额和 ASP
- 客户集中度、汇率和扩产节奏
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 大客户订单波动或降价；技术路线切换导致库存/产能错配；出口管制和海外清单风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688205
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 存储/HBM

### 603986 兆易创新（上交所，存储/HBM）

**0. Executive Investment View**
- Rating Bias: Reduce / Avoid chase
- 12M Target Price Range: ¥314.28 / ¥370.27 / ¥462.84 Bear/Base/Bull
- Current Price / Upside: ¥483.50 / -23.4%
- Core Thesis: NAND/DRAM/MCU 龙头，主题为存储/HBM。本地 analyst 快照显示买入占比 +93.2%（206/221），当前价 ¥483.50，隐含目标 ¥370.27，上行 -23.4%。本地 fundamentals 快照：PE(TTM) 117.9x，PB 13.7x，市值 3389.8亿元。Dashboard 最新信号排名 #14，PEG- 动量34.0% 主题79分。核心研究问题是：DRAM/NAND 价格周期 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在存储芯片、模组、控制器和 HBM 产业链，周期属性强，利润池随供需、价格和 AI 存储需求摆动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.65%，平均仓位 +7.59%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 117.9x；PB 13.7x；市值 3389.8亿元；next EPS consensus 3.14。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- DRAM/NAND 价格周期
- HBM/企业级 SSD/模组升级
- 库存水位和毛利率拐点
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥314.28 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥370.27 | -23.4% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥462.84 | -4.3% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 存储价格回落；海外龙头扩产压制景气；库存跌价和客户认证风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=603986
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688008 澜起科技（上交所，存储/HBM）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: ¥149.97 / ¥272.67 / ¥340.84 Bear/Base/Bull
- Current Price / Upside: ¥228.70 / +19.2%
- Core Thesis: DDR5/CXL 内存接口，主题为存储/HBM。本地 analyst 快照显示买入占比 +90.0%（117/130），当前价 ¥228.70，隐含目标 ¥272.67，上行 +19.2%。本地 fundamentals 快照：PE(TTM) 109.3x，PB 13.4x，市值 2795.2亿元。Dashboard 最新持仓包含该股，按 ¥224.88 标记。核心研究问题是：DRAM/NAND 价格周期 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在存储芯片、模组、控制器和 HBM 产业链，周期属性强，利润池随供需、价格和 AI 存储需求摆动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.65%，平均仓位 +7.59%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 109.3x；PB 13.4x；市值 2795.2亿元；next EPS consensus 2.50。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- DRAM/NAND 价格周期
- HBM/企业级 SSD/模组升级
- 库存水位和毛利率拐点
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥149.97 | -34.4% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥272.67 | +19.2% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥340.84 | +49.0% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 存储价格回落；海外龙头扩产压制景气；库存跌价和客户认证风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688008
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300223 北京君正（深交所，存储/HBM）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: ¥94.57 / ¥164.23 / ¥205.28 Bear/Base/Bull
- Current Price / Upside: ¥145.49 / +12.9%
- Core Thesis: 车规存储+处理器，主题为存储/HBM。本地 analyst 快照显示买入占比 +97.8%（87/89），当前价 ¥145.49，隐含目标 ¥164.23，上行 +12.9%。本地 fundamentals 快照：PE(TTM) 113.3x，PB 5.6x，市值 703.7亿元。Dashboard 最新信号排名 #26，PEG- 动量17.2% 主题79分。核心研究问题是：DRAM/NAND 价格周期 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在存储芯片、模组、控制器和 HBM 产业链，周期属性强，利润池随供需、价格和 AI 存储需求摆动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.65%，平均仓位 +7.59%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 113.3x；PB 5.6x；市值 703.7亿元；next EPS consensus 1.45。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- DRAM/NAND 价格周期
- HBM/企业级 SSD/模组升级
- 库存水位和毛利率拐点
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥94.57 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥164.23 | +12.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥205.28 | +41.1% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 存储价格回落；海外龙头扩产压制景气；库存跌价和客户认证风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300223
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 301308 江波龙（深交所，存储/HBM）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: ¥334.62 / ¥108.95 / ¥136.19 Bear/Base/Bull
- Current Price / Upside: ¥514.80 / -78.8%
- Core Thesis: 存储模组，主题为存储/HBM。本地 analyst 快照显示买入占比 +100.0%（12/12），当前价 ¥514.80，隐含目标 ¥108.95，上行 -78.8%。本地 fundamentals 快照：PE(TTM) 40.1x，PB 18.3x，市值 2177.9亿元。Dashboard 最新信号排名 #8，PEG- 动量54.8% 主题79分。核心研究问题是：DRAM/NAND 价格周期 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在存储芯片、模组、控制器和 HBM 产业链，周期属性强，利润池随供需、价格和 AI 存储需求摆动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.65%，平均仓位 +7.59%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 40.1x；PB 18.3x；市值 2177.9亿元；next EPS consensus 2.72。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- DRAM/NAND 价格周期
- HBM/企业级 SSD/模组升级
- 库存水位和毛利率拐点
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥334.62 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥108.95 | -78.8% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥136.19 | -73.5% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 存储价格回落；海外龙头扩产压制景气；库存跌价和客户认证风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=301308
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002156 通富微电（深交所，存储/HBM）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: ¥39.06 / ¥65.57 / ¥81.96 Bear/Base/Bull
- Current Price / Upside: ¥60.09 / +9.1%
- Core Thesis: AMD HBM 封测，主题为存储/HBM。本地 analyst 快照显示买入占比 +96.7%（117/121），当前价 ¥60.09，隐含目标 ¥65.57，上行 +9.1%。本地 fundamentals 快照：PE(TTM) 63.0x，PB 5.9x，市值 911.9亿元。Dashboard 最新信号排名 #19，PEG- 动量22.0% 主题79分。核心研究问题是：DRAM/NAND 价格周期 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在存储芯片、模组、控制器和 HBM 产业链，周期属性强，利润池随供需、价格和 AI 存储需求摆动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.65%，平均仓位 +7.59%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 63.0x；PB 5.9x；市值 911.9亿元；next EPS consensus 1.04。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- DRAM/NAND 价格周期
- HBM/企业级 SSD/模组升级
- 库存水位和毛利率拐点
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥39.06 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥65.57 | +9.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥81.96 | +36.4% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 存储价格回落；海外龙头扩产压制景气；库存跌价和客户认证风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002156
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 600584 长电科技（上交所，存储/HBM）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥72.86 / ¥132.48 / ¥165.60 Bear/Base/Bull
- Current Price / Upside: ¥71.95 / +84.1%
- Core Thesis: 封测龙头，主题为存储/HBM。本地 analyst 快照显示买入占比 +95.5%（128/134），当前价 ¥71.95，隐含目标 ¥132.48，上行 +84.1%。本地 fundamentals 快照：PE(TTM) 77.9x，PB 4.5x，市值 1287.5亿元。Dashboard 最新信号排名 #15，PEG- 动量30.9% 主题79分。核心研究问题是：DRAM/NAND 价格周期 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在存储芯片、模组、控制器和 HBM 产业链，周期属性强，利润池随供需、价格和 AI 存储需求摆动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.65%，平均仓位 +7.59%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 77.9x；PB 4.5x；市值 1287.5亿元；next EPS consensus 1.70。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- DRAM/NAND 价格周期
- HBM/企业级 SSD/模组升级
- 库存水位和毛利率拐点
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥72.86 | +1.3% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥132.48 | +84.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥165.60 | +130.2% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 存储价格回落；海外龙头扩产压制景气；库存跌价和客户认证风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600584
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002185 华天科技（深交所，存储/HBM）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥15.01 / ¥27.29 / ¥34.12 Bear/Base/Bull
- Current Price / Upside: ¥16.75 / +63.0%
- Core Thesis: 封测，主题为存储/HBM。本地 analyst 快照显示买入占比 +91.2%（73/80），当前价 ¥16.75，隐含目标 ¥27.29，上行 +63.0%。本地 fundamentals 快照：PE(TTM) 68.2x，PB 3.1x，市值 556.7亿元。Dashboard 最新信号排名 #33，PEG- 动量12.7% 主题79分。核心研究问题是：DRAM/NAND 价格周期 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在存储芯片、模组、控制器和 HBM 产业链，周期属性强，利润池随供需、价格和 AI 存储需求摆动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.65%，平均仓位 +7.59%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 68.2x；PB 3.1x；市值 556.7亿元；next EPS consensus 0.40。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- DRAM/NAND 价格周期
- HBM/企业级 SSD/模组升级
- 库存水位和毛利率拐点
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥15.01 | -10.4% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥27.29 | +62.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥34.12 | +103.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 存储价格回落；海外龙头扩产压制景气；库存跌价和客户认证风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002185
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 000021 深科技（深交所，存储/HBM）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥37.09 / 未核验
- Core Thesis: 内存芯片封测龙头，为海力士等国际大厂提供存储芯片封装测试服务，间接受益于HBM扩产，主题为存储/HBM。本地 analyst 快照显示买入占比 +94.4%（17/18），当前价 ¥37.09，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 51.3x，PB 4.7x，市值 615.3亿元。Dashboard 最新信号排名 #29，PEG- 动量15.6% 主题79分。核心研究问题是：DRAM/NAND 价格周期 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在存储芯片、模组、控制器和 HBM 产业链，周期属性强，利润池随供需、价格和 AI 存储需求摆动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.65%，平均仓位 +7.59%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 51.3x；PB 4.7x；市值 615.3亿元；next EPS consensus 未核验。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- DRAM/NAND 价格周期
- HBM/企业级 SSD/模组升级
- 库存水位和毛利率拐点
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 存储价格回落；海外龙头扩产压制景气；库存跌价和客户认证风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=000021
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300475 香农芯创（深交所，存储/HBM）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: ¥118.40 / ¥86.21 / ¥107.76 Bear/Base/Bull
- Current Price / Upside: ¥182.16 / -52.7%
- Core Thesis: SK海力士HBM主要代理商，直接受益于AI存储需求爆发，主题为存储/HBM。本地 analyst 快照显示买入占比 +100.0%（17/17），当前价 ¥182.16，隐含目标 ¥86.21，上行 -52.7%。本地 fundamentals 快照：PE(TTM) 46.1x，PB 17.3x，市值 855.3亿元。Dashboard 最新持仓包含该股，按 ¥187.50 标记。核心研究问题是：DRAM/NAND 价格周期 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在存储芯片、模组、控制器和 HBM 产业链，周期属性强，利润池随供需、价格和 AI 存储需求摆动。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.65%，平均仓位 +7.59%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 46.1x；PB 17.3x；市值 855.3亿元；next EPS consensus 1.87。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- DRAM/NAND 价格周期
- HBM/企业级 SSD/模组升级
- 库存水位和毛利率拐点
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥118.40 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥86.21 | -52.7% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥107.76 | -40.8% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 存储价格回落；海外龙头扩产压制景气；库存跌价和客户认证风险。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300475
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 半导体材料

### 600330 天通股份（上交所，半导体材料）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥29.31 / 未核验
- Core Thesis: 铌酸锂单晶/晶圆，上游关键原材料，主题为半导体材料。本地 analyst 快照显示买入占比 +96.4%（27/28），当前价 ¥29.31，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 未核验x，PB 4.7x，市值 361.5亿元。Dashboard 最新持仓包含该股，按 ¥28.25 标记。核心研究问题是：晶圆厂国产材料验证通过率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆制造上游材料国产替代环节，利润池取决于验证壁垒、客户导入数量和产能利用率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -4.12%，平均仓位 +14.39%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 未核验x；PB 4.7x；市值 361.5亿元；next EPS consensus 0.06。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 晶圆厂国产材料验证通过率
- 产能爬坡和良率
- 价格压力与原材料成本
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 验证周期长导致收入确认滞后；下游晶圆厂资本开支下行；单一材料价格竞争加剧。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600330
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688126 沪硅产业（上交所，半导体材料）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥32.50 / 未核验
- Core Thesis: 12 寸硅片，主题为半导体材料。本地 analyst 快照显示买入占比 +96.4%（53/55），当前价 ¥32.50，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 未核验x，PB 6.4x，市值 1074.1亿元。Dashboard 最新持仓包含该股，按 ¥29.59 标记。核心研究问题是：晶圆厂国产材料验证通过率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆制造上游材料国产替代环节，利润池取决于验证壁垒、客户导入数量和产能利用率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -4.12%，平均仓位 +14.39%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 未核验x；PB 6.4x；市值 1074.1亿元；next EPS consensus 0.09。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 晶圆厂国产材料验证通过率
- 产能爬坡和良率
- 价格压力与原材料成本
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 验证周期长导致收入确认滞后；下游晶圆厂资本开支下行；单一材料价格竞争加剧。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688126
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688019 安集科技（上交所，半导体材料）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥237.62 / ¥432.03 / ¥540.04 Bear/Base/Bull
- Current Price / Upside: ¥230.45 / +87.5%
- Core Thesis: CMP抛光液龙头，已供货台积电等全球先进制程晶圆厂，主题为半导体材料。本地 analyst 快照显示买入占比 +81.1%（43/53），当前价 ¥230.45，隐含目标 ¥432.03，上行 +87.5%。本地 fundamentals 快照：PE(TTM) 63.7x，PB 11.6x，市值 524.3亿元。Dashboard 最新信号排名 #36，PEG- 动量5.7% 主题96分。核心研究问题是：晶圆厂国产材料验证通过率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆制造上游材料国产替代环节，利润池取决于验证壁垒、客户导入数量和产能利用率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -4.12%，平均仓位 +14.39%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 63.7x；PB 11.6x；市值 524.3亿元；next EPS consensus 6.78。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 晶圆厂国产材料验证通过率
- 产能爬坡和良率
- 价格压力与原材料成本
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥237.62 | +3.1% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥432.03 | +87.5% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥540.04 | +134.3% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 验证周期长导致收入确认滞后；下游晶圆厂资本开支下行；单一材料价格竞争加剧。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688019
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002409 雅克科技（深交所，半导体材料）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥112.17 / ¥203.94 / ¥254.92 Bear/Base/Bull
- Current Price / Upside: ¥134.81 / +51.3%
- Core Thesis: 半导体前驱体与SOD龙头，向SK海力士、三星等出货用于HBM先进制程，主题为半导体材料。本地 analyst 快照显示买入占比 +96.7%（59/61），当前价 ¥134.81，隐含目标 ¥203.94，上行 +51.3%。本地 fundamentals 快照：PE(TTM) 63.7x，PB 8.1x，市值 641.6亿元。Dashboard 最新信号排名 #12，PEG- 动量22.0% 主题96分。核心研究问题是：晶圆厂国产材料验证通过率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆制造上游材料国产替代环节，利润池取决于验证壁垒、客户导入数量和产能利用率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -4.12%，平均仓位 +14.39%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 63.7x；PB 8.1x；市值 641.6亿元；next EPS consensus 3.20。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 晶圆厂国产材料验证通过率
- 产能爬坡和良率
- 价格压力与原材料成本
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥112.17 | -16.8% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥203.94 | +51.3% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥254.92 | +89.1% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 验证周期长导致收入确认滞后；下游晶圆厂资本开支下行；单一材料价格竞争加剧。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002409
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300346 南大光电（深交所，半导体材料）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥45.13 / ¥82.05 / ¥102.56 Bear/Base/Bull
- Current Price / Upside: ¥66.71 / +23.0%
- Core Thesis: 国内光刻胶领先，高纯电子特气用于先进制程，主题为半导体材料。本地 analyst 快照显示买入占比 +100.0%（6/6），当前价 ¥66.71，隐含目标 ¥82.05，上行 +23.0%。本地 fundamentals 快照：PE(TTM) 132.3x，PB 13.5x，市值 461.1亿元。Dashboard 最新信号排名 #18，PEG- 动量16.1% 主题96分。核心研究问题是：晶圆厂国产材料验证通过率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆制造上游材料国产替代环节，利润池取决于验证壁垒、客户导入数量和产能利用率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -4.12%，平均仓位 +14.39%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 132.3x；PB 13.5x；市值 461.1亿元；next EPS consensus 0.62。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 晶圆厂国产材料验证通过率
- 产能爬坡和良率
- 价格压力与原材料成本
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥45.13 | -32.4% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥82.05 | +23.0% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥102.56 | +53.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 验证周期长导致收入确认滞后；下游晶圆厂资本开支下行；单一材料价格竞争加剧。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300346
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688268 华特气体（上交所，半导体材料）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥228.82 / 未核验
- Core Thesis: 高纯特种气体龙头，供应台积电等全球先进制程，主题为半导体材料。本地 analyst 快照显示买入占比 +90.7%（39/43），当前价 ¥228.82，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 234.2x，PB 11.6x，市值 292.3亿元。Dashboard 最新持仓包含该股，按 ¥188.50 标记。核心研究问题是：晶圆厂国产材料验证通过率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆制造上游材料国产替代环节，利润池取决于验证壁垒、客户导入数量和产能利用率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -4.12%，平均仓位 +14.39%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 234.2x；PB 11.6x；市值 292.3亿元；next EPS consensus 3.04。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 晶圆厂国产材料验证通过率
- 产能爬坡和良率
- 价格压力与原材料成本
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 验证周期长导致收入确认滞后；下游晶圆厂资本开支下行；单一材料价格竞争加剧。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688268
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688234 天岳先进（上交所，半导体材料）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥123.70 / 未核验
- Core Thesis: 碳化硅衬底龙头，AI服务器功率器件关键材料，主题为半导体材料。本地 analyst 快照显示买入占比 +97.4%（38/39），当前价 ¥123.70，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 未核验x，PB 8.6x，市值 610.3亿元。Dashboard 最新持仓包含该股，按 ¥123.70 标记。核心研究问题是：晶圆厂国产材料验证通过率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆制造上游材料国产替代环节，利润池取决于验证壁垒、客户导入数量和产能利用率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -4.12%，平均仓位 +14.39%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 未核验x；PB 8.6x；市值 610.3亿元；next EPS consensus 1.13。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 晶圆厂国产材料验证通过率
- 产能爬坡和良率
- 价格压力与原材料成本
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 验证周期长导致收入确认滞后；下游晶圆厂资本开支下行；单一材料价格竞争加剧。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688234
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300655 晶瑞电材（深交所，半导体材料）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥10.43 / ¥18.47 / ¥23.08 Bear/Base/Bull
- Current Price / Upside: ¥16.04 / +15.1%
- Core Thesis: 高纯化学试剂和光刻胶，用于AI芯片制造，主题为半导体材料。本地 analyst 快照显示买入占比 +98.0%（50/51），当前价 ¥16.04，隐含目标 ¥18.47，上行 +15.1%。本地 fundamentals 快照：PE(TTM) 160.6x，PB 7.1x，市值 180.7亿元。Dashboard 最新信号排名 #32，PEG- 动量7.9% 主题96分。核心研究问题是：晶圆厂国产材料验证通过率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆制造上游材料国产替代环节，利润池取决于验证壁垒、客户导入数量和产能利用率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -4.12%，平均仓位 +14.39%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 160.6x；PB 7.1x；市值 180.7亿元；next EPS consensus 0.12。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 晶圆厂国产材料验证通过率
- 产能爬坡和良率
- 价格压力与原材料成本
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥10.43 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥18.47 | +15.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥23.08 | +43.9% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 验证周期长导致收入确认滞后；下游晶圆厂资本开支下行；单一材料价格竞争加剧。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300655
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## AI-PCB

### 300476 胜宏科技（深交所，AI-PCB）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥303.20 / ¥551.27 / ¥689.09 Bear/Base/Bull
- Current Price / Upside: ¥325.48 / +69.4%
- Core Thesis: NVIDIA GB200 PCB 主力，主题为AI-PCB。本地 analyst 快照显示买入占比 +92.8%（77/83），当前价 ¥325.48，隐含目标 ¥551.27，上行 +69.4%。本地 fundamentals 快照：PE(TTM) 68.4x，PB 9.0x，市值 3198.8亿元。Dashboard 最新信号排名 #47，PEG- 动量10.5% 主题57分。核心研究问题是：AI 服务器和交换机 PCB 单机价值量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器、交换机和高速通信 PCB/封装基板环节，高层数、高速材料和客户认证决定利润率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -7.94%，平均仓位 +16.16%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 68.4x；PB 9.0x；市值 3198.8亿元；next EPS consensus 8.06。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器和交换机 PCB 单机价值量
- 高阶产品良率与产能释放
- 海外大客户份额
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥303.20 | -6.8% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥551.27 | +69.4% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥689.09 | +111.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 扩产后价格竞争；材料成本和良率波动；单一大客户需求下修。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300476
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002463 沪电股份（深交所，AI-PCB）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: ¥82.49 / ¥130.57 / ¥163.21 Bear/Base/Bull
- Current Price / Upside: ¥126.91 / +2.9%
- Core Thesis: AI 服务器主板，主题为AI-PCB。本地 analyst 快照显示买入占比 +99.4%（166/167），当前价 ¥126.91，隐含目标 ¥130.57，上行 +2.9%。本地 fundamentals 快照：PE(TTM) 56.8x，PB 15.4x，市值 2442.2亿元。Dashboard 最新信号排名 #57，PEG- 动量6.1% 主题57分。核心研究问题是：AI 服务器和交换机 PCB 单机价值量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器、交换机和高速通信 PCB/封装基板环节，高层数、高速材料和客户认证决定利润率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -7.94%，平均仓位 +16.16%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 56.8x；PB 15.4x；市值 2442.2亿元；next EPS consensus 2.30。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器和交换机 PCB 单机价值量
- 高阶产品良率与产能释放
- 海外大客户份额
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥82.49 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥130.57 | +2.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥163.21 | +28.6% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 扩产后价格竞争；材料成本和良率波动；单一大客户需求下修。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002463
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002916 深南电路（深交所，AI-PCB）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: ¥244.50 / ¥421.93 / ¥527.41 Bear/Base/Bull
- Current Price / Upside: ¥376.16 / +12.2%
- Core Thesis: PCB 龙头，主题为AI-PCB。本地 analyst 快照显示买入占比 +90.0%（153/170），当前价 ¥376.16，隐含目标 ¥421.93，上行 +12.2%。本地 fundamentals 快照：PE(TTM) 70.5x，PB 15.6x，市值 2562.3亿元。Dashboard 最新信号排名 #42，PEG- 动量13.1% 主题57分。核心研究问题是：AI 服务器和交换机 PCB 单机价值量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器、交换机和高速通信 PCB/封装基板环节，高层数、高速材料和客户认证决定利润率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -7.94%，平均仓位 +16.16%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 70.5x；PB 15.6x；市值 2562.3亿元；next EPS consensus 5.99。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器和交换机 PCB 单机价值量
- 高阶产品良率与产能释放
- 海外大客户份额
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥244.50 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥421.93 | +12.2% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥527.41 | +40.2% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 扩产后价格竞争；材料成本和良率波动；单一大客户需求下修。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002916
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002938 鹏鼎控股（深交所，AI-PCB）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥79.71 / ¥144.94 / ¥181.17 Bear/Base/Bull
- Current Price / Upside: ¥106.50 / +36.1%
- Core Thesis: 苹果链 + AI 服务器，主题为AI-PCB。本地 analyst 快照显示买入占比 +93.2%（109/117），当前价 ¥106.50，隐含目标 ¥144.94，上行 +36.1%。本地 fundamentals 快照：PE(TTM) 66.5x，PB 7.1x，市值 2468.2亿元。Dashboard 最新信号排名 #20，PEG- 动量42.4% 主题57分。核心研究问题是：AI 服务器和交换机 PCB 单机价值量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器、交换机和高速通信 PCB/封装基板环节，高层数、高速材料和客户认证决定利润率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -7.94%，平均仓位 +16.16%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 66.5x；PB 7.1x；市值 2468.2亿元；next EPS consensus 2.18。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器和交换机 PCB 单机价值量
- 高阶产品良率与产能释放
- 海外大客户份额
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥79.71 | -25.2% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥144.94 | +36.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥181.17 | +70.1% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 扩产后价格竞争；材料成本和良率波动；单一大客户需求下修。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002938
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 600183 生益科技（上交所，AI-PCB）

**0. Executive Investment View**
- Rating Bias: Hold / Watchlist
- 12M Target Price Range: ¥97.32 / ¥149.52 / ¥186.90 Bear/Base/Bull
- Current Price / Upside: ¥149.73 / -0.1%
- Core Thesis: 高速覆铜板 (CCL)，主题为AI-PCB。本地 analyst 快照显示买入占比 +97.8%（135/138），当前价 ¥149.73，隐含目标 ¥149.52，上行 -0.1%。本地 fundamentals 快照：PE(TTM) 92.6x，PB 22.8x，市值 3637.1亿元。Dashboard 最新信号排名 #23，PEG- 动量34.6% 主题57分。核心研究问题是：AI 服务器和交换机 PCB 单机价值量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器、交换机和高速通信 PCB/封装基板环节，高层数、高速材料和客户认证决定利润率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -7.94%，平均仓位 +16.16%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 92.6x；PB 22.8x；市值 3637.1亿元；next EPS consensus 1.61。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器和交换机 PCB 单机价值量
- 高阶产品良率与产能释放
- 海外大客户份额
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥97.32 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥149.52 | -0.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥186.90 | +24.8% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 扩产后价格竞争；材料成本和良率波动；单一大客户需求下修。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600183
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002436 兴森科技（深交所，AI-PCB）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥36.75 / 未核验
- Core Thesis: 兴森科技，主题为AI-PCB。本地 analyst 快照显示买入占比 +100.0%（93/93），当前价 ¥36.75，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 432.8x，PB 11.8x，市值 624.6亿元。Dashboard 最新信号排名 #28，PEG- 动量23.9% 主题57分。核心研究问题是：AI 服务器和交换机 PCB 单机价值量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器、交换机和高速通信 PCB/封装基板环节，高层数、高速材料和客户认证决定利润率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -7.94%，平均仓位 +16.16%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 432.8x；PB 11.8x；市值 624.6亿元；next EPS consensus 0.27。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器和交换机 PCB 单机价值量
- 高阶产品良率与产能释放
- 海外大客户份额
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 扩产后价格竞争；材料成本和良率波动；单一大客户需求下修。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002436
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 603228 景旺电子（上交所，AI-PCB）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥74.81 / ¥136.02 / ¥170.02 Bear/Base/Bull
- Current Price / Upside: ¥75.80 / +79.4%
- Core Thesis: 高端PCB制造商，产品可应用于AI服务器，补全PCB板块，主题为AI-PCB。本地 analyst 快照显示买入占比 +88.3%（53/60），当前价 ¥75.80，隐含目标 ¥136.02，上行 +79.4%。本地 fundamentals 快照：PE(TTM) 65.6x，PB 5.8x，市值 746.5亿元。Dashboard 最新信号排名 #41，PEG- 动量14.1% 主题57分。核心研究问题是：AI 服务器和交换机 PCB 单机价值量 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器、交换机和高速通信 PCB/封装基板环节，高层数、高速材料和客户认证决定利润率。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -7.94%，平均仓位 +16.16%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 65.6x；PB 5.8x；市值 746.5亿元；next EPS consensus 2.08。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器和交换机 PCB 单机价值量
- 高阶产品良率与产能释放
- 海外大客户份额
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥74.81 | -1.3% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥136.02 | +79.4% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥170.02 | +124.3% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 扩产后价格竞争；材料成本和良率波动；单一大客户需求下修。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=603228
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 半导体设备

### 002371 北方华创（深交所，半导体设备）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥786.68 / ¥1430.32 / ¥1787.90 Bear/Base/Bull
- Current Price / Upside: ¥637.50 / +124.4%
- Core Thesis: 刻蚀/沉积/清洗龙头，主题为半导体设备。本地 analyst 快照显示买入占比 +98.2%（270/275），当前价 ¥637.50，隐含目标 ¥1430.32，上行 +124.4%。本地 fundamentals 快照：PE(TTM) 82.9x，PB 11.8x，市值 4620.8亿元。Dashboard 最新信号排名 #16，PEG- 动量22.9% 主题88分。核心研究问题是：国产晶圆厂扩产和设备招标 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆厂资本开支与国产替代核心设备环节，议价权来自工艺节点覆盖、客户验证和服务能力。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +2.94%，平均仓位 +14.99%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 82.9x；PB 11.8x；市值 4620.8亿元；next EPS consensus 17.26。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产晶圆厂扩产和设备招标
- 先进封装/刻蚀/薄膜/量测等细分设备份额
- 订单、合同负债和毛利率
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥786.68 | +23.4% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥1430.32 | +124.4% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥1787.90 | +180.5% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 半导体资本开支周期下行；进口替代进度慢于预期；研发投入侵蚀短期利润。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002371
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688012 中微公司（上交所，半导体设备）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: ¥296.52 / ¥539.12 / ¥673.90 Bear/Base/Bull
- Current Price / Upside: ¥303.12 / +77.9%
- Core Thesis: 刻蚀机，主题为半导体设备。本地 analyst 快照显示买入占比 +93.5%（202/216），当前价 ¥303.12，隐含目标 ¥539.12，上行 +77.9%。本地 fundamentals 快照：PE(TTM) 104.1x，PB 11.7x，市值 2840.2亿元。Dashboard 最新信号排名 #9，PEG- 动量33.4% 主题88分。核心研究问题是：国产晶圆厂扩产和设备招标 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆厂资本开支与国产替代核心设备环节，议价权来自工艺节点覆盖、客户验证和服务能力。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +2.94%，平均仓位 +14.99%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 104.1x；PB 11.7x；市值 2840.2亿元；next EPS consensus 5.18。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产晶圆厂扩产和设备招标
- 先进封装/刻蚀/薄膜/量测等细分设备份额
- 订单、合同负债和毛利率
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥296.52 | -2.2% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥539.12 | +77.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥673.90 | +122.3% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 半导体资本开支周期下行；进口替代进度慢于预期；研发投入侵蚀短期利润。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688012
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688072 拓荆科技（上交所，半导体设备）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: ¥425.93 / ¥626.38 / ¥782.98 Bear/Base/Bull
- Current Price / Upside: ¥655.27 / -4.4%
- Core Thesis: 薄膜沉积，主题为半导体设备。本地 analyst 快照显示买入占比 +100.0%（66/66），当前价 ¥655.27，隐含目标 ¥626.38，上行 -4.4%。本地 fundamentals 快照：PE(TTM) 112.7x，PB 25.9x，市值 1852.4亿元。Dashboard 最新信号排名 #10，PEG- 动量29.7% 主题88分。核心研究问题是：国产晶圆厂扩产和设备招标 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆厂资本开支与国产替代核心设备环节，议价权来自工艺节点覆盖、客户验证和服务能力。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +2.94%，平均仓位 +14.99%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 112.7x；PB 25.9x；市值 1852.4亿元；next EPS consensus 5.56。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产晶圆厂扩产和设备招标
- 先进封装/刻蚀/薄膜/量测等细分设备份额
- 订单、合同负债和毛利率
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥425.93 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥626.38 | -4.4% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥782.98 | +19.5% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 半导体资本开支周期下行；进口替代进度慢于预期；研发投入侵蚀短期利润。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688072
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688082 盛美上海（上交所，半导体设备）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥257.31 / ¥467.83 / ¥584.79 Bear/Base/Bull
- Current Price / Upside: ¥284.00 / +64.7%
- Core Thesis: 清洗设备龙头，TSV电镀设备用于先进封装，主题为半导体设备。本地 analyst 快照显示买入占比 +98.5%（66/67），当前价 ¥284.00，隐含目标 ¥467.83，上行 +64.7%。本地 fundamentals 快照：PE(TTM) 109.3x，PB 10.0x，市值 1370.6亿元。Dashboard 最新信号排名 #31，PEG- 动量10.0% 主题88分。核心研究问题是：国产晶圆厂扩产和设备招标 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆厂资本开支与国产替代核心设备环节，议价权来自工艺节点覆盖、客户验证和服务能力。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +2.94%，平均仓位 +14.99%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 109.3x；PB 10.0x；市值 1370.6亿元；next EPS consensus 4.28。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产晶圆厂扩产和设备招标
- 先进封装/刻蚀/薄膜/量测等细分设备份额
- 订单、合同负债和毛利率
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥257.31 | -9.4% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥467.83 | +64.7% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥584.79 | +105.9% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 半导体资本开支周期下行；进口替代进度慢于预期；研发投入侵蚀短期利润。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688082
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688120 华海清科（上交所，半导体设备）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥186.74 / 未核验
- Core Thesis: CMP设备龙头，用于AI芯片先进制程和封装，主题为半导体设备。本地 analyst 快照显示买入占比 +98.5%（66/67），当前价 ¥186.74，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 84.2x，PB 12.2x，市值 923.9亿元。Dashboard 最新信号排名 #5，PEG- 动量45.5% 主题88分。核心研究问题是：国产晶圆厂扩产和设备招标 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆厂资本开支与国产替代核心设备环节，议价权来自工艺节点覆盖、客户验证和服务能力。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +2.94%，平均仓位 +14.99%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 84.2x；PB 12.2x；市值 923.9亿元；next EPS consensus 6.75。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产晶圆厂扩产和设备招标
- 先进封装/刻蚀/薄膜/量测等细分设备份额
- 订单、合同负债和毛利率
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 半导体资本开支周期下行；进口替代进度慢于预期；研发投入侵蚀短期利润。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688120
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688037 芯源微（上交所，半导体设备）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥260.30 / 未核验
- Core Thesis: 涂胶显影设备龙头，用于前道晶圆制造，主题为半导体设备。本地 analyst 快照显示买入占比 +93.4%（71/76），当前价 ¥260.30，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 743.9x，PB 18.7x，市值 524.8亿元。Dashboard 最新信号排名 #6，PEG- 动量41.8% 主题88分。核心研究问题是：国产晶圆厂扩产和设备招标 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在晶圆厂资本开支与国产替代核心设备环节，议价权来自工艺节点覆盖、客户验证和服务能力。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +2.94%，平均仓位 +14.99%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 743.9x；PB 18.7x；市值 524.8亿元；next EPS consensus 2.49。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产晶圆厂扩产和设备招标
- 先进封装/刻蚀/薄膜/量测等细分设备份额
- 订单、合同负债和毛利率
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 半导体资本开支周期下行；进口替代进度慢于预期；研发投入侵蚀短期利润。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688037
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 电力设备

### 002335 科华数据（深交所，电力设备）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥35.37 / 未核验
- Core Thesis: IDC + 数据中心电源，主题为电力设备。本地 analyst 快照显示买入占比 +100.0%（34/34），当前价 ¥35.37，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 61.9x，PB 4.2x，市值 264.3亿元。Dashboard 最新信号排名 #54，PEG- 动量11.4% 主题40分。核心研究问题是：电网投资和海外电力设备需求 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在电网投资、变压器、储能和电力电子设备链条，订单和交付节奏是利润释放关键。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -2.10%，平均仓位 +16.56%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 61.9x；PB 4.2x；市值 264.3亿元；next EPS consensus 2.03。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电网投资和海外电力设备需求
- 特高压/变压器/储能订单
- 原材料成本和交付能力
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 招标节奏低于预期；海外认证/贸易风险；原材料价格压缩毛利。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002335
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688676 金盘科技（上交所，电力设备）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥70.91 / ¥128.93 / ¥161.16 Bear/Base/Bull
- Current Price / Upside: ¥80.69 / +59.8%
- Core Thesis: 干式变压器龙头，产品用于数据中心配电，出口全球，主题为电力设备。本地 analyst 快照显示买入占比 +100.0%（101/101），当前价 ¥80.69，隐含目标 ¥128.93，上行 +59.8%。本地 fundamentals 快照：PE(TTM) 55.8x，PB 7.6x，市值 371.0亿元。Dashboard 最新信号排名 #59，PEG- 动量9.3% 主题40分。核心研究问题是：电网投资和海外电力设备需求 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在电网投资、变压器、储能和电力电子设备链条，订单和交付节奏是利润释放关键。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -2.10%，平均仓位 +16.56%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 55.8x；PB 7.6x；市值 371.0亿元；next EPS consensus 2.31。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电网投资和海外电力设备需求
- 特高压/变压器/储能订单
- 原材料成本和交付能力
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥70.91 | -12.1% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥128.93 | +59.8% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥161.16 | +99.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 招标节奏低于预期；海外认证/贸易风险；原材料价格压缩毛利。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688676
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300693 盛弘股份（深交所，电力设备）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥35.13 / ¥63.87 / ¥79.84 Bear/Base/Bull
- Current Price / Upside: ¥42.62 / +49.9%
- Core Thesis: 电能质量与UPS设备，AIDC基础设施核心供应商，主题为电力设备。本地 analyst 快照显示买入占比 +94.2%（49/52），当前价 ¥42.62，隐含目标 ¥63.87，上行 +49.9%。本地 fundamentals 快照：PE(TTM) 27.3x，PB 6.4x，市值 133.3亿元。Dashboard 最新信号排名 #45，PEG- 动量17.5% 主题40分。核心研究问题是：电网投资和海外电力设备需求 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在电网投资、变压器、储能和电力电子设备链条，订单和交付节奏是利润释放关键。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -2.10%，平均仓位 +16.56%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 27.3x；PB 6.4x；市值 133.3亿元；next EPS consensus 2.34。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电网投资和海外电力设备需求
- 特高压/变压器/储能订单
- 原材料成本和交付能力
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥35.13 | -17.6% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥63.87 | +49.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥79.84 | +87.3% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 招标节奏低于预期；海外认证/贸易风险；原材料价格压缩毛利。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300693
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002364 中恒电气（深交所，电力设备）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥61.98 / ¥112.69 / ¥140.86 Bear/Base/Bull
- Current Price / Upside: ¥48.97 / +130.1%
- Core Thesis: HVDC电源系统龙头，为数据中心提供高效直流供电，主题为电力设备。本地 analyst 快照显示买入占比 +68.8%（11/16），当前价 ¥48.97，隐含目标 ¥112.69，上行 +130.1%。本地 fundamentals 快照：PE(TTM) 210.6x，PB 11.0x，市值 276.0亿元。Dashboard 最新信号排名 #53，PEG- 动量12.6% 主题40分。核心研究问题是：电网投资和海外电力设备需求 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在电网投资、变压器、储能和电力电子设备链条，订单和交付节奏是利润释放关键。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -2.10%，平均仓位 +16.56%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 210.6x；PB 11.0x；市值 276.0亿元；next EPS consensus 0.54。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电网投资和海外电力设备需求
- 特高压/变压器/储能订单
- 原材料成本和交付能力
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥61.98 | +26.6% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥112.69 | +130.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥140.86 | +187.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 招标节奏低于预期；海外认证/贸易风险；原材料价格压缩毛利。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002364
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002851 麦格米特（深交所，电力设备）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥139.41 / 未核验
- Core Thesis: 服务器电源已进入英伟达供应链，AI算力核心供电器件，主题为电力设备。本地 analyst 快照显示买入占比 +94.2%（81/86），当前价 ¥139.41，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 529.5x，PB 9.0x，市值 811.1亿元。Dashboard 最新信号排名 #43，PEG- 动量17.9% 主题40分。核心研究问题是：电网投资和海外电力设备需求 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在电网投资、变压器、储能和电力电子设备链条，订单和交付节奏是利润释放关键。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -2.10%，平均仓位 +16.56%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 529.5x；PB 9.0x；市值 811.1亿元；next EPS consensus 1.87。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电网投资和海外电力设备需求
- 特高压/变压器/储能订单
- 原材料成本和交付能力
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 招标节奏低于预期；海外认证/贸易风险；原材料价格压缩毛利。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002851
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300491 通合科技（深交所，电力设备）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥29.06 / 未核验
- Core Thesis: 电源模块供应商，产品用于数据中心高压直流电源，主题为电力设备。本地 analyst 快照显示买入占比 +95.5%（21/22），当前价 ¥29.06，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 111.4x，PB 4.3x，市值 51.6亿元。Dashboard 最新信号排名 #61，PEG- 动量8.9% 主题40分。核心研究问题是：电网投资和海外电力设备需求 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在电网投资、变压器、储能和电力电子设备链条，订单和交付节奏是利润释放关键。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -2.10%，平均仓位 +16.56%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 111.4x；PB 4.3x；市值 51.6亿元；next EPS consensus 1.33。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电网投资和海外电力设备需求
- 特高压/变压器/储能订单
- 原材料成本和交付能力
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 招标节奏低于预期；海外认证/贸易风险；原材料价格压缩毛利。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300491
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 算力/AI芯片

### 688256 寒武纪（上交所，算力/AI芯片）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥1319.93 / ¥2399.87 / ¥2999.84 Bear/Base/Bull
- Current Price / Upside: ¥1219.50 / +96.8%
- Core Thesis: 国产 AI 训练/推理芯片龙头，主题为算力/AI芯片。本地 analyst 快照显示买入占比 +92.5%（37/40），当前价 ¥1219.50，隐含目标 ¥2399.87，上行 +96.8%。本地 fundamentals 快照：PE(TTM) 282.0x，PB 62.6x，市值 7662.0亿元。Dashboard 最新信号排名 #25，PEG- 动量45.2% 主题47分。核心研究问题是：国产算力招标与信创适配节奏 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 算力国产化的核心芯片/IP/整机适配环节，议价权来自架构生态、软件栈、客户验证周期与国产替代预算。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +4.32%，平均仓位 +6.94%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 282.0x；PB 62.6x；市值 7662.0亿元；next EPS consensus 8.51。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产算力招标与信创适配节奏
- 训练/推理芯片出货量与软件生态成熟度
- 毛利率随规模量产和产品代际切换的变化
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥1319.93 | +8.2% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥2399.87 | +96.8% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥2999.84 | +146.0% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 海外 GPU 供给缓和导致国产替代溢价下降；客户验证和生态迁移慢于预期；高估值对业绩兑现容错率低。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688256
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688041 海光信息（上交所，算力/AI芯片）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥246.01 / ¥447.30 / ¥559.12 Bear/Base/Bull
- Current Price / Upside: ¥289.84 / +54.3%
- Core Thesis: DCU + x86 CPU，主题为算力/AI芯片。本地 analyst 快照显示买入占比 +96.4%（106/110），当前价 ¥289.84，隐含目标 ¥447.30，上行 +54.3%。本地 fundamentals 快照：PE(TTM) 247.1x，PB 28.7x，市值 6736.9亿元。Dashboard 最新信号排名 #37，PEG- 动量21.8% 主题47分。核心研究问题是：国产算力招标与信创适配节奏 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 算力国产化的核心芯片/IP/整机适配环节，议价权来自架构生态、软件栈、客户验证周期与国产替代预算。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +4.32%，平均仓位 +6.94%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 247.1x；PB 28.7x；市值 6736.9亿元；next EPS consensus 1.81。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产算力招标与信创适配节奏
- 训练/推理芯片出货量与软件生态成熟度
- 毛利率随规模量产和产品代际切换的变化
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥246.01 | -15.1% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥447.30 | +54.3% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥559.12 | +92.9% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 海外 GPU 供给缓和导致国产替代溢价下降；客户验证和生态迁移慢于预期；高估值对业绩兑现容错率低。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688041
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688047 龙芯中科（上交所，算力/AI芯片）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥135.69 / 未核验
- Core Thesis: 自主指令集 CPU，主题为算力/AI芯片。本地 analyst 快照显示买入占比 +75.0%（9/12），当前价 ¥135.69，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 未核验x，PB 22.7x，市值 544.1亿元。Dashboard 最新持仓包含该股，按 ¥140.56 标记。核心研究问题是：国产算力招标与信创适配节奏 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 算力国产化的核心芯片/IP/整机适配环节，议价权来自架构生态、软件栈、客户验证周期与国产替代预算。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +4.32%，平均仓位 +6.94%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 未核验x；PB 22.7x；市值 544.1亿元；next EPS consensus 0.09。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产算力招标与信创适配节奏
- 训练/推理芯片出货量与软件生态成熟度
- 毛利率随规模量产和产品代际切换的变化
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 海外 GPU 供给缓和导致国产替代溢价下降；客户验证和生态迁移慢于预期；高估值对业绩兑现容错率低。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688047
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300474 景嘉微（深交所，算力/AI芯片）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥50.93 / 未核验
- Core Thesis: 国产 GPU，主题为算力/AI芯片。本地 analyst 快照显示买入占比 +89.5%（51/57），当前价 ¥50.93，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 未核验x，PB 4.0x，市值 269.7亿元。Dashboard 最新信号排名 #62，PEG- 动量6.3% 主题47分。核心研究问题是：国产算力招标与信创适配节奏 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 算力国产化的核心芯片/IP/整机适配环节，议价权来自架构生态、软件栈、客户验证周期与国产替代预算。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +4.32%，平均仓位 +6.94%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 未核验x；PB 4.0x；市值 269.7亿元；next EPS consensus 1.01。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产算力招标与信创适配节奏
- 训练/推理芯片出货量与软件生态成熟度
- 毛利率随规模量产和产品代际切换的变化
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 海外 GPU 供给缓和导致国产替代溢价下降；客户验证和生态迁移慢于预期；高估值对业绩兑现容错率低。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300474
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002049 紫光国微（深交所，算力/AI芯片）

**0. Executive Investment View**
- Rating Bias: Buy / Active position
- 12M Target Price Range: ¥81.00 / ¥147.28 / ¥184.10 Bear/Base/Bull
- Current Price / Upside: ¥71.42 / +106.2%
- Core Thesis: 特种 FPGA/SoC，主题为算力/AI芯片。本地 analyst 快照显示买入占比 +95.5%（107/112），当前价 ¥71.42，隐含目标 ¥147.28，上行 +106.2%。本地 fundamentals 快照：PE(TTM) 36.7x，PB 4.4x，市值 606.8亿元。Dashboard 最新持仓包含该股，按 ¥71.51 标记。核心研究问题是：国产算力招标与信创适配节奏 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 算力国产化的核心芯片/IP/整机适配环节，议价权来自架构生态、软件栈、客户验证周期与国产替代预算。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +4.32%，平均仓位 +6.94%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 36.7x；PB 4.4x；市值 606.8亿元；next EPS consensus 4.01。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产算力招标与信创适配节奏
- 训练/推理芯片出货量与软件生态成熟度
- 毛利率随规模量产和产品代际切换的变化
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥81.00 | +13.4% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥147.28 | +106.2% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥184.10 | +157.8% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 海外 GPU 供给缓和导致国产替代溢价下降；客户验证和生态迁移慢于预期；高估值对业绩兑现容错率低。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002049
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688385 复旦微电（上交所，算力/AI芯片）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥53.31 / 未核验
- Core Thesis: FPGA/MCU，主题为算力/AI芯片。本地 analyst 快照显示买入占比 +97.4%（38/39），当前价 ¥53.31，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 179.6x，PB 7.0x，市值 439.1亿元。Dashboard 最新信号排名 #67，PEG- 动量-1.6% 主题47分。核心研究问题是：国产算力招标与信创适配节奏 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 算力国产化的核心芯片/IP/整机适配环节，议价权来自架构生态、软件栈、客户验证周期与国产替代预算。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +4.32%，平均仓位 +6.94%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 179.6x；PB 7.0x；市值 439.1亿元；next EPS consensus 1.26。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 国产算力招标与信创适配节奏
- 训练/推理芯片出货量与软件生态成熟度
- 毛利率随规模量产和产品代际切换的变化
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 海外 GPU 供给缓和导致国产替代溢价下降；客户验证和生态迁移慢于预期；高估值对业绩兑现容错率低。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688385
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## AI服务器

### 601138 工业富联（上交所，AI服务器）

**0. Executive Investment View**
- Rating Bias: Hold / Watchlist
- 12M Target Price Range: ¥45.19 / ¥63.80 / ¥79.75 Bear/Base/Bull
- Current Price / Upside: ¥69.52 / -8.2%
- Core Thesis: 全球 AI 服务器/HPC 代工核心，主题为AI服务器。本地 analyst 快照显示买入占比 +96.3%（104/108），当前价 ¥69.52，隐含目标 ¥63.80，上行 -8.2%。本地 fundamentals 快照：PE(TTM) 33.9x，PB 7.8x，市值 13795.6亿元。Dashboard 最新信号排名 #52，PEG- 动量14.8% 主题33分。核心研究问题是：AI 服务器订单能见度 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 GPU/加速卡服务器、整机制造、云厂商与运营商 AI 基建交付环节，利润率通常受上游芯片与大客户议价挤压。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 33.9x；PB 7.8x；市值 13795.6亿元；next EPS consensus 1.88。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器订单能见度
- 高端整机出货与液冷/高速互联附加值
- 存货周转和应收回款质量
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥45.19 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥63.80 | -8.2% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥79.75 | +14.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 订单高增但利润率无法同步提升；上游关键器件供给扰动；客户集中导致验收和回款波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=601138
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 000977 浪潮信息（深交所，AI服务器）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥43.24 / ¥78.62 / ¥98.27 Bear/Base/Bull
- Current Price / Upside: ¥57.84 / +35.9%
- Core Thesis: 国内最大 AI 服务器厂商，主题为AI服务器。本地 analyst 快照显示买入占比 +93.6%（161/172），当前价 ¥57.84，隐含目标 ¥78.62，上行 +35.9%。本地 fundamentals 快照：PE(TTM) 33.2x，PB 3.8x，市值 849.4亿元。Dashboard 最新信号排名 #69，PEG- 动量3.3% 主题33分。核心研究问题是：AI 服务器订单能见度 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 GPU/加速卡服务器、整机制造、云厂商与运营商 AI 基建交付环节，利润率通常受上游芯片与大客户议价挤压。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 33.2x；PB 3.8x；市值 849.4亿元；next EPS consensus 2.37。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器订单能见度
- 高端整机出货与液冷/高速互联附加值
- 存货周转和应收回款质量
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥43.24 | -25.2% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥78.62 | +35.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥98.27 | +69.9% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 订单高增但利润率无法同步提升；上游关键器件供给扰动；客户集中导致验收和回款波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=000977
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 603019 中科曙光（上交所，AI服务器）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥61.12 / ¥111.13 / ¥138.91 Bear/Base/Bull
- Current Price / Upside: ¥81.37 / +36.6%
- Core Thesis: 中科曙光，主题为AI服务器。本地 analyst 快照显示买入占比 +91.3%（105/115），当前价 ¥81.37，隐含目标 ¥111.13，上行 +36.6%。本地 fundamentals 快照：PE(TTM) 53.7x，PB 5.4x，市值 1190.5亿元。Dashboard 最新信号排名 #64，PEG- 动量6.3% 主题33分。核心研究问题是：AI 服务器订单能见度 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 GPU/加速卡服务器、整机制造、云厂商与运营商 AI 基建交付环节，利润率通常受上游芯片与大客户议价挤压。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 53.7x；PB 5.4x；市值 1190.5亿元；next EPS consensus 2.07。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器订单能见度
- 高端整机出货与液冷/高速互联附加值
- 存货周转和应收回款质量
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥61.12 | -24.9% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥111.13 | +36.6% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥138.91 | +70.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 订单高增但利润率无法同步提升；上游关键器件供给扰动；客户集中导致验收和回款波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=603019
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 000938 紫光股份（深交所，AI服务器）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥18.86 / ¥34.29 / ¥42.87 Bear/Base/Bull
- Current Price / Upside: ¥25.35 / +35.3%
- Core Thesis: 新华三，主题为AI服务器。本地 analyst 快照显示买入占比 +96.7%（117/121），当前价 ¥25.35，隐含目标 ¥34.29，上行 +35.3%。本地 fundamentals 快照：PE(TTM) 34.1x，PB 4.7x，市值 725.0亿元。Dashboard 最新信号排名 #55，PEG- 动量14.5% 主题33分。核心研究问题是：AI 服务器订单能见度 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 GPU/加速卡服务器、整机制造、云厂商与运营商 AI 基建交付环节，利润率通常受上游芯片与大客户议价挤压。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 34.1x；PB 4.7x；市值 725.0亿元；next EPS consensus 1.00。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器订单能见度
- 高端整机出货与液冷/高速互联附加值
- 存货周转和应收回款质量
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥18.86 | -25.6% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥34.29 | +35.3% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥42.87 | +69.1% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 订单高增但利润率无法同步提升；上游关键器件供给扰动；客户集中导致验收和回款波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=000938
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002475 立讯精密（深交所，AI服务器）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥43.44 / ¥78.99 / ¥98.73 Bear/Base/Bull
- Current Price / Upside: ¥64.58 / +22.3%
- Core Thesis: 进入英伟达GB200供应链，提供服务器组装及高速铜缆互连组件，深度参与全球AI服务器制造，主题为AI服务器。本地 analyst 快照显示买入占比 +92.3%（191/207），当前价 ¥64.58，隐含目标 ¥78.99，上行 +22.3%。本地 fundamentals 快照：PE(TTM) 27.3x，PB 5.3x，市值 4705.3亿元。Dashboard 最新信号排名 #38，PEG- 动量25.1% 主题33分。核心研究问题是：AI 服务器订单能见度 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 GPU/加速卡服务器、整机制造、云厂商与运营商 AI 基建交付环节，利润率通常受上游芯片与大客户议价挤压。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 27.3x；PB 5.3x；市值 4705.3亿元；next EPS consensus 2.89。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器订单能见度
- 高端整机出货与液冷/高速互联附加值
- 存货周转和应收回款质量
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥43.44 | -32.7% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥78.99 | +22.3% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥98.73 | +52.9% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 订单高增但利润率无法同步提升；上游关键器件供给扰动；客户集中导致验收和回款波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002475
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 000063 中兴通讯（深交所，AI服务器）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥53.24 / ¥96.80 / ¥121.00 Bear/Base/Bull
- Current Price / Upside: ¥37.81 / +156.0%
- Core Thesis: ICT龙头，AI服务器出货量国内前列，算力基础设施核心供应商，主题为AI服务器。本地 analyst 快照显示买入占比 +88.8%（247/278），当前价 ¥37.81，隐含目标 ¥96.80，上行 +156.0%。本地 fundamentals 快照：PE(TTM) 40.4x，PB 2.4x，市值 1808.7亿元。Dashboard 最新信号排名 #71，PEG- 动量2.5% 主题33分。核心研究问题是：AI 服务器订单能见度 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 GPU/加速卡服务器、整机制造、云厂商与运营商 AI 基建交付环节，利润率通常受上游芯片与大客户议价挤压。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 40.4x；PB 2.4x；市值 1808.7亿元；next EPS consensus 2.40。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 服务器订单能见度
- 高端整机出货与液冷/高速互联附加值
- 存货周转和应收回款质量
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥53.24 | +40.8% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥96.80 | +156.0% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥121.00 | +220.0% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 订单高增但利润率无法同步提升；上游关键器件供给扰动；客户集中导致验收和回款波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=000063
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 电力

### 600900 长江电力（上交所，电力）

**0. Executive Investment View**
- Rating Bias: Hold / Watchlist
- 12M Target Price Range: ¥18.13 / ¥28.25 / ¥35.31 Bear/Base/Bull
- Current Price / Upside: ¥27.89 / +1.3%
- Core Thesis: 稳定基荷水电，主题为电力。本地 analyst 快照显示买入占比 +96.8%（121/125），当前价 ¥27.89，隐含目标 ¥28.25，上行 +1.3%。本地 fundamentals 快照：PE(TTM) 18.9x，PB 3.0x，市值 6824.2亿元。Dashboard 最新信号排名 #82，PEG- 动量2.3% 主题10分。核心研究问题是：电力需求增速和上网电价 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 数据中心电力需求扩张的基础设施环节，现金流稳定性和电价/消纳政策决定估值中枢。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 18.9x；PB 3.0x；市值 6824.2亿元；next EPS consensus 1.49。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电力需求增速和上网电价
- 新能源装机与消纳
- 煤价/利用小时/补贴回款
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥18.13 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥28.25 | +1.3% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥35.31 | +26.6% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 电价政策调整；煤价或利用小时不利变化；新能源补贴和消纳压力。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600900
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 003816 中国广核（深交所，电力）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥3.11 / ¥5.65 / ¥7.06 Bear/Base/Bull
- Current Price / Upside: ¥4.24 / +33.2%
- Core Thesis: 核电，主题为电力。本地 analyst 快照显示买入占比 +96.8%（60/62），当前价 ¥4.24，隐含目标 ¥5.65，上行 +33.2%。本地 fundamentals 快照：PE(TTM) 22.6x，PB 1.7x，市值 2141.1亿元。Dashboard 最新信号排名 #74，PEG- 动量7.7% 主题10分。核心研究问题是：电力需求增速和上网电价 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 数据中心电力需求扩张的基础设施环节，现金流稳定性和电价/消纳政策决定估值中枢。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 22.6x；PB 1.7x；市值 2141.1亿元；next EPS consensus 0.25。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电力需求增速和上网电价
- 新能源装机与消纳
- 煤价/利用小时/补贴回款
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥3.11 | -26.8% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥5.65 | +33.2% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥7.06 | +66.5% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 电价政策调整；煤价或利用小时不利变化；新能源补贴和消纳压力。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=003816
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 600886 国投电力（上交所，电力）

**0. Executive Investment View**
- Rating Bias: Hold / Watchlist
- 12M Target Price Range: ¥8.95 / ¥15.72 / ¥19.65 Bear/Base/Bull
- Current Price / Upside: ¥13.77 / +14.2%
- Core Thesis: 国投电力，主题为电力。本地 analyst 快照显示买入占比 +95.1%（58/61），当前价 ¥13.77，隐含目标 ¥15.72，上行 +14.2%。本地 fundamentals 快照：PE(TTM) 14.8x，PB 1.6x，市值 1102.2亿元。Dashboard 最新信号排名 #83，PEG- 动量1.1% 主题10分。核心研究问题是：电力需求增速和上网电价 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 数据中心电力需求扩张的基础设施环节，现金流稳定性和电价/消纳政策决定估值中枢。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 14.8x；PB 1.6x；市值 1102.2亿元；next EPS consensus 1.06。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电力需求增速和上网电价
- 新能源装机与消纳
- 煤价/利用小时/补贴回款
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥8.95 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥15.72 | +14.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥19.65 | +42.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 电价政策调整；煤价或利用小时不利变化；新能源补贴和消纳压力。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600886
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 600011 华能国际（上交所，电力）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: ¥5.31 / ¥8.38 / ¥10.48 Bear/Base/Bull
- Current Price / Upside: ¥8.17 / +2.6%
- Core Thesis: 火电+新能源，主题为电力。本地 analyst 快照显示买入占比 +97.0%（97/100），当前价 ¥8.17，隐含目标 ¥8.38，上行 +2.6%。本地 fundamentals 快照：PE(TTM) 9.2x，PB 1.8x，市值 1282.5亿元。Dashboard 最新信号排名 #72，PEG- 动量8.3% 主题10分。核心研究问题是：电力需求增速和上网电价 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 数据中心电力需求扩张的基础设施环节，现金流稳定性和电价/消纳政策决定估值中枢。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 9.2x；PB 1.8x；市值 1282.5亿元；next EPS consensus 0.91。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电力需求增速和上网电价
- 新能源装机与消纳
- 煤价/利用小时/补贴回款
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥5.31 | -35.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥8.38 | +2.6% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥10.48 | +28.3% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 电价政策调整；煤价或利用小时不利变化；新能源补贴和消纳压力。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600011
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 601985 中国核电（上交所，电力）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥8.02 / ¥14.58 / ¥18.23 Bear/Base/Bull
- Current Price / Upside: ¥9.12 / +59.9%
- Core Thesis: 核电运营商，受益于AI带来的稳定清洁电力需求，主题为电力。本地 analyst 快照显示买入占比 +97.8%（88/90），当前价 ¥9.12，隐含目标 ¥14.58，上行 +59.9%。本地 fundamentals 快照：PE(TTM) 22.8x，PB 1.6x，市值 1875.8亿元。Dashboard 最新信号排名 #77，PEG- 动量5.1% 主题10分。核心研究问题是：电力需求增速和上网电价 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 数据中心电力需求扩张的基础设施环节，现金流稳定性和电价/消纳政策决定估值中枢。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 未在 dashboard 主题贡献中单独列示。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 22.8x；PB 1.6x；市值 1875.8亿元；next EPS consensus 0.64。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 电力需求增速和上网电价
- 新能源装机与消纳
- 煤价/利用小时/补贴回款
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥8.02 | -12.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥14.58 | +59.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥18.23 | +99.9% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 电价政策调整；煤价或利用小时不利变化；新能源补贴和消纳压力。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=601985
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 液冷

### 301018 申菱环境（深交所，液冷）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥139.93 / ¥254.41 / ¥318.02 Bear/Base/Bull
- Current Price / Upside: ¥97.59 / +160.7%
- Core Thesis: 数据中心精密温控，主题为液冷。本地 analyst 快照显示买入占比 +100.0%（24/24），当前价 ¥97.59，隐含目标 ¥254.41，上行 +160.7%。本地 fundamentals 快照：PE(TTM) 191.3x，PB 13.5x，市值 365.3亿元。Dashboard 最新信号排名 #81，PEG- 动量5.2% 主题5分。核心研究问题是：高功率 AI 机柜渗透率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器热管理链条，价值量来自冷板、CDU、机柜级方案和数据中心工程交付。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -23.90%，平均仓位 +14.52%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 191.3x；PB 13.5x；市值 365.3亿元；next EPS consensus 1.33。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 高功率 AI 机柜渗透率
- 液冷方案 ASP 和良率
- 大客户导入与批量交付
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥139.93 | +43.4% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥254.41 | +160.7% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥318.02 | +225.9% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 液冷渗透慢于预期；方案标准化后价格竞争；交付责任和售后成本上升。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=301018
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300499 高澜股份（深交所，液冷）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥39.72 / ¥72.22 / ¥90.28 Bear/Base/Bull
- Current Price / Upside: ¥34.40 / +109.9%
- Core Thesis: 高澜股份，主题为液冷。本地 analyst 快照显示买入占比 +100.0%（8/8），当前价 ¥34.40，隐含目标 ¥72.22，上行 +109.9%。本地 fundamentals 快照：PE(TTM) 343.9x，PB 7.7x，市值 105.0亿元。Dashboard 最新信号排名 #84，PEG- 动量2.9% 主题5分。核心研究问题是：高功率 AI 机柜渗透率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器热管理链条，价值量来自冷板、CDU、机柜级方案和数据中心工程交付。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -23.90%，平均仓位 +14.52%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 343.9x；PB 7.7x；市值 105.0亿元；next EPS consensus 0.21。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 高功率 AI 机柜渗透率
- 液冷方案 ASP 和良率
- 大客户导入与批量交付
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥39.72 | +15.5% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥72.22 | +109.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥90.28 | +162.4% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 液冷渗透慢于预期；方案标准化后价格竞争；交付责任和售后成本上升。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300499
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300602 飞荣达（深交所，液冷）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥27.74 / ¥50.44 / ¥63.06 Bear/Base/Bull
- Current Price / Upside: ¥41.63 / +21.2%
- Core Thesis: 导热散热材料，主题为液冷。本地 analyst 快照显示买入占比 +100.0%（41/41），当前价 ¥41.63，隐含目标 ¥50.44，上行 +21.2%。本地 fundamentals 快照：PE(TTM) 63.1x，PB 5.9x，市值 242.2亿元。Dashboard 最新信号排名 #73，PEG- 动量8.9% 主题5分。核心研究问题是：高功率 AI 机柜渗透率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器热管理链条，价值量来自冷板、CDU、机柜级方案和数据中心工程交付。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -23.90%，平均仓位 +14.52%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 63.1x；PB 5.9x；市值 242.2亿元；next EPS consensus 0.80。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 高功率 AI 机柜渗透率
- 液冷方案 ASP 和良率
- 大客户导入与批量交付
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥27.74 | -33.4% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥50.44 | +21.2% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥63.06 | +51.5% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 液冷渗透慢于预期；方案标准化后价格竞争；交付责任和售后成本上升。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300602
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 002837 英维克（深交所，液冷）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥67.14 / 未核验
- Core Thesis: 数据中心温控龙头，冷板式液冷解决方案领先，受益AI算力散热需求，主题为液冷。本地 analyst 快照显示买入占比 +98.8%（85/86），当前价 ¥67.14，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 177.3x，PB 25.7x，市值 855.6亿元。Dashboard 最新信号排名 #85，PEG- 动量-8.5% 主题5分。核心研究问题是：高功率 AI 机柜渗透率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在 AI 服务器热管理链条，价值量来自冷板、CDU、机柜级方案和数据中心工程交付。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -23.90%，平均仓位 +14.52%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 177.3x；PB 25.7x；市值 855.6亿元；next EPS consensus 1.28。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 高功率 AI 机柜渗透率
- 液冷方案 ASP 和良率
- 大客户导入与批量交付
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 液冷渗透慢于预期；方案标准化后价格竞争；交付责任和售后成本上升。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=002837
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 云/AI基建

### 600941 中国移动（上交所，云/AI基建）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥70.78 / ¥128.70 / ¥160.87 Bear/Base/Bull
- Current Price / Upside: ¥95.42 / +34.9%
- Core Thesis: 国内最大运营商，移动云和AI基础设施服务，主题为云/AI基建。本地 analyst 快照显示买入占比 +97.5%（78/80），当前价 ¥95.42，隐含目标 ¥128.70，上行 +34.9%。本地 fundamentals 快照：PE(TTM) 15.3x，PB 1.5x，市值 20805.7亿元。Dashboard 最新信号排名 #76，PEG- 动量4.7% 主题15分。核心研究问题是：云与 AI 基建收入增速 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在云服务、运营商网络和 AI 基建平台层，利润池由资本开支、资源调度和客户黏性决定。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.13%，平均仓位 +14.24%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 15.3x；PB 1.5x；市值 20805.7亿元；next EPS consensus 7.30。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 云与 AI 基建收入增速
- 算力利用率和毛利率
- 政企/运营商订单
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥70.78 | -25.8% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥128.70 | +34.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥160.87 | +68.6% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 资本开支回报低于预期；价格竞争；项目制收入确认波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600941
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 601728 中国电信（上交所，云/AI基建）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥4.16 / ¥7.57 / ¥9.46 Bear/Base/Bull
- Current Price / Upside: ¥6.24 / +21.4%
- Core Thesis: 天翼云稳居国内前三，支撑AI算力调度，主题为云/AI基建。本地 analyst 快照显示买入占比 +97.9%（46/47），当前价 ¥6.24，隐含目标 ¥7.57，上行 +21.4%。本地 fundamentals 快照：PE(TTM) 18.0x，PB 1.2x，市值 5710.0亿元。Dashboard 最新信号排名 #68，PEG- 动量9.3% 主题15分。核心研究问题是：云与 AI 基建收入增速 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在云服务、运营商网络和 AI 基建平台层，利润池由资本开支、资源调度和客户黏性决定。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.13%，平均仓位 +14.24%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 18.0x；PB 1.2x；市值 5710.0亿元；next EPS consensus 0.42。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 云与 AI 基建收入增速
- 算力利用率和毛利率
- 政企/运营商订单
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥4.16 | -33.3% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥7.57 | +21.3% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥9.46 | +51.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 资本开支回报低于预期；价格竞争；项目制收入确认波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=601728
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 600050 中国联通（上交所，云/AI基建）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥3.12 / ¥5.67 / ¥7.08 Bear/Base/Bull
- Current Price / Upside: ¥4.36 / +30.0%
- Core Thesis: 三大运营商之一，提供AI算力网络和云服务，主题为云/AI基建。本地 analyst 快照显示买入占比 +87.9%（116/132），当前价 ¥4.36，隐含目标 ¥5.67，上行 +30.0%。本地 fundamentals 快照：PE(TTM) 15.7x，PB 0.8x，市值 1363.1亿元。Dashboard 最新信号排名 #79，PEG- 动量1.7% 主题15分。核心研究问题是：云与 AI 基建收入增速 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在云服务、运营商网络和 AI 基建平台层，利润池由资本开支、资源调度和客户黏性决定。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.13%，平均仓位 +14.24%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 15.7x；PB 0.8x；市值 1363.1亿元；next EPS consensus 0.36。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 云与 AI 基建收入增速
- 算力利用率和毛利率
- 政企/运营商订单
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥3.12 | -28.5% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥5.67 | +30.0% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥7.08 | +62.5% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 资本开支回报低于预期；价格竞争；项目制收入确认波动。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=600050
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## IDC

### 300383 光环新网（深交所，IDC）

**0. Executive Investment View**
- Rating Bias: Watchlist
- 12M Target Price Range: 未核验，需以最新公告、盈利预测和可比公司估值复核
- Current Price / Upside: ¥12.14 / 未核验
- Core Thesis: 光环新网，主题为IDC。本地 analyst 快照显示买入占比 +86.5%（90/104），当前价 ¥12.14，隐含目标 未核验，上行 未核验。本地 fundamentals 快照：PE(TTM) 未核验x，PB 1.8x，市值 216.8亿元。Dashboard 最新信号排名 #87，PEG- 动量-8.8% 主题1分。核心研究问题是：AI 客户上架率和单机柜功率提升 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在算力基础设施运营端，核心是机柜资源、上架率、电力指标和客户结构。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.82%，平均仓位 +18.76%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 未核验x；PB 1.8x；市值 216.8亿元；next EPS consensus 0.25。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 客户上架率和单机柜功率提升
- PUE、电力获取和资本开支效率
- 租金/合同期限/回款
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 估值压缩或盈利兑现不足 | 未核验 | 未核验 |
| Base | 50% | 维持主题暴露，等待公告和财报确认 | 未核验 | 未核验 |
| Bull | 25% | 订单/利润率/份额超预期 | 未核验 | 未核验 |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 供给过剩压低租金；高 capex 拉低 ROIC；客户需求或监管政策变化。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300383
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 603881 数据港（上交所，IDC）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥25.63 / ¥46.59 / ¥58.24 Bear/Base/Bull
- Current Price / Upside: ¥31.19 / +49.4%
- Core Thesis: 数据港，主题为IDC。本地 analyst 快照显示买入占比 +97.6%（40/41），当前价 ¥31.19，隐含目标 ¥46.59，上行 +49.4%。本地 fundamentals 快照：PE(TTM) 160.7x，PB 6.7x，市值 224.1亿元。Dashboard 最新信号排名 #86，PEG- 动量-1.7% 主题1分。核心研究问题是：AI 客户上架率和单机柜功率提升 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在算力基础设施运营端，核心是机柜资源、上架率、电力指标和客户结构。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.82%，平均仓位 +18.76%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 160.7x；PB 6.7x；市值 224.1亿元；next EPS consensus 0.29。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 客户上架率和单机柜功率提升
- PUE、电力获取和资本开支效率
- 租金/合同期限/回款
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥25.63 | -17.8% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥46.59 | +49.4% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥58.24 | +86.7% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 供给过剩压低租金；高 capex 拉低 ROIC；客户需求或监管政策变化。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=603881
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 300738 奥飞数据（深交所，IDC）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥18.96 / ¥34.47 / ¥43.09 Bear/Base/Bull
- Current Price / Upside: ¥18.95 / +81.9%
- Core Thesis: 奥飞数据，主题为IDC。本地 analyst 快照显示买入占比 +100.0%（27/27），当前价 ¥18.95，隐含目标 ¥34.47，上行 +81.9%。本地 fundamentals 快照：PE(TTM) 107.7x，PB 4.8x，市值 186.7亿元。Dashboard 最新信号排名 #65，PEG- 动量15.7% 主题1分。核心研究问题是：AI 客户上架率和单机柜功率提升 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在算力基础设施运营端，核心是机柜资源、上架率、电力指标和客户结构。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 -0.82%，平均仓位 +18.76%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 107.7x；PB 4.8x；市值 186.7亿元；next EPS consensus 0.32。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- AI 客户上架率和单机柜功率提升
- PUE、电力获取和资本开支效率
- 租金/合同期限/回款
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥18.96 | +0.0% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥34.47 | +81.9% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥43.09 | +127.4% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 供给过剩压低租金；高 capex 拉低 ROIC；客户需求或监管政策变化。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.szse.cn/disclosure/listed/notice/index.html?stock=300738
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 晶圆代工

### 688981 中芯国际（上交所，晶圆代工）

**0. Executive Investment View**
- Rating Bias: Accumulate
- 12M Target Price Range: ¥86.25 / ¥156.81 / ¥196.02 Bear/Base/Bull
- Current Price / Upside: ¥127.40 / +23.1%
- Core Thesis: 中国大陆晶圆代工龙头，先进制程为AI芯片提供代工，主题为晶圆代工。本地 analyst 快照显示买入占比 +93.3%（97/104），当前价 ¥127.40，隐含目标 ¥156.81，上行 +23.1%。本地 fundamentals 快照：PE(TTM) 202.3x，PB 6.8x，市值 10209.2亿元。Dashboard 最新信号排名 #39，PEG- 动量17.2% 主题52分。核心研究问题是：成熟/特色工艺利用率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在半导体制造核心环节，产能利用率、工艺平台和客户结构决定盈利弹性。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +41.13%，平均仓位 +43.25%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 202.3x；PB 6.8x；市值 10209.2亿元；next EPS consensus 0.78。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 成熟/特色工艺利用率
- 国产客户订单和 ASP
- 折旧压力与毛利率
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥86.25 | -32.3% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥156.81 | +23.1% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥196.02 | +53.9% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 行业库存周期反复；高折旧压制利润；先进设备限制和客户集中。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688981
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

### 688347 华虹公司（上交所，晶圆代工）

**0. Executive Investment View**
- Rating Bias: Buy
- 12M Target Price Range: ¥280.83 / ¥510.60 / ¥638.25 Bear/Base/Bull
- Current Price / Upside: ¥221.35 / +130.7%
- Core Thesis: 国内第二大晶圆代工厂，特色工艺助力AI功率和存储，主题为晶圆代工。本地 analyst 快照显示买入占比 +93.3%（14/15），当前价 ¥221.35，隐含目标 ¥510.60，上行 +130.7%。本地 fundamentals 快照：PE(TTM) 779.5x，PB 8.5x，市值 3846.4亿元。Dashboard 最新信号排名 #34，PEG- 动量22.5% 主题52分。核心研究问题是：成熟/特色工艺利用率 能否转化为可持续利润，而不是只停留在主题估值扩张。
- Key Debate: 市场定价的是主题景气、盈利兑现还是稀缺性溢价；若后续公告无法证明订单、利润率和现金流同步改善，应下调仓位或移出核心池。

**1. Industry Chain / Competition**
- Value Chain Position: 处在半导体制造核心环节，产能利用率、工艺平台和客户结构决定盈利弹性。
- Moat Direction: 重点验证客户认证、产品代际、规模制造、渠道/生态与成本曲线；当前仅依据股票池主题与本地数据形成初判，未逐项核验公司公告。
- Theme Backtest Context: 主题回测收益贡献 +41.13%，平均仓位 +43.25%。

**2. Financial Statement Read-Through**
- Snapshot Metrics: PE(TTM) 779.5x；PB 8.5x；市值 3846.4亿元；next EPS consensus 0.66。
- Accounting Focus: 后续需核验收入确认、毛利率、费用资本化、存货/应收、经营现金流、资本开支、债务和股权稀释。若利润增长主要来自非经常性项目或营运资本透支，base case 不成立。

**3. Key Value Drivers**
- 成熟/特色工艺利用率
- 国产客户订单和 ASP
- 折旧压力与毛利率
- Valuation Sensitivity: 对高 PE 或无 implied target 的股票，盈利预测小幅下修会显著压缩目标价；对低上行但强动量股票，仓位应更多受风控和催化剂驱动。

**4. Bull / Base / Bear Scenarios**
| Scenario | Probability | Core Assumptions | Target Price | Implied Return |
| --- | ---: | --- | ---: | ---: |
| Bear | 25% | 订单/盈利兑现低于预期，估值回落 | ¥280.83 | +26.9% |
| Base | 50% | 本地一致预期 EPS 与 implied target 基本兑现 | ¥510.60 | +130.7% |
| Bull | 25% | 需求、份额和利润率同时超预期 | ¥638.25 | +188.3% |

**5. Catalysts / Risks / Monitoring Dashboard**
- Catalysts: 下一次季报/中报/年报、订单或客户突破、行业价格/资本开支变化、政策或出口管制变化。
- Key Risks: 行业库存周期反复；高折旧压制利润；先进设备限制和客户集中。
- Monitor: 最新交易所公告、业绩预告、机构调研、合同/中标、毛利率、存货、应收、经营现金流、股权激励和减持。公告核验入口：https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688347
- Source Status: 本页为本地快照驱动的一页 memo，尚未逐条核验最新年报、半年报、投资者关系活动记录和电话会。

## 3. Source List

- Local: web/data/universe.json, docs/data/analyst.json, docs/data/signals.json, web/data/dashboard-backtest.json, accessed/generated locally on 2026-06-13.
- 上海证券交易所上市公司公告：用于上交所/科创板公司公告复核，示例入口 https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688256 。
- 深圳证券交易所上市公司公告：用于深交所公司公告复核，示例入口 https://www.szse.cn/disclosure/listed/notice/index.html?stock=300308 。
- 巨潮资讯：A 股公告集中查询入口 https://www.cninfo.com.cn/ 。
- 后续深度版应逐家公司补充：最新年报/季报、业绩说明会、投资者关系活动记录、公司官网/IR 资料、交易所问询函和回复、可比公司估值表。
