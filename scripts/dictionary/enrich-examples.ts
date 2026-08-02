/**
 * Attach Tatoeba SK–EN example sentences to promoted dictionary words.
 *
 * Downloads expected in tmp/tatoeba/ (see docs/data-sources.md):
 *   slk_sentences.tsv, eng_sentences.tsv, slk-eng_links.tsv
 *
 * Usage:
 *   bun run examples:enrich
 *   bun run examples:enrich -- --per-word 3 --report tmp/missing-examples.txt
 *   bun run examples:enrich -- --replace-practice
 */

import { createReadStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

import type { ContentEntry, Example } from "../../src/lib/content/types";
import {
  isAcceptableCorpusExample,
  isCleanExample,
} from "../../src/lib/content/example-quality";
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

type RejectReason =
  "no-candidates" | "quality" | "weak-match" | "already-protected" | "no-practice-frame";

const TATOEBA_DIR = path.join(ROOT, "tmp", "tatoeba");
const PROMOTED_PATH = path.join(ROOT, "content", "dictionary", "promoted.json");

const TOKEN_RE = /[\p{L}\p{M}]+/gu;

function parseArgs(argv: string[]): {
  force: boolean;
  perWord: number;
  refreshTatoeba: boolean;
  rejectReport: string;
  replacePractice: boolean;
  report: string;
} {
  let perWord = 3;
  let report = path.join(ROOT, "tmp", "missing-examples.txt");
  let rejectReport = path.join(ROOT, "tmp", "enrich-rejects.tsv");
  let force = false;
  let replacePractice = false;
  let refreshTatoeba = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--force") force = true;
    if (arg === "--replace-practice") replacePractice = true;
    if (arg === "--refresh-tatoeba") refreshTatoeba = true;
    if (arg === "--per-word" && argv[index + 1]) {
      perWord = Number(argv[index + 1]);
      index += 1;
    }
    if (arg === "--report" && argv[index + 1]) {
      report = path.resolve(argv[index + 1]!);
      index += 1;
    }
    if (arg === "--reject-report" && argv[index + 1]) {
      rejectReport = path.resolve(argv[index + 1]!);
      index += 1;
    }
  }

  return { perWord, report, rejectReport, force, replacePractice, refreshTatoeba };
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

/** Inflectional leftovers after a verb stem — keeps nemocnici from matching nemôcť. */
const VERB_REST =
  /^(ť|t|l|la|lo|li|ly|ím|íš|í|íme|íte|ia|am|áš|á|áme|áte|ajú|em|eš|e|ieme|iete|ú|iem|ol|ola|olo|oli|m|š|s|me|te|u|a|ou|ej)?$/iu;

function isVerbCategory(category: string): boolean {
  return category === "Verbs";
}

function lemmaAppearsAsToken(text: string, lemma: string): boolean {
  const targets = new Set([lemma.toLocaleLowerCase("sk"), normalizeLemma(lemma)]);
  return tokenize(text).some(
    (token) => targets.has(token) || targets.has(normalizeLemma(token)),
  );
}

function verbInflectionEvidence(text: string, lemma: string): boolean {
  const stem = verbStem(lemma);
  if (!stem || stem.length < 5) return false;
  const stemNorm = normalizeLemma(stem);
  if (stemNorm.length < 5) return false;

  return tokenize(text).some((token) => {
    const norm = normalizeLemma(token);
    if (!norm.startsWith(stemNorm)) return false;
    if (norm.length < stemNorm.length || norm.length > stemNorm.length + 5) return false;
    const rest = norm.slice(stemNorm.length);
    return VERB_REST.test(rest);
  });
}

function scorePair(pair: SentencePair, lemma: string, category: string): number {
  let score = 0;
  const length = pair.slovak.length;
  if (length >= 12 && length <= 90) score += 3;
  else if (length <= 120) score += 1;

  if (lemmaAppearsAsToken(pair.slovak, lemma)) score += 8;
  else if (isVerbCategory(category) && verbInflectionEvidence(pair.slovak, lemma))
    score += 4;
  else if (pair.slovak.toLocaleLowerCase("sk").includes(lemma.toLocaleLowerCase("sk")))
    score += 1;

  if (/[.!?]$/.test(pair.slovak.trim())) score += 1;
  if (/^[A-ZÁÄČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ]/.test(pair.slovak.trim())) score += 1;
  return score;
}

function hasStrongMatch(pair: SentencePair, lemma: string, category: string): boolean {
  if (lemmaAppearsAsToken(pair.slovak, lemma)) return true;
  if (isVerbCategory(category) && verbInflectionEvidence(pair.slovak, lemma)) return true;
  return false;
}

function isPracticeOnly(examples: Example[]): boolean {
  return (
    examples.length > 0 && examples.every((example) => example.isPracticeFrame === true)
  );
}

function isProtectedExample(example: Example): boolean {
  if (example.demonstrates) return true;
  if (example.isPracticeFrame) return false;
  if (example.note === "Tatoeba") return true;
  if (example.note === "Curated") return true;
  return true;
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
  category: string,
  pairs: SentencePair[],
  index: Map<string, number[]>,
): { accepted: SentencePair[]; rejectedQuality: number; rejectedWeak: number } {
  const exactKeys = new Set<string>([
    lemma.toLocaleLowerCase("sk"),
    normalizeLemma(lemma),
  ]);
  const stem = isVerbCategory(category) ? verbStem(lemma) : undefined;
  const stemNorm = stem ? normalizeLemma(stem) : undefined;

  const hitIndexes = new Set<number>();

  for (const key of exactKeys) {
    for (const pairIndex of index.get(key) ?? []) hitIndexes.add(pairIndex);
  }

  // Safer stem fallback for verbs only: long stem + inflectional remainder.
  if (stem && stemNorm && stemNorm.length >= 5) {
    for (const [token, pairIndexes] of index) {
      if (!token.startsWith(stemNorm)) continue;
      if (token.length < stemNorm.length || token.length > stemNorm.length + 5) continue;
      const rest = token.slice(stemNorm.length);
      if (!VERB_REST.test(rest)) continue;
      for (const pairIndex of pairIndexes) hitIndexes.add(pairIndex);
    }
  }

  let rejectedQuality = 0;
  let rejectedWeak = 0;
  const accepted: SentencePair[] = [];

  for (const pairIndex of hitIndexes) {
    const pair = pairs[pairIndex]!;
    if (!isAcceptableCorpusExample(pair.slovak, pair.english)) {
      rejectedQuality += 1;
      continue;
    }
    if (!hasStrongMatch(pair, lemma, category)) {
      rejectedWeak += 1;
      continue;
    }
    accepted.push(pair);
  }

  accepted.sort((a, b) => scorePair(b, lemma, category) - scorePair(a, lemma, category));

  return { accepted, rejectedQuality, rejectedWeak };
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
      tatoebaId: pair.tatoebaId,
    });
    if (examples.length >= limit) break;
  }

  return examples;
}

