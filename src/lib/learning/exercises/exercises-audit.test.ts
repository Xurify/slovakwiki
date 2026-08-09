import { describe, expect, it } from "vitest";

import { gradeChoice } from "$lib/learning/exercises/choice";
import { daysDatesTimePracticeItems, daysDatesTimePracticeItemIds } from "$lib/learning/time/practice-catalog";
import { daysDatesTimeGradedExercises } from "$lib/learning/time/lesson";
import { materializeDaysDatesTimeItem } from "$lib/learning/time/session";
import { practiceItems } from "$lib/content/practice";
import { lessons } from "$lib/content/lessons";
import type { ChoiceExercise } from "$lib/learning/types";

function choiceExercisesFromLessons(): ChoiceExercise[] {
  return lessons.flatMap((lesson) =>
    lesson.exercises
      .filter((exercise): exercise is ChoiceExercise => exercise.type === "choice")
      .map((exercise) => exercise),
  );
}

function choiceTasksFromPractice() {
  return practiceItems
    .filter((item) => item.task.type === "choice")
    .map((item) => item.task)
    .filter((task): task is ChoiceExercise => task.type === "choice");
}

function trapChoices(task: ChoiceExercise) {
  return task.choices.filter((choice) => choice.fits !== true);
}

describe("exercise audit invariants", () => {
  it("pickTrap items expose exactly one trap choice", () => {
    const pickTrapTasks = [
      ...choiceExercisesFromLessons().filter((task) => task.choiceMode === "pickTrap"),
      ...choiceTasksFromPractice().filter((task) => task.choiceMode === "pickTrap"),
      ...daysDatesTimeGradedExercises.filter(
        (exercise): exercise is ChoiceExercise =>
          exercise.type === "choice" && exercise.choiceMode === "pickTrap",
      ),
      ...daysDatesTimePracticeItems.map((item) => item.task).filter(
        (task): task is ChoiceExercise => task.type === "choice" && task.choiceMode === "pickTrap",
      ),
      ...daysDatesTimePracticeItemIds.map((kind) =>
        materializeDaysDatesTimeItem(kind, () => 0.42),
      )
        .map((item) => item.task)
        .filter(
          (task): task is ChoiceExercise =>
            task.type === "choice" && task.choiceMode === "pickTrap",
        ),
    ];

    for (const task of pickTrapTasks) {
      expect(trapChoices(task), `${task.id ?? task.practiceItemId} trap count`).toHaveLength(1);
      expect(task.choices.some((choice) => choice.fits === true)).toBe(true);
      expect(task.prompt).toMatch(/does not mean/i);
    }
  });

  it("pickCorrect prompts do not use odd-one-out wording", () => {
    const pickCorrectTasks = [
      ...choiceExercisesFromLessons().filter((task) => task.choiceMode !== "pickTrap"),
      ...choiceTasksFromPractice().filter((task) => task.choiceMode !== "pickTrap"),
      ...daysDatesTimeGradedExercises.filter(
        (exercise): exercise is ChoiceExercise =>
          exercise.type === "choice" && exercise.choiceMode !== "pickTrap",
      ),
      ...daysDatesTimePracticeItemIds.map((kind) =>
        materializeDaysDatesTimeItem(kind, () => 0.42),
      )
        .map((item) => item.task)
        .filter(
          (task): task is ChoiceExercise =>
            task.type === "choice" && task.choiceMode !== "pickTrap",
        ),
    ];

    for (const task of pickCorrectTasks) {
      expect(task.prompt, `${task.id ?? task.practiceItemId} prompt`).not.toMatch(
        /does not mean/i,
      );
    }
  });

  it("time module pickCorrect distractors keep whyWrong", () => {
    const timeTasks = [
      ...daysDatesTimeGradedExercises.filter(
        (exercise): exercise is ChoiceExercise =>
          exercise.type === "choice" && exercise.choiceMode !== "pickTrap",
      ),
      ...daysDatesTimePracticeItemIds.map((kind) =>
        materializeDaysDatesTimeItem(kind, () => 0.42),
      )
        .map((item) => item.task)
        .filter(
          (task): task is ChoiceExercise =>
            task.type === "choice" && task.choiceMode !== "pickTrap",
        ),
    ];

    for (const task of timeTasks) {
      const wrongChoices = task.choices.filter((choice) => choice.id !== task.answerId);
      const missingWhyWrong = wrongChoices.filter((choice) => !choice.whyWrong);
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
    expect(trapChoices(noon.task).map((choice) => choice.id)).toEqual([noon.task.answerId]);
  });
});
