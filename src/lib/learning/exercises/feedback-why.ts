type FeedbackChoice = {
  id: string;
  correct?: boolean;
  fits?: boolean;
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

export const PICK_TRAP_CORRECT_HEADLINE = "That one doesn't fit.";
export const PICK_TRAP_MISS_HEADLINE = "Doesn't fit";

/**
 * pickTrap feedback: `english` is the prompt target meaning (e.g. half past 11),
 * not what the trap line means — never show it beside the trap correction.
 */
export function pickTrapFeedbackEnglish(_english?: string): undefined {
  return undefined;
}

/** Feedback for pickTrap choice exercises. */
export function pickTrapFeedbackWhy(
  baseWhy: string,
  selectedId: string | null,
  choices: ReadonlyArray<FeedbackChoice>,
): string {
  if (!selectedId) return baseWhy;
  const selected = choices.find((choice) => choice.id === selectedId);
  if (!selected) return baseWhy;
  if (selected.fits === true) {
    if (!selected.whyWrong || isRedundantWhyWrong(baseWhy, selected.whyWrong))
      return baseWhy;
    return `${baseWhy} ${selected.whyWrong}`;
  }
  return selected.whyWrong ?? baseWhy;
}
