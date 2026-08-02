/**
 * Fail if curated-example-overrides.json still contains damaged fill templates.
 *
 * Usage: bun scripts/dictionary/audit-curated-overrides.ts
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { words } from "../../src/lib/content/data";
import { isDamagedExampleTemplate } from "../../src/lib/content/example-quality";
import type { Example } from "../../src/lib/content/types";
import { ROOT } from "../lib/paths";

const OVERRIDES_PATH = path.join(
  ROOT,
  "content",
  "dictionary",
  "curated-example-overrides.json",
);

const overrides = JSON.parse(readFileSync(OVERRIDES_PATH, "utf8")) as Record<
  string,
  Example[]
>;

const lemmaBySlug = new Map(
  words.filter((word) => word.kind === "word").map((word) => [word.slug, word.slovak]),
);

const damaged: string[] = [];
for (const [slug, examples] of Object.entries(overrides)) {
  const lemma = lemmaBySlug.get(slug) ?? slug;
  for (const example of examples) {
    if (isDamagedExampleTemplate(example.slovak, lemma)) {
      damaged.push(`${slug}\t${example.slovak}`);
    }
  }
}

if (damaged.length > 0) {
  console.error(`Damaged curated overrides: ${damaged.length}`);
  for (const row of damaged.slice(0, 50)) console.error(row);
  if (damaged.length > 50) console.error(`… +${damaged.length - 50} more`);
  process.exit(1);
}

console.log(`OK: ${Object.keys(overrides).length} overrides, 0 damaged templates`);
