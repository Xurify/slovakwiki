import { z } from "zod";

import { lessons } from "$lib/content/lessons";
import { practiceItemById } from "$lib/content/practice";

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

const stateSchema = z.object({
  completedLessonIds: z.array(z.string()),
  reviewItemIds: z.array(z.string()),
  savedReferenceItemIds: z.array(z.string()),
  version: z.literal(1),
});

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

const lessonIds = new Set(lessons.map((lesson) => lesson.id));

function validLessonIds(values: string[]): string[] {
  return unique(values).filter((id) => lessonIds.has(id));
}

function validPracticeItemIds(values: string[]): string[] {
  return unique(values).filter((id) => practiceItemById.has(id));
}

export function readPracticeState(storage: StorageLike): PracticeState {
  const raw = storage.getItem(practiceStateKey);
  if (!raw) return emptyPracticeState();

  try {
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      storage.removeItem(practiceStateKey);
      return emptyPracticeState();
    }

    return {
      version: 1,
      completedLessonIds: validLessonIds(parsed.data.completedLessonIds),
      reviewItemIds: validPracticeItemIds(parsed.data.reviewItemIds),
      savedReferenceItemIds: validPracticeItemIds(parsed.data.savedReferenceItemIds),
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
      completedLessonIds: validLessonIds(state.completedLessonIds),
      reviewItemIds: validPracticeItemIds(state.reviewItemIds),
      savedReferenceItemIds: validPracticeItemIds(state.savedReferenceItemIds),
    }),
  );
}

export function markLessonComplete(state: PracticeState, lessonId: string): PracticeState {
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

export function answersMatch(value: string, answer: string, alternatives: string[] = []): boolean {
  const normalizedValue = normalizePracticeAnswer(value);
  return [answer, ...alternatives].some(
    (candidate) => normalizePracticeAnswer(candidate) === normalizedValue,
  );
}
