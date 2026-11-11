/**
 * Import common closed-class lemmas from the wty sk→en Wiktionary dictionary.
 *
 * The SNK frequency lists cover nouns, verbs, adjectives and adverbs only, so
 * pronouns, conjunctions, prepositions, particles, numerals and interjections
 * (nejaký, niečo, pretože, hoci, …) never reached the dictionary. wty is a
 * Yomitan build of English Wiktionary (via Kaikki), so it has those lemmas and
 * an English gloss for each.
 *
 * Selection: a lemma entry whose part of speech is in CLOSED_CLASS, that appears
 * in the OpenSubtitles sk_50k list within `--max-rank` (default 4000), is not
 * already live, and has a usable gloss. Entries are grouped by lemma, so a word
 * with two parts of speech (že conjunction + particle) becomes one row.
 *
 * Usage:
 *   bun scripts/dictionary/import-wiktionary.ts -- --dry-run
 *   bun scripts/dictionary/import-wiktionary.ts
 *   bun scripts/dictionary/import-wiktionary.ts -- --max-rank 5000
 *
 * Source: docs/data-sources.md → Wiktionary (English), via Kaikki and wty
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

import { words } from "../../src/lib/catalog/entries";
import { lemmaToSlug } from "../../src/lib/catalog/frequency";
import { FREQUENCY_PUBLISH_BLOCKLIST } from "../../src/lib/catalog/frequency/blocklist";
import type { WordRegister } from "../../src/lib/catalog/types";
import { ROOT } from "../lib/paths";

const WTY_URL =
  "https://huggingface.co/datasets/daxida/wty-release/resolve/main/latest/dict/sk/en/wty-sk-en.zip";
const SUBTITLES_URL =
  "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/sk/sk_50k.txt";
const WTY_CACHE = path.join(ROOT, "tmp", "wiktionary", "wty-sk-en.zip");
const SUBTITLES_CACHE = path.join(ROOT, "tmp", "opensubtitles", "sk_50k.txt");
const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");
const DEFAULT_MAX_RANK = 4000;

/** Browse bucket for function words; there is no pronoun/preposition chip. */
const CATEGORY = "Phrases";

const CLOSED_CLASS = new Set(["pron", "conj", "prep", "ptcl", "num", "intj"]);

/** Wiktionary labels that keep a word out of a learner dictionary. */
const SKIP_TAGS = new Set([
  "vulg",
  "offens",
  "derog",
  "arch",
  "obs",
  "obsolete",
  "rare",
  "dial",
  "dialectal",
  "regio",
  "sl",
  "slang",
]);

/**
 * Words left out on purpose. The value is the reason printed in the report.
 */
const SKIP_LEMMAS = new Map<string, string>([
  ["dofrasa", "expressive interjection, not learner vocabulary"],
  ["panebože", "exclamation, not learner vocabulary"],
  ["uhm", "filler sound, not a word to learn"],
]);

/**
 * Hand glosses where Wiktionary's definition is a grammatical description
 * rather than a translation (mostly prepositions). Keyed by the Slovak lemma.
 */
