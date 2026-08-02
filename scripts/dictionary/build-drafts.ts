/**
 * Build pending dictionary drafts from frequency lists.
 *
 * Optional: --with-tatoeba --tatoeba-dir tmp/tatoeba
 * Tatoeba dumps: https://tatoeba.org/en/downloads
 *                 https://downloads.tatoeba.org/exports/
 *
 * See docs/data-sources.md
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { words } from "../../src/lib/content/data";
import type { DraftEntry } from "../../src/lib/content/draft-types";
import type {
  FrequencyListFile,
  FrequencyPos,
} from "../../src/lib/content/frequency-types";
import { findLiveWordForLemma, lemmaToSlug } from "../../src/lib/content/frequency";
import { ROOT } from "../lib/paths";

const FREQUENCY_DIR = path.join(ROOT, "content", "frequency");
const DRAFTS_DIR = path.join(ROOT, "content", "drafts");

const DEFAULT_LIMIT = 100;

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

function parseArgs(argv: string[]): {
  limit: number;
  force: boolean;
  withTatoeba: boolean;
  tatoebaDir: string;
} {
  let limit = DEFAULT_LIMIT;
  let force = false;
  let withTatoeba = false;
  let tatoebaDir = path.join(ROOT, "tmp", "tatoeba");

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--force") force = true;
    if (arg === "--with-tatoeba") withTatoeba = true;
    if (arg === "--limit" && argv[index + 1]) {
      limit = Number(argv[index + 1]);
      index += 1;
    }
    if (arg === "--tatoeba-dir" && argv[index + 1]) {
      tatoebaDir = path.resolve(argv[index + 1]!);
      index += 1;
    }
  }

  return { limit, force, withTatoeba, tatoebaDir };
}

async function loadFrequency(pos: FrequencyPos): Promise<FrequencyListFile> {
  const raw = await readFile(path.join(FREQUENCY_DIR, POS_FILES[pos]), "utf8");
  return JSON.parse(raw) as FrequencyListFile;
}

async function readExistingDraft(slug: string): Promise<DraftEntry | undefined> {
  try {
    const raw = await readFile(path.join(DRAFTS_DIR, `${slug}.json`), "utf8");
    return JSON.parse(raw) as DraftEntry;
  } catch {
    return undefined;
  }
}

/** Minimal Tatoeba SK–EN matcher from local TSV dumps when present. */
async function loadTatoebaExamples(
  lemma: string,
  tatoebaDir: string,
): Promise<DraftEntry["examples"]> {
  const sentencesPath = path.join(tatoebaDir, "sentences.csv");
  const linksPath = path.join(tatoebaDir, "links.csv");

  let sentencesRaw: string;
  let linksRaw: string;

  try {
    sentencesRaw = await readFile(sentencesPath, "utf8");
    linksRaw = await readFile(linksPath, "utf8");
  } catch {
    console.warn(
      `Tatoeba dumps not found in ${tatoebaDir}. Download from https://tatoeba.org/en/downloads or https://downloads.tatoeba.org/exports/`,
    );
    return undefined;
  }

  const skSentences = new Map<number, string>();
  const enSentences = new Map<number, string>();

  for (const line of sentencesRaw.split(/\r?\n/)) {
    if (!line) continue;
    const [idRaw, lang, text] = line.split("\t");
    const id = Number(idRaw);
    if (!Number.isFinite(id) || !text) continue;
    if (lang === "slk") skSentences.set(id, text);
    if (lang === "eng") enSentences.set(id, text);
  }

  const links = new Map<number, number[]>();
  for (const line of linksRaw.split(/\r?\n/)) {
    if (!line) continue;
    const [fromRaw, toRaw] = line.split("\t");
    const from = Number(fromRaw);
    const to = Number(toRaw);
    if (!Number.isFinite(from) || !Number.isFinite(to)) continue;
    const list = links.get(from) ?? [];
    list.push(to);
    links.set(from, list);
  }

  const needle = lemma.toLocaleLowerCase("sk");
  const escaped = lemma.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordBoundary = new RegExp(`(^|[^\\p{L}])${escaped}([^\\p{L}]|$)`, "iu");

  const examples: NonNullable<DraftEntry["examples"]> = [];

  for (const [id, text] of skSentences) {
    if (text.length > 120 || text.length < 8) continue;
    if (!wordBoundary.test(text) && !text.toLocaleLowerCase("sk").includes(needle)) {
      continue;
    }

    const translationIds = links.get(id) ?? [];
    const englishId = translationIds.find((candidate) => enSentences.has(candidate));
    if (englishId === undefined) continue;

    const english = enSentences.get(englishId);
    if (!english || english.length > 140) continue;

    examples.push({ slovak: text, english, tatoebaId: id });
    if (examples.length >= 2) break;
  }

  return examples.length > 0 ? examples : undefined;
}

async function main(): Promise<void> {
  const { limit, force, withTatoeba, tatoebaDir } = parseArgs(process.argv.slice(2));
  await mkdir(DRAFTS_DIR, { recursive: true });

  let created = 0;
  let skipped = 0;
  let live = 0;

  for (const pos of Object.keys(POS_FILES) as FrequencyPos[]) {
    const list = await loadFrequency(pos);

    for (const entry of list.entries.slice(0, limit)) {
      if (findLiveWordForLemma(entry.lemma, words)) {
        live += 1;
        continue;
      }

      const slug = lemmaToSlug(entry.lemma);
      if (!slug) {
        console.warn(`Skip lemma with empty slug: ${entry.lemma}`);
        skipped += 1;
        continue;
      }

      const existing = await readExistingDraft(slug);
      if (existing && !force) {
        skipped += 1;
        continue;
      }

      const draft: DraftEntry = {
        status: "pending",
        slug,
        slovak: entry.lemma,
        category: CATEGORY_BY_POS[pos],
        pos,
        frequencyRank: entry.rank,
        sources: [entry.sourceUrl, entry.source],
      };

      if (withTatoeba) {
        draft.examples = await loadTatoebaExamples(entry.lemma, tatoebaDir);
        if (draft.examples?.length) {
          draft.sources.push("https://tatoeba.org/en/downloads");
        }
      }

      await writeFile(
        path.join(DRAFTS_DIR, `${slug}.json`),
        `${JSON.stringify(draft, null, 2)}\n`,
        "utf8",
      );
      created += 1;
    }
  }

  console.log(
    `Created/updated: ${created}; skipped existing: ${skipped}; already live: ${live}`,
  );
  console.log(`Drafts dir: ${path.relative(ROOT, DRAFTS_DIR)}`);
  if (withTatoeba) {
    console.log(`Tatoeba dir: ${tatoebaDir}`);
  }
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
