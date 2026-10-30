/**
 * Builds the adaptive item pool for /level-test → content/level-test/items.json.
 *
 *   bun scripts/level-test/build-bank.ts
 *
 * Item difficulty is predicted from the text (corpus and subtitle frequency,
 * length, a character language model) instead of from pilot testing, and
 * pseudowords come from a character model, filtered against every attested word
 * form. Downloads the SNK word-form lists to tmp/snk/ and the OpenSubtitles
 * counts to tmp/opensubtitles/ on the first run.
 * `--rescore-pseudowords` only re-rates the pseudowords already in the bank
 * (no SNK download, no new audio). `--rescore-lengths` does the same for the
 * Short or Long pairs, dropping -ne/-né pairs over the cap. `--add-lengths`
 * refills the Short or Long pairs from the SNK and leaves the rest of the bank
 * as it is, so only the new pairs need voicing.
 * Then voice and check the Listen and Select pseudowords, and repeat until
 * check-spoken reports nothing new:
 *   bun scripts/audio/generate.ts -- --level-test-only --missing-only
 *   bun scripts/level-test/check-spoken.ts
 */

import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { audioHash } from "../../src/lib/catalog/audio/core";
import { highlightLemmaInText } from "../../src/lib/catalog/dictionary/highlight-lemma";
import { EXAMPLE_DISPLAY_LIMIT } from "../../src/lib/catalog/dictionary/example-limits";
import { words } from "../../src/lib/catalog/entries";
import { FREQUENCY_PUBLISH_BLOCKLIST } from "../../src/lib/catalog/frequency/blocklist";
import { ctestPassages } from "../../src/lib/catalog/level-test/passages";
import { isCommonWord, tagWord } from "../../src/lib/catalog/level-test/word-tags";
import { searchFormsForLemma } from "../../src/lib/catalog/search/forms";
import { damagePassage } from "../../src/lib/level-test/ctest";
import { CEFR_ANCHOR, clampScale } from "../../src/lib/level-test/scale";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";

import { CharModel, foldDiacritics, isPlausibleSlovak, seededRandom } from "./char-model";
import { loadSnkFormCounts } from "./snk-forms";
import {
  lengthAudible,
  loadLengthChecks,
  loadSpokenChecks,
  type LengthCheck,
} from "./spoken-check";

const OUT_PATH = path.join(ROOT, "content", "level-test", "items.json");
const SUBTITLES_URL =
  "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/sk/sk_50k.txt";
const SEED = 20261020;

type Pos = "noun" | "verb" | "adjective" | "adverb";

const CATEGORY_POS: Record<string, Pos> = {
  Nouns: "noun",
  Verbs: "verb",
  Adjectives: "adjective",
  Adverbs: "adverb",
};

const FREQUENCY_FILES: Record<Pos, string> = {
  noun: "nouns.json",
  verb: "verbs.json",
  adjective: "adjectives.json",
  adverb: "adverbs.json",
};

/**
 * Global SNK rank (nouns, verbs, adjectives, adverbs merged by count) → scale.
 * Rough vocabulary-size bands: an A1 learner knows a few hundred lemmas, A2
 * about a thousand, B1 about two thousand, each level roughly doubling. The
 * top anchors are squeezed because the pool ends near rank 7000.
 */
const RANK_ANCHORS: readonly [number, number][] = [
  [1, 0],
  [300, 5],
  [1000, 20],
  [2000, 40],
  [3500, 60],
  [5500, 80],
  [7000, 95],
];

/** Hand-seeded beginner words are A1 whatever their corpus rank. */
const ESSENTIALS_CAP = 10;

/**
 * A form's count is split across its lemma's other forms; three forms carry
 * most of a typical lemma's hits, so its count × 3 approximates the lemma's.
 */
const FORM_TO_LEMMA_COUNT = 3;

const LONG_VOWEL: Readonly<Record<string, string>> = {
  a: "á",
  e: "é",
  i: "í",
  o: "ó",
  u: "ú",
  y: "ý",
};

/** Short/long pairs for Short or Long; both forms must be this common in the SNK. */
const MIN_LENGTH_FORM_COUNT = 300;
/** Pairs per difficulty band, so every level has clips near it. */
const LENGTH_PAIRS_PER_BAND = 20;

/**
 * Adverb/adjective pairs (pekne/pekné) are the commonest length pairs by far:
 * uncapped they were 50 of 80, so the format heard one contrast.
 */
const ADVERB_ADJECTIVE_PAIRS = 15;

/** Vowels and diphthongs, plus r and l between consonants (štvrtý, vlna). */
const SYLLABLE_RE =
  /ia|ie|iu|ô|[aáäeéiíoóuúyý]|(?<=[^aáäeéiíoóuúyý])[rlŕĺ](?=[^aáäeéiíoóuúyý])/gu;

