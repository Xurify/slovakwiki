import type { DialogueSayChoices } from "$lib/learning/types";

/** Correct ids for a mid-story say gate (`answerIds` or legacy `answerId`). */
export function sayChoiceAnswerIds(choices: DialogueSayChoices): string[] {
  if (choices.answerIds && choices.answerIds.length > 0) {
    return choices.answerIds;
  }
  if (choices.answerId) return [choices.answerId];
  return [];
}

export function isSayChoiceCorrect(
  selectedId: string | null | undefined,
  choices: DialogueSayChoices,
): boolean {
  if (!selectedId) return false;
  return sayChoiceAnswerIds(choices).includes(selectedId);
}
