import { test } from "node:test";
import assert from "node:assert/strict";
import { fallback } from "../lib/analyst-fallback";
import type { Analyst } from "../lib/pyserver";

function ok(symbol: string): Analyst {
  return { symbol, buy_count: 3, total_count: 5, buy_ratio: 0.6 };
}

test("fallback reports anySucceeded when at least one symbol resolves", async () => {
  const { data, anySucceeded } = await fallback(["A", "B"], async (s) => {
    if (s === "A") return ok(s);
    throw new Error("down");
  });
  assert.equal(anySucceeded, true);
  assert.equal(data.length, 2);
  assert.equal(data[0].buy_count, 3);
  // Failed symbol still yields a null-filled placeholder, in order.
  assert.equal(data[1].symbol, "B");
  assert.equal(data[1].buy_count, null);
});

test("fallback reports anySucceeded=false when every symbol fails", async () => {
  const { data, anySucceeded } = await fallback(["A", "B"], async () => {
    throw new Error("pyserver outage");
  });
  assert.equal(anySucceeded, false);
  assert.deepEqual(
    data.map((d) => d.symbol),
    ["A", "B"],
  );
  assert.ok(data.every((d) => d.buy_count === null));
});

test("fallback treats a slow symbol as a failure (per-symbol timeout)", async () => {
  const { data, anySucceeded } = await fallback(["SLOW"], () => new Promise(() => {}));
  assert.equal(anySucceeded, false);
  assert.equal(data[0].symbol, "SLOW");
  assert.equal(data[0].current_price, null);
});
