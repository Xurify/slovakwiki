import { gradeAnswer, type AnswerGrade } from "$lib/components/practice/practice-state";
import type { FindMistakeExercise } from "$lib/learning/types";

export type MistakePick = number | "no-mistake" | null;

const EDGE_PUNCTUATION = /^[„“"(]+|[.,?!;:…“")]+$/gu;

export function wordWithoutPunctuation(words: readonly string[], index: number): string {
  return (words[index] ?? "").replace(EDGE_PUNCTUATION, "");
}

export function canCheckFindMistake(pick: MistakePick, fix: string): boolean {
  if (pick === null) return false;
  if (pick === "no-mistake") return true;
  return fix.trim().length > 0;
}

export function gradeFindMistake(
  task: FindMistakeExercise,
  pick: MistakePick,
  fix: string,
): AnswerGrade {
  if (task.wrongWordIndex === null)
    return pick === "no-mistake" ? "correct" : "incorrect";
  if (pick !== task.wrongWordIndex) return "incorrect";
  return gradeAnswer(fix, task.answer, task.acceptedAnswers);
}

export function findMistakeAttempt(
  task: FindMistakeExercise,
  pick: MistakePick,
  fix: string,
): string | undefined {
  if (pick === null) return undefined;
  if (pick === "no-mistake") return task.words.join(" ");

  const typed = fix.trim();
  if (!typed) return undefined;

  return task.words
    .map((word, index) =>
      index === pick
        ? word.replace(wordWithoutPunctuation(task.words, index), typed)
        : word,
    )
    .join(" ");
}

export function findMistakeFeedbackWhy(
  task: FindMistakeExercise,
  pick: MistakePick,
  baseWhy: string,
): string {
  if (task.wrongWordIndex === null) {
    return typeof pick === "number" ? `Nothing was wrong here. ${baseWhy}` : baseWhy;
  }

  const wrong = wordWithoutPunctuation(task.words, task.wrongWordIndex);
  if (pick === "no-mistake") return `One word is wrong: **${wrong}**. ${baseWhy}`;
  if (typeof pick === "number" && pick !== task.wrongWordIndex) {
    const word = wordWithoutPunctuation(task.words, pick);
    const picked = word.charAt(0).toLocaleUpperCase("sk") + word.slice(1);
    return `**${picked}** is fine here. The wrong word is **${wrong}**. ${baseWhy}`;
  }
  return baseWhy;
}
