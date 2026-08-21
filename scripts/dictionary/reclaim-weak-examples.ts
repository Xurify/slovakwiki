/**
 * Remove exact weak fill-template curated examples so Tatoeba can reclaim them.
 * Keeps hand-curated and pattern (`demonstrates`) entries.
 * Also clears matching weak examples from words.json.
 *
 * Usage: bun scripts/dictionary/reclaim-weak-examples.ts
 * Then: enrich-examples.ts → author-verb-examples.ts → apply-curated-examples.ts → apply-related.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { isWeakFillTemplate } from "../../src/lib/catalog/dictionary/example-quality";
import type { ContentEntry, Example } from "../../src/lib/catalog/types";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

const CURATED_PATH = path.join(ROOT, "content", "dictionary", "curated-examples.json");
const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");

const dictionaryWords = JSON.parse(readFileSync(WORDS_PATH, "utf8")) as WordSeed[];
const lemmaBySlug = new Map(dictionaryWords.map((word) => [word.slug, word.slovak]));

const curated = JSON.parse(readFileSync(CURATED_PATH, "utf8")) as Record<
  string,
  Example[]
>;

let removedKeys = 0;
let trimmedKeys = 0;
let keptKeys = 0;

function isRemovableWeakExample(example: Example, lemma?: string): boolean {
  return example.note === "Curated" && isWeakFillTemplate(example, lemma);
}

for (const [slug, examples] of Object.entries(curated)) {
  const lemma = lemmaBySlug.get(slug);
  const kept = examples.filter((example) => !isRemovableWeakExample(example, lemma));
  if (kept.length === 0) {
    delete curated[slug];
    removedKeys += 1;
  } else if (kept.length < examples.length) {
    curated[slug] = kept;
    trimmedKeys += 1;
  } else {
    keptKeys += 1;
  }
}

writeFileSync(CURATED_PATH, `${JSON.stringify(curated, null, 2)}\n`);

let clearedWords = 0;

for (const word of dictionaryWords) {
  const before = word.examples.length;
  word.examples = word.examples.filter(
    (example) => !isRemovableWeakExample(example, word.slovak),
  );
  if (word.examples.length < before) clearedWords += 1;
}

writeFileSync(WORDS_PATH, `${JSON.stringify(dictionaryWords, null, 2)}\n`);

console.log(`Removed fully-weak curated keys: ${removedKeys}`);
console.log(`Trimmed weak sentences from mixed keys: ${trimmedKeys}`);
console.log(`Unchanged curated keys: ${keptKeys}`);
console.log(`Remaining curated keys: ${Object.keys(curated).length}`);
console.log(`Cleared weak examples on dictionary words: ${clearedWords}`);
