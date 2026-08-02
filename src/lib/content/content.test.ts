import { describe, expect, it } from "vitest";

import {
  addReviewItem,
  answersMatch,
  emptyPracticeState,
  markLessonComplete,
  practiceStateKey,
  readPracticeState,
  removeReviewItem,
  saveReferenceItem,
  writePracticeState,
  type StorageLike,
} from "../client/practice-state";
import { allEntries, caseTopics, validateContent } from "./data";
import { lessons, validateLessons } from "./lessons";
import { practiceItemById, validatePracticeItems } from "./practice";
import { normalizeSearchText, searchEntries } from "./search";

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("Slovak content", () => {
  it("finds Slovak words when learners omit diacritics", () => {
    expect(normalizeSearchText("Ďakujem")).toBe("dakujem");
    expect(searchEntries("dakujem")[0]?.slug).toBe("dakujem");
  });

  it("finds entries by their English meaning", () => {
    expect(searchEntries("hello")[0]?.slug).toBe("ahoj");
  });

  it("publishes valid, uniquely addressed entries", () => {
    expect(validateContent(allEntries)).toEqual([]);
  });

  it("publishes valid lesson and practice content with a review item for every graded interaction", () => {
    expect(validateLessons()).toEqual([]);
    expect(validatePracticeItems()).toEqual([]);

    for (const lesson of lessons) {
      for (const exercise of lesson.exercises) {
        if (exercise.type !== "personal") {
          expect(practiceItemById.has(exercise.practiceItemId)).toBe(true);
        }
      }
    }
  });

  it("publishes usable content for every case page", () => {
    expect(caseTopics.every((topic) => topic.status === "ready")).toBe(true);
    expect(caseTopics.every((topic) => topic.body.length > 0 && topic.examples.length > 0)).toBe(true);
  });

  it("matches Slovak answers without making diacritics optional", () => {
    expect(answersMatch("Čítam knihu.", "Čítam knihu.")).toBe(true);
    expect(answersMatch("čítam knihu", "Čítam knihu.")).toBe(true);
    expect(answersMatch("Citam knihu", "Čítam knihu.")).toBe(false);
  });

  it("stores only completion, review, and saved-reference state", () => {
    const storage = new MemoryStorage();
    const state = saveReferenceItem(
      removeReviewItem(
        addReviewItem(markLessonComplete(emptyPracticeState(), "everyday/meet-someone"), "everyday/origin"),
        "everyday/origin",
      ),
      "grammar/first-person-reading",
    );

    writePracticeState(storage, state);
    expect(readPracticeState(storage)).toEqual({
      version: 1,
      completedLessonIds: ["everyday/meet-someone"],
      reviewItemIds: [],
      savedReferenceItemIds: ["grammar/first-person-reading"],
    });
  });

  it("discards stale lesson and practice ids from stored state", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      practiceStateKey,
      JSON.stringify({
        version: 1,
        completedLessonIds: ["missing-lesson", "everyday/meet-someone"],
        reviewItemIds: ["missing-item", "everyday/origin"],
        savedReferenceItemIds: ["missing-item", "grammar/first-person-reading"],
      }),
    );

    expect(readPracticeState(storage)).toEqual({
      version: 1,
      completedLessonIds: ["everyday/meet-someone"],
      reviewItemIds: ["everyday/origin"],
      savedReferenceItemIds: ["grammar/first-person-reading"],
    });
  });
});
