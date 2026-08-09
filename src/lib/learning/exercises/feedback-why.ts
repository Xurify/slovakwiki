type FeedbackChoice = {
  id: string;
  correct?: boolean;
  whyWrong?: string;
};

function plainWhy(text: string): string {
  return text.replace(/\*\*/g, "").toLowerCase();
}

/** Skip appending when the base line already teaches the same point. */
function isRedundantWhyWrong(baseWhy: string, whyWrong: string): boolean {
  const base = plainWhy(baseWhy);
  const note = plainWhy(whyWrong);

  if (base.includes(note)) return true;

  const lead = note.split(/[.—]/)[0]?.trim() ?? "";
  if (lead.length >= 16 && base.includes(lead)) return true;

  return false;
}

/** Append per-choice wrong explanations for what the learner actually picked. */
export function augmentFeedbackWhy(
  baseWhy: string,
  selectedIds: ReadonlySet<string>,
  choices: ReadonlyArray<FeedbackChoice>,
  answerId?: string,
): string {
  const isSelectAll = answerId === undefined;

  const wrongNotes = choices
    .filter((choice) => {
      if (!selectedIds.has(choice.id) || !choice.whyWrong) return false;
      if (answerId !== undefined) return choice.id !== answerId;
      return choice.correct === false;
    })
    .map((choice) => choice.whyWrong!)
    .filter((note) => isSelectAll || !isRedundantWhyWrong(baseWhy, note));

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
