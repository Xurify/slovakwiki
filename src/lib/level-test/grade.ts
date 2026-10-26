import { levenshtein } from "$lib/string/levenshtein";

/**
 * Partial credit for an answer whose only fault is missing or wrong diacritics.
 * A learner site is kinder because many keyboards make č, ľ and ô slow to type.
 */
export const ACCENT_ONLY_CREDIT = 0.5;

export function normalizeTyped(value: string): string {
  return value.normalize("NFC").toLocaleLowerCase("sk").trim().replace(/\s+/gu, " ");
}

export function foldDiacritics(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .normalize("NFC");
}

export function tokenizeWords(value: string): string[] {
  return normalizeTyped(value).match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
}

/** Letters typed into a damaged word (Fill in the Blanks, Read and Complete). */
export function gradeLetters(missing: string, typed: string): number {
  const expected = normalizeTyped(missing);
  const actual = normalizeTyped(typed).replace(/\s+/gu, "");
  if (!actual) return 0;
  if (actual === expected) return 1;
  if (foldDiacritics(actual) === foldDiacritics(expected)) return ACCENT_ONLY_CREDIT;
  return 0;
}

export function gradeYesNo(real: boolean, answer: boolean | null): number {
  if (answer === null) return 0;
  return answer === real ? 1 : 0;
}

export function gradeChoice(answer: number, picked: number | null): number {
  return picked === answer ? 1 : 0;
}

const UNITS: Record<string, number> = {
  jeden: 1,
  jedna: 1,
  jedno: 1,
  dva: 2,
  dve: 2,
  tri: 3,
  štyri: 4,
  päť: 5,
  šesť: 6,
  sedem: 7,
  osem: 8,
  deväť: 9,
};

const TEENS: Record<string, number> = {
  desať: 10,
  jedenásť: 11,
  dvanásť: 12,
  trinásť: 13,
  štrnásť: 14,
  pätnásť: 15,
  šestnásť: 16,
  sedemnásť: 17,
  osemnásť: 18,
  devätnásť: 19,
};

const TENS: Record<string, number> = {
  dvadsať: 20,
  tridsať: 30,
  štyridsať: 40,
  päťdesiat: 50,
  šesťdesiat: 60,
  sedemdesiat: 70,
  osemdesiat: 80,
  deväťdesiat: 90,
};

const HUNDREDS: Record<string, number> = {
  sto: 100,
  dvesto: 200,
  tristo: 300,
  štyristo: 400,
  päťsto: 500,
  šesťsto: 600,
  sedemsto: 700,
  osemsto: 800,
  deväťsto: 900,
};

/** Declined and masculine-personal forms, which are never written as one word with others. */
const CASE_FORMS: Record<string, number> = {
  nula: 0,
  jedného: 1,
  jednej: 1,
  jednému: 1,
  jednom: 1,
  jedným: 1,
  jednou: 1,
  jednu: 1,
  dvaja: 2,
  dvoch: 2,
  dvom: 2,
  dvoma: 2,
  traja: 3,
  troch: 3,
  trom: 3,
  troma: 3,
  tromi: 3,
  štyria: 4,
  štyroch: 4,
  štyrom: 4,
  štyrmi: 4,
  ...Object.fromEntries(
    (
      [
        ["piat", 5],
        ["šiest", 6],
        ["siedm", 7],
        ["ôsm", 8],
        ["deviat", 9],
        ["desiat", 10],
      ] as const
    ).flatMap(([stem, value]) =>
      ["ich", "im", "imi"].map((ending) => [`${stem}${ending}`, value] as const),
    ),
  ),
};

function takePrefix(
  word: string,
  table: Record<string, number>,
): { value: number; rest: string } | null {
  let best: { value: number; rest: string } | null = null;
  for (const [form, value] of Object.entries(table)) {
    if (!word.startsWith(form)) continue;
    if (!best || word.length - form.length < best.rest.length) {
      best = { value, rest: word.slice(form.length) };
    }
  }
  return best;
}

/**
 * The value of a Slovak cardinal, so a learner may type the digits instead.
 * Compounds in the basic form are one word (dvadsaťpäť, stodvadsať, dvetisíc).
 */
