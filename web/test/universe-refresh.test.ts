import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Stage a fake working directory with data/universe.json BEFORE importing, so
// readUniverse/writeUniverse operate on a throwaway file.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "scc-refresh-"));
fs.mkdirSync(path.join(tmp, "data"));
fs.writeFileSync(
  path.join(tmp, "data", "universe.json"),
  JSON.stringify(
    {
      updated_at: "2026-01-01",
      updated_by: "test",
      entries: [{ symbol: "688256", name: "寒武纪", theme: "算力", global_supply: false }],
    },
    null,
    2,
  ),
);
const origCwd = process.cwd();
process.chdir(tmp);

let applyRefresh: typeof import("../lib/universe-refresh").applyRefresh;
let readUniverse: typeof import("../lib/universe").readUniverse;
const origFetch = globalThis.fetch;

// pyserver /fundamental stub: a known set of real codes return a non-null name,
// everything else returns the vacuous 200 with null name that real pyserver gives
// for any well-formed code.
const REAL = new Map<string, string>([
  ["300476", "胜宏科技"],
  ["601138", "工业富联"],
]);

before(async () => {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    const symbol = url.searchParams.get("symbol") ?? "";
    const body = { symbol, name: REAL.get(symbol) ?? null };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  applyRefresh = (await import("../lib/universe-refresh")).applyRefresh;
  readUniverse = (await import("../lib/universe")).readUniverse;
});

after(() => {
  globalThis.fetch = origFetch;
  process.chdir(origCwd);
});

const emptyProposal = { removes: [], reclassifies: [], rationale: "" };

test("applyRefresh dedupes a symbol proposed twice", async () => {
  const current = readUniverse();
  const result = await applyRefresh(current, {
    ...emptyProposal,
    adds: [
      { symbol: "300476", name: "胜宏科技", theme: "AI-PCB" },
      { symbol: "300476", name: "胜宏科技 dup", theme: "AI-PCB" },
    ],
  });

  // Validated + added once, not twice.
  assert.equal(result.applied.added.filter((a) => a.symbol === "300476").length, 1);
  const written = readUniverse();
  assert.equal(written.entries.filter((e) => e.symbol === "300476").length, 1);
});

test("applyRefresh rejects a code with a null name (hallucinated)", async () => {
  const current = readUniverse();
  const result = await applyRefresh(current, {
    ...emptyProposal,
    adds: [{ symbol: "999999", name: "幻觉股份", theme: "算力" }],
  });

  assert.equal(result.applied.added.length, 0);
  assert.equal(result.applied.rejected.length, 1);
  assert.equal(result.applied.rejected[0].symbol, "999999");
});

test("applyRefresh validates each unique code only once even when duplicated", async () => {
  let calls = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.pathname === "/fundamental") calls++;
    return realFetch(input as Request);
  }) as typeof fetch;

  try {
    const current = readUniverse();
    await applyRefresh(current, {
      ...emptyProposal,
      adds: [
        { symbol: "601138", name: "工业富联", theme: "AI服务器" },
        { symbol: "601138", name: "工业富联 dup", theme: "AI服务器" },
        { symbol: "601138", name: "工业富联 dup2", theme: "AI服务器" },
      ],
    });
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = realFetch;
  }
});
