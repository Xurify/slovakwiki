import { describe, expect, it } from "vitest";

import {
  addReviewItem,
  answersMatch,
  emptyPracticeState,
  gradeAnswer,
  markLessonComplete,
  PRACTICE_STATE_STORAGE_KEY,
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
  SEARCH_HISTORY_STORAGE_KEY,
} from "../client/search-history";
import { allEntries, caseTopics, entryBySlug, validateContent, words } from "./data";
import { isDamagedExampleTemplate } from "./example-quality";
import { lessonById, lessons, validateLessons } from "./lessons";
import {
  practiceItemById,
  practiceItems,
  practiceSets,
  practiceSetForLesson,
  validatePracticeItems,
} from "./practice";
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

  it("keeps practice sets linked to lessons and preserves each lesson's primary set", () => {
    const setIds = new Set<string>();

    for (const set of practiceSets) {
      expect(setIds.has(set.id)).toBe(false);
      setIds.add(set.id);
      expect(lessonById.has(set.lessonId)).toBe(true);
    }

    expect(practiceSets).toHaveLength(5);
    expect(practiceSetForLesson("grammar/present-tense-i")?.id).toBe("present-tense-i");
    expect(practiceSetForLesson("grammar/present-tense-i")?.itemIds).toHaveLength(6);
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
    const meter = words.find((word) => word.slug === "meter");
    expect(meter?.examples[0]?.slovak).toBe("Kúpili sme meter modrej látky.");
    expect(meter?.examples[0]?.english).toBe("We bought a meter of blue fabric.");
    expect(meter?.examples[0]?.note).toBe("Curated");
    expect(meter?.examples[0]?.isPracticeFrame).toBeUndefined();

    const jednotka = words.find((word) => word.slug === "jednotka");
    expect(jednotka?.examples[0]?.note).toBe("Tatoeba");
    expect(jednotka?.examples[0]?.tatoebaId).toBeDefined();
    expect(jednotka?.examples[0]?.isPracticeFrame).toBeUndefined();

    const informacia = words.find((word) => word.slug === "informacia");
    expect(informacia?.examples[0]?.slovak).toBe("Táto informácia je dôležitá.");
    expect(informacia?.examples[0]?.english).toBe("This information is important.");
    expect(informacia?.examples[0]?.isPracticeFrame).toBeUndefined();

    const podnik = words.find((word) => word.slug === "podnik");
    expect(podnik?.examples[0]?.note).toBe("Curated");
    expect(podnik?.examples[0]?.isPracticeFrame).toBeUndefined();
    expect(podnik?.examples[0]?.slovak).toContain("podnik");
  });

  it("uses classed adjective fill frames instead of Ten príklad je", () => {
    const odborny = words.find((word) => word.slug === "odborny");
    expect(odborny?.examples[0]?.note).toBe("Curated");
    expect(odborny?.examples[0]?.slovak).toBe("Odborný článok vysvetľuje tému.");
    expect(odborny?.examples[0]?.isPracticeFrame).toBeUndefined();

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

  it("replaces audited valency and relational-adjective failures with reviewed examples", () => {
    const expected = new Map([
      ["ocitnut", "Môžem sa ocitnúť v ťažkej situácii."],
      ["podielat", "Chcem sa na tom podieľať."],
      ["stretavat", "Chcem sa s tebou stretávať."],
      ["zavisiet", "To môže závisieť od okolností."],
      ["tatransky", "Tatranský vzduch je čistý."],
    ]);

    for (const [slug, slovak] of expected) {
      const word = words.find((entry) => entry.slug === slug);
      expect(word?.examples[0]?.slovak).toBe(slovak);
      expect(word?.examples[0]?.isPracticeFrame).toBeUndefined();
    }
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
            /^To je \S+\.$/u.test(example.slovak) &&
            /^That is \S+\.$/i.test(example.english ?? ""),
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

  it("keeps hand-curated examples free of practice-frame flags", () => {
    const expected = [
      "ocitnut",
      "podielat",
      "stretavat",
      "zavisiet",
      "tatransky",
      "vracat",
      "informacia",
    ];

    for (const slug of expected) {
      const word = words.find((entry) => entry.slug === slug);
      expect(word?.examples.length).toBeGreaterThan(0);
      expect(word?.examples.every((example) => !example.isPracticeFrame)).toBe(true);
      expect(word?.examples[0]?.note).toBe("Curated");
    }
  });

  it("keeps Tatoeba examples marked as corpus sources", () => {
    const tatoeba = words.filter((word) =>
      word.examples.some((example) => example.note === "Tatoeba"),
    );
    expect(tatoeba.length).toBeGreaterThan(100);
    expect(
      tatoeba.every((word) =>
        word.examples
          .filter((example) => example.note === "Tatoeba")
          .every((example) => !example.isPracticeFrame),
      ),
    ).toBe(true);
  });

  it("does not claim Tatoeba in sourceNote when only practice frames exist", () => {
    // Practice-frame fills are fully replaced by reviewed/Tatoeba examples.
    const practiceOnly = words.find(
      (word) =>
        word.origin === "frequency" &&
        word.examples.length > 0 &&
        word.examples.every((example) => example.isPracticeFrame),
    );
    expect(practiceOnly).toBeUndefined();

    const reviewedOnly = words.find(
      (word) =>
        word.origin === "frequency" &&
        word.examples.length > 0 &&
        word.examples.every(
          (example) => example.note === "Curated" && !example.isPracticeFrame,
        ),
    );
    expect(reviewedOnly).toBeDefined();
    expect(reviewedOnly?.sourceNote).not.toContain("Tatoeba");
    expect(reviewedOnly?.sourceNote).not.toContain("Practice frames");

    const tatoebaOnly = words.find(
      (word) =>
        word.origin === "frequency" &&
        word.examples.some((example) => example.note === "Tatoeba") &&
        word.examples.every(
          (example) => example.note === "Tatoeba" || example.demonstrates,
        ),
    );
    expect(tatoebaOnly).toBeDefined();
    expect(tatoebaOnly?.sourceNote).toContain("Tatoeba");
  });

  it("uses reviewed verb examples instead of leftover infinitive fill frames", () => {
    const practiceVerbFills = words.filter(
      (word) =>
        word.category === "Verbs" &&
        word.examples.some((example) => example.isPracticeFrame),
    );
    expect(practiceVerbFills).toEqual([]);

    const badPrefixes = words.filter((word) =>
      word.examples.some(
        (example) =>
          example.note === "Curated" &&
          !example.demonstrates &&
          (/^Niekto môže /u.test(example.slovak) ||
            /^Je možné /u.test(example.slovak) ||
            /^Začínam /u.test(example.slovak)),
      ),
    );
    expect(badPrefixes.map((word) => word.slug)).toEqual([]);

    const vracat = words.find((word) => word.slug === "vracat");
    expect(vracat?.examples[0]?.slovak).toBe("Knihu vraciam do knižnice.");
    expect(vracat?.examples[0]?.isPracticeFrame).toBeUndefined();

    const oznacit = words.find((word) => word.slug === "oznacit");
    expect(oznacit?.examples[0]?.slovak).toBe("Chcem označiť správnu odpoveď.");
    expect(oznacit?.examples[0]?.isPracticeFrame).toBeUndefined();

    const nemoct = words.find((word) => word.slug === "nemoct");
    expect(nemoct?.examples[0]?.slovak).toBe("Nemôžem prísť zajtra.");
    expect(nemoct?.examples[0]?.isPracticeFrame).toBeUndefined();
  });

  it("rejects damaged fill-template residue on reviewed examples", () => {
    const damaged = words.flatMap((word) =>
      word.examples
        .filter(
          (example) =>
            example.note === "Curated" &&
            !example.isPracticeFrame &&
            isDamagedExampleTemplate(example.slovak, word.slovak),
        )
        .map((example) => `${word.slug}: ${example.slovak}`),
    );

    expect(damaged).toEqual([]);

    const posvatny = words.find((word) => word.slug === "posvatny");
    expect(posvatny?.examples[0]?.slovak).toBe(
      "Tento chrám je pre miestnych obyvateľov posvätný.",
    );
  });

  it("attributes frequency dictionary words to SNK, not JÚĽŠ", () => {
    const frequencyWord = words.find((word) => word.origin === "frequency");
    const curated = words.find((word) => word.origin === "curated");

    expect(frequencyWord).toBeDefined();
    expect(curated).toBeDefined();
    expect(frequencyWord?.sourceLabel).toContain("Slovak National Corpus");
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

  it("fills related neighbors for frequency dictionary words", () => {
    const frequencyWord = words.find(
      (word) => word.origin === "frequency" && word.frequency?.rank === 2,
    );
    expect(frequencyWord?.related.length).toBeGreaterThan(0);
    for (const relatedSlug of frequencyWord?.related ?? []) {
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

  it("keeps high-value related concepts and antonyms reciprocal", () => {
    const expectedPairs = [
      ["pocet", "cislo"],
      ["pocet", "mnozstvo"],
      ["cislo", "mnozstvo"],
      ["dobry", "zly"],
      ["lahky", "tazky"],
      ["problem", "riesenie"],
      ["zapas", "hra"],
      ["vlada", "stat-n"],
    ] as const;

    for (const [firstSlug, secondSlug] of expectedPairs) {
      const first = words.find((word) => word.slug === firstSlug);
      const second = words.find((word) => word.slug === secondSlug);

      expect(first?.related).toContain(secondSlug);
      expect(second?.related).toContain(firstSlug);
    }
  });

  it("keeps expanded semantic clusters ahead of rank-neighbor fallback", () => {
    expect(words.find((word) => word.slug === "nechciet")?.related).toContain("chciet");
    expect(words.find((word) => word.slug === "cena")?.related).toContain("peniaze");
    expect(words.find((word) => word.slug === "telo")?.related).toEqual(
      expect.arrayContaining(["ruka", "noha", "hlava"]),
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

  it("grades cloze answers with an accents near-miss path", () => {
    expect(gradeAnswer("čítam", "Čítam")).toBe("correct");
    expect(gradeAnswer("Citam", "Čítam")).toBe("accents");
    expect(gradeAnswer("píšem", "Čítam")).toBe("incorrect");
  });

  it("resolves cloze lemma and grammar topic ids", () => {
    const clozeItems = practiceItems.filter((item) => item.task.type === "cloze");
    expect(clozeItems.length).toBeGreaterThanOrEqual(3);

    for (const item of clozeItems) {
      if (item.task.type !== "cloze") continue;
      if (item.task.lemmaId) {
        expect(entryBySlug.has(item.task.lemmaId)).toBe(true);
      }
      if (item.task.hint.grammarTopicId) {
        expect(entryBySlug.has(item.task.hint.grammarTopicId)).toBe(true);
      }
    }
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

  it("keeps string ids from stored practice state and drops non-strings", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      PRACTICE_STATE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        completedLessonIds: ["missing-lesson", "everyday/meet-someone", 12],
        reviewItemIds: ["missing-item", "everyday/origin", null],
        savedReferenceItemIds: ["missing-item", "grammar/first-person-reading", ""],
      }),
    );

    expect(readPracticeState(storage)).toEqual({
      version: 1,
      completedLessonIds: ["missing-lesson", "everyday/meet-someone"],
      reviewItemIds: ["missing-item", "everyday/origin"],
      savedReferenceItemIds: ["missing-item", "grammar/first-person-reading"],
    });
  });

  it("stores recent search lookups with dedupe, cap, and clear", () => {
    const storage = new MemoryStorage();

    expect(normalizeHistoryHref("https://slovak.wiki/dictionary/ahoj?x=1")).toBe(
      "/dictionary/ahoj",
    );

    pushSearchHistory(storage, {
      visitedAt: 1,
      href: "/dictionary/ahoj",
      kind: "word",
      label: "ahoj",
    });
    pushSearchHistory(storage, {
      visitedAt: 2,
      href: "/grammar/cases/nominative",
      kind: "case",
      label: "Nominative",
    });
    pushSearchHistory(storage, {
      visitedAt: 3,
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
        visitedAt: 10 + index,
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
    expect(storage.getItem(SEARCH_HISTORY_STORAGE_KEY)).toBeNull();
  });
});
