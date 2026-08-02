/**
 * Attach Tatoeba SK–EN example sentences to promoted dictionary words.
 *
 * Downloads expected in tmp/tatoeba/ (see docs/data-sources.md):
 *   slk_sentences.tsv, eng_sentences.tsv, slk-eng_links.tsv
 *
 * Usage:
 *   bun run examples:enrich
 *   bun run examples:enrich -- --per-word 3 --report tmp/missing-examples.txt
 */

import { createReadStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

import type { ContentEntry, Example } from "../../src/lib/content/types";
import { isCleanExample } from "../../src/lib/content/example-quality";
import { normalizeLemma } from "../../src/lib/content/frequency";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

interface SentencePair {
  english: string;
  slovak: string;
  tatoebaId: number;
}

const TATOEBA_DIR = path.join(ROOT, "tmp", "tatoeba");
const PROMOTED_PATH = path.join(ROOT, "content", "dictionary", "promoted.json");

const TOKEN_RE = /[\p{L}\p{M}]+/gu;

function parseArgs(argv: string[]): { perWord: number; report: string; force: boolean } {
  let perWord = 3;
  let report = path.join(ROOT, "tmp", "missing-examples.txt");
  let force = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--force") force = true;
    if (arg === "--per-word" && argv[index + 1]) {
      perWord = Number(argv[index + 1]);
      index += 1;
    }
    if (arg === "--report" && argv[index + 1]) {
      report = path.resolve(argv[index + 1]!);
      index += 1;
    }
  }

  return { perWord, report, force };
}

function tokenize(text: string): string[] {
  return (text.match(TOKEN_RE) ?? []).map((token) => token.toLocaleLowerCase("sk"));
}

function verbStem(lemma: string): string | undefined {
  const lower = lemma.toLocaleLowerCase("sk");
  if (!lower.endsWith("ť") || lower.length < 5) return undefined;
  const stem = lower.slice(0, -1);
  return stem.length >= 4 ? stem : undefined;
}

function scorePair(pair: SentencePair, lemma: string): number {
  let score = 0;
  const length = pair.slovak.length;
  if (length >= 12 && length <= 90) score += 3;
  else if (length <= 120) score += 1;
  if (lemmaAppearsAsToken(pair.slovak, lemma)) score += 6;
  else if (pair.slovak.toLocaleLowerCase("sk").includes(lemma.toLocaleLowerCase("sk")))
    score += 1;
  if (/[.!?]$/.test(pair.slovak.trim())) score += 1;
  return score;
}

function lemmaAppearsAsToken(text: string, lemma: string): boolean {
  const targets = new Set([lemma.toLocaleLowerCase("sk"), normalizeLemma(lemma)]);
  return tokenize(text).some(
    (token) => targets.has(token) || targets.has(normalizeLemma(token)),
  );
}

async function loadTsvMap(
  filePath: string,
  keep?: Set<number>,
): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const stream = createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line) continue;
    const tab = line.indexOf("\t");
    if (tab < 0) continue;
    const id = Number(line.slice(0, tab));
    if (!Number.isFinite(id)) continue;
    if (keep && !keep.has(id)) continue;

    // id \t lang \t text  OR id \t text depending on export
    const rest = line.slice(tab + 1);
    const secondTab = rest.indexOf("\t");
    const text = secondTab >= 0 ? rest.slice(secondTab + 1) : rest;
    if (text) map.set(id, text);
  }

  return map;
}

async function loadLinks(filePath: string): Promise<Map<number, number>> {
  const links = new Map<number, number>();
  const stream = createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line) continue;
    const [fromRaw, toRaw] = line.split("\t");
    const from = Number(fromRaw);
    const to = Number(toRaw);
    if (!Number.isFinite(from) || !Number.isFinite(to)) continue;
    if (!links.has(from)) links.set(from, to);
  }

  return links;
}

function buildIndex(pairs: SentencePair[]): Map<string, number[]> {
  const index = new Map<string, number[]>();

  for (let pairIndex = 0; pairIndex < pairs.length; pairIndex += 1) {
    const pair = pairs[pairIndex]!;
    const seen = new Set<string>();

    for (const token of tokenize(pair.slovak)) {
      const keys = [token, normalizeLemma(token)];
      for (const key of keys) {
        if (!key || seen.has(key)) continue;
        seen.add(key);
        const list = index.get(key) ?? [];
        list.push(pairIndex);
        index.set(key, list);
      }
    }
  }

  return index;
}

