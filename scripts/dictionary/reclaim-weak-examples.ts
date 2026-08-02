/**
 * Remove exact weak fill-template curated examples so Tatoeba can reclaim them.
 * Keeps hand-curated and pattern (`demonstrates`) entries.
 * Also clears matching weak examples from promoted.json.
 *
 * Usage: bun run examples:reclaim
 * Then: bun run examples:enrich → examples:fill → examples:curate → related:apply
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { ContentEntry, Example } from "../../src/lib/content/types";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

const CURATED_PATH = path.join(ROOT, "content", "dictionary", "curated-examples.json");
const PROMOTED_PATH = path.join(ROOT, "content", "dictionary", "promoted.json");

function isWeakTemplate(example: Example): boolean {
  if (example.demonstrates) return false;
  const { slovak, english } = example;

  if (/^Chcem .+\.$/u.test(slovak) && /^I want to /i.test(english)) return true;
  if (/^Môže to .+\.$/u.test(slovak) && /^It can /i.test(english)) return true;
  if (/^Môže sa to .+\.$/u.test(slovak) && /^It can /i.test(english)) return true;
  if (/^Také veci môžu .+\.$/u.test(slovak) && /^Such things can /i.test(english))
    return true;
  if (/^Sloveso „.+“ je bežné\.$/u.test(slovak)) return true;
  if (/^Sloveso „[^“]+“ znamená „[^“]+“\.$/u.test(slovak) && /^The verb /i.test(english))
    return true;
  if (/^Rozumiem slovesu „.+“\.$/u.test(slovak)) return true;
  if (/^Mám .+ problém\.$/u.test(slovak) && /^I have a .+ problem\.$/i.test(english))
    return true;
  if (/^To je .+ príklad\.$/u.test(slovak) && /^That is a .+ example\.$/i.test(english))
    return true;
  if (/^Ten príklad je .+\.$/u.test(slovak) && /^That example is /i.test(english))
    return true;
  if (/^Ten muž je .+\.$/u.test(slovak) && /^That man is /i.test(english)) return true;
  if (/^Ten dom je .+\.$/u.test(slovak) && /^That house is /i.test(english)) return true;
  if (/^Ten projekt je .+\.$/u.test(slovak) && /^That project is /i.test(english))
    return true;
  if (/^To mesto je .+\.$/u.test(slovak) && /^That city is /i.test(english)) return true;
  if (/^To je .+\.$/u.test(slovak) && /^That is /i.test(english)) return true;
  if (/^Tá práca je .+\.$/u.test(slovak)) return true;
  if (/^Toto je .+\.$/u.test(slovak) && /^This is /i.test(english)) return true;
  if (/^Toto sú .+\.$/u.test(slovak) && /^These are /i.test(english)) return true;
  if (/^Kde je .+\?$/u.test(slovak) && /^Where is /i.test(english)) return true;
  if (/^Jeden .+ stačí\.$/u.test(slovak) && /^One .+ is enough\.$/i.test(english))
    return true;
  if (/^Jedna .+ stačí\.$/u.test(slovak) && /^One .+ is enough\.$/i.test(english))
    return true;
  if (/^Jedno .+ stačí\.$/u.test(slovak) && /^One .+ is enough\.$/i.test(english))
    return true;
  if (/^Potrebujem .+\.$/u.test(slovak) && /^I need /i.test(english)) return true;
  if (/^Volá sa .+\.$/u.test(slovak) && /^His\/her name is /i.test(english)) return true;
  if (/^Navštívim .+\.$/u.test(slovak) && /^I'll visit /i.test(english)) return true;
  if (/^Tu je .+\.$/u.test(slovak) && /^Here is /i.test(english)) return true;
  if (/^.+ je pekné mesto\.$/u.test(slovak) && / is a nice city\.$/i.test(english))
    return true;

  return false;
}

const curated = JSON.parse(readFileSync(CURATED_PATH, "utf8")) as Record<
  string,
  Example[]
>;

let removedKeys = 0;
let trimmedKeys = 0;
let keptKeys = 0;

for (const [slug, examples] of Object.entries(curated)) {
  const kept = examples.filter((example) => !isWeakTemplate(example));
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

const promoted = JSON.parse(readFileSync(PROMOTED_PATH, "utf8")) as WordSeed[];
let clearedPromoted = 0;

for (const word of promoted) {
  const before = word.examples.length;
  word.examples = word.examples.filter((example) => !isWeakTemplate(example));
  if (word.examples.length < before) clearedPromoted += 1;
}

writeFileSync(PROMOTED_PATH, `${JSON.stringify(promoted, null, 2)}\n`);

console.log(`Removed fully-weak curated keys: ${removedKeys}`);
console.log(`Trimmed weak sentences from mixed keys: ${trimmedKeys}`);
console.log(`Unchanged curated keys: ${keptKeys}`);
console.log(`Remaining curated keys: ${Object.keys(curated).length}`);
console.log(`Cleared weak examples on promoted words: ${clearedPromoted}`);
