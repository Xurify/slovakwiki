/**
 * Write `gender` (+ `pluralOnlyGender`) onto every `Nouns` row in
 * content/dictionary/words.json: the reviewed exceptions list, else the Slovak
 * ending rule (`noun-gender-rules.ts`). Prints every gender it sets or changes,
 * so new nouns get a look — masculine people and animals need an exception.
 *
 * Optional check against the Slovak National Corpus treebank (UD Slovak-SNK,
 * hand-annotated gender + animacy): put its .conllu files in tmp/ud-slovak-snk/ —
 *   https://github.com/UniversalDependencies/UD_Slovak-SNK
 *
 * Usage: bun scripts/dictionary/assign-noun-gender.ts
 *        bun scripts/dictionary/assign-noun-gender.ts -- --dry-run
 */

import { existsSync, readdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ContentEntry, NounGender } from "../../src/lib/catalog/types";
import { ROOT } from "../lib/paths";
import {
  assignNounGender,
  validateExceptions,
  type NounGenderExceptions,
} from "./noun-gender-rules";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "gender" | "pluralOnlyGender"
>;

const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");
const EXCEPTIONS_PATH = path.join(
  ROOT,
  "content",
  "dictionary",
  "noun-gender-exceptions.json",
);
const TREEBANK_DIR = path.join(ROOT, "tmp", "ud-slovak-snk");

/** Keep `gender` (+ `pluralOnlyGender`) right after `category` for readable diffs. */
function withGender<T extends WordSeed>(word: T, assigned: Partial<WordSeed>): T {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(word)) {
    if (key === "gender" || key === "pluralOnlyGender") continue;
    next[key] = value;
    if (key === "category") {
      if (assigned.gender) next.gender = assigned.gender;
      if (assigned.pluralOnlyGender) next.pluralOnlyGender = assigned.pluralOnlyGender;
    }
  }
  return next as T;
}

/** Treebank lemma → genders on its singular uses (plural-only nouns: any use). */
async function loadTreebankGenders(): Promise<Map<string, Set<NounGender>> | undefined> {
  if (!existsSync(TREEBANK_DIR)) return undefined;
  const singular = new Map<string, Set<NounGender>>();
  const plural = new Map<string, Set<NounGender>>();

  for (const file of readdirSync(TREEBANK_DIR).filter((name) =>
    name.endsWith(".conllu"),
  )) {
    for (const line of (await readFile(path.join(TREEBANK_DIR, file), "utf8")).split(
      "\n",
    )) {
      const columns = line.split("\t");
      if (columns.length < 6 || columns[3] !== "NOUN") continue;
      const features = new Map(
        columns[5]!.split("|").map((pair) => pair.split("=") as [string, string]),
      );
      const gender =
        features.get("Gender") === "Fem"
          ? "feminine"
          : features.get("Gender") === "Neut"
            ? "neuter"
            : features.get("Gender") === "Masc"
              ? features.get("Animacy") === "Anim"
                ? "masculine-animate"
                : "masculine-inanimate"
              : undefined;
      if (!gender) continue;
      // Animals take inanimate forms in the plural (psy), so animacy is read from the singular.
      const target = features.get("Number") === "Plur" ? plural : singular;
      const genders = target.get(columns[2]!) ?? new Set<NounGender>();
      genders.add(gender);
      target.set(columns[2]!, genders);
    }
  }

  for (const [lemma, genders] of plural)
    if (!singular.has(lemma)) singular.set(lemma, genders);
  return singular;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const words = JSON.parse(await readFile(WORDS_PATH, "utf8")) as WordSeed[];
  const exceptions = JSON.parse(
    await readFile(EXCEPTIONS_PATH, "utf8"),
  ) as NounGenderExceptions;
  validateExceptions(exceptions);

  const treebank = await loadTreebankGenders();
  const changes: string[] = [];
  const treebankDisagreements: string[] = [];
  const counts = { exception: 0, "ending-rule": 0, unset: 0 };

  const next = words.map((word) => {
    if (word.category !== "Nouns") return word;
    const { source, ...assigned } = assignNounGender(word.slovak, exceptions);
    counts[source] += 1;

    if (
      word.gender !== assigned.gender ||
      word.pluralOnlyGender !== assigned.pluralOnlyGender
    ) {
      changes.push(
        `  ${word.slovak} — ${word.english}: ${word.gender ?? "unset"} → ${assigned.gender ?? "unset"} (${source})`,
      );
    }

    const corpus = treebank?.get(word.slovak);
    const expected =
      assigned.gender === "plural-only" ? assigned.pluralOnlyGender : assigned.gender;
    if (corpus && expected && !corpus.has(expected)) {
      treebankDisagreements.push(
        `  ${word.slovak} — ${word.english}: ${expected}, treebank says ${[...corpus].join(" / ")}`,
      );
    }

    return withGender(word, assigned);
  });

  if (!dryRun) await writeFile(WORDS_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  console.log(
    `Nouns: ${counts.exception + counts["ending-rule"] + counts.unset} — ending rule ${counts["ending-rule"]}, exceptions ${counts.exception}, unset ${counts.unset}`,
  );
  console.log(`${dryRun ? "Would change" : "Changed"}: ${changes.length}`);
  for (const line of changes) console.log(line);

  if (!treebank) {
    console.log(`\nTreebank check skipped (no ${path.relative(ROOT, TREEBANK_DIR)}/).`);
  } else {
    console.log(`\nTreebank disagreements (${treebankDisagreements.length}) — review:`);
    for (const line of treebankDisagreements) console.log(line);
  }
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