/**
 * Not yet calibrated; a judgement until answers from real learners can place
 * it. Length is easiest to hear in the stressed first syllable and on a/á,
 * hardest in a late unstressed syllable on i/í and y/ý, where fast speech
 * often shortens it.
 */
function lengthDifficulty(short: string, long: string): number {
  const at = [...short].findIndex((letter, index) => letter !== [...long][index]);
  const syllables = [...short.matchAll(SYLLABLE_RE)];
  const syllable = syllables.filter((match) => (match.index ?? 0) <= at).length;
  const vowel = [...short][at];
  if (syllable <= 1) return CEFR_ANCHOR.A2;
  if (vowel === "a") return CEFR_ANCHOR.B1;
  if (vowel === "i" || vowel === "y") return syllables.length <= 2 ? CEFR_ANCHOR.B2 : 75;
  if (vowel === "e") return syllables.length <= 3 ? CEFR_ANCHOR.B2 : 75;
  return CEFR_ANCHOR.B2;
}

function isAdverbAdjectivePair(short: string, long: string): boolean {
  return short.endsWith("ne") && long === `${short.slice(0, -1)}é`;
}

/** So "desať" or "svoj" does not fill a whole level of pronoun and number gaps. */
const MAX_SENTENCES_PER_BLANK_WORD = 2;

const PER_BIN = {
  readSelectReal: 40,
  readSelectPseudo: 25,
  listenSelectReal: 12,
  listenSelectPseudo: 12,
  fillBlank: 18,
  classBlank: 6,
  listenType: 14,
  readAloud: 8,
};

/**
 * Rejected on review: real but unattested derivations (participles,
 * frequentatives, negations) and strings one letter from a real word.
 */
const REVIEWED_REJECTS = new Set([
  "hromček",
  "likovať",
  "masovaný",
  "nebežný",
  "nesedať",
  "neverenie",
  "obranský",
  "odporol",
  "pochytávať",
  "politý",
  "posterna",
  "pozostať",
  "pribehať",
  "prodávka",
  "prípadový",
  "reťazka",
  "statívne",
  "súdruža",
  "tembrovský",
  "tembrový",
  "trpievať",
  "vstvo",
  "zriebe",
  "zvedať",
  "záchranstvo",
  "úplnkový",
  "špecifikačný",
]);

/**
 * Fill in the Blanks items dropped on review: Latin (in memoriam), tennis
 * jargon (brejk), and druhých meaning "others", which is no numeral. They go
 * after sampling so the rest of the pool stays as it was.
 */
const REVIEWED_FILL_REJECTS = new Set([
  "fb-memoriam",
  "fb-brejk",
  "fb-num-53434b205c",
  "fb-num-f80d81b385",
]);

/** A negated or superlative real word is itself a real word. */
const TRANSPARENT_PREFIXES = ["ne", "naj"];

/** Never show these inside a pseudoword, even by accident. */
const OFFENSIVE = [
  "kokot",
  "piča",
  "pica",
  "jeb",
  "kurv",
  "chuj",
  "srat",
  "sra",
  "riť",
  "rit",
  "debil",
  "hovn",
  "prd",
  "buzer",
  "cigán",
  "cigan",
];

interface FrequencyFile {
  entries: { lemma: string; count: number }[];
}

interface RealWord {
  slug: string;
  word: string;
  english: string;
  pos: Pos;
  difficulty: number;
  hasLemmaAudio: boolean;
}

interface Pseudoword {
  word: string;
  pos: Pos;
  difficulty: number;
}

interface SentenceSource {
  slug: string;
  lemma: string;
  category: string;
  lemmaDifficulty: number;
  slovak: string;
  english: string;
  hasAudio: boolean;
}

function interpolate(x: number, anchors: readonly [number, number][]): number {
  const first = anchors[0];
  const last = anchors.at(-1);
  if (!first || !last) return 0;
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  for (let index = 1; index < anchors.length; index++) {
    const [x1, y1] = anchors[index - 1] as [number, number];
    const [x2, y2] = anchors[index] as [number, number];
    if (x <= x2) return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
  }
  return last[1];
}

function rankDifficulty(rank: number): number {
  return interpolate(
    Math.log(rank),
    RANK_ANCHORS.map(([anchorRank, value]) => [Math.log(anchorRank), value]),
  );
}

