import type { AnswerGrade } from "$lib/client/practice-state";

export type FeedbackTone = "accents" | "correct" | "incorrect";

export type EmphasisPart = { type: "text" | "em"; value: string };

const panelBase = "grid gap-2 rounded-(--control-radius) px-4 py-3.5 ring-1 ring-inset";

/** Split `why` copy on `**term**` markers for inline emphasis. */
export function splitEmphasis(text: string): EmphasisPart[] {
  const parts: EmphasisPart[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "em", value: match[1] ?? "" });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }];
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
  if (tone === "incorrect") return `${panelBase} bg-rose-50 ring-rose-900/8`;
  if (tone === "accents") return `${panelBase} bg-blue-50 ring-blue-900/10`;
  return `${panelBase} bg-emerald-50 ring-emerald-700/10`;
}

export function feedbackFooterClass(tone: FeedbackTone): string {
  if (tone === "incorrect") return "border-t border-rose-200 bg-rose-50";
  if (tone === "accents") return "border-t border-blue-200 bg-blue-50";
  return "border-t border-emerald-200 bg-emerald-50";
}

export const progressCorrectClass = "bg-emerald-600";
export const progressMissedClass = "bg-rose-600";

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
