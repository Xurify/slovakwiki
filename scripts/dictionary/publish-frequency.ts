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
  for (const word of promoted) liveSlugs.add(word.slug);

  let added = 0;
  let skippedLive = 0;
  let missingGloss = 0;

  for (const pos of Object.keys(POS_FILES) as FrequencyPos[]) {
    const list = JSON.parse(
      await readFile(path.join(FREQUENCY_DIR, POS_FILES[pos]), "utf8"),
    ) as FrequencyListFile;

    for (const entry of list.entries.slice(0, limit)) {
      if (findLiveWordForLemma(entry.lemma, words)) {
        skippedLive += 1;
        continue;
      }

      const gloss = glosses[entry.lemma];
      if (!gloss?.english?.trim()) {
        missingGloss += 1;
        continue;
      }

      const slug = lemmaToSlug(entry.lemma);
      if (!slug || entry.lemma.length <= 1 || liveSlugs.has(slug)) {
        skippedLive += 1;
        continue;
      }

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
      added += 1;
    }
  }

  await writeFile(PROMOTED_PATH, `${JSON.stringify(promoted, null, 2)}\n`, "utf8");
  console.log(
    `Published ${added} lemmas; already live ${skippedLive}; missing gloss ${missingGloss}`,
  );
  console.log(`→ ${path.relative(ROOT, PROMOTED_PATH)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
