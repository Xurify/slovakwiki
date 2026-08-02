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
import { allEntries, caseTopics, entryBySlug, validateContent, words } from "./data";
import { lessons, validateLessons } from "./lessons";
import { practiceItemById, validatePracticeItems } from "./practice";
import { normalizeSearchText, searchEntries } from "./search";
import { buildSearchDocuments } from "./search-documents";

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

  it("indexes reference and learning content for Pagefind", () => {
    const documents = buildSearchDocuments();
    expect(documents.some((document) => document.kind === "word")).toBe(true);
    expect(documents.some((document) => document.kind === "case")).toBe(true);
    expect(documents.some((document) => document.kind === "lesson")).toBe(true);
    expect(documents.some((document) => document.kind === "practice")).toBe(true);
    expect(
      documents.some(
        (document) =>
          document.url.includes("dakujem") &&
          normalizeSearchText(document.content).includes("dakujem"),
      ),
    ).toBe(true);
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
    expect(
      caseTopics.every((topic) => topic.body.length > 0 && topic.examples.length > 0),
    ).toBe(true);
  });

  it("gives every word at least one example and matching usage copy", () => {
    const withExamples = words.filter((word) => word.examples.length > 0);
    const withoutExamples = words.filter((word) => word.examples.length === 0);

    expect(withoutExamples).toEqual([]);
    expect(withExamples.length).toBe(words.length);
    expect(
      withExamples.every((word) =>
        word.body.some((paragraph) => paragraph.includes("Read the example")),
      ),
    ).toBe(true);
  });

  it("attributes frequency-promoted words to SNK, not JÚĽŠ", () => {
    const promoted = words.find((word) => word.origin === "frequency");
    const curated = words.find((word) => word.origin === "curated");

    expect(promoted).toBeDefined();
    expect(curated).toBeDefined();
    expect(promoted?.sourceLabel).toContain("Slovak National Corpus");
    expect(curated?.sourceLabel).toContain("Jazykovedný ústav");
  });

  it("attaches frequency rank for SNK lemmas", () => {
    const byt = words.find((word) => word.slug === "byt");
    expect(byt?.frequency?.pos).toBe("verb");
    expect(byt?.frequency?.rank).toBe(1);

    const velky = words.find((word) => word.slovak === "veľký");
    expect(velky?.frequency?.rank).toBe(1);

    const slovensky = words.find((word) => word.slug === "slovensky");
    expect(slovensky?.origin).toBe("curated");
    expect(slovensky?.frequency).toBeUndefined();
  });

  it("publishes diacritic near-homographs under disambiguated slugs", () => {
    expect(words.find((word) => word.slovak === "štát")?.slug).toBe("stat-n");
    expect(words.find((word) => word.slovak === "byt")?.slug).toBe("byt-n");
    expect(words.find((word) => word.slovak === "slovenský")?.slug).toBe("slovensky-a");
  });

  it("fills related neighbors for frequency-promoted words", () => {
    const promoted = words.find(
      (word) => word.origin === "frequency" && word.frequency?.rank === 2,
    );
    expect(promoted?.related.length).toBeGreaterThan(0);
    for (const relatedSlug of promoted?.related ?? []) {
      expect(entryBySlug.has(relatedSlug)).toBe(true);
    }
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
        addReviewItem(
          markLessonComplete(emptyPracticeState(), "everyday/meet-someone"),
          "everyday/origin",
        ),
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
