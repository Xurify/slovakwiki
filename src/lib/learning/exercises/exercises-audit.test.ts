import { describe, expect, it } from "vitest";

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
import { practiceItems } from "$lib/content/practice";
import { lessonExercises } from "$lib/learning/lesson-beats";
import { lessons } from "$lib/content/lessons";
import type { ChoiceExercise } from "$lib/learning/types";

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
  ];
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
