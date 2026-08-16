/**
 * Publish frequency lemmas that have English glosses into the live dictionary.
 * No approval gate — simple high-frequency words ship with glosses ready.
 *
 * Usage:
 *   bun scripts/dictionary/publish-frequency.ts
 *   bun scripts/dictionary/publish-frequency.ts -- --limit 100
 *   bun scripts/dictionary/publish-frequency.ts -- --dry-run --limit 100
 *
 * Add/edit glosses in content/frequency/glosses.json
 * See docs/data-sources.md
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { words } from "../../src/lib/catalog/entries";
import type {
  FrequencyListFile,
  FrequencyPartOfSpeech,
} from "../../src/lib/catalog/frequency/types";
import { findLiveWordForLemma, lemmaToSlug } from "../../src/lib/catalog/frequency";
import { FREQUENCY_PUBLISH_BLOCKLIST } from "../../src/lib/catalog/frequency/blocklist";
import {
  dialectLookupFlag,
  isWordRegister,
  type ContentEntry,
  type WordRegister,
} from "../../src/lib/catalog/types";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  | "slug"
  | "slovak"
  | "english"
  | "category"
  | "examples"
  | "related"
  | "topics"
  | "register"
  | "dialect"
>;

interface Gloss {
  english: string;
  /** Browse override — only `Places` (or other browse buckets) are honored. */
  category?: string;
  register?: WordRegister;
  dialect?: true;
}

const FREQUENCY_DIR = path.join(ROOT, "content", "frequency");
const GLOSSES_PATH = path.join(FREQUENCY_DIR, "glosses.json");
const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");

const PART_OF_SPEECH_FILES: Record<FrequencyPartOfSpeech, string> = {
  verb: "verbs.json",
  noun: "nouns.json",
  adjective: "adjectives.json",
  adverb: "adverbs.json",
};

const CATEGORY_BY_PART_OF_SPEECH: Record<FrequencyPartOfSpeech, string> = {
  verb: "Verbs",
  noun: "Nouns",
  adjective: "Adjectives",
  adverb: "Adverbs",
};

/** Gloss `category` overrides allowed on publish (themes belong in curated `topics`). */
const BROWSE_CATEGORY_OVERRIDES = new Set([
  "Verbs",
  "Nouns",
  "Adjectives",
  "Adverbs",
  "Places",
  "Phrases",
]);

function resolvePublishCategory(
  gloss: Gloss,
  partOfSpeech: FrequencyPartOfSpeech,
): string {
  const override = gloss.category?.trim();
  if (override && BROWSE_CATEGORY_OVERRIDES.has(override)) return override;
  return CATEGORY_BY_PART_OF_SPEECH[partOfSpeech];
}

const PART_OF_SPEECH_SLUG_SUFFIX: Record<FrequencyPartOfSpeech, string> = {
  verb: "v",
  noun: "n",
  adjective: "a",
  adverb: "adv",
};

function parseArgs(argv: string[]): { dryRun: boolean; limit: number } {
  let limit = Number.POSITIVE_INFINITY;
  const dryRun = argv.includes("--dry-run");

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--limit" && argv[index + 1]) {
      limit = Number(argv[index + 1]);
      index += 1;
    }
  }

  return { dryRun, limit };
}

/** Prefer bare slug; on collision append -v / -n / -a / -adv (štát → stat-n). */
function allocateSlug(
  lemma: string,
  partOfSpeech: FrequencyPartOfSpeech,
  liveSlugs: Set<string>,
): string | undefined {
  const base = lemmaToSlug(lemma);
  if (!base) return undefined;
  if (!liveSlugs.has(base)) return base;

  const withPartOfSpeech = `${base}-${PART_OF_SPEECH_SLUG_SUFFIX[partOfSpeech]}`;
  if (!liveSlugs.has(withPartOfSpeech)) return withPartOfSpeech;

  let suffix = 2;
  while (liveSlugs.has(`${withPartOfSpeech}-${suffix}`)) suffix += 1;
  return `${withPartOfSpeech}-${suffix}`;
}

async function loadWords(): Promise<WordSeed[]> {
  try {
    return JSON.parse(await readFile(WORDS_PATH, "utf8")) as WordSeed[];
  } catch {
    return [];
  }
}

