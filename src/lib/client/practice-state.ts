export const practiceStateKey = "slovak-wiki.practice.v1";

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

export function readPracticeState(storage: StorageLike): PracticeState {
  const raw = storage.getItem(practiceStateKey);
  if (!raw) return emptyPracticeState();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      storage.removeItem(practiceStateKey);
      return emptyPracticeState();
    }

    const state = parsed as Record<string, unknown>;
    if (state.version !== 1) {
      storage.removeItem(practiceStateKey);
      return emptyPracticeState();
    }

    return {
      version: 1,
      completedLessonIds: asStringIds(state.completedLessonIds),
      reviewItemIds: asStringIds(state.reviewItemIds),
      savedReferenceItemIds: asStringIds(state.savedReferenceItemIds),
    };
  } catch {
    storage.removeItem(practiceStateKey);
    return emptyPracticeState();
  }
}

export function writePracticeState(storage: StorageLike, state: PracticeState): void {
  storage.setItem(
    practiceStateKey,
    JSON.stringify({
      version: 1,
      completedLessonIds: asStringIds(state.completedLessonIds),
      reviewItemIds: asStringIds(state.reviewItemIds),
      savedReferenceItemIds: asStringIds(state.savedReferenceItemIds),
    }),
  );
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
