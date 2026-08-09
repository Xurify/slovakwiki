/**
 * One-shot: fill missing verb glosses for frequency ranks 1001–2000.
 * Strategies: ne-prefix from existing gloss, then English Wiktionary Slovak section.
 *
 * Usage: bun scripts/dictionary/bootstrap-verb-glosses.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";

const FREQUENCY_DIR = path.join(ROOT, "content", "frequency");
const GLOSSES_PATH = path.join(FREQUENCY_DIR, "glosses.json");
const MISSING_PATH = path.join(ROOT, "tmp", "missing-glosses.json");

const PAUSE_MS = 150;

interface Gloss {
  english: string;
}

interface MissingRow {
  lemma: string;
  partOfSpeech: string;
  rank: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function glossFromNePrefix(lemma: string, glosses: Record<string, Gloss>): string | null {
  if (!lemma.startsWith("ne")) return null;
  const base = lemma.slice(2);
  const baseGloss = glosses[base]?.english?.trim();
  if (!baseGloss) return null;

  const parts = baseGloss.split(";").map((part) => part.trim());
  const negated = parts.map((part) => {
    const lower = part.toLocaleLowerCase("en");
    if (lower.startsWith("not to ")) return part;
    if (lower.startsWith("to ")) return `not ${part}`;
    return `not to ${part}`;
  });
  return negated.join("; ");
}

function extractSkVerbGloss(wikitext: string): string | null {
  const slovakBlock = wikitext.split("==Slovak==")[1];
  if (!slovakBlock) return null;
  const section = slovakBlock.split(/^==[^=]/m)[0] ?? slovakBlock;

  const toDefs = [...section.matchAll(/^#\s+to\s+\[\[([^\]|#]+)/gm)].map((m) =>
    m[1].trim(),
  );
  const plainDefs = [...section.matchAll(/^#\s+\[\[([^\]|#]+)\]\]/gm)].map((m) =>
    m[1].trim(),
  );
  const tEn = [...section.matchAll(/\{\{t\+en\|([^}|]+)/g)].map((m) => m[1].trim());

  const words = (
    toDefs.length > 0 ? toDefs : plainDefs.length > 0 ? plainDefs : tEn
  ).filter((word) => word.length > 1 && !/^\d+$/.test(word));

  if (words.length === 0) return null;

  const unique = [...new Set(words)];
  return unique
    .slice(0, 2)
    .map((word) => (word.startsWith("to ") ? word : `to ${word}`))
    .join("; ");
}

async function fetchWiktionaryGloss(lemma: string): Promise<string | null> {
  const url =
    "https://en.wiktionary.org/w/api.php?action=query&titles=" +
    encodeURIComponent(lemma) +
    "&prop=revisions&rvprop=content&format=json&formatversion=2";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "slovak.wiki gloss bootstrap" },
      });
      if (!response.ok) {
        await sleep(500 * (attempt + 1));
        continue;
      }
      const json = (await response.json()) as {
        query?: { pages?: Array<{ revisions?: Array<{ content?: string }> }> };
      };
      const content = json.query?.pages?.[0]?.revisions?.[0]?.content ?? "";
      return extractSkVerbGloss(content);
    } catch {
      await sleep(500 * (attempt + 1));
    }
  }
  return null;
}

async function main(): Promise<void> {
  const glosses = JSON.parse(await readFile(GLOSSES_PATH, "utf8")) as Record<
    string,
    Gloss
  >;
  const missing = JSON.parse(await readFile(MISSING_PATH, "utf8")) as MissingRow[];
  const verbs = missing.filter((row) => row.partOfSpeech === "verb");

  let fromNe = 0;
  let fromWiki = 0;
  let stillMissing: string[] = [];

  for (const { lemma } of verbs) {
    if (glosses[lemma]?.english?.trim()) continue;

    const neGloss = glossFromNePrefix(lemma, glosses);
    if (neGloss) {
      glosses[lemma] = { english: neGloss };
      fromNe += 1;
      continue;
    }

    const wikiGloss = await fetchWiktionaryGloss(lemma);
    await sleep(PAUSE_MS);
    if (wikiGloss) {
      glosses[lemma] = { english: wikiGloss };
      fromWiki += 1;
      continue;
    }

    stillMissing.push(lemma);
  }

  if (stillMissing.length > 0) {
    const outPath = path.join(ROOT, "tmp", "gloss-bootstrap-failed.json");
    await writeFile(outPath, `${JSON.stringify(stillMissing, null, 2)}\n`, "utf8");
    console.warn(
      `Still missing ${stillMissing.length} glosses → ${path.relative(ROOT, outPath)}`,
    );
  }

  await writeFile(GLOSSES_PATH, `${JSON.stringify(glosses, null, 2)}\n`, "utf8");
  console.log(
    `Updated glosses.json — ne-prefix: ${fromNe}, wiktionary: ${fromWiki}, failed: ${stillMissing.length}`,
  );
}

await main();