async function main(): Promise<void> {
  const { dryRun, limit } = parseArgs(process.argv.slice(2));
  await mkdir(path.dirname(WORDS_PATH), { recursive: true });

  const glosses = JSON.parse(await readFile(GLOSSES_PATH, "utf8")) as Record<
    string,
    Gloss
  >;
  const dictionaryWords = await loadWords();
  const liveSlugs = new Set(words.map((word) => word.slug));
  const liveLemmas = new Set(words.map((word) => word.slovak.toLocaleLowerCase("sk")));

  for (const word of dictionaryWords) {
    liveSlugs.add(word.slug);
    liveLemmas.add(word.slovak.toLocaleLowerCase("sk"));
  }

  let added = 0;
  let skippedLive = 0;
  let missingGloss = 0;
  let disambiguated = 0;
  const addedLemmas: string[] = [];

  for (const partOfSpeech of Object.keys(
    PART_OF_SPEECH_FILES,
  ) as FrequencyPartOfSpeech[]) {
    const list = JSON.parse(
      await readFile(
        path.join(FREQUENCY_DIR, PART_OF_SPEECH_FILES[partOfSpeech]),
        "utf8",
      ),
    ) as FrequencyListFile;

    for (const entry of list.entries.slice(0, limit)) {
      const preferredCategory = CATEGORY_BY_PART_OF_SPEECH[partOfSpeech];
      const liveSamePartOfSpeech = findLiveWordForLemma(entry.lemma, words, partOfSpeech);
      if (liveSamePartOfSpeech?.category === preferredCategory) {
        skippedLive += 1;
        continue;
      }

      // Adverbs may share spelling with nouns/adjectives/phrases (málo, slovensky).
      // Other POS keep the original one-lemma-per-spelling gate.
      if (
        partOfSpeech !== "adverb" &&
        (findLiveWordForLemma(entry.lemma, words) ||
          liveLemmas.has(entry.lemma.toLocaleLowerCase("sk")))
      ) {
        skippedLive += 1;
        continue;
      }

      if (FREQUENCY_PUBLISH_BLOCKLIST.has(entry.lemma.toLocaleLowerCase("sk"))) {
        skippedLive += 1;
        continue;
      }

      const gloss = glosses[entry.lemma];
      if (!gloss?.english?.trim()) {
        missingGloss += 1;
        continue;
      }

      // Person names / surnames are not dictionary headwords.
      const glossCategory = gloss.category?.trim();
      if (
        glossCategory === "Names" ||
        /\b(given name|surname|family name|first name|last name)\b/i.test(gloss.english)
      ) {
        skippedLive += 1;
        continue;
      }

      if (entry.lemma.trim().length <= 1) {
        skippedLive += 1;
        continue;
      }

      const baseSlug = lemmaToSlug(entry.lemma);
      const slug = allocateSlug(entry.lemma, partOfSpeech, liveSlugs);
      if (!slug) {
        skippedLive += 1;
        continue;
      }

      if (slug !== baseSlug) disambiguated += 1;

      const seed: WordSeed = {
        slug,
        slovak: entry.lemma,
        english: gloss.english.trim(),
        category: resolvePublishCategory(gloss, partOfSpeech),
        examples: [],
        related: [],
        ...(isWordRegister(gloss.register) ? { register: gloss.register } : {}),
        ...dialectLookupFlag(gloss),
      };

      dictionaryWords.push(seed);
      liveSlugs.add(slug);
      liveLemmas.add(entry.lemma.toLocaleLowerCase("sk"));
      addedLemmas.push(entry.lemma);
      added += 1;
    }
  }

  if (!dryRun) {
    await writeFile(WORDS_PATH, `${JSON.stringify(dictionaryWords, null, 2)}\n`, "utf8");
  }
  console.log(
    `${dryRun ? "Would add" : "Published"} ${added} lemmas (${disambiguated} with part-of-speech slug suffix); already live ${skippedLive}; missing gloss ${missingGloss}`,
  );
  if (dryRun) {
    const sample = addedLemmas.slice(0, 20);
    console.log(`Sample (${sample.length}): ${sample.join(", ")}`);
  } else {
    console.log(`→ ${path.relative(ROOT, WORDS_PATH)}`);
  }
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