export function cardinalValue(word: string): number | null {
  const lower = normalizeTyped(word);
  if (lower in CASE_FORMS) return CASE_FORMS[lower] ?? null;

  let rest = lower;
  let total = 0;
  const thousandAt = rest.indexOf("tisíc");
  if (thousandAt !== -1) {
    const head = rest.slice(0, thousandAt);
    const multiplier = head ? cardinalValue(head) : 1;
    if (multiplier === null || multiplier >= 1000) return null;
    total += multiplier * 1000;
    rest = rest.slice(thousandAt + "tisíc".length);
  }
  for (const table of [HUNDREDS, TENS]) {
    const part = takePrefix(rest, table);
    if (part) {
      total += part.value;
      rest = part.rest;
    }
  }
  const last = rest ? (TEENS[rest] ?? UNITS[rest]) : 0;
  if (last === undefined) return null;
  if (!rest && total === 0 && thousandAt === -1) return null;
  return total + last;
}

const ORDINAL_STEMS = [
  "prv",
  "druh",
  "",
  "štvrt",
  "piat",
  "šiest",
  "siedm",
  "ôsm",
  "deviat",
  "desiat",
];

const ORDINAL =
  /^(prv|druh|štvrt|piat|šiest|siedm|ôsm|deviat|desiat)(?:ý|á|é|í|ého|ej|ému|om|ú|ou|ých|ým|ými)$/u;

const THIRD = /^(?:tret(?:í|ia|ie|ieho|iemu|iu|ej|ích|ím|ími)|treť(?:om|ou))$/u;

/** The number a cardinal or ordinal (5. for piaty) stands for. */
export function numberValue(word: string): number | null {
  const cardinal = cardinalValue(word);
  if (cardinal !== null) return cardinal;
  const lower = normalizeTyped(word);
  if (THIRD.test(lower)) return 3;
  const stem = ORDINAL.exec(lower)?.[1];
  return stem ? ORDINAL_STEMS.indexOf(stem) + 1 : null;
}

const PERCENT_WORDS = new Set(["percento", "percentá", "percenta", "percent"]);

/** A number typed as digits, or %, standing for the word that was said. */
function sameNumber(expected: string, actual: string): boolean {
  if (/^\d+$/u.test(actual)) return numberValue(expected) === Number(actual);
  if (actual === "%") return PERCENT_WORDS.has(expected);
  return false;
}

/** ä is mostly said [e] in standard Slovak, so "peť" for "päť" is heard right. */
function foldSounds(value: string): string {
  return foldDiacritics(value.replace(/ä/gu, "e"));
}

/**
 * One letter off in a long word is a typo, unless it is the ending (pekné for
 * pekný is a grammar slip) or the i of a diphthong (mesto for miesto is
 * another word). i for y stays a typo: diagnose counts it under spelling.
 */
function isTypo(expected: string, actual: string): boolean {
  if (expected.length < 5 || levenshtein(expected, actual) > 1) return false;
  if (expected.replace(/y/gu, "i") === actual.replace(/y/gu, "i")) return true;
  const [longer, shorter] =
    expected.length >= actual.length ? [expected, actual] : [actual, expected];
  let at = 0;
  while (at < shorter.length && longer[at] === shorter[at]) at += 1;
  if (at >= expected.length - 2) return false;
  const diphthong =
    longer.length > shorter.length &&
    longer[at] === "i" &&
    /[aeu]/u.test(longer[at + 1] ?? "");
  return !diphthong;
}

interface WordCosts {
  accentOnly: number;
  typo: number;
  /** One word typed as two, or two as one (od malička for odmalička). */
  split: number;
}

function substitutionCost(expected: string, actual: string, costs: WordCosts): number {
  if (expected === actual) return 0;
  if (sameNumber(expected, actual) || sameNumber(actual, expected)) return 0;
  const foldedExpected = foldDiacritics(expected);
  const foldedActual = foldDiacritics(actual);
  if (foldedExpected === foldedActual || foldSounds(expected) === foldSounds(actual)) {
    return costs.accentOnly;
  }
  if (isTypo(foldedExpected, foldedActual)) return costs.typo;
  return 1;
}

