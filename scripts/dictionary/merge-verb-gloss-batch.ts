/**
 * Merge content/frequency/verb-gloss-batch.json into glosses.json.
 * Skips lemmas that already have a non-empty english gloss.
 *
 * Usage: bun scripts/dictionary/merge-verb-gloss-batch.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";

const FREQUENCY_DIR = path.join(ROOT, "content", "frequency");
const GLOSSES_PATH = path.join(FREQUENCY_DIR, "glosses.json");
const BATCH_PATH = path.join(FREQUENCY_DIR, "verb-gloss-batch.json");

interface Gloss {
  english: string;
}

async function main(): Promise<void> {
  const glosses = JSON.parse(await readFile(GLOSSES_PATH, "utf8")) as Record<
    string,
    Gloss
  >;
  const batch = JSON.parse(await readFile(BATCH_PATH, "utf8")) as Record<string, Gloss>;

  let merged = 0;
  let skipped = 0;

  for (const [lemma, entry] of Object.entries(batch)) {
    const english = entry.english?.trim();
    if (!english) continue;

    if (glosses[lemma]?.english?.trim()) {
      skipped += 1;
      continue;
    }

    glosses[lemma] = { english };
    merged += 1;
  }

  await writeFile(GLOSSES_PATH, `${JSON.stringify(glosses, null, 2)}\n`, "utf8");

  console.log(
    `Merged ${merged} glosses into glosses.json (${skipped} skipped — already present)`,
  );
}

await main();
