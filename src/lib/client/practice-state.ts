export const PRACTICE_STATE_STORAGE_KEY = "slovak.wiki.practice.v1";

const LEGACY_PRACTICE_STATE_STORAGE_KEY = "slovak-wiki.practice.v1";

export interface PracticeState {
  completedLessonIds: string[];
  savedReferenceItemIds: string[];
  version: 1;
}

export interface StorageLike {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export function emptyPracticeState(): PracticeState {
  return {
    version: 1,
    completedLessonIds: [],
    savedReferenceItemIds: [],
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function asStringIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return unique(
    value.filter(
      (entry): entry is string => typeof entry === "string" && entry.length > 0,
    ),
  );
}

function readPracticeRaw(storage: StorageLike): string | null {
  return (
    storage.getItem(PRACTICE_STATE_STORAGE_KEY) ??
    storage.getItem(LEGACY_PRACTICE_STATE_STORAGE_KEY)
  );
}

function clearPracticeKeys(storage: StorageLike): void {
  storage.removeItem(PRACTICE_STATE_STORAGE_KEY);
  storage.removeItem(LEGACY_PRACTICE_STATE_STORAGE_KEY);
}

export function readPracticeState(storage: StorageLike): PracticeState {
  const raw = readPracticeRaw(storage);
  if (!raw) return emptyPracticeState();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      clearPracticeKeys(storage);
      return emptyPracticeState();
    }

    const state = parsed as Record<string, unknown>;
    if (state.version !== 1) {
      clearPracticeKeys(storage);
      return emptyPracticeState();
    }

    return {
      version: 1,
      completedLessonIds: asStringIds(state.completedLessonIds),
      savedReferenceItemIds: asStringIds(state.savedReferenceItemIds),
    };
  } catch {
    clearPracticeKeys(storage);
    return emptyPracticeState();
  }
}

export function writePracticeState(storage: StorageLike, state: PracticeState): void {
  storage.setItem(
    PRACTICE_STATE_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      completedLessonIds: asStringIds(state.completedLessonIds),
      savedReferenceItemIds: asStringIds(state.savedReferenceItemIds),
    }),
  );
  storage.removeItem(LEGACY_PRACTICE_STATE_STORAGE_KEY);
}

export function markLessonComplete(
  state: PracticeState,
  lessonId: string,
): PracticeState {
  return {
    ...state,
    completedLessonIds: unique([...state.completedLessonIds, lessonId]),
  };
}

export function saveReferenceItem(state: PracticeState, itemId: string): PracticeState {
  return {
    ...state,
    savedReferenceItemIds: unique([...state.savedReferenceItemIds, itemId]),
  };
}

export function normalizePracticeAnswer(value: string): string {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("sk")
    .trim()
    .replace(/[.?!,;:]+$/gu, "")
    .replace(/\s+/gu, " ");
}

export function answersMatch(
  value: string,
  answer: string,
  alternatives: string[] = [],
): boolean {
  const normalizedValue = normalizePracticeAnswer(value);
  return [answer, ...alternatives].some(
    (candidate) => normalizePracticeAnswer(candidate) === normalizedValue,
  );
}

export type AnswerGrade = "accents" | "correct" | "incorrect";

function foldAccents(value: string): string {
  return normalizePracticeAnswer(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .normalize("NFC");
}

/**
 * Fold is a downgrade path only: it can turn "incorrect" into "almost",
 * never into "correct" (štát/stať fold to the same string).
 */
export function gradeAnswer(
  value: string,
  answer: string,
  alternatives: string[] = [],
): AnswerGrade {
  if (answersMatch(value, answer, alternatives)) return "correct";
  const folded = foldAccents(value);
  const nearMiss = [answer, ...alternatives].some(
    (candidate) => foldAccents(candidate) === folded,
  );
  return nearMiss ? "accents" : "incorrect";
}

/** Classic Levenshtein over Unicode code points. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const aChars = [...a];
  const bChars = [...b];
  const rows = aChars.length + 1;
  const cols = bChars.length + 1;
  const prev = new Array<number>(cols);
  const curr = new Array<number>(cols);

  for (let j = 0; j < cols; j++) prev[j] = j;

  for (let i = 1; i < rows; i++) {
    curr[0] = i;
    const aChar = aChars[i - 1]!;
    for (let j = 1; j < cols; j++) {
      const cost = aChar === bChars[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,
        (curr[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost,
      );
    }
    for (let j = 0; j < cols; j++) prev[j] = curr[j] ?? 0;
  }

  return prev[bChars.length] ?? 0;
}

function closeAnswerThreshold(length: number): number {
  return Math.max(1, Math.floor(length / 5));
}

/**
 * Closest accepted form within a length-scaled edit distance.
 * Compares accent-folded strings so pure diacritic misses stay on the accents grade path.
 * Returns the original (display) candidate spelling, or null if nothing is close enough.
 */
export function suggestCloseAnswer(
  value: string,
  answer: string,
  alternatives: string[] = [],
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const foldedValue = foldAccents(value);
  if (!foldedValue) return null;

  let best: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of [answer, ...alternatives]) {
    const foldedCandidate = foldAccents(candidate);
    if (!foldedCandidate) continue;

    const longer = Math.max(foldedValue.length, foldedCandidate.length);
    if (longer === 0) continue;

    const distance = levenshtein(foldedValue, foldedCandidate);
    if (distance === 0) continue;
    if (distance >= longer) continue;
    if (distance > closeAnswerThreshold(longer)) continue;

    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate.trim();
    }
  }

  return best;
}
