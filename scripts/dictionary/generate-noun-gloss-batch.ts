/**
 * Build content/frequency/noun-gloss-batch.json from tmp/missing-glosses.json.
 * Strategies: English Wiktionary Slovak noun section; mark colloquial labels.
 *
 * Usage: bun scripts/dictionary/generate-noun-gloss-batch.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { WordRegister } from "../../src/lib/catalog/types";
import { ROOT } from "../lib/paths";

const FREQUENCY_DIR = path.join(ROOT, "content", "frequency");
const MISSING_PATH = path.join(ROOT, "tmp", "missing-glosses.json");
const BATCH_PATH = path.join(FREQUENCY_DIR, "noun-gloss-batch.json");

const PAUSE_MS = 80;

interface Gloss {
  english: string;
  register?: WordRegister;
}

interface MissingRow {
  lemma: string;
  partOfSpeech: string;
  rank: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SLANG_LABEL = /\b(slang|argot|slangov)\b/i;
const COLLOQUIAL_LABEL = /\b(colloquial|informal|hovorov[oý]|hovorov[éea])\b/i;

function stripWikiMarkup(value: string): string {
  return value
    .replace(/\{\{[^}]+\}\}/g, " ")
    .replace(/\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]/g, "$1")
    .replace(/'{2,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSkNounGloss(wikitext: string): Gloss | null {
  const slovakBlock = wikitext.split("==Slovak==")[1];
  if (!slovakBlock) return null;
  const section = slovakBlock.split(/^==[^=]/m)[0] ?? slovakBlock;
  const nounBlock = section.split(/===Noun===/i)[1] ?? section;
  const nounSection = nounBlock.split(/^===/m)[0] ?? nounBlock;

  const defs = [...nounSection.matchAll(/^#\s+(.+)$/gm)]
    .map((match) => match[1]!.trim())
    .filter((line) => !line.startsWith("*") && !line.startsWith(":"));

  if (defs.length === 0) return null;

  const senses: string[] = [];
  let slang = false;
  let colloquial = false;

  for (const def of defs) {
    if (SLANG_LABEL.test(def)) slang = true;
    else if (COLLOQUIAL_LABEL.test(def)) colloquial = true;
    const cleaned = stripWikiMarkup(def)
      .replace(/^\((?:colloquial|informal|slang)\)\s*/i, "")
      .trim();
    if (cleaned.length < 2) continue;
    if (/^(plural|uncountable|countable|rare)$/i.test(cleaned)) continue;
    senses.push(cleaned);
    if (senses.length >= 2) break;
  }

  if (senses.length === 0) return null;

  const english = [...new Set(senses)].join("; ");
  if (slang) return { english, register: "slang" };
  if (colloquial) return { english, register: "colloquial" };
  return { english };
}

async function fetchWiktionaryGloss(lemma: string): Promise<Gloss | null> {
  const url =
    "https://en.wiktionary.org/w/api.php?action=query&titles=" +
    encodeURIComponent(lemma) +
    "&prop=revisions&rvprop=content&format=json&formatversion=2";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "slovak.wiki/1.0 (https://slovak.wiki)" },
      });
      if (!response.ok) {
        await sleep(500 * (attempt + 1));
        continue;
      }
      const json = (await response.json()) as {
        query?: { pages?: Array<{ revisions?: Array<{ content?: string }> }> };
      };
      const content = json.query?.pages?.[0]?.revisions?.[0]?.content ?? "";
      return extractSkNounGloss(content);
    } catch {
      await sleep(500 * (attempt + 1));
    }
  }
  return null;
}

async function main(): Promise<void> {
  const missing = JSON.parse(await readFile(MISSING_PATH, "utf8")) as MissingRow[];
  const nouns = missing.filter((row) => row.partOfSpeech === "noun");

  const batch: Record<string, Gloss> = {};
  const stillMissing: string[] = [];
  let fromWiki = 0;
  let colloquial = 0;
  let slang = 0;

  for (const { lemma } of nouns) {
    const wikiGloss = await fetchWiktionaryGloss(lemma);
    await sleep(PAUSE_MS);
    if (wikiGloss?.english) {
      batch[lemma] = wikiGloss;
      fromWiki += 1;
      if (wikiGloss.register === "colloquial") colloquial += 1;
      if (wikiGloss.register === "slang") slang += 1;
      continue;
    }
    stillMissing.push(lemma);
  }

  await writeFile(BATCH_PATH, `${JSON.stringify(batch, null, 2)}\n`, "utf8");

  if (stillMissing.length > 0) {
    const outPath = path.join(ROOT, "tmp", "noun-gloss-batch-failed.json");
    await writeFile(outPath, `${JSON.stringify(stillMissing, null, 2)}\n`, "utf8");
    console.warn(
      `Still missing ${stillMissing.length} glosses → ${path.relative(ROOT, outPath)}`,
    );
  }

  console.log(
    `Wrote ${Object.keys(batch).length} noun glosses → ${path.relative(ROOT, BATCH_PATH)}`,
  );
  console.log(
    `Wiktionary: ${fromWiki}; colloquial: ${colloquial}; slang: ${slang}; failed: ${stillMissing.length}`,
  );
}

await main();
