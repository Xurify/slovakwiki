/**
 * Merge content/frequency/noun-gloss-batch.json into glosses.json.
 * Skips lemmas that already have a non-empty english gloss.
 *
 * Usage: bun scripts/dictionary/merge-noun-gloss-batch.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { isWordRegister, type WordRegister } from "../../src/lib/catalog/types";
import { ROOT } from "../lib/paths";
import { NOUN_GLOSS_CLEANUPS, NOUN_GLOSS_SUPPLEMENT } from "./noun-gloss-supplement";

const FREQUENCY_DIR = path.join(ROOT, "content", "frequency");
const GLOSSES_PATH = path.join(FREQUENCY_DIR, "glosses.json");
const BATCH_PATH = path.join(FREQUENCY_DIR, "noun-gloss-batch.json");

interface Gloss {
  english: string;
  category?: string;
  register?: WordRegister;
}

async function main(): Promise<void> {
  const glosses = JSON.parse(await readFile(GLOSSES_PATH, "utf8")) as Record<
    string,
    Gloss
  >;
  const batch = {
    ...((JSON.parse(await readFile(BATCH_PATH, "utf8")) as Record<string, Gloss>) ?? {}),
    ...NOUN_GLOSS_SUPPLEMENT,
    ...NOUN_GLOSS_CLEANUPS,
  };

  let merged = 0;
  let skipped = 0;

  for (const [lemma, entry] of Object.entries(batch)) {
    const english = entry.english?.trim();
    if (!english) continue;

    if (glosses[lemma]?.english?.trim()) {
      skipped += 1;
      continue;
    }

    glosses[lemma] = {
      english,
      ...(isWordRegister(entry.register) ? { register: entry.register } : {}),
    };
    merged += 1;
  }

  await writeFile(GLOSSES_PATH, `${JSON.stringify(glosses, null, 2)}\n`, "utf8");

  console.log(
    `Merged ${merged} noun glosses into glosses.json (${skipped} skipped — already present)`,
  );
}

await main();
