/**
 * Import SNK frequency lists: noun top-3000 and verb top-2000 from full count dumps,
 * adjective/adverb top-1000 from the existing HTML lists.
 *
 * Pivot: swap `fetchSnkFrequency` for a Tatoeba-rank importer later; keep
 * FrequencyListFile / FrequencyEntry shapes stable for UI + drafts.
 *
 * Sources: see docs/data-sources.md and src/lib/catalog/data-sources/catalog.ts
 */

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { normalizeLemma } from "../../src/lib/catalog/frequency";
import type {
  FrequencyListFile,
  FrequencyPartOfSpeech,
} from "../../src/lib/catalog/frequency/types";
import { referenceSources } from "../../src/lib/catalog/data-sources/catalog";
import {
  isLikelyProperNoun,
  parseSnkCountLemmaDump,
  parseSnkLemmaTable,
  PROPER_NOUN_ALLOWLIST,
  selectFrequencyHead,
} from "../../src/lib/catalog/frequency/snk";
import { ROOT } from "../lib/paths";

const OUT_DIR = path.join(ROOT, "content", "frequency");
const SNK_CACHE_DIR = path.join(ROOT, "tmp", "snk");
const SNK_NOUN_CACHE = path.join(
  SNK_CACHE_DIR,
  "prim-8.0-public-all-S-lemma-frequency.bz2",
);
const SNK_VERB_CACHE = path.join(
  SNK_CACHE_DIR,
  "prim-8.0-public-all-V-lemma-frequency.bz2",
);
const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const Bunzip = require("seek-bzip") as { decode(input: Buffer): Buffer };

const SNK_INDEX =
  "https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/";

const SNK_CORPUS = "prim-8.0-public-all";
const SNK_SOURCE_NAME = "Slovak National Corpus (SNK)";
const SNK_NOUN_DUMP =
  "https://korpus.juls.savba.sk/files/prim-8.0/tag/prim-8.0-public-all-S-lemma-frequency.bz2";
const SNK_VERB_DUMP =
  "https://korpus.juls.savba.sk/files/prim-8.0/tag/prim-8.0-public-all-V-lemma-frequency.bz2";
const DEFAULT_NOUN_LIMIT = 3000;
const DEFAULT_VERB_LIMIT = 2000;

const PART_OF_SPEECH_PATHS: Record<
  FrequencyPartOfSpeech,
  { file: string; path: string }
> = {
  verb: {
    file: "verbs.json",
    path: "prim-8-0-public-all-verbums-top-1000-lemmas/",
  },
  noun: {
    file: "nouns.json",
    path: "prim-8-0-public-all-substantives-top-1000-lemmas/",
  },
  adjective: {
    file: "adjectives.json",
    path: "prim-8-0-public-all-adjectives-top-1000-lemmas/",
  },
  adverb: {
    file: "adverbs.json",
    path: "prim-8-0-public-all-adverbs-top-1000-lemmas/",
  },
};

