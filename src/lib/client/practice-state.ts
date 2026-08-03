export const PRACTICE_STATE_STORAGE_KEY = "slovak.wiki.practice.v1";

const LEGACY_PRACTICE_STATE_STORAGE_KEY = "slovak-wiki.practice.v1";

export interface PracticeState {
  completedLessonIds: string[];
  reviewItemIds: string[];
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
    reviewItemIds: [],
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
      reviewItemIds: asStringIds(state.reviewItemIds),
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
      reviewItemIds: asStringIds(state.reviewItemIds),
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

export function addReviewItem(state: PracticeState, itemId: string): PracticeState {
  return {
    ...state,
    reviewItemIds: unique([...state.reviewItemIds, itemId]),
  };
}

export function removeReviewItem(state: PracticeState, itemId: string): PracticeState {
  return {
    ...state,
    reviewItemIds: state.reviewItemIds.filter((id) => id !== itemId),
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
