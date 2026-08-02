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
import {
  clearSearchHistory,
  normalizeHistoryHref,
  pushSearchHistory,
  readSearchHistory,
  SEARCH_HISTORY_LIMIT,
  searchHistoryKey,
} from "../client/search-history";
import { allEntries, caseTopics, entryBySlug, validateContent, words } from "./data";
import { lessons, validateLessons } from "./lessons";
import { practiceItemById, validatePracticeItems } from "./practice";
import { normalizeSearchText, searchEntries } from "./search";
import { buildSearchDocuments } from "./search-documents";
import { conjugateVerbForTest, searchFormsForLemma } from "./search-forms";

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

  it("finds verbs by common conjugated forms", () => {
    expect(conjugateVerbForTest("navštíviť")).toContain("navštívim");
    expect(conjugateVerbForTest("robiť")).toContain("robím");
    expect(searchFormsForLemma("navštíviť", "Verbs")).toContain("navštívim");
    expect(searchEntries("navštívim")[0]?.slug).toBe("navstivit");
    expect(searchEntries("kupujem")[0]?.slug).toBe("kupovat");
  });

  it("indexes conjugated forms for Pagefind word documents", () => {
    const documents = buildSearchDocuments();
    const navstivit = documents.find(
      (document) => document.url === "/dictionary/navstivit",
    );
    expect(navstivit).toBeDefined();
    expect(normalizeSearchText(navstivit!.content)).toContain("navstivim");
  });

  it("does not keep Navštívim place fill stubs that steal verb form search", () => {
    const places = words.filter((word) => word.category === "Places");
    const polluted = places.filter((word) =>
      word.examples.some(
        (example) =>
          example.note === "Curated" &&
          !example.demonstrates &&
          /^Navštívim .+\.$/u.test(example.slovak),
      ),
    );
    expect(polluted.map((word) => word.slug)).toEqual([]);
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

  it("does not paste noun lemmas into accusative Potrebujem stubs", () => {
    const bad = words.filter((word) =>
      word.examples.some(
        (example) =>
          example.note === "Curated" &&
          !example.demonstrates &&
          /^Potrebujem .+\.$/u.test(example.slovak) &&
          /^I need /i.test(example.english ?? ""),
      ),
    );
    expect(bad.map((word) => word.slug)).toEqual([]);
  });

  it("uses classed noun fill frames including measure nouns", () => {
    const jednotka = words.find((word) => word.slug === "jednotka");
    expect(jednotka?.examples[0]?.slovak).toBe("Jedna jednotka stačí.");
    expect(jednotka?.examples[0]?.english).toBe("One unit is enough.");
    expect(jednotka?.examples[0]?.note).toBe("Curated");

    const informacia = words.find((word) => word.slug === "informacia");
    expect(informacia?.examples[0]?.note).toBe("Curated");
    expect(informacia?.examples[0]?.slovak).toMatch(/^(Toto je|To je|Kde je|Jedn[aoe])/u);
  });

  it("uses classed adjective fill frames instead of Ten príklad je", () => {
    const odborny = words.find((word) => word.slug === "odborny");
    expect(odborny?.examples[0]?.note).toBe("Curated");
    expect(odborny?.examples[0]?.slovak).not.toMatch(/^Ten príklad je /u);
    expect(odborny?.examples[0]?.slovak).toMatch(
      /^(Ten muž je|Ten dom je|Ten projekt je|Tá práca je|To mesto je )/u,
    );
    expect(odborny?.examples[0]?.slovak).not.toMatch(/^To je /u);

    const bad = words.filter((word) =>
      word.examples.some(
        (example) =>
          example.note === "Curated" &&
          !example.demonstrates &&
          /^Ten príklad je /u.test(example.slovak),
      ),
    );
    expect(bad.map((word) => word.slug)).toEqual([]);
  });

  it("avoids mono To je adjective fill stubs for masculine lemmas", () => {
    const bad = words.filter(
      (word) =>
        word.category === "Adjectives" &&
        /[ýí]$/u.test(word.slovak) &&
        word.examples.some(
          (example) =>
            example.note === "Curated" &&
            !example.demonstrates &&
            /^To je /u.test(example.slovak) &&
            /^That is /i.test(example.english ?? ""),
        ),
    );
    expect(bad.map((word) => word.slug)).toEqual([]);
  });

  it("does not use citation-gloss verb fill stubs", () => {
    const bad = words.filter((word) =>
      word.examples.some(
        (example) =>
          example.note === "Curated" &&
          !example.demonstrates &&
          /^Sloveso „[^“]+“ znamená /u.test(example.slovak),
      ),
    );
    expect(bad.map((word) => word.slug)).toEqual([]);
  });

  it("uses classed infinitive frames for leftover verb fills", () => {
    const isFillFrame = (slovak: string): boolean =>
      /^Chcem /u.test(slovak) ||
      /^Môže to /u.test(slovak) ||
      /^Môže sa to /u.test(slovak) ||
      /^Také veci môžu /u.test(slovak) ||
      /^Sloveso „/u.test(slovak);

    const leftovers = words.filter(
      (word) =>
        word.category === "Verbs" &&
        word.examples.length === 1 &&
        word.examples[0]?.note === "Curated" &&
        !word.examples[0]?.demonstrates &&
        isFillFrame(word.examples[0]?.slovak ?? ""),
    );
    expect(leftovers.length).toBeGreaterThan(50);
    expect(
      leftovers.every((word) => !/^Sloveso „/u.test(word.examples[0]?.slovak ?? "")),
    ).toBe(true);

    const prefixes = new Set(
      leftovers.map((word) => word.examples[0]?.slovak.split(" ").slice(0, 2).join(" ")),
    );
    expect(prefixes.size).toBeGreaterThanOrEqual(3);

    const vracat = words.find((word) => word.slug === "vracat");
    expect(vracat?.examples[0]?.slovak).toMatch(/^Chcem vracať\.$/u);

    const oznacit = words.find((word) => word.slug === "oznacit");
    expect(oznacit?.examples[0]?.slovak).toMatch(/^Chcem to označiť\.$/u);
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

  it("prefers semantic clusters over raw frequency neighbors", () => {
    const praca = words.find((word) => word.slug === "praca");
    const velky = words.find((word) => word.slug === "velky");
    const skola = words.find((word) => word.slug === "skola");

    expect(praca?.related).toEqual(
      expect.arrayContaining(["peniaze", "obchod", "nakupovat"]),
    );
    expect(velky?.related.some((slug) => ["maly", "dlhy", "kratky"].includes(slug))).toBe(
      true,
    );
    expect(skola?.related).toEqual(
      expect.arrayContaining(["ucitel", "ziak", "student", "kniha"]),
    );
  });

  it("prefers gloss-overlap related over raw frequency neighbors", () => {
    const hrat = words.find((word) => word.slug === "hrat");
    const dokazat = words.find((word) => word.slug === "dokazat");
    const snazit = words.find((word) => word.slug === "snazit");

    expect(
      hrat?.related.some((slug) => ["zahrat", "hravat", "zohrat"].includes(slug)),
    ).toBe(true);
    expect(
      dokazat?.related.some((slug) => ["preukazat", "dokazovat"].includes(slug)),
    ).toBe(true);
    expect(
      snazit?.related.some((slug) => ["pokusit", "pokusat", "skusit"].includes(slug)),
    ).toBe(true);
    // Rank noise should not win when gloss peers exist
    expect(hrat?.related).not.toEqual(expect.arrayContaining(["nevediet"]));
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

  it("stores recent search lookups with dedupe, cap, and clear", () => {
    const storage = new MemoryStorage();

    expect(normalizeHistoryHref("https://slovak.wiki/dictionary/ahoj?x=1")).toBe(
      "/dictionary/ahoj",
    );

    pushSearchHistory(storage, {
      at: 1,
      href: "/dictionary/ahoj",
      kind: "word",
      label: "ahoj",
    });
    pushSearchHistory(storage, {
      at: 2,
      href: "/grammar/cases/nominative",
      kind: "case",
      label: "Nominative",
    });
    pushSearchHistory(storage, {
      at: 3,
      href: "https://example.com/dictionary/ahoj",
      kind: "word",
      label: "ahoj",
    });

    expect(readSearchHistory(storage).map((item) => item.href)).toEqual([
      "/dictionary/ahoj",
      "/grammar/cases/nominative",
    ]);

    for (let index = 0; index < SEARCH_HISTORY_LIMIT + 2; index += 1) {
      pushSearchHistory(storage, {
        at: 10 + index,
        href: `/dictionary/word-${index}`,
        kind: "word",
        label: `word-${index}`,
      });
    }

    expect(readSearchHistory(storage)).toHaveLength(SEARCH_HISTORY_LIMIT);
    expect(readSearchHistory(storage)[0]?.href).toBe(
      `/dictionary/word-${SEARCH_HISTORY_LIMIT + 1}`,
    );

    clearSearchHistory(storage);
    expect(readSearchHistory(storage)).toEqual([]);
    expect(storage.getItem(searchHistoryKey)).toBeNull();
  });
});
