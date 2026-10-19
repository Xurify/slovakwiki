import { gradeAnswer, type AnswerGrade } from "$lib/components/practice/practice-state";
import type { SpotExercise } from "$lib/learning/types";

/** A word index, "none" for “nothing is wrong”, or null before the learner picks. */
export type SpotPick = number | "none" | null;

const EDGE_PUNCTUATION = /^[„“"(]+|[.,?!;:…“")]+$/gu;

export function spotWord(words: readonly string[], index: number): string {
  return (words[index] ?? "").replace(EDGE_PUNCTUATION, "");
}

export function canCheckSpot(pick: SpotPick, fix: string): boolean {
  if (pick === null) return false;
  if (pick === "none") return true;
  return fix.trim().length > 0;
}

/** Right only when the learner finds the wrong word and fixes it, or says nothing is wrong. */
export function gradeSpot(task: SpotExercise, pick: SpotPick, fix: string): AnswerGrade {
  if (task.wrongIndex === null) return pick === "none" ? "correct" : "incorrect";
  if (pick !== task.wrongIndex) return "incorrect";
  return gradeAnswer(fix, task.answer, task.acceptedAnswers);
}

/** The sentence the learner ends up with, for the “You wrote” line. */
export function spotAttempt(
  task: SpotExercise,
  pick: SpotPick,
  fix: string,
): string | undefined {
  if (pick === null) return undefined;
  if (pick === "none") return task.words.join(" ");

  const typed = fix.trim();
  if (!typed) return undefined;

  return task.words
    .map((word, index) =>
      index === pick ? word.replace(spotWord(task.words, index), typed) : word,
    )
    .join(" ");
}

/** Says which word was the problem when the learner looked in the wrong place. */
export function spotFeedbackWhy(
  task: SpotExercise,
  pick: SpotPick,
  baseWhy: string,
): string {
  if (task.wrongIndex === null) {
    return typeof pick === "number" ? `Nothing was wrong here. ${baseWhy}` : baseWhy;
  }

  const wrong = spotWord(task.words, task.wrongIndex);
  if (pick === "none") return `One word is wrong: **${wrong}**. ${baseWhy}`;
  if (typeof pick === "number" && pick !== task.wrongIndex) {
    const word = spotWord(task.words, pick);
    const picked = word.charAt(0).toLocaleUpperCase("sk") + word.slice(1);
    return `**${picked}** is fine here. The wrong word is **${wrong}**. ${baseWhy}`;
  }
  return baseWhy;
}
