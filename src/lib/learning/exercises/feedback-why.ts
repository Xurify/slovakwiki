type FeedbackChoice = {
  id: string;
  correct?: boolean;
  whyWrong?: string;
};

/** Append per-choice wrong explanations for what the learner actually picked. */
export function augmentFeedbackWhy(
  baseWhy: string,
  selectedIds: ReadonlySet<string>,
  choices: ReadonlyArray<FeedbackChoice>,
  answerId?: string,
): string {
  const wrongNotes = choices
    .filter((choice) => {
      if (!selectedIds.has(choice.id) || !choice.whyWrong) return false;
      if (answerId !== undefined) return choice.id !== answerId;
      return choice.correct === false;
    })
    .map((choice) => choice.whyWrong!);

  if (wrongNotes.length === 0) return baseWhy;
  return [baseWhy, ...wrongNotes].join(" ");
}

export function choiceFeedbackWhy(
  baseWhy: string,
  selectedId: string | null,
  choices: ReadonlyArray<FeedbackChoice>,
  answerId: string,
): string {
  if (!selectedId || selectedId === answerId) return baseWhy;
  return augmentFeedbackWhy(baseWhy, new Set([selectedId]), choices, answerId);
}
