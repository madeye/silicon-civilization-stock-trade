import {test} from "node:test";
import assert from "node:assert/strict";
import {compareBenchmark} from "../lib/benchmarkComparison";

test("benchmark comparison joins dates and never substitutes a missing date", () => {
  const p = [{date:"2025-01-01",equity:100,cash:80},{date:"2025-01-02",equity:120,cash:0},
    {date:"2025-01-03",equity:80,cash:0},{date:"2025-01-04",equity:200,cash:0}];
  const c = compareBenchmark(p,[{date:"2025-01-03",equity:110},{date:"2025-01-01",equity:100}],100)!;
  assert.deepEqual(c.curve.map((b)=>b.date), ["2025-01-01","2025-01-03"]);
  assert.ok(Math.abs(c.strategyReturnPct + 20) < 1e-8);
  assert.ok(Math.abs(c.benchmarkReturnPct - 10) < 1e-8);
  assert.ok(Math.abs(c.excessReturnPp + 30) < 1e-8);
  assert.equal(c.curve.at(-1)!.matchedExposure,102); // prior 20%, not today's 100%
  assert.equal(c.endDate,"2025-01-03");
});

test("late overlap rebases both curves, and insufficient overlap is unavailable", () => {
  const p = [{date:"2025-01-01",equity:100,cash:50},{date:"2025-01-02",equity:120,cash:60},{date:"2025-01-03",equity:132,cash:66}];
  const c = compareBenchmark(p,[{date:"2025-01-02",equity:200},{date:"2025-01-03",equity:240}],100)!;
  assert.ok(Math.abs(c.strategyReturnPct-10)<1e-8);
  assert.ok(Math.abs(c.benchmarkReturnPct-20)<1e-8);
  assert.equal(compareBenchmark(p,[],100),null);
  assert.equal(compareBenchmark(p,[{date:"2025-01-01",equity:100}],100),null);
});

test("first day fees remain part of the strategy return", () => {
  const c = compareBenchmark([{date:"2025-01-01",equity:99,cash:49},{date:"2025-01-02",equity:100,cash:50}],
    [{date:"2025-01-01",equity:100},{date:"2025-01-02",equity:100}],100)!;
  assert.equal(c.strategyReturnPct,0);
  assert.equal(c.strategyDrawdownPct,-1.0000000000000009);
});
