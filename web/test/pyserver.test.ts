import { test } from "node:test";
import assert from "node:assert/strict";

test("fetchAnalysts sends one deduped batch request", async () => {
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request) => {
    calls.push(String(input));
    return new Response(JSON.stringify([{ symbol: "300476", current_price: 1 }]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const { fetchAnalysts } = await import("../lib/pyserver");
    const out = await fetchAnalysts(["300476", "300476", "", "601138"]);
    assert.deepEqual(out, [{ symbol: "300476", current_price: 1 }]);
    assert.equal(calls.length, 1);
    const url = new URL(calls[0]);
    assert.equal(url.pathname, "/analysts");
    assert.equal(url.searchParams.get("symbols"), "300476,601138");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