function round(value: number): number {
  return Math.round(clampScale(value) * 10) / 10;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadSubtitleCounts(): Promise<Map<string, number>> {
  const cachePath = path.join(ROOT, "tmp", "opensubtitles", "sk_50k.txt");
  if (!(await fileExists(cachePath))) {
    await mkdir(path.dirname(cachePath), { recursive: true });
    console.log(
      `Downloading OpenSubtitles frequencies → ${path.relative(ROOT, cachePath)}`,
    );
    const response = await fetch(SUBTITLES_URL);
    if (!response.ok) throw new Error(`FrequencyWords: HTTP ${response.status}`);
    await writeFile(cachePath, await response.text(), "utf8");
  }

  const counts = new Map<string, number>();
  for (const line of (await readFile(cachePath, "utf8")).split("\n")) {
    const [form, count] = line.trim().split(/\s+/u);
    if (form && count) counts.set(form.toLocaleLowerCase("sk"), Number(count));
  }
  return counts;
}

async function loadRuntimeIndex(): Promise<Set<string>> {
  const index = await readJsonFile<Record<string, unknown>>(
    path.join(ROOT, "content", "audio", "runtime-index.json"),
    {},
  );
  return new Set(Object.keys(index));
}

function firstGloss(english: string): string {
  return (english.split(";")[0] ?? english).trim();
}

function rankBy<T>(items: readonly T[], count: (item: T) => number): Map<T, number> {
  return new Map(
    [...items]
      .sort((a, b) => count(b) - count(a))
      .map((item, index) => [item, index + 1]),
  );
}

async function loadRealWords(
  audioHashes: Set<string>,
  subtitleCounts: ReadonlyMap<string, number>,
): Promise<{
  real: RealWord[];
  sortedCounts: number[];
  sentences: SentenceSource[];
}> {
  const countByKey = new Map<string, number>();
  for (const pos of Object.keys(FREQUENCY_FILES) as Pos[]) {
    const file = JSON.parse(
      await readFile(
        path.join(ROOT, "content", "frequency", FREQUENCY_FILES[pos]),
        "utf8",
      ),
    ) as FrequencyFile;
    for (const entry of file.entries) {
      const key = `${entry.lemma.toLocaleLowerCase("sk")}|${pos}`;
      countByKey.set(key, Math.max(countByKey.get(key) ?? 0, entry.count));
    }
  }

  const sortedCounts = [...countByKey.values()].sort((a, b) => b - a);

  const ranked = words.flatMap((entry) => {
    if (entry.kind !== "word") return [];
    const pos = CATEGORY_POS[entry.category];
    if (!pos) return [];
    const word = entry.slovak.trim();
    const snkCount = countByKey.get(`${word.toLocaleLowerCase("sk")}|${pos}`);
    if (!snkCount) return [];
    const forms = new Set([word, ...searchFormsForLemma(word, entry.category)]);
    let subtitles = 0;
    for (const form of forms)
      subtitles += subtitleCounts.get(form.toLocaleLowerCase("sk")) ?? 0;
    return [{ entry, pos, word, snkCount, subtitles }];
  });

  /**
   * Movie-subtitle counts track CEFR word lists better than written corpora;
   * SNK is mostly news. The geometric mean of both ranks keeps "prázdniny"
   * from looking like a B2 word.
   */
  const snkRank = rankBy(ranked, (row) => row.snkCount);
  const subtitleRank = rankBy(ranked, (row) => row.subtitles);

  const real: RealWord[] = [];
  const sentences: SentenceSource[] = [];

  for (const row of ranked) {
    const { entry, pos, word } = row;
    const rank = Math.sqrt((snkRank.get(row) ?? 1) * (subtitleRank.get(row) ?? 1));

    let difficulty = rankDifficulty(rank);
    if (entry.origin === "curated") difficulty = Math.min(difficulty, ESSENTIALS_CAP);

    for (const example of entry.examples.slice(0, EXAMPLE_DISPLAY_LIMIT)) {
      if (example.note !== "Curated") continue;
      sentences.push({
        slug: entry.slug,
        lemma: word,
        category: entry.category,
        lemmaDifficulty: difficulty,
        slovak: example.slovak.trim(),
        english: example.english.trim(),
        hasAudio: audioHashes.has(audioHash(example.slovak)),
      });
    }

    const usable =
      /^[\p{Ll}]+$/u.test(word) &&
      [...word].length >= 3 &&
      !FREQUENCY_PUBLISH_BLOCKLIST.has(word.toLocaleLowerCase("sk"));
    if (!usable) continue;

    real.push({
      slug: entry.slug,
      word,
      english: firstGloss(entry.english),
      pos,
      difficulty,
      hasLemmaAudio: audioHashes.has(audioHash(word)),
    });
  }

  return { real, sortedCounts, sentences };
}

function deletions(word: string): string[] {
  const letters = [...word];
  return letters.map((_, index) =>
    [...letters.slice(0, index), ...letters.slice(index + 1)].join(""),
  );
}

/** Distance-1 neighbourhood check (SymSpell): too close to a real word is unfair. */
function nearRealWord(lemmas: readonly string[]): (candidate: string) => boolean {
  const folded = new Set(lemmas.map(foldDiacritics));
  const folds = new Set<string>();
  for (const lemma of folded) for (const deleted of deletions(lemma)) folds.add(deleted);

  return (candidate) => {
    const value = foldDiacritics(candidate);
    if (folded.has(value) || folds.has(value)) return true;
    return deletions(value).some((deleted) => folded.has(deleted) || folds.has(deleted));
  };
}

const POS_ENDING: Record<Pos, RegExp> = {
  noun: /[aeoiuyáéíóúýkntlrsvzcčšžmbpdhjď]$/u,
  verb: /ť$/u,
  adjective: /[ýí]$/u,
  adverb: /[oey]$/u,
};

function generatePseudowords(
  real: readonly RealWord[],
  formCounts: ReadonlyMap<string, number>,
): Pseudoword[] {
  const near = nearRealWord(real.map((entry) => entry.word));
  const frequentFolds = new Set<string>();
  for (const [form, count] of formCounts) {
    if (count >= 5) frequentFolds.add(foldDiacritics(form));
  }

  const wanted: Record<Pos, number> = { noun: 0, verb: 0, adjective: 0, adverb: 0 };
  for (const entry of real) wanted[entry.pos] += 1;

  const result: Pseudoword[] = [];
  (Object.keys(wanted) as Pos[]).forEach((pos, posIndex) => {
    const random = seededRandom(SEED + posIndex);
    const model = new CharModel(4);
    model.train(real.filter((entry) => entry.pos === pos).map((entry) => entry.word));

    const target = Math.round(wanted[pos] * 0.45);
    const seen = new Set<string>();
    let attempts = 0;
    while (seen.size < target && attempts < target * 400) {
      attempts += 1;
      const candidate = model.sample(random, 0.9);
      const length = [...candidate].length;
      if (length < 4 || length > 12 || seen.has(candidate)) continue;
      if (!POS_ENDING[pos].test(candidate)) continue;
      if (!isPlausibleSlovak(candidate)) continue;
      if (
        OFFENSIVE.some((bad) => foldDiacritics(candidate).includes(foldDiacritics(bad)))
      ) {
        continue;
      }
      if (formCounts.has(candidate) || frequentFolds.has(foldDiacritics(candidate)))
        continue;
      if (REVIEWED_REJECTS.has(candidate) || near(candidate)) continue;
      const stem = TRANSPARENT_PREFIXES.find((prefix) => candidate.startsWith(prefix));
      if (stem && formCounts.has(candidate.slice(stem.length))) continue;
      seen.add(candidate);
    }

    for (const word of seen) result.push({ word, pos, difficulty: 0 });
    console.log(
      `Pseudowords (${pos}): ${seen.size} of ${target} after ${attempts} draws`,
    );
  });

  return result;
}

/**
 * Pseudowords have no frequency, so their difficulty comes from how Slovak
 * they look: the more wordlike a fake word, the harder it is to reject. Ranks
 * pseudowords by the character model's average log-probability (most wordlike
 * hardest) and maps the ranks onto `targets`, so they cover the same range of
 * the scale. A fit on real words got the sign backwards, since a typical-looking
 * real word is an easy one, and left length driving difficulty (r = 0.96).
 */
function assignPseudowordDifficulty(
  model: CharModel,
  pseudo: { word: string; difficulty: number }[],
  targets: readonly number[],
): void {
  const sortedTargets = [...targets].sort((a, b) => a - b);
  const order = pseudo
    .map((entry, index) => ({ value: model.averageLogProb(entry.word), index }))
    .sort((a, b) => a.value - b.value);
  order.forEach(({ index }, position) => {
    const quantile = order.length === 1 ? 0.5 : position / (order.length - 1);
    const targetIndex = Math.round(quantile * (sortedTargets.length - 1));
    const entry = pseudo[index];
    if (entry) entry.difficulty = sortedTargets[targetIndex] ?? 50;
  });
}

function trainCharModel(real: readonly RealWord[]): CharModel {
  const model = new CharModel(4);
  model.train(real.map((entry) => entry.word));
  return model;
}

/**
 * Up to `perBin` items from each five-point band of the scale. Items are
 * ordered by a hash of their key, not shuffled, so dropping one reviewed
 * pseudoword pulls in a single replacement instead of reshuffling the bank.
 */
function sampleByBin<T extends { difficulty: number }>(
  items: readonly T[],
  perBin: number,
  key: (item: T) => string,
): T[] {
  const bins = new Map<number, T[]>();
  for (const item of items) {
    const bin = Math.min(19, Math.floor(item.difficulty / 5));
    bins.set(bin, [...(bins.get(bin) ?? []), item]);
  }

  const order = (item: T) =>
    createHash("sha256")
      .update(`${SEED}:${key(item)}`)
      .digest("hex");

  const picked: T[] = [];
  for (const bin of [...bins.keys()].sort((a, b) => a - b)) {
    const pool = [...(bins.get(bin) ?? [])].sort((a, b) =>
      order(a).localeCompare(order(b)),
    );
    picked.push(...pool.slice(0, perBin));
  }
  return picked;
}

const WORD_RE = /[\p{L}\p{M}]+/gu;

function sentenceTokens(sentence: string): string[] {
  return sentence.match(WORD_RE) ?? [];
}

/** Plain sentences only: no digits, quotes, brackets or abbreviations. */
function cleanSentence(sentence: string, minWords: number, maxWords: number): boolean {
  if (!/^[\p{Lu}]/u.test(sentence) || !/[.?!]$/u.test(sentence)) return false;
  if (/[\d"„“”()[\]/;:…]/u.test(sentence)) return false;
  const count = sentenceTokens(sentence).length;
  return count >= minWords && count <= maxWords;
}

function makeDifficulty(formCounts: ReadonlyMap<string, number>, sortedCounts: number[]) {
  const countAnchors = RANK_ANCHORS.map(
    ([rank, value]) => [Math.log(sortedCounts[rank - 1] ?? 1), value] as [number, number],
  ).sort((a, b) => a[0] - b[0]);

  const form = (word: string): number => {
    const count = formCounts.get(word.toLocaleLowerCase("sk")) ?? 1;
    return interpolate(Math.log(count * FORM_TO_LEMMA_COUNT), countAnchors);
  };

  const sentence = (text: string): number => {
    const tokens = sentenceTokens(text);
    const content = tokens.filter((token) => [...token].length >= 3).map(form);
    const rarest = content.sort((a, b) => b - a).slice(0, 3);
    const rarity = rarest.length ? rarest.reduce((a, b) => a + b, 0) / rarest.length : 0;
    const length = interpolate(tokens.length, [
      [3, 0],
      [6, 20],
      [9, 40],
      [12, 60],
      [16, 80],
    ]);
    return 0.5 * rarity + 0.5 * length;
  };

  return { form, sentence };
}

interface LengthPair {
  short: string;
  long: string;
  difficulty: number;
}

/**
 * Real word pairs that differ only in one vowel's length (dobre/dobré,
 * mala/malá, rad/rád), commonest first. Names and misspellings drop out because
 * both forms must be plain dictionary words or their forms; a pair whose long
 * clip is barely longer than its short one is dropped too (check-length.ts).
 */
function lengthPairs(
  formCounts: ReadonlyMap<string, number>,
  checks: Readonly<Record<string, LengthCheck>>,
): LengthPair[] {
  const candidates: (LengthPair & { count: number })[] = [];
  for (const [short, count] of formCounts) {
    if (count < MIN_LENGTH_FORM_COUNT || !/^\p{Ll}{3,8}$/u.test(short)) continue;
    const letters = [...short];
    letters.forEach((letter, index) => {
      const lengthened = LONG_VOWEL[letter];
      if (!lengthened) return;
      const long = [
        ...letters.slice(0, index),
        lengthened,
        ...letters.slice(index + 1),
      ].join("");
      const longCount = formCounts.get(long) ?? 0;
      if (longCount < MIN_LENGTH_FORM_COUNT) return;
      if (!isCommonWord(short) || !isCommonWord(long)) return;
      if (!lengthAudible(short, long, checks)) return;
      candidates.push({
        short,
        long,
        count: Math.min(count, longCount),
        difficulty: lengthDifficulty(short, long),
      });
    });
  }

  const taken = new Set<string>();
  const pairs: LengthPair[] = [];
  const perBand = new Map<number, number>();
  let adverbAdjective = 0;
  for (const pair of candidates.sort(
    (a, b) => b.count - a.count || a.short.localeCompare(b.short, "sk"),
  )) {
    if (taken.has(pair.short) || taken.has(pair.long)) continue;
    const inBand = perBand.get(pair.difficulty) ?? 0;
    if (inBand >= LENGTH_PAIRS_PER_BAND) continue;
    if (isAdverbAdjectivePair(pair.short, pair.long)) {
      if (adverbAdjective >= ADVERB_ADJECTIVE_PAIRS) continue;
      adverbAdjective += 1;
    }
    perBand.set(pair.difficulty, inBand + 1);
    taken.add(pair.short);
    taken.add(pair.long);
    pairs.push({ short: pair.short, long: pair.long, difficulty: pair.difficulty });
  }
  return pairs;
}

async function main(): Promise<void> {
  const [formCounts, audioHashes, subtitleCounts] = await Promise.all([
    loadSnkFormCounts(),
    loadRuntimeIndex(),
    loadSubtitleCounts(),
  ]);
  const { real, sortedCounts, sentences } = await loadRealWords(
    audioHashes,
    subtitleCounts,
  );
  console.log(`Real words: ${real.length}; curated sentences: ${sentences.length}`);

  const difficulty = makeDifficulty(formCounts, sortedCounts);

  const lengths = lengthPairs(formCounts, await loadLengthChecks());

  const pseudo = generatePseudowords(real, formCounts);
  assignPseudowordDifficulty(
    trainCharModel(real),
    pseudo,
    real.map((entry) => entry.difficulty),
  );

  const listenReal = sampleByBin(
    real.filter((entry) => entry.hasLemmaAudio),
    PER_BIN.listenSelectReal,
    (entry) => entry.word,
  );
  const listenRealSlugs = new Set(listenReal.map((entry) => entry.slug));
  const readReal = sampleByBin(
    real.filter((entry) => !listenRealSlugs.has(entry.slug)),
    PER_BIN.readSelectReal,
    (entry) => entry.word,
  );
  const spoken = await loadSpokenChecks();
  const listenPseudo = sampleByBin(
    pseudo.filter((entry) => !spoken[entry.word]?.heardAsReal),
    PER_BIN.listenSelectPseudo,
    (entry) => entry.word,
  );
  const listenPseudoWords = new Set(listenPseudo.map((entry) => entry.word));
  const readPseudo = sampleByBin(
    pseudo.filter((entry) => !listenPseudoWords.has(entry.word)),
    PER_BIN.readSelectPseudo,
    (entry) => entry.word,
  );

  const usedSentences = new Set<string>();
  const usedFillLemmas = new Set<string>();

  const fillCandidates = sentences.flatMap((source) => {
    if (usedFillLemmas.has(source.slug) || !cleanSentence(source.slovak, 4, 14))
      return [];
    const parts = highlightLemmaInText(source.slovak, source.lemma, source.category);
    const hitIndex = parts.findIndex((part) => part.hit);
    const hit = parts[hitIndex];
    if (!hit || hitIndex === 0) return [];
    const letters = [...hit.text];
    if (letters.length < 4 || !/^\p{Ll}/u.test(hit.text)) return [];
    usedFillLemmas.add(source.slug);
    const keep = Math.floor(letters.length / 2);
    return [
      {
        source,
        before: parts
          .slice(0, hitIndex)
          .map((part) => part.text)
          .join(""),
        prefix: letters.slice(0, keep).join(""),
        missing: letters.slice(keep).join(""),
        after: parts
          .slice(hitIndex + 1)
          .map((part) => part.text)
          .join(""),
        difficulty:
          0.6 * source.lemmaDifficulty + 0.4 * difficulty.sentence(source.slovak),
      },
    ];
  });
  const fillBlank = sampleByBin(
    fillCandidates,
    PER_BIN.fillBlank,
    (item) => item.source.slovak,
  );
  for (const item of fillBlank) usedSentences.add(item.source.slovak);

  const listenCandidates = sentences
    .filter(
      (source) =>
        source.hasAudio &&
        !usedSentences.has(source.slovak) &&
        cleanSentence(source.slovak, 4, 14),
    )
    .map((source) => ({
      source,
      difficulty: 0.4 * source.lemmaDifficulty + 0.6 * difficulty.sentence(source.slovak),
    }));
  const listenType = sampleByBin(
    dedupe(listenCandidates),
    PER_BIN.listenType,
    (item) => item.source.slovak,
  );
  for (const item of listenType) usedSentences.add(item.source.slovak);

  const aloudCandidates = sentences
    .filter(
      (source) =>
        !usedSentences.has(source.slovak) && cleanSentence(source.slovak, 4, 12),
    )
    .map((source) => ({
      source,
      difficulty: 0.4 * source.lemmaDifficulty + 0.6 * difficulty.sentence(source.slovak),
    }));
  const readAloud = sampleByBin(
    dedupe(aloudCandidates),
    PER_BIN.readAloud,
    (item) => item.source.slovak,
  );
  for (const item of readAloud) usedSentences.add(item.source.slovak);

  // A lemma search never blanks a pronoun or a number, and natural text has
  // few of them, so these classes get their own Fill in the Blanks items from
  // the sentences nothing else took.
  const classBlanks = (wanted: "pronoun" | "numeral") => {
    const perWord = new Map<string, number>();
    return sampleByBin(
      [
        ...new Map(
          sentences
            .filter(
              (source) =>
                !usedSentences.has(source.slovak) && cleanSentence(source.slovak, 4, 14),
            )
            .map((source) => [source.slovak, source]),
        ).values(),
      ].flatMap((source) => {
        for (const match of source.slovak.matchAll(WORD_RE)) {
          const word = match[0];
          const start = match.index ?? 0;
          if (start === 0 || [...word].length < 4 || !/^\p{Ll}/u.test(word)) continue;
          if (tagWord(word).class !== wanted) continue;
          const key = word.toLocaleLowerCase("sk");
          if ((perWord.get(key) ?? 0) >= MAX_SENTENCES_PER_BLANK_WORD) continue;
          perWord.set(key, (perWord.get(key) ?? 0) + 1);
          const letters = [...word];
          const keep = Math.floor(letters.length / 2);
          return [
            {
              source,
              before: source.slovak.slice(0, start),
              prefix: letters.slice(0, keep).join(""),
              missing: letters.slice(keep).join(""),
              after: source.slovak.slice(start + word.length),
              difficulty:
                0.6 * difficulty.form(word) + 0.4 * difficulty.sentence(source.slovak),
            },
          ];
        }
        return [];
      }),
      PER_BIN.classBlank,
      (item) => item.source.slovak,
    );
  };
  const pronounBlanks = classBlanks("pronoun");
  for (const item of pronounBlanks) usedSentences.add(item.source.slovak);
  const numeralBlanks = classBlanks("numeral");

  const readComplete = ctestPassages.map((passage) => {
    const passageDifficulty = passage.level === "A1" ? 5 : CEFR_ANCHOR[passage.level];
    const parts = damagePassage(passage.text, (word) =>
      round(0.5 * passageDifficulty + 0.5 * difficulty.form(word)),
    );
    return {
      id: `rc-${passage.id}`,
      format: "readComplete" as const,
      difficulty: passageDifficulty,
      title: passage.title,
      parts,
    };
  });

  const items = {
    readSelect: [
      ...readReal.map((entry) => ({
        id: `rs-${entry.slug}`,
        format: "readSelect" as const,
        difficulty: round(entry.difficulty),
        word: entry.word,
        real: true,
        slug: entry.slug,
        english: entry.english,
      })),
      ...readPseudo.map((entry) => ({
        id: `rs-x-${entry.word}`,
        format: "readSelect" as const,
        difficulty: round(entry.difficulty),
        word: entry.word,
        real: false,
      })),
    ],
    listenSelect: [
      ...listenReal.map((entry) => ({
        id: `ls-${entry.slug}`,
        format: "listenSelect" as const,
        difficulty: round(entry.difficulty),
        word: entry.word,
        real: true,
        slug: entry.slug,
        english: entry.english,
      })),
      ...listenPseudo.map((entry) => ({
        id: `ls-x-${entry.word}`,
        format: "listenSelect" as const,
        difficulty: round(entry.difficulty),
        word: entry.word,
        real: false,
      })),
    ],
    fillBlank: [
      ...fillBlank.map((item) => ({ ...item, id: `fb-${item.source.slug}` })),
      ...pronounBlanks.map((item) => ({
        ...item,
        id: `fb-pron-${audioHash(item.source.slovak).slice(0, 10)}`,
      })),
      ...numeralBlanks.map((item) => ({
        ...item,
        id: `fb-num-${audioHash(item.source.slovak).slice(0, 10)}`,
      })),
    ]
      .filter((item) => !REVIEWED_FILL_REJECTS.has(item.id))
      .map((item) => ({
        id: item.id,
        format: "fillBlank" as const,
        difficulty: round(item.difficulty),
        before: item.before,
        prefix: item.prefix,
        missing: item.missing,
        after: item.after,
        english: item.source.english,
      })),
    listenType: listenType.map((item) => ({
      id: `lt-${audioHash(item.source.slovak).slice(0, 10)}`,
      format: "listenType" as const,
      difficulty: round(item.difficulty),
      text: item.source.slovak,
      english: item.source.english,
    })),
    listenLength: lengths.flatMap((pair) =>
      [pair.short, pair.long].map((word) => ({
        id: `ll-${word}`,
        format: "listenLength" as const,
        difficulty: round(pair.difficulty),
        word,
        short: pair.short,
        long: pair.long,
      })),
    ),
    readComplete,
    readAloud: readAloud.map((item) => ({
      id: `ra-${audioHash(item.source.slovak).slice(0, 10)}`,
      difficulty: round(item.difficulty),
      text: item.source.slovak,
      english: item.source.english,
    })),
  };

  for (const [key, list] of Object.entries(items)) {
    console.log(`${key}: ${list.length}`);
  }

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFileAtomic(
    OUT_PATH,
    `${JSON.stringify({ version: 1, ...items }, null, 1)}\n`,
  );
  console.log(`Wrote ${path.relative(ROOT, OUT_PATH)}`);
}

function dedupe<T extends { source: SentenceSource }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.source.slovak)) return false;
    seen.add(item.source.slovak);
    return true;
  });
}

