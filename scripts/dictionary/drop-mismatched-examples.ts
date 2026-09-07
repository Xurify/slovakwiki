/**
 * Drop Tatoeba rows whose Slovak line does not contain the lemma
 * (or a diacritic-true surface form). Fixes vina←vína / chyba←chýbať collisions.
 *
 * Requires --slugs. Do not run on the full dictionary — heuristic paradigms
 * miss many valid inflections (vieš, koňa, bývam, …).
 *
 * Usage: bun scripts/dictionary/drop-mismatched-examples.ts -- --slugs chyba,chybat
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { exampleContainsLemma } from "../../src/lib/catalog/dictionary/example-lemma-match";
import type { ContentEntry, Example } from "../../src/lib/catalog/types";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");

function parseSlugs(argv: string[]): string[] {
  const slugs: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--slugs" && argv[index + 1]) {
      slugs.push(
        ...argv[index + 1]!.split(",")
          .map((slug) => slug.trim())
          .filter(Boolean),
      );
      index += 1;
    }
  }
  return slugs;
}

function keepExample(word: WordSeed, example: Example): boolean {
  if (example.note !== "Tatoeba") return true;
  if (example.demonstrates) return true;
  return exampleContainsLemma(example.slovak, word.slovak, word.category);
}

async function main(): Promise<void> {
  const slugs = parseSlugs(process.argv.slice(2));
  if (slugs.length === 0) {
    throw new Error("Required: --slugs a,b (do not run on the full dictionary)");
  }

  const wanted = new Set(slugs);
  const dictionaryWords = JSON.parse(await readFile(WORDS_PATH, "utf8")) as WordSeed[];
  let wordsTouched = 0;
  let rowsDropped = 0;

  for (const word of dictionaryWords) {
    if (!wanted.has(word.slug)) continue;
    const before = word.examples.length;
    word.examples = word.examples.filter((example) => keepExample(word, example));
    const dropped = before - word.examples.length;
    if (dropped > 0) {
      wordsTouched += 1;
      rowsDropped += dropped;
    }
  }

  const missing = slugs.filter(
    (slug) => !dictionaryWords.some((word) => word.slug === slug),
  );
  if (missing.length > 0) {
    console.warn(`Unknown slugs: ${missing.join(", ")}`);
  }

  await writeFile(WORDS_PATH, `${JSON.stringify(dictionaryWords, null, 2)}\n`, "utf8");
  console.log(`Dropped ${rowsDropped} Tatoeba rows on ${wordsTouched} lemmas`);
  console.log(`→ ${path.relative(ROOT, WORDS_PATH)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