const GLOSS_OVERRIDES: Record<string, string> = {
  a: "and",
  ak: "if",
  akonáhle: "as soon as",
  alebo: "or",
  avšak: "however; but",
  by: "would (conditional particle)",
  bez: "without",
  buď: "either; or",
  cez: "through; across",
  či: "whether; if",
  čiže: "that is; in other words",
  čau: "hello; hi; bye",
  do: "into; to; until",
  hoci: "although",
  ich: "their; theirs",
  jeho: "his; its",
  jej: "her; hers",
  jeden: "one",
  každý: "each; every",
  keď: "when",
  keďže: "since; because",
  krát: "times; multiplied by",
  ktorý: "which; who; that",
  kvôli: "because of; for the sake of",
  kým: "while; until",
  lebo: "because",
  lenže: "but",
  medzi: "between; among",
  môj: "my; mine",
  na: "on; to; for",
  napriek: "despite; in spite of",
  nazdar: "hello; hi",
  náš: "our; ours",
  o: "about; on; at",
  od: "from; since",
  okrem: "except; besides",
  po: "after; around; along; up to; each",
  pod: "under; below",
  podľa: "according to",
  počas: "during",
  pokým: "while; until",
  pre: "for; because of",
  pretože: "because",
  pričom: "while; whereas",
  proti: "against",
  s: "with",
  skrz: "through",
  seba: "oneself",
  svoj: "one's own",
  taký: "such; so",
  takýto: "this kind of; such",
  takže: "so; therefore",
  taktiež: "also; likewise",
  ten: "this; that; the",
  tento: "this",
  títo: "these",
  to: "it; that",
  tvoj: "your; yours",
  váš: "your; yours",
  že: "that",
  z: "from; out of",
  zbohom: "goodbye",
  žiaden: "no; none",
};

const FORM_OF_GLOSS =
  /^(?:(?:alternative|obsolete|archaic|nonstandard|non-standard) form of|form of|inflection of|nominative|genitive|dative|accusative|locative|instrumental|singular|plural)\b/iu;
const LETTER_GLOSS =
  /^(?:the )?(?:\p{L}+ )?(?:letter|symbol|abbreviation|initialism) of\b/iu;

type YomitanNode =
  | string
  | {
      content?: YomitanNode | YomitanNode[];
      data?: { content?: string };
      tag?: string;
      title?: string;
    }
  | YomitanNode[];

type YomitanTerm = [
  string,
  string,
  string,
  string,
  number,
  Array<{ content: YomitanNode; type: string }>,
  number,
  string,
];

interface Candidate {
  english: string;
  lemma: string;
  partOfSpeech: string;
  rank: number;
  register?: WordRegister;
  tags: string[];
}

interface WordRow {
  category: string;
  english: string;
  examples: unknown[];
  origin?: string;
  register?: WordRegister;
  related: string[];
  slug: string;
  slovak: string;
}

/** Minimal ZIP reader: central directory + raw DEFLATE. */
function readZip(buffer: Buffer): Map<string, Buffer> {
  const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
  const CENTRAL_ENTRY = 0x02014b50;
  let end = -1;

  for (
    let at = buffer.length - 22;
    at >= Math.max(0, buffer.length - 22 - 0xffff);
    at -= 1
  ) {
    if (buffer.readUInt32LE(at) === END_OF_CENTRAL_DIRECTORY) {
      end = at;
      break;
    }
  }

  if (end < 0) throw new Error("wty zip: end of central directory not found");

  const count = buffer.readUInt16LE(end + 10);
  let offset = buffer.readUInt32LE(end + 16);
  const entries = new Map<string, Buffer>();

  for (let index = 0; index < count; index += 1) {
    if (buffer.readUInt32LE(offset) !== CENTRAL_ENTRY) {
      throw new Error("wty zip: bad central directory entry");
    }

    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);

    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const raw = buffer.subarray(start, start + compressedSize);
    const data = method === 0 ? Buffer.from(raw) : inflateRawSync(raw);

    entries.set(name, data);
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

/** Text of one gloss line, without usage labels or example sentences. */
function glossText(node: YomitanNode | undefined): string {
  if (node === undefined) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map((child) => glossText(child)).join("");

  const dataContent = node.data?.content;
  if (dataContent === "tags" || dataContent === "tag") return "";
  if (typeof dataContent === "string" && dataContent.startsWith("example")) return "";
  if (dataContent === "extra-info" || dataContent === "backlink") return "";
  if (node.tag === "details" || node.tag === "ol" || node.tag === "ul") return "";

  return glossText(node.content);
}

function cleanGloss(value: string): string {
  const gloss = value
    .replace(/\s+/gu, " ")
    .replace(/\s*\([^)]*\)/gu, "")
    .replace(/[.;:,]+$/u, "")
    .trim();

  if (!gloss || gloss.length > 70) return "";
  if (FORM_OF_GLOSS.test(gloss) || LETTER_GLOSS.test(gloss)) return "";
  return gloss;
}