/**
 * Re-rates the pseudowords already in the bank without drawing new ones, so
 * the Listen and Select clips and the spoken checks stay valid. Each format
 * keeps its own spread of difficulties; only which word gets which changes.
 */
async function rescorePseudowords(): Promise<void> {
  const [audioHashes, subtitleCounts] = await Promise.all([
    loadRuntimeIndex(),
    loadSubtitleCounts(),
  ]);
  const { real } = await loadRealWords(audioHashes, subtitleCounts);
  const model = trainCharModel(real);

  type BankWord = { word: string; real: boolean; difficulty: number };
  const bank = await readJsonFile<Record<string, unknown>>(OUT_PATH, {});
  for (const key of ["readSelect", "listenSelect"]) {
    const pseudo = ((bank[key] ?? []) as BankWord[]).filter((entry) => !entry.real);
    assignPseudowordDifficulty(
      model,
      pseudo,
      pseudo.map((entry) => entry.difficulty),
    );
    for (const entry of pseudo) entry.difficulty = round(entry.difficulty);
    console.log(`${key}: re-rated ${pseudo.length} pseudowords`);
  }

  await writeFileAtomic(OUT_PATH, `${JSON.stringify(bank, null, 1)}\n`);
  console.log(`Wrote ${path.relative(ROOT, OUT_PATH)}`);
}

