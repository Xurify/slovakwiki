import { describe, expect, it } from "vitest";

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
