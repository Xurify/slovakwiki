import { describe, expect, it } from "vitest";

import { lessonById, lessons } from "$lib/catalog/lessons";
import { NOUNS as DEMONSTRATIVE_NOUNS } from "$lib/learning/demonstratives/paradigm";
import {
  DEMONSTRATIVE_KINDS,
  materializeDemonstrativeItem,
} from "$lib/learning/demonstratives/session";
import { seededRng } from "$lib/learning/possessives/session";
import {
  lessonWords,
  sameWord,
  unintroducedLessonWords,
  unintroducedTaskWords,
  withNounForms,
} from "./vocabulary";

/** Pronunciation choices are English descriptions (“The first syllable”), not Slovak. */
const CHECKED_LESSONS = lessons
  .filter((lesson) => lesson.track !== "pronunciation")
  .map((lesson) => lesson.id);

function requireLesson(id: string) {
  const lesson = lessonById.get(id);
  if (!lesson) throw new Error(`Missing lesson: ${id}`);
  return lesson;
}

describe("sameWord", () => {
  it("matches case forms that share a stem", () => {
    expect(sameWord("taška", "tašku")).toBe(true);
    expect(sameWord("chlapci", "chlapcovi")).toBe(true);
    expect(sameWord("dom", "domu")).toBe(true);
    expect(sameWord("dám", "dá")).toBe(true);
  });

  it("does not let a short word cover a longer one, and stays a heuristic", () => {
    expect(sameWord("ku", "kufor")).toBe(false);
    expect(sameWord("kino", "kniha")).toBe(false);
    expect(sameWord("muž", "mužovi")).toBe(true);
    expect(sameWord("pomáha", "pomoc")).toBe(true);
  });
});

describe("lesson vocabulary", () => {
  it.each(CHECKED_LESSONS)("%s tests only words it has shown", (id) => {
    expect(unintroducedLessonWords(requireLesson(id))).toEqual([]);
  });

  it("builds demonstrative practice only from words the lesson shows", () => {
    const known = withNounForms(
      lessonWords(requireLesson("grammar/demonstratives")),
      DEMONSTRATIVE_NOUNS,
    );

    for (const kind of DEMONSTRATIVE_KINDS) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const { task } = materializeDemonstrativeItem(kind, seededRng(seed));
        expect(unintroducedTaskWords(task, known), `${kind} seed ${seed}`).toEqual([]);
      }
    }
  });

  it("introduces every noun the demonstrative drills decline", () => {
    const known = lessonWords(requireLesson("grammar/demonstratives"));

    for (const entry of DEMONSTRATIVE_NOUNS) {
      const forms = Object.values(entry.forms).map((form) =>
        form.toLocaleLowerCase("sk"),
      );
      expect(
        forms.some((form) => known.some((word) => sameWord(word, form))),
        entry.id,
      ).toBe(true);
    }
  });
});
