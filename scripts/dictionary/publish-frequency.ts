/**
 * Publish frequency lemmas that have English glosses into the live dictionary.
 * No approval gate — simple high-frequency words ship with glosses ready.
 *
 * Usage:
 *   bun run frequency:publish
 *   bun run frequency:publish -- --limit 100
 *
 * Add/edit glosses in content/frequency/glosses.json
 * See docs/data-sources.md
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { words } from "../../src/lib/content/data";
import type {
  FrequencyListFile,
  FrequencyPos,
} from "../../src/lib/content/frequency-types";
import { findLiveWordForLemma, lemmaToSlug } from "../../src/lib/content/frequency";
import type { ContentEntry } from "../../src/lib/content/types";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

interface Gloss {
  english: string;
  category?: string;
}

const FREQUENCY_DIR = path.join(ROOT, "content", "frequency");
const GLOSSES_PATH = path.join(FREQUENCY_DIR, "glosses.json");
const PROMOTED_PATH = path.join(ROOT, "content", "dictionary", "promoted.json");

const POS_FILES: Record<FrequencyPos, string> = {
  verb: "verbs.json",
  noun: "nouns.json",
  adjective: "adjectives.json",
};

const CATEGORY_BY_POS: Record<FrequencyPos, string> = {
  verb: "Verbs",
  noun: "Nouns",
  adjective: "Adjectives",
};

const POS_SLUG_SUFFIX: Record<FrequencyPos, string> = {
  verb: "v",
  noun: "n",
  adjective: "a",
};

function parseArgs(argv: string[]): { limit: number } {
  let limit = Number.POSITIVE_INFINITY;

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--limit" && argv[index + 1]) {
      limit = Number(argv[index + 1]);
      index += 1;
    }
  }

  return { limit };
}

/** Prefer bare slug; on collision append -v / -n / -a (štát → stat-n). */
function allocateSlug(
  lemma: string,
  pos: FrequencyPos,
  liveSlugs: Set<string>,
): string | undefined {
  const base = lemmaToSlug(lemma);
  if (!base) return undefined;
  if (!liveSlugs.has(base)) return base;

  const withPos = `${base}-${POS_SLUG_SUFFIX[pos]}`;
  if (!liveSlugs.has(withPos)) return withPos;

  let suffix = 2;
  while (liveSlugs.has(`${withPos}-${suffix}`)) suffix += 1;
  return `${withPos}-${suffix}`;
}

async function loadPromoted(): Promise<WordSeed[]> {
  try {
    return JSON.parse(await readFile(PROMOTED_PATH, "utf8")) as WordSeed[];
  } catch {
    return [];
  }
}

async function main(): Promise<void> {
  const { limit } = parseArgs(process.argv.slice(2));
  await mkdir(path.dirname(PROMOTED_PATH), { recursive: true });

  const glosses = JSON.parse(await readFile(GLOSSES_PATH, "utf8")) as Record<
    string,
    Gloss
  >;
  const promoted = await loadPromoted();
  const liveSlugs = new Set(words.map((word) => word.slug));
  const liveLemmas = new Set(words.map((word) => word.slovak.toLocaleLowerCase("sk")));

  for (const word of promoted) {
    liveSlugs.add(word.slug);
    liveLemmas.add(word.slovak.toLocaleLowerCase("sk"));
  }

  let added = 0;
  let skippedLive = 0;
  let missingGloss = 0;
  let disambiguated = 0;

  for (const pos of Object.keys(POS_FILES) as FrequencyPos[]) {
    const list = JSON.parse(
      await readFile(path.join(FREQUENCY_DIR, POS_FILES[pos]), "utf8"),
    ) as FrequencyListFile;

    for (const entry of list.entries.slice(0, limit)) {
      if (
        findLiveWordForLemma(entry.lemma, words) ||
        liveLemmas.has(entry.lemma.toLocaleLowerCase("sk"))
      ) {
        skippedLive += 1;
        continue;
      }

      const gloss = glosses[entry.lemma];
      if (!gloss?.english?.trim()) {
        missingGloss += 1;
        continue;
      }

      if (entry.lemma.trim().length <= 1) {
        skippedLive += 1;
        continue;
      }

      const baseSlug = lemmaToSlug(entry.lemma);
      const slug = allocateSlug(entry.lemma, pos, liveSlugs);
      if (!slug) {
        skippedLive += 1;
        continue;
      }

      if (slug !== baseSlug) disambiguated += 1;

      const seed: WordSeed = {
        slug,
        slovak: entry.lemma,
        english: gloss.english.trim(),
        category: gloss.category?.trim() || CATEGORY_BY_POS[pos],
        examples: [],
        related: [],
      };

      promoted.push(seed);
      liveSlugs.add(slug);
      liveLemmas.add(entry.lemma.toLocaleLowerCase("sk"));
      added += 1;
    }
  }

  await writeFile(PROMOTED_PATH, `${JSON.stringify(promoted, null, 2)}\n`, "utf8");
  console.log(
    `Published ${added} lemmas (${disambiguated} with POS slug suffix); already live ${skippedLive}; missing gloss ${missingGloss}`,
  );
  console.log(`→ ${path.relative(ROOT, PROMOTED_PATH)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