/**
 * Re-rates the Short or Long pairs already in the bank and drops the -ne/-né
 * pairs over the cap, keeping the commonest (the bank lists pairs commonest
 * first), so no clip needs voicing again.
 */
async function rescoreLengths(): Promise<void> {
  type BankClip = { short: string; long: string; difficulty: number };
  const bank = await readJsonFile<Record<string, unknown>>(OUT_PATH, {});
  const clips = (bank.listenLength ?? []) as BankClip[];
  const kept = new Set<string>();
  let adverbAdjective = 0;
  for (const clip of clips) {
    if (kept.has(clip.short)) continue;
    if (isAdverbAdjectivePair(clip.short, clip.long)) {
      if (adverbAdjective >= ADVERB_ADJECTIVE_PAIRS) continue;
      adverbAdjective += 1;
    }
    kept.add(clip.short);
  }
  bank.listenLength = clips
    .filter((clip) => kept.has(clip.short))
    .map((clip) => ({ ...clip, difficulty: lengthDifficulty(clip.short, clip.long) }));
  console.log(`listenLength: kept ${kept.size} of ${clips.length / 2} pairs`);

  await writeFileAtomic(OUT_PATH, `${JSON.stringify(bank, null, 1)}\n`);
  console.log(`Wrote ${path.relative(ROOT, OUT_PATH)}`);
}

