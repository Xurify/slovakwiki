import { describe, expect, it } from "vitest";

import { answersMatch } from "$lib/components/practice/practice-state";
import { words } from "$lib/catalog/entries";
import { searchFormsForLemma } from "$lib/catalog/search/forms";
import { maybeMaterializeBuildItem } from "$lib/learning/exercises/materialize-build";
import { containsAnswerWords } from "$lib/learning/exercises/answer-diff";
import { gradeChoice } from "$lib/learning/exercises/choice";
import {
  daysDatesTimePracticeItems,
  daysDatesTimePracticeItemIds,
} from "$lib/learning/time/practice-catalog";
import { daysDatesTimeGradedExercises } from "$lib/learning/time/lesson";
import {
  materializeDaysDatesTimeItem,
  type DaysDatesTimeKind,
} from "$lib/learning/time/session";
import {
  POSSESSIVE_KINDS,
  materializePossessiveItem,
  seededRng,
} from "$lib/learning/possessives/session";
import {
  DEMONSTRATIVE_KINDS,
  materializeDemonstrativeItem,
} from "$lib/learning/demonstratives/session";
import { practiceItems } from "$lib/catalog/practice";
import { lessonExercises } from "$lib/learning/beats";
import { lessons } from "$lib/catalog/lessons";
import type {
  BuildExercise,
  ChoiceExercise,
  PracticeTask,
  TypedExercise,
} from "$lib/learning/types";

function generatedTasks(): PracticeTask[] {
  return [
    ...POSSESSIVE_KINDS.flatMap((kind) =>
      Array.from(
        { length: 40 },
        (_, seed) => materializePossessiveItem(kind, seededRng(seed + 1)).task,
      ),
    ),
    ...DEMONSTRATIVE_KINDS.flatMap((kind) =>
      Array.from(
        { length: 40 },
        (_, seed) => materializeDemonstrativeItem(kind, seededRng(seed + 1)).task,
      ),
    ),
  ];
}

function choiceExercisesFromLessons(): ChoiceExercise[] {
  return lessons.flatMap((lesson) =>
    lessonExercises(lesson).filter(
      (exercise): exercise is ChoiceExercise => exercise.type === "choice",
    ),
  );
}

function choiceTasksFromPractice(): ChoiceExercise[] {
  return practiceItems
    .map((item) => item.task)
    .filter((task): task is ChoiceExercise => task.type === "choice");
}

function allChoiceTasks(): ChoiceExercise[] {
  const materialized = daysDatesTimePracticeItemIds.flatMap((kind) =>
    [0, 0.1, 0.42, 0.5, 0.9].map(
      (seed) => materializeDaysDatesTimeItem(kind as DaysDatesTimeKind, () => seed).task,
    ),
  );
  return [
    ...choiceExercisesFromLessons(),
    ...choiceTasksFromPractice(),
    ...daysDatesTimeGradedExercises.filter(
      (exercise): exercise is ChoiceExercise => exercise.type === "choice",
    ),
    ...daysDatesTimePracticeItems
      .map((item) => item.task)
      .filter((task): task is ChoiceExercise => task.type === "choice"),
    ...materialized.filter((task): task is ChoiceExercise => task.type === "choice"),
    ...generatedTasks().filter((task): task is ChoiceExercise => task.type === "choice"),
  ];
}

function isAnswerTask(task: PracticeTask): task is BuildExercise | TypedExercise {
  return task.type === "build" || task.type === "typed";
}

function allAnswerTasks(): Array<BuildExercise | TypedExercise> {
  return [
    ...lessons.flatMap((lesson) =>
      lessonExercises(lesson).filter(
        (exercise): exercise is BuildExercise | TypedExercise =>
          exercise.type === "build" || exercise.type === "typed",
      ),
    ),
    ...practiceItems.map((item) => item.task).filter(isAnswerTask),
    ...generatedTasks().filter(isAnswerTask),
  ];
}

function acceptedAnswers(task: BuildExercise | TypedExercise): string[] {
  if (task.type === "build") return [task.answer.join(" ")];
  return [task.answer, ...(task.acceptedAnswers ?? [])];
}

