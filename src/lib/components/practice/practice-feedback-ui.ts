import type { AnswerGrade } from "$lib/components/practice/practice-state";
import { eyebrowClass } from "$lib/components/ui/system-ui";
import type {
  AttemptWordMark,
  CorrectionWordMark,
  DiffWord,
} from "$lib/learning/exercises/answer-diff";

export type FeedbackTone = "accents" | "correct" | "incorrect";

export type EmphasisPart = { type: "text" | "em" | "i"; value: string };

const panelBase = "grid gap-2 rounded-(--control-radius) px-4 py-3.5 ring-1 ring-inset";

/** Split teaching copy on `**bold**` and `*italic*` markers. */
export function splitRichText(text: string): EmphasisPart[] {
  const parts: EmphasisPart[] = [];
  const pattern = /\*\*(.+?)\*\*|\*([^*]+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      parts.push({ type: "em", value: match[1] });
    } else {
      parts.push({ type: "i", value: match[2] ?? "" });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}

/** Split `why` copy on `**term**` markers for inline emphasis. */
export function splitEmphasis(text: string): EmphasisPart[] {
  return splitRichText(text);
}

export function feedbackToneFromGrade(
  grade: AnswerGrade | "revealed" | null,
  revealed = false,
): FeedbackTone {
  if (revealed || grade === "incorrect" || grade === null) return "incorrect";
  if (grade === "accents") return "accents";
  return "correct";
}

export function feedbackPanelClass(tone: FeedbackTone): string {
  if (tone === "incorrect") return `${panelBase} bg-rose-50 ring-rose-600/15`;
  if (tone === "accents") return `${panelBase} bg-blue-50 ring-blue-600/15`;
  return `${panelBase} bg-emerald-50 ring-emerald-600/15`;
}

export const feedbackSectionLabelClass = eyebrowClass;

export const missCompareClass =
  "grid gap-1 overflow-hidden rounded-(--control-radius) bg-surface p-1 shadow-(--shadow-border)";

export const missCompareAttemptRowClass =
  "grid gap-1 rounded-[calc(var(--control-radius)-2px)] bg-rose-50 px-3.5 py-2.5";

export const missCompareCorrectionRowClass =
  "grid gap-1 rounded-[calc(var(--control-radius)-2px)] bg-emerald-50 px-3.5 py-2.5";

export function shouldShowCorrection(
  submitted: boolean,
  grade: AnswerGrade | null,
  revealed: boolean,
): boolean {
  if (!submitted) return false;
  return revealed || grade !== null;
}

export function isMissFeedback(grade: AnswerGrade | null, revealed: boolean): boolean {
  return revealed || grade === "incorrect" || grade === "accents";
}

export type WordMark = AttemptWordMark | CorrectionWordMark;

export interface MarkedSegment {
  mark: Exclude<WordMark, "same"> | null;
  text: string;
}

/** Flatten diff words into text runs; spaces and edge punctuation stay unmarked. */
export function markedSegments(
  words: ReadonlyArray<DiffWord<WordMark>>,
): MarkedSegment[] {
  const segments: MarkedSegment[] = [];

  const pushText = (text: string) => {
    if (!text) return;
    const last = segments.at(-1);
    if (last && last.mark === null) last.text += text;
    else segments.push({ mark: null, text });
  };

  for (const [index, word] of words.entries()) {
    pushText(`${index > 0 ? " " : ""}${word.lead}`);
    if (word.mark === "same") pushText(word.word);
    else segments.push({ mark: word.mark, text: word.word });
    pushText(word.trail);
  }

  return segments;
}

const wordMarkBase = "bg-transparent underline decoration-2 underline-offset-4";

export function wordMarkClass(mark: Exclude<WordMark, "same">): string {
  if (mark === "wrong")
    return `${wordMarkBase} text-rose-700 decoration-rose-500 decoration-wavy`;
  if (mark === "accent")
    return `${wordMarkBase} text-blue-700 decoration-blue-500 decoration-dotted`;
  return `${wordMarkBase} text-emerald-700 decoration-emerald-500`;
}