/** Word-level edit distance where near-misses cost less than a wrong word. */
function weightedWordDistance(
  reference: readonly string[],
  attempt: readonly string[],
  costs: WordCosts,
): number {
  let beforePrevious: number[] = [];
  let previous = Array.from({ length: attempt.length + 1 }, (_, index) => index);

  for (let row = 1; row <= reference.length; row++) {
    const current = [row];
    const expected = reference[row - 1] ?? "";
    for (let column = 1; column <= attempt.length; column++) {
      const actual = attempt[column - 1] ?? "";
      let best = Math.min(
        (previous[column] ?? 0) + 1,
        (current[column - 1] ?? 0) + 1,
        (previous[column - 1] ?? 0) + substitutionCost(expected, actual, costs),
      );
      if (column >= 2) {
        const joined = `${attempt[column - 2] ?? ""}${actual}`;
        best = Math.min(
          best,
          (previous[column - 2] ?? 0) +
            costs.split +
            substitutionCost(expected, joined, costs),
        );
      }
      if (row >= 2) {
        const joined = `${reference[row - 2] ?? ""}${expected}`;
        best = Math.min(
          best,
          (beforePrevious[column - 1] ?? 0) +
            costs.split +
            substitutionCost(joined, actual, costs),
        );
      }
      current[column] = best;
    }
    beforePrevious = previous;
    previous = current;
  }

  return previous[attempt.length] ?? 0;
}

/** Words plus %, which a learner may type for "percent". */
function tokenizeAnswer(value: string): string[] {
  return normalizeTyped(value).match(/[\p{L}\p{M}\p{N}]+|%/gu) ?? [];
}

function similarity(reference: string, attempt: string, costs: WordCosts): number {
  const referenceWords = tokenizeWords(reference);
  const attemptWords = tokenizeAnswer(attempt);
  if (referenceWords.length === 0) return attemptWords.length === 0 ? 1 : 0;
  if (attemptWords.length === 0) return 0;
  const distance = weightedWordDistance(referenceWords, attemptWords, costs);
  return Math.max(0, 1 - distance / referenceWords.length);
}

/** Listen and Type: how close the typed sentence is to what was said. */
export function gradeDictation(reference: string, typed: string): number {
  return similarity(reference, typed, { accentOnly: 0.25, typo: 0.5, split: 0.5 });
}

/**
 * Read Aloud: compares a speech-to-text transcript to the sentence on screen.
 * Diacritics and word breaks come from the recogniser, not the learner, so
 * they cost nothing.
 */
export function gradeReadAloud(reference: string, transcript: string): number {
  return similarity(reference, transcript, { accentOnly: 0, typo: 0.5, split: 0 });
}

function wordsMatch(expected: string, actual: string): boolean {
  const a = foldDiacritics(expected);
  const b = foldDiacritics(actual);
  if (a === b) return true;
  return a.length >= 5 && levenshtein(a, b) <= 1;
}

/**
 * Listen and Complete: credit for getting the idea in, spelling aside.
 * Long rambles that bury the answer lose a little.
 */
export function gradeIdeaGap(accepted: readonly string[], typed: string): number {
  const attempt = tokenizeWords(typed);
  if (attempt.length === 0) return 0;

  let best = 0;
  let longest = 0;
  for (const phrase of accepted) {
    const wanted = tokenizeWords(phrase);
    if (wanted.length === 0) continue;
    longest = Math.max(longest, wanted.length);
    const found = wanted.filter((word) =>
      attempt.some((typedWord) => wordsMatch(word, typedWord)),
    );
    best = Math.max(best, found.length / wanted.length);
  }

  const rambling = attempt.length > longest * 3 + 3;
  return rambling ? best * 0.7 : best;
}

export interface TokenSpan {
  start: number;
  end: number;
}

/** Highlight the Answer: overlap between the picked words and the answer (F1). */
export function gradeHighlight(gold: TokenSpan, picked: TokenSpan | null): number {
  if (!picked) return 0;
  const overlapStart = Math.max(gold.start, picked.start);
  const overlapEnd = Math.min(gold.end, picked.end);
  const overlap = Math.max(0, overlapEnd - overlapStart + 1);
  if (overlap === 0) return 0;
  const precision = overlap / (picked.end - picked.start + 1);
  const recall = overlap / (gold.end - gold.start + 1);
  return (2 * precision * recall) / (precision + recall);
}
