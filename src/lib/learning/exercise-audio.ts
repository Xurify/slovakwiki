import type { LessonExercise } from "./types";

/** Slovak options a learner presses in a lesson check — each gets a clip. Clock faces have no text. */
export function exerciseOptionTexts(exercise: LessonExercise): string[] {
  if (exercise.type !== "choice" && exercise.type !== "selectAll") return [];
  return exercise.choices.flatMap((choice) => (choice.label ? [choice.label] : []));
}