/** Every build or typed task a learner can meet, including session-time variants. */
function answerTaskPool(): Array<BuildExercise | TypedExercise> {
  const seeds = Array.from({ length: 40 }, (_, seed) => seededRng(seed + 1));
  return [
    ...allAnswerTasks(),
    ...daysDatesTimePracticeItemIds.flatMap((kind) =>
      seeds.map(
        (rng) => materializeDaysDatesTimeItem(kind as DaysDatesTimeKind, rng).task,
      ),
    ),
    ...practiceItems.flatMap((item) =>
      seeds.map((rng) => maybeMaterializeBuildItem(item, rng).task),
    ),
  ].filter(isAnswerTask);
}

function sentenceCase(text: string): string {
  const trimmed = text.trim().replace(/\s+/gu, " ");
  return trimmed.charAt(0).toLocaleUpperCase("sk") + trimmed.slice(1);
}

function countTiles(tiles: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tile of tiles) counts.set(tile, (counts.get(tile) ?? 0) + 1);
  return counts;
}

type Person = "1sg" | "2sg" | "1pl" | "2pl";

const SUBJECT_PRONOUN: Record<Person, string> = {
  "1sg": "Ja",
  "2sg": "Ty",
  "1pl": "My",
  "2pl": "Vy",
};

const BYT_PERSON: Record<string, Person> = {
  som: "1sg",
  si: "2sg",
  sme: "1pl",
  ste: "2pl",
};

// Clitics sit second in the clause, so they move in front of the verb after a pronoun.
const CLITICS = new Set([
  "sa",
  "si",
  "mi",
  "ti",
  "mu",
  "nám",
  "vám",
  "im",
  "ma",
  "ťa",
  "ho",
  "ju",
]);

// Imperatives that end like a present-tense plural (pite, umyte) take no pronoun.
const VOWEL_IMPERATIVE = /(?:pi|bi|ši|ži|my|kry)(?:me|te)$/u;

const verbForms = new Set(
  words
    .filter((word) => word.category === "Verbs")
    .flatMap((word) => [word.slovak, ...searchFormsForLemma(word.slovak, "Verbs")])
    .map((form) => form.toLocaleLowerCase("sk")),
);

function bareWord(word: string): string {
  return word.replace(/[\p{P}]/gu, "").toLocaleLowerCase("sk");
}

function isVerbForm(word: string): boolean {
  return verbForms.has(word) || (word.startsWith("ne") && verbForms.has(word.slice(2)));
}

function presentPerson(word: string): Person | undefined {
  if (BYT_PERSON[word]) return BYT_PERSON[word];
  if (!isVerbForm(word)) return undefined;
  if (word.endsWith("m")) return "1sg";
  if (word.endsWith("š")) return "2sg";
  if (VOWEL_IMPERATIVE.test(word)) return undefined;
  if (/[aáäeéiíoóuúyý]me$/u.test(word)) return "1pl";
  if (/[aáäeéiíoóuúyý]te$/u.test(word)) return "2pl";
  return undefined;
}

/**
 * The same answer with its optional subject pronoun: "Som Alex." → "Ja som Alex.",
 * "Stretneme sa v utorok." → "My sa stretneme v utorok."
 */
function withSubjectPronoun(answer: string): string | undefined {
  const tokens = answer.trim().split(/\s+/u);
  const first = bareWord(tokens[0] ?? "");
  const negatedByt = first === "nie" ? BYT_PERSON[bareWord(tokens[1] ?? "")] : undefined;
  const person = negatedByt ?? presentPerson(first);
  if (!person) return undefined;

  const verbLength = negatedByt ? 2 : 1;
  const verb = tokens.slice(0, verbLength);
  const rest = tokens.slice(verbLength);
  const clitics: string[] = [];
  while (rest.length > 1 && CLITICS.has(bareWord(rest[0]!))) clitics.push(rest.shift()!);

  verb[0] = verb[0]!.toLocaleLowerCase("sk");
  return [SUBJECT_PRONOUN[person], ...clitics, ...verb, ...rest].join(" ");
}

