import {test} from "node:test";
import assert from "node:assert/strict";
import {compareNewWindow,validateFreshDataset,type FreshDataset} from "../lib/freshValidation";
import type {PortfolioBar} from "../lib/backtest";

const dates = Array.from({length: 6},(_,i)=>`2026-08-${String(5+i).padStart(2,"0")}`);
const bars:PortfolioBar[] = dates.map((date,i)=>({date,equity:2_000_000+i*20_000,cash:1_000_000,positions:{A:{shares:100,price:10_000+i*200}}}));
const index = dates.map((date,i)=>({date,equity:100+i}));

test("new-window returns use pre-period equity and exclude the anchor from trading-day counts",()=>{
 const result=compareNewWindow(bars,index,"2026-08-06");
 assert.ok(Math.abs(result.strategyReturnPct-5)<1e-8);
 assert.ok(Math.abs(result.benchmarkReturnPct-5)<1e-8);
 assert.equal(result.observations,5);
 assert.equal(result.startDate,"2026-08-06");
 assert.equal(result.anchorDate,"2026-08-05");
 assert.equal(result.curve[0].equity,1_000_000);
 assert.equal(result.curve.at(-1)!.equity,1_050_000);
});

test("new-window validation fails instead of silently shortening missing index coverage",()=>{
 assert.throws(()=>compareNewWindow(bars,index.slice(1),"2026-08-06"),/anchor/);
 assert.throws(()=>compareNewWindow(bars,index.slice(0,-1),"2026-08-06"),/coverage/);
});

function dataset():FreshDataset {
 const klines=Array.from({length:65},(_,i)=>({date:new Date(Date.UTC(2026,5,7+i)).toISOString().slice(0,10),open:10,high:10,low:10,close:10,volume:100}));
 return {fetchedAt:"2026-09-06",source:"fixture",requestedEnd:"2026-08-10",failures:[],sourceFiles:[],universeSha256:"test",
  series:[{entry:{symbol:"A",name:"A",theme:"T"},klines,fundamentals:[{effective_date:"2026-08-01",profit_yoy:1}]}],benchmark:index};
}

test("fresh data requires the frozen universe, valid dates, and genuinely new observations",()=>{
 const good=dataset();
 assert.equal(validateFreshDataset(good,["A"],"2026-08-06").symbols,1);
 assert.throws(()=>validateFreshDataset(good,["A","B"],"2026-08-06"),/universe/);
 const duplicate=dataset();duplicate.series[0].klines.push(duplicate.series[0].klines.at(-1)!);
 assert.throws(()=>validateFreshDataset(duplicate,["A"],"2026-08-06"),/duplicate/);
 const failed=dataset();failed.failures=[{symbol:"A",error:"unavailable"}];
 assert.throws(()=>validateFreshDataset(failed,["A"],"2026-08-06"),/failed downloads/);
 assert.throws(()=>validateFreshDataset(good,["A"],"2026-09-01"),/No new data/);
});