function definitionGlosses(definition: { content: YomitanNode }): string[] {
  const root = Array.isArray(definition.content)
    ? definition.content
    : [definition.content];
  const glosses: string[] = [];

  for (const node of root) {
    if (typeof node !== "object" || Array.isArray(node) || node.tag !== "ol") continue;
    if (node.data?.content !== "glosses") continue;

    const items = Array.isArray(node.content)
      ? node.content
      : node.content === undefined
        ? []
        : [node.content];

    for (const item of items) {
      if (typeof item !== "object" || Array.isArray(item) || item.tag !== "li") continue;
      const first = Array.isArray(item.content) ? item.content[0] : item.content;
      const gloss = cleanGloss(glossText(first));
      if (gloss) glosses.push(gloss);
    }
  }

  return glosses;
}

function registerFor(tags: string[], current?: WordRegister): WordRegister | undefined {
  if (tags.includes("sl") || tags.includes("slang")) return "slang";
  if (tags.includes("col") || tags.includes("inf") || tags.includes("colloq")) {
    return "colloquial";
  }
  return current;
}

async function ensureFile(
  url: string,
  cachePath: string,
  label: string,
): Promise<Buffer> {
  try {
    return await readFile(cachePath);
  } catch {
    // Not cached yet.
  }

  await mkdir(path.dirname(cachePath), { recursive: true });
  console.log(`Downloading ${label} → ${path.relative(ROOT, cachePath)}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${label}: HTTP ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(cachePath, buffer);
  return buffer;
}

function loadSubtitleRanks(text: string): Map<string, number> {
  const ranks = new Map<string, number>();
  let rank = 0;

  for (const line of text.split(/\r?\n/u)) {
    const [form] = line.trim().split(/\s+/u);
    if (!form) continue;
    rank += 1;
    ranks.set(form.toLocaleLowerCase("sk"), rank);
  }

  return ranks;
}

function parseArgs(argv: string[]): { dryRun: boolean; maxRank: number } {
  const dryRun = argv.includes("--dry-run");
  let maxRank = DEFAULT_MAX_RANK;
  const index = argv.indexOf("--max-rank");

  if (index >= 0) {
    const parsed = Number(argv[index + 1]);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new Error(`--max-rank must be a positive integer; got ${argv[index + 1]}`);
    }
    maxRank = parsed;
  }

  return { dryRun, maxRank };
}

function allocateSlug(lemma: string, taken: Set<string>): string {
  const base = lemmaToSlug(lemma);
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-p${suffix > 2 ? `-${suffix}` : ""}`)) suffix += 1;
  return suffix === 2 ? `${base}-p` : `${base}-p-${suffix}`;
}

