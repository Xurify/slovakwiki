import { describe, expect, it } from "vitest";

import {
  answersMatch,
  closestAcceptedAnswer,
  displayPracticeAnswer,
  emptyPracticeState,
  gradeAnswer,
  markLessonComplete,
  readPracticeState,
  saveRecentItem,
  suggestCloseAnswer,
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
import {
  allEntries,
  caseTopics,
  entryBySlug,
  grammarEntries,
  validateContent,
  words,
} from "./data";
import { isDamagedExampleTemplate } from "./example-quality";
import { lessonById, lessons, validateLessons } from "./lessons";
import {
  practiceItemById,
  practiceItemHref,
  practiceItems,
  practiceSets,
  practiceSetForItem,
  practiceSetForLesson,
  practiceSessionCount,
  samplePracticeItemIds,
  validatePracticeItems,
} from "./practice";
import { normalizeSearchText, searchEntries } from "./search";
import { buildSearchDocuments } from "./search-documents";
import { conjugateVerbForTest, searchFormsForLemma } from "./search-forms";
import { searchMetaLabel } from "./search-ui";
import { answersForTime } from "$lib/learning/time/clock";

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

  it("finds question words such as prečo and ktorý without diacritics", () => {
    expect(searchEntries("preco")[0]?.slug).toBe("preco");
    expect(searchEntries("ktory")[0]?.slug).toBe("ktory");
    expect(searchEntries("ktorý")[0]?.slug).toBe("ktory");
  });

  it("indexes question words for Pagefind word documents", () => {
    const documents = buildSearchDocuments();
    const preco = documents.find((document) => document.url === "/dictionary/preco");
    expect(preco).toBeDefined();
    expect(normalizeSearchText(preco!.content)).toContain("preco");
  });

  it("indexes grammar and case examples for Pagefind", () => {
    const documents = buildSearchDocuments();
    const nominative = documents.find(
      (document) => document.url === "/grammar/cases/nominative",
    );
    expect(nominative).toBeDefined();
    expect(normalizeSearchText(nominative!.content)).toContain("peter cita knihu");
  });

  it("indexes conjugated forms for Pagefind word documents", () => {
    const documents = buildSearchDocuments();
    const navstivit = documents.find(
      (document) => document.url === "/dictionary/navstivit",
    );
    expect(navstivit).toBeDefined();
    expect(navstivit!.category).toBe("Verbs");
    expect(normalizeSearchText(navstivit!.content)).toContain("navstivim");
  });

  it("labels word search meta with category instead of Word", () => {
    expect(searchMetaLabel("word", "Nouns")).toBe("Noun");
    expect(searchMetaLabel("word", "Verbs")).toBe("Verb");
    expect(searchMetaLabel("word", "Phrases")).toBe("Phrase");
    expect(searchMetaLabel("word")).toBe("Word");
    expect(searchMetaLabel("grammar")).toBe("Grammar");
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

  it("publishes valid lesson and practice content with a practice item for every graded exercise", () => {
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

    expect(practiceSets).toHaveLength(10);
    const present = practiceSetForLesson("grammar/present-tense-i");
    expect(present?.id).toBe("present-tense-i");
    expect(present?.sessionSize).toBe(7);
    expect(present?.itemIds.length).toBeGreaterThan(7);
    expect(practiceSessionCount(present!)).toBe(7);

    expect(practiceSetForLesson("everyday/numbers-and-personal-details")?.id).toBe(
      "numbers-and-personal-details",
    );
    expect(practiceSetForLesson("everyday/days-dates-and-time")?.id).toBe(
      "days-dates-and-time",
    );
    expect(practiceSetForLesson("everyday/negation-in-conversation")?.id).toBe(
      "negation-in-conversation",
    );
    expect(practiceSetForLesson("grammar/byt-present")?.id).toBe("byt-present");
    expect(practiceSetForLesson("grammar/mat-present")?.id).toBe("mat-present");
  });

  it("routes every practice item through its topic set", () => {
    for (const item of practiceItems) {
      const set = practiceSetForItem(item.id);
      expect(set).toBeDefined();
      expect(set!.itemIds).toContain(item.id);
    }

    expect(practiceItemHref("pronunciation/thanks-phrase")).toBe(
      "/practice/stress-in-phrases?at=pronunciation%2Fthanks-phrase",
    );
  });

  it("publishes expanded alphabet, everyday, and grammar reference content", () => {
    expect(entryBySlug.has("slovak-alphabet")).toBe(true);
    expect(entryBySlug.has("numbers-and-numerals")).toBe(true);
    expect(entryBySlug.has("negation")).toBe(true);
    expect(entryBySlug.has("questions")).toBe(true);
    expect(entryBySlug.has("telling-time")).toBe(true);
    expect(entryBySlug.has("byt-present")).toBe(true);
    expect(entryBySlug.has("mat-present")).toBe(true);
    expect(entryBySlug.has("aspect")).toBe(true);
    expect(entryBySlug.has("ty-vs-vy")).toBe(true);
    expect(entryBySlug.has("rhythmic-law")).toBe(true);

    expect(entryBySlug.has("telling-time")).toBe(true);
    expect(entryBySlug.get("numbers-and-numerals")?.related).toContain("telling-time");
    expect(grammarEntries.find((topic) => topic.slug === "questions")?.nextSlug).toBe(
      undefined,
    );
    expect(
      grammarEntries.find((topic) => topic.slug === "numbers-and-numerals")?.pathGroup,
    ).toBe("Numbers");
    expect(grammarEntries.find((topic) => topic.slug === "telling-time")?.pathGroup).toBe(
      "Numbers",
    );
    expect(grammarEntries.find((topic) => topic.slug === "word-order")?.pathGroup).toBe(
      "Sentence building",
    );

    const timeLesson = lessonById.get("everyday/days-dates-and-time");
    expect(timeLesson?.visual?.type).toBe("clock-grid");
    expect(timeLesson?.visual?.items.length).toBeGreaterThanOrEqual(4);

    for (const lesson of lessons) {
      for (const exercise of lesson.exercises) {
        if (exercise.type !== "choice") continue;

        if (exercise.clock) {
          expect(exercise.clock.hour).toBeGreaterThanOrEqual(1);
          expect(exercise.clock.hour).toBeLessThanOrEqual(12);
          expect(exercise.clock.minute).toBeGreaterThanOrEqual(0);
          expect(exercise.clock.minute).toBeLessThan(60);
          expect(exercise.choiceStyle).not.toBe("clock");
        }

        if (exercise.choiceStyle === "clock") {
          expect(exercise.clock).toBeUndefined();
          expect(exercise.promptLang).toBe("sk");
          for (const choice of exercise.choices) {
            expect(choice.clock).toBeDefined();
            expect(choice.clock!.hour).toBeGreaterThanOrEqual(1);
            expect(choice.clock!.hour).toBeLessThanOrEqual(12);
            expect(choice.clock!.minute).toBeGreaterThanOrEqual(0);
            expect(choice.clock!.minute).toBeLessThan(60);
          }
        }
      }
    }

    expect(lessonById.has("everyday/numbers-and-personal-details")).toBe(true);
    expect(lessonById.has("everyday/days-dates-and-time")).toBe(true);
    expect(lessonById.has("everyday/negation-in-conversation")).toBe(true);
    expect(lessonById.has("grammar/byt-present")).toBe(true);
    expect(lessonById.has("grammar/mat-present")).toBe(true);

    for (const lessonId of [
      "everyday/numbers-and-personal-details",
      "everyday/days-dates-and-time",
      "everyday/negation-in-conversation",
      "grammar/byt-present",
      "grammar/mat-present",
    ] as const) {
      const lesson = lessonById.get(lessonId)!;
      const graded = lesson.exercises.filter((exercise) => exercise.type !== "personal");
      expect(graded.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("samples a shuffled practice session from the pool", () => {
    const pool = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const sample = samplePracticeItemIds(pool, 7);

    expect(sample).toHaveLength(7);
    expect(new Set(sample).size).toBe(7);
    expect(sample.every((id) => pool.includes(id))).toBe(true);
    expect(samplePracticeItemIds(["only"], 7)).toEqual(["only"]);
    expect(samplePracticeItemIds(pool).sort()).toEqual([...pool].sort());
  });

  it("publishes usable content for every case page", () => {
    expect(caseTopics.every((topic) => topic.status === "ready")).toBe(true);
    expect(
      caseTopics.every((topic) => topic.body.length > 0 && topic.examples.length > 0),
    ).toBe(true);
  });

  it("gives every word at least one example", () => {
    expect(words.every((word) => word.examples.length > 0)).toBe(true);
  });

  it("keeps dictionary usage body only for real pattern notes", () => {
    expect(
      words.every(
        (word) =>
          !word.body.some(
            (paragraph) =>
              paragraph.includes("everyday Slovak") ||
              paragraph.includes("Read the example") ||
              paragraph.includes("Say it aloud"),
          ),
      ),
    ).toBe(true);

    const rad = words.find((word) => word.slug === "rad");
    expect(rad?.body.length).toBeGreaterThan(0);
    expect(rad?.body[0]).toMatch(/mať rád/i);

    const plain = words.find((word) => word.slug === "stanica");
    expect(plain?.body).toEqual([]);
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

  it("avoids legacy universal adverb fill stubs", () => {
    const bad = words.filter(
      (word) =>
        word.category === "Adverbs" &&
        word.examples.some(
          (example) =>
            example.isPracticeFrame === true &&
            ((/^Urobím to .+\.$/u.test(example.slovak) &&
              /^I'll do it /i.test(example.english ?? "")) ||
              (/^Stalo sa to .+\.$/u.test(example.slovak) &&
                /^It happened /i.test(example.english ?? ""))),
        ),
    );
    expect(bad.map((word) => word.slug)).toEqual([]);
  });

  it("publishes adverb homographs under -adv slugs", () => {
    const malo = words.find((word) => word.slug === "malo-adv");
    expect(malo?.slovak).toBe("málo");
    expect(malo?.category).toBe("Adverbs");
    expect(malo?.frequency?.partOfSpeech).toBe("adverb");

    const slovenskyAdv = words.find((word) => word.slug === "slovensky-adv");
    expect(slovenskyAdv?.slovak).toBe("slovensky");
    expect(slovenskyAdv?.category).toBe("Adverbs");
    expect(slovenskyAdv?.frequency).toEqual({ partOfSpeech: "adverb", rank: 281 });
  });

  it("indexes POS sibling senses to the shared lemma path", () => {
    const documents = buildSearchDocuments();
    const maloAdv = documents.find(
      (document) => document.title === "málo" && document.category === "Adverbs",
    );
    expect(maloAdv?.url).toBe("/dictionary/malo#adverb");
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
    const practiceOnly = words.filter(
      (word) =>
        word.origin === "frequency" &&
        word.examples.length > 0 &&
        word.examples.every((example) => example.isPracticeFrame),
    );
    for (const word of practiceOnly) {
      expect(word.sourceNote).toContain("Practice frames");
      expect(word.sourceNote).not.toContain("Tatoeba");
    }

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
    expect(byt?.frequency?.partOfSpeech).toBe("verb");
    expect(byt?.frequency?.rank).toBe(1);

    const velky = words.find((word) => word.slovak === "veľký");
    expect(velky?.frequency?.rank).toBe(1);

    const slovensky = words.find((word) => word.slug === "slovensky");
    expect(slovensky?.origin).toBe("curated");
    expect(slovensky?.category).toBe("Phrases");
    expect(slovensky?.frequency).toBeUndefined();

    const slovenskyAdv = words.find((word) => word.slug === "slovensky-adv");
    expect(slovenskyAdv?.category).toBe("Adverbs");
    expect(slovenskyAdv?.frequency).toEqual({ partOfSpeech: "adverb", rank: 281 });

    const hned = words.find((word) => word.slovak === "hneď");
    expect(hned?.category).toBe("Adverbs");
    expect(hned?.frequency).toEqual({ partOfSpeech: "adverb", rank: 17 });

    const maloAdv = words.find(
      (word) => word.slovak === "málo" && word.category === "Adverbs",
    );
    expect(maloAdv?.frequency?.partOfSpeech).toBe("adverb");
    expect(maloAdv?.slug).toBe("malo-adv");
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

  it("suggests close typed answers via Levenshtein without marking correct", () => {
    const accepted = answersForTime({ hour: 11, minute: 15 });
    const preferred = accepted[0] ?? "";

    expect(gradeAnswer("jedanásť pätnásť", preferred, accepted)).toBe("incorrect");
    expect(suggestCloseAnswer("jedanásť pätnásť", preferred, accepted)).toBe(
      "jedenásť pätnásť",
    );

    expect(gradeAnswer("čítam", "Čítam")).toBe("correct");
    expect(suggestCloseAnswer("čítam", "Čítam")).toBeNull();

    expect(gradeAnswer("Citam", "Čítam")).toBe("accents");
    expect(suggestCloseAnswer("Citam", "Čítam")).toBeNull();

    expect(suggestCloseAnswer("píšem", "Čítam")).toBeNull();
    expect(suggestCloseAnswer("   ", preferred, accepted)).toBeNull();
    expect(suggestCloseAnswer("", preferred, accepted)).toBeNull();
  });

  it("picks the closest accepted clock form as the primary correction", () => {
    const accepted = answersForTime({ hour: 5, minute: 45 });
    const preferred = accepted[0] ?? "";

    expect(preferred).toBe("Je trištvrte na šesť");
    expect(closestAcceptedAnswer("trištvrte na deväť", preferred, accepted)).toBe(
      "trištvrte na šesť",
    );
    expect(closestAcceptedAnswer("Je trištvrte na deväť", preferred, accepted)).toBe(
      "Je trištvrte na šesť",
    );
    expect(closestAcceptedAnswer("", preferred, accepted)).toBe(preferred);
  });

  it("capitalizes Slovak answers for feedback display only", () => {
    expect(displayPracticeAnswer("trištvrte na šesť")).toBe("Trištvrte na šesť");
    expect(displayPracticeAnswer("Je trištvrte na šesť")).toBe("Je trištvrte na šesť");
    expect(displayPracticeAnswer("")).toBe("");
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

  it("marks key terms in every practice and lesson why line", () => {
    const missing: string[] = [];

    for (const item of practiceItems) {
      if (!item.feedback.why.includes("**")) {
        missing.push(`practice:${item.id}`);
      }
    }

    for (const lesson of lessons) {
      for (const exercise of lesson.exercises) {
        if (exercise.type === "personal") continue;
        if (!exercise.feedback.why.includes("**")) {
          missing.push(`lesson:${lesson.id}:${exercise.practiceItemId}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it("stores only completion and recent drill state", () => {
    const storage = new MemoryStorage();
    const state = saveRecentItem(
      markLessonComplete(emptyPracticeState(), "everyday/meet-someone"),
      "grammar/first-person-reading",
    );

    writePracticeState(storage, state);
    expect(readPracticeState(storage)).toEqual({
      version: 1,
      completedLessonIds: ["everyday/meet-someone"],
      recentItemIds: ["grammar/first-person-reading"],
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
      category: "Phrases",
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
      category: "Phrases",
    });

    expect(readSearchHistory(storage).map((item) => item.href)).toEqual([
      "/dictionary/ahoj",
      "/grammar/cases/nominative",
    ]);
    expect(readSearchHistory(storage)[0]?.category).toBe("Phrases");

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