function trapChoices(task: ChoiceExercise) {
  return task.choices.filter((choice) => choice.fits !== true);
}

function distractors(task: ChoiceExercise) {
  return task.choices.filter((choice) => choice.id !== task.answerId);
}

describe("exercise audit invariants", () => {
  it("pickTrap items expose exactly one trap choice", () => {
    const pickTrapTasks = allChoiceTasks().filter(
      (task) => task.choiceMode === "pickTrap",
    );

    for (const task of pickTrapTasks) {
      expect(
        trapChoices(task),
        `${task.id ?? task.practiceItemId} trap count`,
      ).toHaveLength(1);
      expect(task.choices.some((choice) => choice.fits === true)).toBe(true);
      expect(task.prompt).toMatch(/does not mean/i);
    }
  });

  it("pickCorrect prompts do not use odd-one-out wording", () => {
    const pickCorrectTasks = allChoiceTasks().filter(
      (task) => task.choiceMode !== "pickTrap",
    );

    for (const task of pickCorrectTasks) {
      expect(task.prompt, `${task.id ?? task.practiceItemId} prompt`).not.toMatch(
        /does not mean/i,
      );
    }
  });

  it("every choice distractor keeps whyWrong", () => {
    for (const task of allChoiceTasks()) {
      const missingWhyWrong = distractors(task).filter((choice) => !choice.whyWrong);
      expect(
        missingWhyWrong.map((choice) => choice.id),
        `${task.id ?? task.practiceItemId} missing whyWrong`,
      ).toEqual([]);
    }
  });

  it("never flags an accepted answer as a mistake", () => {
    for (const task of allAnswerTasks()) {
      const flagged = (task.mistakes ?? []).filter((mistake) =>
        acceptedAnswers(task).some((answer) =>
          containsAnswerWords(answer, mistake.wrong),
        ),
      );
      expect(
        flagged.map((mistake) => mistake.wrong),
        `${task.id} mistakes matching an accepted answer`,
      ).toEqual([]);
    }
  });

  it("builds every answer from the tile bank", () => {
    const problems = new Set<string>();
    for (const task of answerTaskPool()) {
      if (task.type !== "build") continue;
      const bank = countTiles(task.tiles);
      for (const [tile, count] of countTiles(task.answer)) {
        if ((bank.get(tile) ?? 0) < count) problems.add(`${task.id}: no tile "${tile}"`);
      }
    }
    expect([...problems]).toEqual([]);
  });

  it("joins build tiles into exactly the correction, punctuation included", () => {
    const problems = new Set<string>();
    for (const task of answerTaskPool()) {
      if (task.type !== "build") continue;
      const built = sentenceCase(task.answer.join(" "));
      const correction = sentenceCase(task.feedback.correction ?? "");
      if (built !== correction) {
        problems.add(`${task.id}: tiles read "${built}", correction is "${correction}"`);
      }
    }
    expect([...problems]).toEqual([]);
  });

  it("accepts the optional subject pronoun when an answer opens with a verb", () => {
    const problems = new Set<string>();
    for (const task of answerTaskPool()) {
      if (task.type !== "typed" || task.task !== "complete") continue;
      for (const variant of acceptedAnswers(task).map(withSubjectPronoun)) {
        if (variant && !answersMatch(variant, task.answer, task.acceptedAnswers)) {
          problems.add(`${task.id}: add "${variant}" to acceptedAnswers`);
        }
      }
    }
    expect([...problems]).toEqual([]);
  });

  it("grades only the lone trap on pickTrap success", () => {
    const noon = materializeDaysDatesTimeItem("everyday/noon-midnight", () => 0);
    expect(noon.task.type).toBe("choice");
    if (noon.task.type !== "choice" || noon.task.choiceMode !== "pickTrap") return;

    const trap = trapChoices(noon.task)[0]!;
    const fit = noon.task.choices.find((choice) => choice.fits === true)!;

    expect(gradeChoice(trap.id, noon.task)).toBe(true);
    expect(gradeChoice(fit.id, noon.task)).toBe(false);
    expect(trapChoices(noon.task).map((choice) => choice.id)).toEqual([
      noon.task.answerId,
    ]);
  });
});
