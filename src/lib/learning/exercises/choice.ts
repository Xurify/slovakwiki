import type { ChoiceExercise } from "$lib/learning/types";

export type ChoiceStyle = NonNullable<ChoiceExercise["choiceStyle"]>;

/** Slovak phrase choices (default) vs analog faces on each option. */
export function choiceUsesClockFaces(
  exercise: Pick<ChoiceExercise, "choiceStyle">,
): boolean {
  return exercise.choiceStyle === "clock";
}

/** English/digital prompt clock — only when choices are text, not faces. */
export function choiceShowsPromptClock(
  exercise: Pick<ChoiceExercise, "choiceStyle" | "clock">,
): boolean {
  return exercise.choiceStyle !== "clock" && exercise.clock !== undefined;
}

export function gradeChoice(
  selectedId: string | null,
  exercise: Pick<ChoiceExercise, "answerId" | "choiceMode" | "choices">,
): boolean {
  if (!selectedId) return false;
  const selected = exercise.choices.find((choice) => choice.id === selectedId);
  if (!selected) return false;
  if (exercise.choiceMode === "pickTrap") return selected.fits !== true;
  return selectedId === exercise.answerId;
}
