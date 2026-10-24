import { levenshtein } from "$lib/string/levenshtein";

/**
 * Partial credit for an answer whose only fault is missing or wrong diacritics.
 * The DET marks those wrong; a learner site is kinder because many keyboards
 * make č, ľ and ô slow to type.
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

interface WordCosts {
  accentOnly: number;
  typo: number;
}

function substitutionCost(expected: string, actual: string, costs: WordCosts): number {
  if (expected === actual) return 0;
  const foldedExpected = foldDiacritics(expected);
  const foldedActual = foldDiacritics(actual);
  if (foldedExpected === foldedActual) return costs.accentOnly;
  if (foldedExpected.length >= 5 && levenshtein(foldedExpected, foldedActual) <= 1) {
    return costs.typo;
  }
  return 1;
}

/** Word-level edit distance where near-misses cost less than a wrong word. */
function weightedWordDistance(
  reference: readonly string[],
  attempt: readonly string[],
  costs: WordCosts,
): number {
  let previous = Array.from({ length: attempt.length + 1 }, (_, index) => index);

  for (let row = 1; row <= reference.length; row++) {
    const current = [row];
    for (let column = 1; column <= attempt.length; column++) {
      current[column] = Math.min(
        (previous[column] ?? 0) + 1,
        (current[column - 1] ?? 0) + 1,
        (previous[column - 1] ?? 0) +
          substitutionCost(reference[row - 1] ?? "", attempt[column - 1] ?? "", costs),
      );
    }
    previous = current;
  }

  return previous[attempt.length] ?? 0;
}

function similarity(reference: string, attempt: string, costs: WordCosts): number {
  const referenceWords = tokenizeWords(reference);
  const attemptWords = tokenizeWords(attempt);
  if (referenceWords.length === 0) return attemptWords.length === 0 ? 1 : 0;
  if (attemptWords.length === 0) return 0;
  const distance = weightedWordDistance(referenceWords, attemptWords, costs);
  return Math.max(0, 1 - distance / referenceWords.length);
}

/** Listen and Type: how close the typed sentence is to what was said. */
export function gradeDictation(reference: string, typed: string): number {
  return similarity(reference, typed, { accentOnly: 0.25, typo: 0.5 });
}

/**
 * Read Aloud: compares a speech-to-text transcript to the sentence on screen.
 * Diacritics come from the recogniser, not the learner, so they cost nothing.
 */
export function gradeReadAloud(reference: string, transcript: string): number {
  return similarity(reference, transcript, { accentOnly: 0, typo: 0.5 });
}

function wordsMatch(expected: string, actual: string): boolean {
  const a = foldDiacritics(expected);
  const b = foldDiacritics(actual);
  if (a === b) return true;
  return a.length >= 5 && levenshtein(a, b) <= 1;
}

/**
 * Listen and Complete: credit for getting the idea in, spelling aside (the DET
 * ignores spelling here too). Long rambles that bury the answer lose a little.
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
