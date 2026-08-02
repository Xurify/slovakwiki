/**
 * Drop thin single-example curated overlays (no `demonstrates`).
 * Promoted keeps those sentences; enrich can append Tatoeba.
 * Keeps multi-example and pattern pedagogy entries.
 *
 * Usage: bun scripts/dictionary/shrink-curated-singles.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { Example } from "../../src/lib/content/types";
import { ROOT } from "../lib/paths";

const CURATED_PATH = path.join(ROOT, "content", "dictionary", "curated-examples.json");

const curated = JSON.parse(readFileSync(CURATED_PATH, "utf8")) as Record<
  string,
  Example[]
>;

let removed = 0;
let kept = 0;

for (const [slug, examples] of Object.entries(curated)) {
  const hasPattern = examples.some((example) => Boolean(example.demonstrates));
  if (!hasPattern && examples.length <= 1) {
    delete curated[slug];
    removed += 1;
    continue;
  }
  kept += 1;
}

writeFileSync(CURATED_PATH, `${JSON.stringify(curated, null, 2)}\n`);

console.log(`Removed thin curated singles: ${removed}`);
console.log(`Kept curated keys: ${kept}`);
console.log(`→ ${path.relative(ROOT, CURATED_PATH)}`);