async function main(): Promise<void> {
  const { perWord, report, rejectReport, force, replacePractice, refreshTatoeba } =
    parseArgs(process.argv.slice(2));

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
  let skippedProtected = 0;
  let skippedNoPractice = 0;
  let practiceReplaced = 0;
  let practiceRetained = 0;
  const missing: WordSeed[] = [];
  const rejects: { slug: string; reason: RejectReason; detail: string }[] = [];

  for (const word of promoted) {
    const before = word.examples.length;

    // Scrub only crude corpus/unsafe lines; keep curated + practice frames.
    let nextExamples = word.examples.filter((example) => {
      if (example.isPracticeFrame) return true;
      if (example.demonstrates) return true;
      if (example.note === "Curated") return true;
      return isCleanExample(example.slovak, example.english);
    });

    // Optional repair pass: drop prior Tatoeba rows and rematch with current rules.
    if (refreshTatoeba) {
      nextExamples = nextExamples.filter((example) => example.note !== "Tatoeba");
    }

    if (nextExamples.length < before) scrubbed += 1;
    word.examples = nextExamples;

    const practiceOnly = isPracticeOnly(word.examples);
    const hasProtected = word.examples.some(isProtectedExample);

    if (replacePractice) {
      if (!practiceOnly) {
        if (hasProtected) {
          skippedProtected += 1;
          rejects.push({
            slug: word.slug,
            reason: "already-protected",
            detail: "Has curated/Tatoeba/pattern examples",
          });
          continue;
        } else if (word.examples.length === 0) {
          // Fall through and try to enrich empty entries.
        } else {
          skippedNoPractice += 1;
          rejects.push({
            slug: word.slug,
            reason: "no-practice-frame",
            detail: "Not practice-only; skipped under --replace-practice",
          });
          continue;
        }
      }
    } else if (!force && !refreshTatoeba && word.examples.length >= perWord) {
      skippedProtected += 1;
      continue;
    } else if (!force && !refreshTatoeba && hasProtected && !practiceOnly) {
      skippedProtected += 1;
      continue;
    } else if (!force && refreshTatoeba && hasProtected && !practiceOnly) {
      // Keep curated/pattern examples; only refill when Tatoeba rows were cleared.
      if (word.examples.length >= perWord) {
        skippedProtected += 1;
        continue;
      }
    }

    const { accepted, rejectedQuality, rejectedWeak } = collectCandidates(
      word.slovak,
      word.category,
      pairs,
      index,
    );
    const examples = toExamples(accepted, perWord);

    if (examples.length === 0) {
      if (practiceOnly) {
        practiceRetained += 1;
        rejects.push({
          slug: word.slug,
          reason:
            rejectedQuality + rejectedWeak > 0
              ? rejectedWeak > rejectedQuality
                ? "weak-match"
                : "quality"
              : "no-candidates",
          detail: `quality=${rejectedQuality}; weak=${rejectedWeak}`,
        });
      } else if (word.examples.length === 0) {
        missing.push(word);
        rejects.push({
          slug: word.slug,
          reason: "no-candidates",
          detail: `quality=${rejectedQuality}; weak=${rejectedWeak}`,
        });
      }
      continue;
    }

    if (practiceOnly) practiceReplaced += 1;
    word.examples = examples;
    enriched += 1;
  }

  await writeFile(PROMOTED_PATH, `${JSON.stringify(promoted, null, 2)}\n`, "utf8");

  const missingLines = [
    `# Words still missing Tatoeba examples (${missing.length})`,
    `# Generated ${new Date().toISOString()}`,
    `# Source: Tatoeba dumps in tmp/tatoeba/`,
    `# Mode: ${replacePractice ? "replace-practice" : force ? "force" : "default"}`,
    "",
    ...missing
      .toSorted((a, b) => a.slovak.localeCompare(b.slovak, "sk"))
      .map((word) => `${word.slug}\t${word.slovak}\t${word.english}\t${word.category}`),
    "",
  ];
  await writeFile(report, missingLines.join("\n"), "utf8");

  const rejectLines = [
    "slug\treason\tdetail",
    ...rejects.map((row) =>
      [row.slug, row.reason, row.detail]
        .map((cell) => String(cell).replace(/\t|\r?\n/g, " "))
        .join("\t"),
    ),
    "",
  ];
  await writeFile(rejectReport, rejectLines.join("\n"), "utf8");

  console.log(`Enriched/replaced: ${enriched}`);
  console.log(`Practice frames replaced: ${practiceReplaced}`);
  console.log(`Practice frames retained: ${practiceRetained}`);
  console.log(`Scrubbed crude examples from: ${scrubbed} words`);
  console.log(`Skipped protected entries: ${skippedProtected}`);
  if (replacePractice) {
    console.log(`Skipped non-practice entries: ${skippedNoPractice}`);
  }
  console.log(`Still missing examples: ${missing.length}`);
  console.log(`Reject rows: ${rejects.length}`);
  console.log(
    `Mode: ${replacePractice ? "replace-practice" : refreshTatoeba ? "refresh-tatoeba" : force ? "force" : "default"}`,
  );
  console.log(`Report: ${path.relative(ROOT, report)}`);
  console.log(`Reject report: ${path.relative(ROOT, rejectReport)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
