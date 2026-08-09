import type { AnswerGrade } from "$lib/client/practice-state";

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

export function feedbackFooterClass(tone: FeedbackTone): string {
  if (tone === "incorrect") return "border-t border-slate-200 bg-paper/70";
  if (tone === "accents") return "border-t border-blue-200 bg-blue-50";
  return "border-t border-emerald-200 bg-emerald-50";
}

export const feedbackSectionLabelClass =
  "m-0 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]";

export const missCompareClass =
  "overflow-hidden rounded-(--control-radius) bg-surface ring-1 ring-inset ring-slate-200/90";

export const missCompareAttemptRowClass =
  "grid gap-0.5 border-b border-slate-200/70 bg-rose-50 px-3 py-2";

export const missCompareCorrectionRowClass = "grid gap-0.5 bg-emerald-50 px-3 py-2";

export const progressCorrectClass = "bg-emerald-400";
export const progressMissedClass = "bg-rose-400";

export const progressRowClass = "mt-3 flex gap-1.5 overflow-x-auto";
export const progressSegmentClass = "h-3 w-5 shrink-0 rounded-sm";

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
