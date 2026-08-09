import type { SelectAllExercise } from "$lib/learning/types";

import { augmentFeedbackWhy } from "./feedback-why";

export { augmentFeedbackWhy, choiceFeedbackWhy } from "./feedback-why";

export function gradeSelectAll(
  selectedIds: ReadonlySet<string>,
  choices: SelectAllExercise["choices"],
): boolean {
  const correctIds = new Set(choices.filter((choice) => choice.correct).map((c) => c.id));
  if (selectedIds.size === 0 || selectedIds.size !== correctIds.size) return false;
  for (const id of selectedIds) {
    if (!correctIds.has(id)) return false;
  }
  return true;
}

export function selectAllFeedbackWhy(
  baseWhy: string,
  selectedIds: ReadonlySet<string>,
  choices: SelectAllExercise["choices"],
): string {
  return augmentFeedbackWhy(baseWhy, selectedIds, choices);
}
