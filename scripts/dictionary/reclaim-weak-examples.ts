/**
 * Remove exact weak fill-template curated examples so Tatoeba can reclaim them.
 * Keeps hand-curated and pattern (`demonstrates`) entries.
 * Also clears matching weak examples from words.json.
 *
 * Usage: bun scripts/dictionary/reclaim-weak-examples.ts
 * Then: enrich-examples.ts → fill-empty-examples.ts → apply-curated-examples.ts → apply-related.ts
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
const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");

function isWeakTemplate(example: Example): boolean {
  if (example.demonstrates) return false;
  if (example.isPracticeFrame !== true) return false;
  const { slovak, english } = example;

  if (/^Chcem .+\.$/u.test(slovak) && /^I want to /i.test(english)) return true;
  if (/^Môže to .+\.$/u.test(slovak) && /^It can /i.test(english)) return true;
  if (/^Môže sa to .+\.$/u.test(slovak) && /^It can /i.test(english)) return true;
  if (/^To môže .+\.$/u.test(slovak) && /^That can /i.test(english)) return true;
  if (/^Také veci môžu .+\.$/u.test(slovak) && /^Such things can /i.test(english))
    return true;
  if (/^Je možné .+\.$/u.test(slovak) && /^It is possible /i.test(english)) return true;
  if (/^Je ťažké .+\.$/u.test(slovak) && /^It is hard /i.test(english)) return true;
  if (/^Niekto môže .+\.$/u.test(slovak) && /^Someone can /i.test(english)) return true;
  if (/^Začínam .+\.$/u.test(slovak) && /^I'm starting to /i.test(english)) return true;
  if (/^Snažím sa .+\.$/u.test(slovak) && /^I'm trying to /i.test(english)) return true;
  if (
    /^Chcem .+ kvalitu\.$/u.test(slovak) &&
    /^I want to .+ the quality\.$/i.test(english)
  )
    return true;
  if (
    /^Je to .+ výraz\.$/u.test(slovak) &&
    /^(It is|This is an expression)/i.test(english)
  )
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
  if (/^To riešenie je .+\.$/u.test(slovak) && /^That solution is /i.test(english))
    return true;
  if (/^To je .+\.$/u.test(slovak) && /^That is /i.test(english)) return true;
  if (/^Tá práca je .+\.$/u.test(slovak)) return true;
  if (/^Je to .+ človek\.$/u.test(slovak) && /^That is /i.test(english)) return true;
  if (/^Hľadám .+ byt\.$/u.test(slovak) && /^I'm looking for /i.test(english))
    return true;
  if (/^Hľadáme .+ riešenie\.$/u.test(slovak) && /^We're looking for /i.test(english))
    return true;
  if (/^Hľadáme .+ plán\.$/u.test(slovak) && /^We're looking for /i.test(english))
    return true;
  if (/^Hľadáme .+ prácu\.$/u.test(slovak) && /^We're looking for /i.test(english))
    return true;
  if (/^Potrebujeme .+ plán\.$/u.test(slovak) && /^We need /i.test(english)) return true;
  if (/^Pracuje v .+ podniku\.$/u.test(slovak) && /^He works at /i.test(english))
    return true;
  if (/^To je .+ podnik\.$/u.test(slovak) && /^That is /i.test(english)) return true;
  if (/^Potrebujeme .+\.$/u.test(slovak) && /^We need /i.test(english)) return true;
  if (/^Hľadám .+\.$/u.test(slovak) && /^I'm looking for /i.test(english)) return true;
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
  // Weak adverb fill frames (pre-classed “Urobím to X” / “Stalo sa to X” / manner stubs).
  if (/^Urobím to .+\.$/u.test(slovak) && /^I'll do it /i.test(english)) return true;
  if (/^Stalo sa to .+\.$/u.test(slovak) && /^It happened /i.test(english)) return true;
  if (/^Ide to .+\.$/u.test(slovak) && /^It's going /i.test(english)) return true;
  if (/^Hovorí .+\.$/u.test(slovak) && /^He\/she speaks /i.test(english)) return true;
  if (
    /^Robíme to .+ opatrne\.$/u.test(slovak) &&
    /^We're doing it .+ carefully\.$/i.test(english)
  )
    return true;
  if (
    /^.+ pracujeme na tom\.$/u.test(slovak) &&
    / we are working on it\.$/i.test(english)
  )
    return true;
  if (/^.+ som odišiel skôr\.$/u.test(slovak) && / I left earlier\.$/i.test(english))
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

const dictionaryWords = JSON.parse(readFileSync(WORDS_PATH, "utf8")) as WordSeed[];
let clearedWords = 0;

for (const word of dictionaryWords) {
  const before = word.examples.length;
  word.examples = word.examples.filter((example) => !isWeakTemplate(example));
  if (word.examples.length < before) clearedWords += 1;
}

writeFileSync(WORDS_PATH, `${JSON.stringify(dictionaryWords, null, 2)}\n`);

console.log(`Removed fully-weak curated keys: ${removedKeys}`);
console.log(`Trimmed weak sentences from mixed keys: ${trimmedKeys}`);
console.log(`Unchanged curated keys: ${keptKeys}`);
console.log(`Remaining curated keys: ${Object.keys(curated).length}`);
console.log(`Cleared weak examples on dictionary words: ${clearedWords}`);
