// Frozen trend120 evaluation. Never invokes profile selection or parameter search.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { runBacktest, type PortfolioBar } from "../lib/backtest";
import { ruleBasedScorer } from "../lib/dashboardBacktest";
import { oversoldMetrics } from "../lib/oversoldStrategy";
import { compareNewWindow, validateFreshDataset, type FreshDataset } from "../lib/freshValidation";
import { loadEntries } from "../lib/universe";

async function main() {
  const file = process.env.FRESH_DATASET;
  if (!file) throw new Error("Set FRESH_DATASET to the newly downloaded dataset.json");
  const datasetText = fs.readFileSync(file,"utf8");
  const dataset: FreshDataset = JSON.parse(datasetText);
  const lock = JSON.parse(fs.readFileSync("data/fresh-validation-lock.json","utf8"));
  for (const [file,hash] of Object.entries(lock.rules_sha256)) {
    assert.equal(createHash("sha256").update(fs.readFileSync(path.resolve("..",file))).digest("hex"),hash,`Frozen strategy changed: ${file}`);
  }
  const universeHash = createHash("sha256").update(fs.readFileSync("data/universe.json")).digest("hex");
  assert.equal(universeHash,lock.universe_sha256);
  assert.equal(dataset.universeSha256,universeHash);
  assert.equal(dataset.requestedEnd,lock.requested_end);
  const quality = validateFreshDataset(dataset,loadEntries().map((e) => e.symbol),lock.new_data_start);
  const cfg = {startCash: lock.startCash, startDate:"2024-01-01",endDate:dataset.requestedEnd,
    maxPositions:lock.maxPositions,rebalanceEveryNDays:lock.rebalanceEveryNDays,feeBps:lock.feeBps,
    exitProfile:"trend120" as const};
  const full = await runBacktest(dataset.series,cfg,{scorer:ruleBasedScorer("trend120")});
  const cold = await runBacktest(dataset.series,{...cfg,startDate:lock.new_data_start},{scorer:ruleBasedScorer("trend120")});
  const anchorDate = full.equityCurve.filter((b) => b.date<lock.new_data_start).at(-1)!.date;
  const cashAnchor: PortfolioBar = {date:anchorDate,equity:cfg.startCash,cash:cfg.startCash,positions:{}};
  const continuous = compareNewWindow(full.equityCurve,dataset.benchmark,lock.new_data_start);
  const cashStart = compareNewWindow([cashAnchor,...cold.equityCurve],dataset.benchmark,lock.new_data_start);
  let auditedBuys = 0;
  for (const result of [full,cold]) {
    for (const b of result.equityCurve) {
      const holdings = Object.values(b.positions).reduce((sum,p)=>sum+p.shares*p.price,0);
      assert(Math.abs(holdings+b.cash-b.equity)<1e-6);
      assert(b.cash>=-1e-7);
      assert(holdings/b.equity<=b.exposureLimitPct!/100+1e-8 || b.riskBreach);
    }
    for (const t of result.trades.filter((t)=>t.side==="buy" && t.date>=lock.new_data_start)) {
      const s = dataset.series.find((s)=>s.entry.symbol===t.symbol)!;
      assert(oversoldMetrics({symbol:t.symbol,closes:s.klines.filter((k)=>k.date<t.date).map((k)=>k.close)})?.oversold);
      auditedBuys++;
    }
  }
  const old = JSON.parse(fs.readFileSync("data/dashboard-candidate.json","utf8"));
  // Quantify historical restatement from the source/financial-date change.
  const oldEnd = lock.prior_stock_end;
  const oldBar = old.equityCurve.find((b:PortfolioBar)=>b.date===oldEnd);
  const restatedBar = full.equityCurve.find((b)=>b.date===oldEnd)!;
  const output = {generatedAt:new Date().toISOString(),profile:"trend120",source:dataset.source,
    fetchedAt:dataset.fetchedAt,newDataStart:lock.new_data_start,newDataEnd:dataset.requestedEnd,
    lock,quality,datasetSha256:createHash("sha256").update(datasetText).digest("hex"),
    sourceFiles:dataset.sourceFiles,
    methodology:"Frozen rules; newly acquired historical data, not live forward performance. Continuous replay inherits restated holdings. Cash-start adds a cash anchor on the prior day. Tushare qfq prices and actual announcement-date fundamentals; no profile reselection.",
    continuous:{...continuous,trades:full.trades.filter((t)=>t.date>=lock.new_data_start)},
    cashStart:{...cashStart,trades:cold.trades},
    historicalRestatement:{through:oldEnd,oldEquity:oldBar.equity,newEquity:restatedBar.equity,
      reason:"Fresh Tushare price/adjustment basis and actual announcement-date financials replace the former CSV source and estimated/empty dates; this difference is not new-period alpha."},
    auditedNewBuys:auditedBuys,
    latestHoldings:full.equityCurve.at(-1)!.positions,
    latestEquity:full.equityCurve.at(-1)!.equity,
    latestCash:full.equityCurve.at(-1)!.cash,
  };
  fs.writeFileSync("data/fresh-validation.json",JSON.stringify(output,null,2)+"\n");
  for (const [name,m] of Object.entries({continuous,cashStart})) console.log(JSON.stringify({mode:name,start:m.startDate,end:m.endDate,days:m.observations,returnPct:m.strategyReturnPct,indexPct:m.benchmarkReturnPct,drawdownPct:m.strategyDrawdownPct,avgExposure:m.averageExposurePct,maxExposure:m.maxExposurePct,breaches:m.riskBreachDays}));
}
main().catch((error)=>{console.error(error);process.exitCode=1;});
