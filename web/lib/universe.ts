// Watchlist loader/writer. The list lives in `web/data/universe.json` so
// it can be edited by hand or refreshed by DeepSeek via the API route.
// Server-only — uses Node fs.
import fs from "node:fs";
import path from "node:path";

export interface UniverseEntry {
  symbol: string;
  name: string;
  theme: string;
  note?: string;
  /** Does the company sell into the global AI supply chain (NVIDIA, AMD,
   *  Apple, Google, hyperscalers) — vs. domestic-only revenue. */
  global_supply?: boolean;
}

export interface UniverseFile {
  $schema_note?: string;
  updated_at: string;
  updated_by: string;
  entries: UniverseEntry[];
}

const FILE = path.join(process.cwd(), "data", "universe.json");

export function readUniverse(): UniverseFile {
  const raw = fs.readFileSync(FILE, "utf-8");
  return JSON.parse(raw) as UniverseFile;
}

export function writeUniverse(file: UniverseFile): void {
  // Write-then-rename so a crash mid-write can't truncate the live file: rename
  // is atomic within a directory, so readers see either the old or new file whole.
  const tmp = path.join(path.dirname(FILE), `.${path.basename(FILE)}.${process.pid}.tmp`);
  fs.writeFileSync(tmp, JSON.stringify(file, null, 2) + "\n", "utf-8");
  fs.renameSync(tmp, FILE);
}

/** Convenience accessor for callers that only want the entries. */
export function loadEntries(): UniverseEntry[] {
  return readUniverse().entries;
}

// Backwards-compat name used across the app.
export const DEFAULT_UNIVERSE: UniverseEntry[] = loadEntries();
