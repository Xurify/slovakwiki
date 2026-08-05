/**
 * Report frequency lemmas that are neither glossed nor already live.
 *
 * Usage: bun run frequency:missing-glosses
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { words } from "../../src/lib/content/data";
import type {
  FrequencyListFile,
  FrequencyPartOfSpeech,
} from "../../src/lib/content/frequency-types";
import { ROOT } from "../lib/paths";

interface MissingGloss {
  lemma: string;
  partOfSpeech: FrequencyPartOfSpeech;
  rank: number;
}

const FREQUENCY_DIR = path.join(ROOT, "content", "frequency");
const OUTPUT_PATH = path.join(ROOT, "tmp", "missing-glosses.json");
const FILES: Record<FrequencyPartOfSpeech, string> = {
  verb: "verbs.json",
  noun: "nouns.json",
  adjective: "adjectives.json",
  adverb: "adverbs.json",
};

async function main(): Promise<void> {
  const glosses = JSON.parse(
    await readFile(path.join(FREQUENCY_DIR, "glosses.json"), "utf8"),
  ) as Record<string, { english?: string }>;
  const liveLemmas = new Set(words.map((word) => word.slovak.toLocaleLowerCase("sk")));
  const missing: MissingGloss[] = [];
  const counts = {} as Record<FrequencyPartOfSpeech, number>;

  for (const partOfSpeech of Object.keys(FILES) as FrequencyPartOfSpeech[]) {
    const list = JSON.parse(
      await readFile(path.join(FREQUENCY_DIR, FILES[partOfSpeech]), "utf8"),
    ) as FrequencyListFile;
    const entries = list.entries.filter(
      (entry) =>
        !glosses[entry.lemma]?.english?.trim() &&
        !liveLemmas.has(entry.lemma.toLocaleLowerCase("sk")),
    );
    counts[partOfSpeech] = entries.length;
    missing.push(
      ...entries.map((entry) => ({
        lemma: entry.lemma,
        partOfSpeech,
        rank: entry.rank,
      })),
    );
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(missing, null, 2)}\n`, "utf8");
  console.log(
    `Missing glosses — verbs: ${counts.verb}, nouns: ${counts.noun}, adjectives: ${counts.adjective}, adverbs: ${counts.adverb}, total: ${missing.length}`,
  );
  console.log(`→ ${path.relative(ROOT, OUTPUT_PATH)}`);
}

await main();
