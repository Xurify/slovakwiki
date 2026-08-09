import type { SelectAllExercise } from "$lib/learning/types";

import { augmentFeedbackWhy } from "./feedback-why";

export {
  augmentFeedbackWhy,
  choiceFeedbackWhy,
  pickTrapFeedbackWhy,
} from "./feedback-why";

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

export type SelectAllRowState =
  "correct-selected" | "correct-missed" | "wrong-selected" | "neutral";

/** Per-row grade after Check — null while the learner is still picking. */
export function selectAllRowState(
  choice: { id: string; correct?: boolean },
  selectedIds: ReadonlySet<string>,
  submitted: boolean,
): SelectAllRowState | null {
  if (!submitted) return null;

  const selected = selectedIds.has(choice.id);
  const correct = choice.correct === true;

  if (correct && selected) return "correct-selected";
  if (correct && !selected) return "correct-missed";
  if (!correct && selected) return "wrong-selected";
  return "neutral";
}

export function selectAllRowMarker(
  state: SelectAllRowState | null,
  selected: boolean,
): string {
  if (state === "correct-selected") return "✓";
  if (state === "correct-missed") return "+";
  if (state === "wrong-selected") return "✗";
  if (!state && selected) return "✓";
  return "";
}
