/**
 * Build content/frequency/verb-gloss-supplement.json from tmp/need-glosses.json.
 * Strategies: manual overrides, ne-prefix from glosses.json + verb-gloss-batch.json,
 * then English Wiktionary Slovak section.
 *
 * Usage: bun scripts/dictionary/generate-verb-gloss-supplement.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";

const FREQUENCY_DIR = path.join(ROOT, "content", "frequency");
const GLOSSES_PATH = path.join(FREQUENCY_DIR, "glosses.json");
const BATCH_PATH = path.join(FREQUENCY_DIR, "verb-gloss-batch.json");
const NEED_PATH = path.join(ROOT, "tmp", "need-glosses.json");
const SUPPLEMENT_PATH = path.join(FREQUENCY_DIR, "verb-gloss-supplement.json");

const PAUSE_MS = 100;

/** Learner-facing overrides when Wiktionary is missing or imprecise. */
const OVERRIDES: Record<string, string> = {
  všímať: "to notice; to pay attention",
  obmedzovať: "to limit; to restrict",
  pripúšťať: "to admit; to allow",
  poslúžiť: "to serve; to be useful",
  sústreďovať: "to concentrate; to focus",
  dobehnúť: "to catch up; to reach",
  zaspievať: "to sing (to sleep)",
  priťahovať: "to attract; to pull toward",
  bodovať: "to score (points)",
  zmierniť: "to ease; to mitigate",
  rušiť: "to cancel; to disturb",
  rozbiť: "to break; to smash",
  uzatvoriť: "to close; to conclude",
  zmocniť: "to seize; to empower",
  zdržať: "to detain; to delay",
  doručiť: "to deliver",
  pripisovať: "to attribute; to credit",
  previezť: "to transport; to give a ride",
  vykríknuť: "to shout out; to cry out",
  spáchať: "to commit (a crime)",
  zrútiť: "to collapse; to demolish",
  oslabiť: "to weaken",
  zaregistrovať: "to register",
  chutiť: "to taste good",
  dbať: "to care; to pay attention",
  vyradiť: "to eliminate; to exclude",
  poprosiť: "to ask (politely)",
  dodržať: "to observe; to keep (a rule)",
  produkovať: "to produce",
  povoliť: "to allow; to permit",
  priložiť: "to attach; to enclose",
  zhodovať: "to match; to agree",
  spomaliť: "to slow down",
  mieniť: "to mean; to intend",
  oživiť: "to revive; to enliven",
  prebojovať: "to fight through",
  maľovať: "to paint",
  oženiť: "to marry off (a son)",
  prilákať: "to attract",
  podrobiť: "to subdue; to subject",
  vyčleniť: "to allocate; to set aside",
  preskúmať: "to examine; to investigate",
  dopriať: "to grant; to afford",
  spresniť: "to specify; to clarify",
  prezrádzať: "to betray; to reveal",
  nadväzovať: "to continue; to build on",
  ničiť: "to destroy; to ruin",
  oddýchnuť: "to rest; to take a breath",
  poklesnúť: "to decrease; to drop",
  neváhať: "not to hesitate",
  nevládať: "not to know how; not to control",
  nemieniť: "not to intend; not to mean",
  netajiť: "not to conceal; not to hide",
  nevylučovať: "not to exclude; not to rule out",
  nevšímať: "not to notice; not to pay attention",
  nevzdávať: "not to give up; not to surrender",
  nevadiť: "not to bother; not to mind",
  neodvážiť: "not to dare",
  neublížiť: "not to harm; not to hurt",
  nepozdávať: "not to agree; not to consider appropriate",
  nezaváhať: "not to hesitate",
  nepripúšťať: "not to admit; not to allow",
  nedbať: "not to care; not to pay attention",
};

interface Gloss {
  english: string;
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

  const toBracket = [...section.matchAll(/^#\s+to\s+\[\[([^\]|#]+)/gm)].map((m) =>
    m[1].trim(),
  );
  const toPlain = [...section.matchAll(/^#\s+to\s+([A-Za-z][\w-]*)/gm)].map((m) =>
    m[1].trim(),
  );
  const plainDefs = [...section.matchAll(/^#\s+\[\[([^\]|#]+)\]\]/gm)].map((m) =>
    m[1].trim(),
  );
  const tEn = [...section.matchAll(/\{\{t\+en\|([^}|]+)/g)].map((m) => m[1].trim());

  const words = (
    toBracket.length > 0
      ? toBracket
      : toPlain.length > 0
        ? toPlain
        : plainDefs.length > 0
          ? plainDefs
          : tEn
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
  const batch = JSON.parse(await readFile(BATCH_PATH, "utf8")) as Record<string, Gloss>;
  const need = JSON.parse(await readFile(NEED_PATH, "utf8")) as string[];

  const known = { ...glosses, ...batch };
  const supplement: Record<string, Gloss> = {};
  let fromOverride = 0;
  let fromNe = 0;
  let fromWiki = 0;
  const stillMissing: string[] = [];

  for (let i = 0; i < need.length; i += 1) {
    const lemma = need[i];
    if (!lemma) continue;

    if (OVERRIDES[lemma]) {
      supplement[lemma] = { english: OVERRIDES[lemma] };
      fromOverride += 1;
      continue;
    }

    const neGloss = glossFromNePrefix(lemma, { ...known, ...supplement });
    if (neGloss) {
      supplement[lemma] = { english: neGloss };
      fromNe += 1;
      continue;
    }

    const wikiGloss = await fetchWiktionaryGloss(lemma);
    await sleep(PAUSE_MS);
    if (wikiGloss) {
      supplement[lemma] = { english: wikiGloss };
      fromWiki += 1;
      if ((i + 1) % 50 === 0) {
        console.log(`Progress: ${i + 1}/${need.length} (wiki: ${fromWiki})`);
      }
      continue;
    }

    stillMissing.push(lemma);
    console.warn(`Missing gloss for: ${lemma}`);
  }

  await writeFile(SUPPLEMENT_PATH, `${JSON.stringify(supplement, null, 2)}\n`, "utf8");

  if (stillMissing.length > 0) {
    const outPath = path.join(ROOT, "tmp", "verb-gloss-supplement-failed.json");
    await writeFile(outPath, `${JSON.stringify(stillMissing, null, 2)}\n`, "utf8");
    console.warn(
      `Still missing ${stillMissing.length} glosses → ${path.relative(ROOT, outPath)}`,
    );
  }

  console.log(
    `Wrote ${Object.keys(supplement).length} glosses → ${path.relative(ROOT, SUPPLEMENT_PATH)}`,
  );
  console.log(
    `Sources — override: ${fromOverride}, ne-prefix: ${fromNe}, wiktionary: ${fromWiki}, failed: ${stillMissing.length}`,
  );
}

await main();