async function fetchSnkFrequency(
  partOfSpeech: FrequencyPartOfSpeech,
  options: { nounLimit: number; verbLimit: number; force: boolean },
): Promise<FrequencyListFile> {
  if (partOfSpeech === "noun") {
    const compressed = await getLemmaDump(
      SNK_NOUN_CACHE,
      SNK_NOUN_DUMP,
      options.force,
      "noun",
    );
    const dump = Bunzip.decode(compressed).toString("utf8");
    const parsed = parseSnkCountLemmaDump(dump, partOfSpeech, SNK_NOUN_DUMP);
    const skippedProperNouns = parsed.filter(
      (entry) =>
        isLikelyProperNoun(entry.lemma) && !PROPER_NOUN_ALLOWLIST.has(entry.lemma),
    ).length;
    const entries = selectFrequencyHead(parsed, options.nounLimit, {
      skipProperNouns: true,
    });

    console.log(
      `Skipped ${skippedProperNouns} likely proper nouns before noun head selection`,
    );

    return {
      corpus: SNK_CORPUS,
      generatedAt: new Date().toISOString(),
      partOfSpeech,
      source: SNK_SOURCE_NAME,
      sourceUrl: SNK_NOUN_DUMP,
      entries,
    };
  }

  if (partOfSpeech === "verb") {
    const compressed = await getLemmaDump(
      SNK_VERB_CACHE,
      SNK_VERB_DUMP,
      options.force,
      "verb",
    );
    const dump = Bunzip.decode(compressed).toString("utf8");
    const parsed = parseSnkCountLemmaDump(dump, partOfSpeech, SNK_VERB_DUMP);
    const entries = selectFrequencyHead(parsed, options.verbLimit).filter(
      (entry) => entry.lemma.trim().length > 1,
    );

    if (entries.length < 100) {
      throw new Error(
        `Expected ~${options.verbLimit} verb lemmas, got ${entries.length} from ${SNK_VERB_DUMP}`,
      );
    }

    return {
      corpus: SNK_CORPUS,
      generatedAt: new Date().toISOString(),
      partOfSpeech,
      source: SNK_SOURCE_NAME,
      sourceUrl: SNK_VERB_DUMP,
      entries,
    };
  }

  const config = PART_OF_SPEECH_PATHS[partOfSpeech];
  const sourceUrl = `${SNK_INDEX}${config.path}`;
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`,
    );
  }

  const html = await response.text();
  const parsed = parseSnkLemmaTable(html, partOfSpeech, sourceUrl);
  const entries = parsed.filter((entry) => entry.lemma.trim().length > 1);

  if (entries.length < 100) {
    throw new Error(
      `Expected ~1000 lemmas for ${partOfSpeech}, got ${entries.length} from ${sourceUrl}`,
    );
  }

  return {
    corpus: SNK_CORPUS,
    generatedAt: new Date().toISOString(),
    partOfSpeech,
    source: SNK_SOURCE_NAME,
    sourceUrl,
    entries,
  };
}

async function getLemmaDump(
  cachePath: string,
  dumpUrl: string,
  force: boolean,
  label: string,
): Promise<Buffer> {
  await mkdir(SNK_CACHE_DIR, { recursive: true });

  if (!force) {
    try {
      await access(cachePath);
      console.log(`Using cached SNK ${label} dump → ${path.relative(ROOT, cachePath)}`);
      return await readFile(cachePath);
    } catch {
      // Cache miss: download below.
    }
  }

  console.log(
    `Downloading SNK ${label} dump with curl.exe → ${path.relative(ROOT, cachePath)}`,
  );
  await execFileAsync("curl.exe", [
    "-k",
    "-L",
    "--fail",
    "--silent",
    "--show-error",
    "-o",
    cachePath,
    dumpUrl,
  ]);
  return await readFile(cachePath);
}

function buildLemmaIndex(
  lists: Record<FrequencyPartOfSpeech, FrequencyListFile>,
): Record<string, { partOfSpeech: FrequencyPartOfSpeech; rank: number }> {
  const index: Record<string, { partOfSpeech: FrequencyPartOfSpeech; rank: number }> = {};

  for (const partOfSpeech of Object.keys(lists) as FrequencyPartOfSpeech[]) {
    for (const entry of lists[partOfSpeech].entries) {
      const key = normalizeLemma(entry.lemma);
      const exactLower = entry.lemma.toLocaleLowerCase("sk");
      const hit = { rank: entry.rank, partOfSpeech: entry.partOfSpeech };

      const existing = index[key];
      if (!existing || entry.rank < existing.rank) {
        index[key] = hit;
      }

      const partOfSpeechKey = `${key}|${entry.partOfSpeech}`;
      const existingPartOfSpeech = index[partOfSpeechKey];
      if (!existingPartOfSpeech || entry.rank < existingPartOfSpeech.rank) {
        index[partOfSpeechKey] = hit;
      }

      const exactKey = `exact:${exactLower}`;
      const existingExact = index[exactKey];
      if (!existingExact || entry.rank < existingExact.rank) {
        index[exactKey] = hit;
      }

      const exactPartOfSpeechKey = `exact:${exactLower}|${entry.partOfSpeech}`;
      const existingExactPartOfSpeech = index[exactPartOfSpeechKey];
      if (!existingExactPartOfSpeech || entry.rank < existingExactPartOfSpeech.rank) {
        index[exactPartOfSpeechKey] = hit;
      }
    }
  }

  return index;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const nounLimitIndex = args.indexOf("--noun-limit");
  const nounLimit =
    nounLimitIndex >= 0 && args[nounLimitIndex + 1]
      ? Number(args[nounLimitIndex + 1])
      : DEFAULT_NOUN_LIMIT;
  const verbLimitIndex = args.indexOf("--verb-limit");
  const verbLimit =
    verbLimitIndex >= 0 && args[verbLimitIndex + 1]
      ? Number(args[verbLimitIndex + 1])
      : DEFAULT_VERB_LIMIT;
  const force = args.includes("--force");

  if (!Number.isInteger(nounLimit) || nounLimit < 1) {
    throw new Error(`--noun-limit must be a positive integer; got ${nounLimit}`);
  }
  if (!Number.isInteger(verbLimit) || verbLimit < 1) {
    throw new Error(`--verb-limit must be a positive integer; got ${verbLimit}`);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const lists = {} as Record<FrequencyPartOfSpeech, FrequencyListFile>;

  for (const partOfSpeech of Object.keys(
    PART_OF_SPEECH_PATHS,
  ) as FrequencyPartOfSpeech[]) {
    const list = await fetchSnkFrequency(partOfSpeech, { nounLimit, verbLimit, force });
    lists[partOfSpeech] = list;
    const outPath = path.join(OUT_DIR, PART_OF_SPEECH_PATHS[partOfSpeech].file);
    await writeFile(outPath, `${JSON.stringify(list, null, 2)}\n`, "utf8");
    console.log(
      `Wrote ${list.entries.length} ${partOfSpeech} lemmas → ${path.relative(ROOT, outPath)}`,
    );
  }

  const lemmaIndex = buildLemmaIndex(lists);
  const indexPath = path.join(OUT_DIR, "lemma-index.json");
  await writeFile(indexPath, `${JSON.stringify(lemmaIndex)}\n`, "utf8");
  console.log(
    `Wrote lemma index (${Object.keys(lemmaIndex).length} keys) → ${path.relative(ROOT, indexPath)}`,
  );

  const snk = referenceSources.find((source) => source.id === "snk-frequency");
  console.log("\nAttributed to:", snk?.name ?? SNK_SOURCE_NAME);
  console.log("Docs: docs/data-sources.md");
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
