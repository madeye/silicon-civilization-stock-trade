import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Stage a fake working directory with data/universe.json BEFORE importing.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "scc-univ-"));
fs.mkdirSync(path.join(tmp, "data"));
const sample = {
  updated_at: "2026-01-01",
  updated_by: "test",
  entries: [
    { symbol: "688256", name: "寒武纪", theme: "算力", global_supply: false },
    { symbol: "300476", name: "胜宏科技", theme: "AI-PCB", global_supply: true },
    { symbol: "600845", name: "宝信软件", theme: "云", global_supply: true },
  ],
};
fs.writeFileSync(
  path.join(tmp, "data", "universe.json"),
  JSON.stringify(sample, null, 2),
);
const origCwd = process.cwd();
process.chdir(tmp);

let readUniverse: typeof import("../lib/universe").readUniverse;
let writeUniverse: typeof import("../lib/universe").writeUniverse;
let loadEntries: typeof import("../lib/universe").loadEntries;

before(async () => {
  const mod = await import("../lib/universe");
  readUniverse = mod.readUniverse;
  writeUniverse = mod.writeUniverse;
  loadEntries = mod.loadEntries;
});

after(() => {
  process.chdir(origCwd);
});

test("readUniverse loads schema fields", () => {
  const u = readUniverse();
  assert.equal(u.updated_by, "test");
  assert.equal(u.entries.length, 3);
});

test("loadEntries returns just the entries", () => {
  const entries = loadEntries();
  assert.equal(entries.length, 3);
  assert.equal(entries[1].name, "胜宏科技");
  assert.equal(entries[1].global_supply, true);
});

test("global_supply is honored", () => {
  const entries = loadEntries();
  const globals = entries.filter((e) => e.global_supply);
  assert.equal(globals.length, 2);
});

test("writeUniverse round-trips", () => {
  const u = readUniverse();
  u.entries.push({ symbol: "002463", name: "沪电股份", theme: "AI-PCB", global_supply: true });
  u.updated_by = "round-trip-test";
  writeUniverse(u);

  const reloaded = readUniverse();
  assert.equal(reloaded.entries.length, 4);
  assert.equal(reloaded.updated_by, "round-trip-test");
  assert.equal(reloaded.entries.at(-1)!.symbol, "002463");
});

test("writeUniverse leaves no temp file behind and keeps content intact", () => {
  const u = readUniverse();
  u.updated_by = "atomic-test";
  writeUniverse(u);

  // The write-then-rename must not leave a .tmp sibling in the data dir.
  const dataDir = path.join(tmp, "data");
  const strays = fs.readdirSync(dataDir).filter((f) => f.includes(".tmp"));
  assert.deepEqual(strays, []);

  // The live file is whole and reflects the write.
  const reloaded = readUniverse();
  assert.equal(reloaded.updated_by, "atomic-test");
  assert.equal(reloaded.entries.length, u.entries.length);
});
