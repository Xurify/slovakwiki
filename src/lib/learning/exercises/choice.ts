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