async function main(): Promise<void> {
  const { dryRun, maxRank } = parseArgs(process.argv.slice(2));
  const [zip, subtitles] = await Promise.all([
    ensureFile(WTY_URL, WTY_CACHE, "wty sk→en"),
    ensureFile(SUBTITLES_URL, SUBTITLES_CACHE, "OpenSubtitles sk_50k"),
  ]);

  const entries = readZip(zip);
  const termBanks = [...entries.entries()]
    .filter(([name]) => /^term_bank_\d+\.json$/u.test(name))
    .map(([, data]) => JSON.parse(data.toString("utf8")) as YomitanTerm[]);
  if (termBanks.length === 0) throw new Error("wty zip has no term banks");

  const subtitleRanks = loadSubtitleRanks(subtitles.toString("utf8"));
  const liveLemmas = new Set(words.map((word) => word.slovak.toLocaleLowerCase("sk")));
  const liveSlugs = new Set(words.map((word) => word.slug));
  const byLemma = new Map<string, Candidate>();

  for (const terms of termBanks) {
    for (const entry of terms) {
      const [lemma, , rawTags, , , definitions] = entry;
      if (!lemma || lemma !== lemma.trim()) continue;

      const tags = (rawTags ?? "").split(/\s+/u).filter(Boolean);
      if (tags.includes("non-lemma")) continue;

      const partOfSpeech = tags[0] ?? "";
      if (!CLOSED_CLASS.has(partOfSpeech)) continue;
      if (tags.some((tag) => SKIP_TAGS.has(tag))) continue;
      if (lemma.includes(" ")) continue;

      const key = lemma.toLocaleLowerCase("sk");
      if (SKIP_LEMMAS.has(key)) continue;
      if (FREQUENCY_PUBLISH_BLOCKLIST.has(key)) continue;
      if (liveLemmas.has(key)) continue;

      const rank = subtitleRanks.get(key);
      if (!rank || rank > maxRank) continue;

      const glosses = definitions.flatMap((definition) => definitionGlosses(definition));
      if (glosses.length === 0) continue;

      const existing = byLemma.get(key);
      const merged = existing?.english ? existing.english.split("; ") : [];
      const seen = new Set(merged.map((gloss) => gloss.toLocaleLowerCase("sk")));

      for (const gloss of glosses) {
        const glossKey = gloss.toLocaleLowerCase("sk");
        if (seen.has(glossKey)) continue;
        seen.add(glossKey);
        merged.push(gloss);
        if (merged.length >= 3) break;
      }

      byLemma.set(key, {
        english: GLOSS_OVERRIDES[lemma] ?? merged.join("; "),
        lemma,
        partOfSpeech,
        rank: Math.min(rank, existing?.rank ?? rank),
        register: registerFor(tags, existing?.register),
        tags: [...new Set([...(existing?.tags ?? []), ...tags])],
      });
    }
  }

  const candidates = [...byLemma.values()]
    .map((candidate) => ({
      ...candidate,
      english: GLOSS_OVERRIDES[candidate.lemma] ?? candidate.english,
    }))
    .filter((candidate) => candidate.english.trim().length > 0)
    .toSorted((first, second) => first.rank - second.rank);

  console.log(
    `${dryRun ? "Would add" : "Adding"} ${candidates.length} closed-class lemmas ` +
      `(OpenSubtitles rank ≤ ${maxRank})`,
  );
  for (const candidate of candidates) {
    console.log(
      `${String(candidate.rank).padStart(5)}  ${candidate.lemma.padEnd(16)} ` +
        `${candidate.partOfSpeech.padEnd(4)} ${candidate.english}` +
        (candidate.register ? `  [${candidate.register}]` : ""),
    );
  }

  if (dryRun) {
    console.log("Dry run: words.json unchanged.");
    return;
  }

  const dictionaryWords = JSON.parse(await readFile(WORDS_PATH, "utf8")) as WordRow[];
  const taken = new Set(liveSlugs);
  for (const word of dictionaryWords) taken.add(word.slug);

  const rows: WordRow[] = [];
  for (const candidate of candidates) {
    const slug = allocateSlug(candidate.lemma, taken);
    taken.add(slug);
    rows.push({
      slug,
      slovak: candidate.lemma,
      english: candidate.english,
      category: CATEGORY,
      origin: "wiktionary",
      ...(candidate.register ? { register: candidate.register } : {}),
      examples: [],
      related: [],
    });
  }

  await writeFile(
    WORDS_PATH,
    `${JSON.stringify([...dictionaryWords, ...rows], null, 2)}\n`,
    "utf8",
  );
  console.log(`Wrote ${rows.length} rows → ${path.relative(ROOT, WORDS_PATH)}`);
  console.log(
    "Next: add examples (tatoeba-api-examples.ts), then audio: bun scripts/audio/generate.ts -- --slugs <slugs> --missing-only",
  );
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
