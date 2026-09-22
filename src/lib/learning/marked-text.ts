/**
 * Plain Slovak plus optional role spans.
 *
 * Build with `markedText` so offsets come from the pieces, not a later search.
 * Render with `segmentsFromMarks` (Svelte) or the same segments in a DOM painter.
 * A new exercise adds a role to `TEXT_ROLE_CLASS` — it does not get its own highlighter.
 */

export const TEXT_ROLE_CLASS = {
  /** Calendar day inside a phrase (`v sobotu`). */
  day: "text-mark-day",
  /** Clock phrase (`o druhej`, `o pol druhej`). */
  time: "text-mark-time",
} as const;

export type TextRole = keyof typeof TEXT_ROLE_CLASS;

/** UTF-16 indexes into the plain string. `end` is exclusive. */
export interface TextMark {
  end: number;
  role: TextRole;
  start: number;
}

export type MarkedPart = string | { role: TextRole; text: string };

export interface MarkedText {
  marks: TextMark[];
  text: string;
}

export type TextSegment = {
  role: TextRole | null;
  text: string;
};

export function isTextRole(role: string): role is TextRole {
  return Object.hasOwn(TEXT_ROLE_CLASS, role);
}

export function markRoleClass(role: TextRole): string {
  return TEXT_ROLE_CLASS[role];
}

/** Concatenate plain runs and labeled spans. Empty spans are skipped. */
export function markedText(parts: readonly MarkedPart[]): MarkedText {
  let text = "";
  const marks: TextMark[] = [];

  for (const part of parts) {
    if (typeof part === "string") {
      text += part;
      continue;
    }

    if (part.text.length === 0) continue;

    const start = text.length;
    text += part.text;
    marks.push({ start, end: text.length, role: part.role });
  }

  return { text, marks };
}

/**
 * Drop out-of-range, empty, unknown, or overlapping marks.
 * Same start: the longer span wins. A later span that starts inside a kept span is dropped.
 */
export function sanitizeMarks(
  text: string,
  marks: readonly TextMark[] | undefined,
): TextMark[] {
  if (!marks || marks.length === 0) return [];

  const clean: TextMark[] = [];

  for (const mark of marks) {
    if (!isTextRole(mark.role)) continue;
    if (!Number.isInteger(mark.start) || !Number.isInteger(mark.end)) continue;
    if (mark.start < 0 || mark.end > text.length || mark.start >= mark.end) continue;
    clean.push({ start: mark.start, end: mark.end, role: mark.role });
  }

  clean.sort((a, b) => a.start - b.start || b.end - a.end);

  const kept: TextMark[] = [];
  let cursor = 0;

  for (const mark of clean) {
    if (mark.start < cursor) continue;
    kept.push(mark);
    cursor = mark.end;
  }

  return kept;
}

/** Split `text` into plain and role runs. No marks → one plain run. */
export function segmentsFromMarks(
  text: string,
  marks?: readonly TextMark[],
): TextSegment[] {
  const safe = sanitizeMarks(text, marks);
  if (safe.length === 0) return text.length > 0 ? [{ text, role: null }] : [];

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const mark of safe) {
    if (mark.start > cursor) {
      segments.push({ text: text.slice(cursor, mark.start), role: null });
    }

    segments.push({ text: text.slice(mark.start, mark.end), role: mark.role });
    cursor = mark.end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), role: null });
  }

  return segments;
}