async function addLengths(): Promise<void> {
  const [formCounts, checks] = await Promise.all([
    loadSnkFormCounts(),
    loadLengthChecks(),
  ]);
  const bank = await readJsonFile<Record<string, unknown>>(OUT_PATH, {});
  const before = new Set(
    ((bank.listenLength ?? []) as { short: string }[]).map((clip) => clip.short),
  );
  const pairs = lengthPairs(formCounts, checks);
  bank.listenLength = pairs.flatMap((pair) =>
    [pair.short, pair.long].map((word) => ({
      id: `ll-${word}`,
      format: "listenLength" as const,
      difficulty: round(pair.difficulty),
      word,
      short: pair.short,
      long: pair.long,
    })),
  );
  const added = pairs.filter((pair) => !before.has(pair.short));
  console.log(
    `listenLength: ${pairs.length} pairs, ${added.length} new: ` +
      added.map((pair) => `${pair.short}/${pair.long} (${pair.difficulty})`).join(", "),
  );

  await writeFileAtomic(OUT_PATH, `${JSON.stringify(bank, null, 1)}\n`);
  console.log(`Wrote ${path.relative(ROOT, OUT_PATH)}`);
}

const run = process.argv.includes("--rescore-pseudowords")
  ? rescorePseudowords
  : process.argv.includes("--rescore-lengths")
    ? rescoreLengths
    : process.argv.includes("--add-lengths")
      ? addLengths
      : main;

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
