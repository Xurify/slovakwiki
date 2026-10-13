export type AttemptWordMark = "same" | "wrong" | "accent";
export type CorrectionWordMark = "same" | "fixed" | "accent";

export interface DiffWord<Mark> {
  /** Punctuation before the word (`„`), kept outside the mark. */
  lead: string;
  mark: Mark;
  /** Punctuation after the word (`.`, `?`), kept outside the mark. */
  trail: string;
  word: string;
}

export interface AnswerWordDiff {
  attempt: DiffWord<AttemptWordMark>[];
  correction: DiffWord<CorrectionWordMark>[];
}

interface Token {
  folded: string;
  key: string;
  lead: string;
  trail: string;
  word: string;
}

const EDGE_PUNCTUATION = /^([\p{P}\p{S}]*)(.*?)([\p{P}\p{S}]*)$/u;

function wordKey(word: string): string {
  return word.normalize("NFC").toLocaleLowerCase("sk");
}

function foldWord(key: string): string {
  return key
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .normalize("NFC");
}

function tokenize(text: string): Token[] {
  return text
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .map((raw) => {
      const [, lead = "", word = "", trail = ""] = EDGE_PUNCTUATION.exec(raw) ?? [];
      const key = wordKey(word);
      return { folded: foldWord(key), key, lead, trail, word };
    });
}

/** Case-, punctuation-, and accent-insensitive words, in order. */
export function foldedAnswerWords(text: string): string[] {
  return tokenize(text)
    .map((token) => token.folded)
    .filter(Boolean);
}

/** Whether `phrase` appears as whole consecutive words in `text`, ignoring case and accents. */
export function containsAnswerWords(text: string, phrase: string): boolean {
  const words = foldedAnswerWords(text);
  const needle = foldedAnswerWords(phrase);
  if (!needle.length || needle.length > words.length) return false;

  for (let start = 0; start + needle.length <= words.length; start += 1) {
    if (needle.every((word, offset) => words[start + offset] === word)) return true;
  }
  return false;
}

/** Index pairs of the longest common subsequence of accent-folded words. */
function alignWords(attempt: Token[], correction: Token[]): Array<[number, number]> {
  const rows = attempt.length;
  const cols = correction.length;
  const lengths = Array.from({ length: rows + 1 }, () =>
    new Array<number>(cols + 1).fill(0),
  );

  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      lengths[i]![j] =
        attempt[i]!.folded === correction[j]!.folded
          ? lengths[i + 1]![j + 1]! + 1
          : Math.max(lengths[i + 1]![j]!, lengths[i]![j + 1]!);
    }
  }

  const pairs: Array<[number, number]> = [];
  let i = 0;
  let j = 0;
  while (i < rows && j < cols) {
    if (attempt[i]!.folded === correction[j]!.folded) {
      pairs.push([i, j]);
      i += 1;
      j += 1;
    } else if (lengths[i + 1]![j]! >= lengths[i]![j + 1]!) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return pairs;
}

/**
 * Word-level marks for a missed sentence: words the learner got wrong, words the
 * correction changed, and accent-only slips on both sides. Returns null when there is
 * nothing to mark, or when the attempt is a different sentence (most words changed) —
 * underlining everything would point at nothing.
 */
export function diffAnswerWords(
  attempt: string,
  correction: string,
): AnswerWordDiff | null {
  const attemptTokens = tokenize(attempt);
  const correctionTokens = tokenize(correction);
  if (!attemptTokens.length || !correctionTokens.length) return null;

  const attemptMarks = attemptTokens.map((token): AttemptWordMark =>
    token.key ? "wrong" : "same",
  );
  const correctionMarks = correctionTokens.map((token): CorrectionWordMark =>
    token.key ? "fixed" : "same",
  );

  for (const [i, j] of alignWords(attemptTokens, correctionTokens)) {
    const accentSlip = attemptTokens[i]!.key !== correctionTokens[j]!.key;
    attemptMarks[i] = accentSlip ? "accent" : "same";
    correctionMarks[j] = accentSlip ? "accent" : "same";
  }

  const changed = correctionMarks.filter((mark) => mark !== "same").length;
  const marked = changed + attemptMarks.filter((mark) => mark !== "same").length;
  if (marked === 0 || changed * 2 > correctionTokens.length) return null;

  return {
    attempt: attemptTokens.map(({ lead, trail, word }, index) => ({
      lead,
      mark: attemptMarks[index]!,
      trail,
      word,
    })),
    correction: correctionTokens.map(({ lead, trail, word }, index) => ({
      lead,
      mark: correctionMarks[index]!,
      trail,
      word,
    })),
  };
}
