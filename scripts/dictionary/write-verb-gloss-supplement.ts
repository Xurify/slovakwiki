/**
 * One-shot writer for content/frequency/verb-gloss-supplement.json
 * Usage: bun scripts/dictionary/write-verb-gloss-supplement.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";

const NEED_PATH = path.join(ROOT, "tmp", "need-glosses.json");
const OUT_PATH = path.join(ROOT, "content", "frequency", "verb-gloss-supplement.json");
const DATA_PATH = path.join(
  ROOT,
  "scripts",
  "dictionary",
  "verb-gloss-supplement-entries.json",
);

interface Gloss {
  english: string;
}

async function main(): Promise<void> {
  const need = JSON.parse(await readFile(NEED_PATH, "utf8")) as string[];
  const entries = JSON.parse(await readFile(DATA_PATH, "utf8")) as Record<string, string>;

  const supplement: Record<string, Gloss> = {};
  const missing: string[] = [];
  const extra = Object.keys(entries).filter((k) => !need.includes(k));

  for (const lemma of need) {
    const english = entries[lemma]?.trim();
    if (!english) {
      missing.push(lemma);
      continue;
    }
    supplement[lemma] = { english };
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing glosses for ${missing.length} lemmas: ${missing.slice(0, 5).join(", ")}…`,
    );
  }
  if (extra.length > 0) {
    throw new Error(`Extra glosses not in need list: ${extra.slice(0, 5).join(", ")}…`);
  }
  if (Object.keys(supplement).length !== need.length) {
    throw new Error(
      `Expected ${need.length} entries, got ${Object.keys(supplement).length}`,
    );
  }

  await writeFile(OUT_PATH, `${JSON.stringify(supplement, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${Object.keys(supplement).length} glosses → ${path.relative(ROOT, OUT_PATH)}`,
  );
}

await main();
