/**
 * Import SNK top-1000 lemma frequency lists.
 *
 * Pivot: swap `fetchSnkFrequency` for a Tatoeba-rank importer later; keep
 * FrequencyListFile / FrequencyEntry shapes stable for UI + drafts.
 *
 * Sources: see docs/data-sources.md and src/lib/content/references.ts
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeLemma } from "../../src/lib/content/frequency";
import type {
  FrequencyListFile,
  FrequencyPos,
} from "../../src/lib/content/frequency-types";
import { referenceSources } from "../../src/lib/content/references";
import { parseSnkLemmaTable } from "../../src/lib/content/snk-frequency";
import { ROOT } from "../lib/paths";

const OUT_DIR = path.join(ROOT, "content", "frequency");

const SNK_INDEX =
  "https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/";

const SNK_CORPUS = "prim-8.0-public-all";
const SNK_SOURCE_NAME = "Slovak National Corpus (SNK)";

const POS_PATHS: Record<FrequencyPos, { file: string; path: string }> = {
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
};

async function fetchSnkFrequency(pos: FrequencyPos): Promise<FrequencyListFile> {
  const config = POS_PATHS[pos];
  const sourceUrl = `${SNK_INDEX}${config.path}`;
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`,
    );
  }

  const html = await response.text();
  const parsed = parseSnkLemmaTable(html, pos, sourceUrl);
  const entries = parsed.filter((entry) => entry.lemma.trim().length > 1);

  if (entries.length < 100) {
    throw new Error(
      `Expected ~1000 lemmas for ${pos}, got ${entries.length} from ${sourceUrl}`,
    );
  }

  return {
    corpus: SNK_CORPUS,
    generatedAt: new Date().toISOString(),
    pos,
    source: SNK_SOURCE_NAME,
    sourceUrl,
    entries,
  };
}

function buildLemmaIndex(
  lists: Record<FrequencyPos, FrequencyListFile>,
): Record<string, { pos: FrequencyPos; rank: number }> {
  const index: Record<string, { pos: FrequencyPos; rank: number }> = {};

  for (const pos of Object.keys(lists) as FrequencyPos[]) {
    for (const entry of lists[pos].entries) {
      const key = normalizeLemma(entry.lemma);
      const exactLower = entry.lemma.toLocaleLowerCase("sk");
      const hit = { rank: entry.rank, pos: entry.pos };

      const existing = index[key];
      if (!existing || entry.rank < existing.rank) {
        index[key] = hit;
      }

      const posKey = `${key}|${entry.pos}`;
      const existingPos = index[posKey];
      if (!existingPos || entry.rank < existingPos.rank) {
        index[posKey] = hit;
      }

      const exactKey = `exact:${exactLower}`;
      const existingExact = index[exactKey];
      if (!existingExact || entry.rank < existingExact.rank) {
        index[exactKey] = hit;
      }

      const exactPosKey = `exact:${exactLower}|${entry.pos}`;
      const existingExactPos = index[exactPosKey];
      if (!existingExactPos || entry.rank < existingExactPos.rank) {
        index[exactPosKey] = hit;
      }
    }
  }

  return index;
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });

  const lists = {} as Record<FrequencyPos, FrequencyListFile>;

  for (const pos of Object.keys(POS_PATHS) as FrequencyPos[]) {
    const list = await fetchSnkFrequency(pos);
    lists[pos] = list;
    const outPath = path.join(OUT_DIR, POS_PATHS[pos].file);
    await writeFile(outPath, `${JSON.stringify(list, null, 2)}\n`, "utf8");
    console.log(
      `Wrote ${list.entries.length} ${pos} lemmas → ${path.relative(ROOT, outPath)}`,
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
