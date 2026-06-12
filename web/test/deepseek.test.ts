import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Redirect the SQLite cache to a temp dir BEFORE importing, and supply an API key.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "scc-deepseek-"));
const origCwd = process.cwd();
process.chdir(tmp);
process.env.DEEPSEEK_API_KEY = "test-key";

let chat: typeof import("../lib/deepseek").chat;
const origFetch = globalThis.fetch;

// Returns a fetch stub that always serves the given assistant content, counting calls.
function stubContent(content: string): { calls: number } {
  const state = { calls: 0 };
  globalThis.fetch = (async () => {
    state.calls++;
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  return state;
}

before(async () => {
  chat = (await import("../lib/deepseek")).chat;
});

beforeEach(() => {
  globalThis.fetch = origFetch;
});

after(() => {
  globalThis.fetch = origFetch;
  process.chdir(origCwd);
});

test("chat() throws on empty json_object content and caches nothing", async () => {
  const state = stubContent("");
  const messages = [{ role: "user" as const, content: "empty-case" }];

  await assert.rejects(
    () => chat(messages, { responseFormat: "json_object" }),
    /empty/,
  );

  // A second identical call must re-hit the API — proof the bad result was not cached.
  await assert.rejects(
    () => chat(messages, { responseFormat: "json_object" }),
    /empty/,
  );
  assert.equal(state.calls, 2);
});

test("chat() throws on unparseable json_object content and caches nothing", async () => {
  const state = stubContent("not json at all {");
  const messages = [{ role: "user" as const, content: "malformed-case" }];

  await assert.rejects(
    () => chat(messages, { responseFormat: "json_object" }),
    /unparseable/,
  );
  await assert.rejects(
    () => chat(messages, { responseFormat: "json_object" }),
    /unparseable/,
  );
  assert.equal(state.calls, 2);
});

test("chat() caches valid json_object content (fetcher runs once)", async () => {
  const state = stubContent('{"signals":[]}');
  const messages = [{ role: "user" as const, content: "valid-case" }];

  const a = await chat(messages, { responseFormat: "json_object" });
  const b = await chat(messages, { responseFormat: "json_object" });
  assert.equal(a, '{"signals":[]}');
  assert.equal(b, '{"signals":[]}');
  assert.equal(state.calls, 1);
});