function collectCandidates(
  lemma: string,
  pairs: SentencePair[],
  index: Map<string, number[]>,
): SentencePair[] {
  const exactKeys = new Set<string>([
    lemma.toLocaleLowerCase("sk"),
    normalizeLemma(lemma),
  ]);
  const stem = verbStem(lemma);
  const stemNorm = stem ? normalizeLemma(stem) : undefined;

  const hitIndexes = new Set<number>();

  for (const key of exactKeys) {
    for (const pairIndex of index.get(key) ?? []) hitIndexes.add(pairIndex);
  }

  // Safer stem fallback: only tokens that start with a long stem and stay close in length.
  if (stem && stemNorm && stem.length >= 5) {
    for (const [token, pairIndexes] of index) {
      if (token.length < stem.length || token.length > stem.length + 5) continue;
      if (!(token.startsWith(stem) || token.startsWith(stemNorm))) continue;
      for (const pairIndex of pairIndexes) hitIndexes.add(pairIndex);
    }
  }

  const candidates = [...hitIndexes]
    .map((pairIndex) => pairs[pairIndex]!)
    .filter((pair) => pair.slovak.length >= 8 && pair.slovak.length <= 140)
    .filter((pair) => pair.english.length <= 160)
    .filter((pair) => isCleanExample(pair.slovak, pair.english))
    .toSorted((a, b) => scorePair(b, lemma) - scorePair(a, lemma));

  const exact = candidates.filter((pair) => lemmaAppearsAsToken(pair.slovak, lemma));
  return exact.length > 0 ? exact : candidates;
}

function toExamples(pairs: SentencePair[], limit: number): Example[] {
  const examples: Example[] = [];
  const seen = new Set<string>();

  for (const pair of pairs) {
    const key = normalizeLemma(pair.slovak);
    if (seen.has(key)) continue;
    seen.add(key);
    examples.push({
      slovak: pair.slovak,
      english: pair.english,
      note: "Tatoeba",
    });
    if (examples.length >= limit) break;
  }

  return examples;
}

async function main(): Promise<void> {
  const { perWord, report, force } = parseArgs(process.argv.slice(2));

  const slkPath = path.join(TATOEBA_DIR, "slk_sentences.tsv");
  const engPath = path.join(TATOEBA_DIR, "eng_sentences.tsv");
  const linksPath = path.join(TATOEBA_DIR, "slk-eng_links.tsv");

  console.log("Loading Tatoeba links…");
  const links = await loadLinks(linksPath);
  const neededEng = new Set(links.values());
  console.log(`SK→EN links: ${links.size}`);

  console.log("Loading Slovak sentences…");
  const slk = await loadTsvMap(slkPath);
  console.log(`SK sentences: ${slk.size}`);

  console.log("Loading linked English sentences…");
  const eng = await loadTsvMap(engPath, neededEng);
  console.log(`EN sentences kept: ${eng.size}`);

  const pairs: SentencePair[] = [];
  for (const [skId, enId] of links) {
    const slovak = slk.get(skId);
    const english = eng.get(enId);
    if (!slovak || !english) continue;
    pairs.push({ tatoebaId: skId, slovak, english });
  }
  console.log(`Aligned pairs: ${pairs.length}`);

  console.log("Building token index…");
  const index = buildIndex(pairs);

  const promoted = JSON.parse(await readFile(PROMOTED_PATH, "utf8")) as WordSeed[];
  let enriched = 0;
  let scrubbed = 0;
  let skippedHasExamples = 0;
  const missing: WordSeed[] = [];

  for (const word of promoted) {
    const before = word.examples.length;
    const cleaned = word.examples.filter((example) =>
      isCleanExample(example.slovak, example.english),
    );
    if (cleaned.length < before) scrubbed += 1;
    word.examples = cleaned;

    if (!force && word.examples.length >= perWord) {
      skippedHasExamples += 1;
      continue;
    }

    const candidates = collectCandidates(word.slovak, pairs, index);
    const examples = toExamples(candidates, perWord);

    if (examples.length === 0) {
      if (word.examples.length === 0) missing.push(word);
      continue;
    }

    word.examples = examples;
    enriched += 1;
  }

  await writeFile(PROMOTED_PATH, `${JSON.stringify(promoted, null, 2)}\n`, "utf8");

  const missingLines = [
    `# Words still missing Tatoeba examples (${missing.length})`,
    `# Generated ${new Date().toISOString()}`,
    `# Source: Tatoeba dumps in tmp/tatoeba/`,
    "",
    ...missing
      .toSorted((a, b) => a.slovak.localeCompare(b.slovak, "sk"))
      .map((word) => `${word.slug}\t${word.slovak}\t${word.english}\t${word.category}`),
    "",
  ];
  await writeFile(report, missingLines.join("\n"), "utf8");

  console.log(`Enriched/replaced: ${enriched}`);
  console.log(`Scrubbed crude examples from: ${scrubbed} words`);
  console.log(`Skipped (already had enough clean examples): ${skippedHasExamples}`);
  console.log(`Still missing examples: ${missing.length}`);
  console.log(`Report: ${path.relative(ROOT, report)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
