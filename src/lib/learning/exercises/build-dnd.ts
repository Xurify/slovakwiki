export type BuildDragPayload =
  { kind: "bank"; index: number } | { kind: "tray"; index: number };

export const BUILD_DRAG_MIME = "application/x-slovakwiki-build";

export function serializeBuildDragPayload(payload: BuildDragPayload): string {
  return JSON.stringify(payload);
}

export function parseBuildDragPayload(raw: string): BuildDragPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BuildDragPayload;
    if (parsed.kind === "bank" && Number.isInteger(parsed.index) && parsed.index >= 0) {
      return parsed;
    }
    if (parsed.kind === "tray" && Number.isInteger(parsed.index) && parsed.index >= 0) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function insertBankIndexAt(
  indexes: readonly number[],
  bankIndex: number,
  position: number,
): number[] {
  const next = [...indexes];
  const insertAt = Math.max(0, Math.min(position, next.length));
  next.splice(insertAt, 0, bankIndex);
  return next;
}

export function reorderBuiltIndexes(
  indexes: readonly number[],
  fromIndex: number,
  toIndex: number,
): number[] {
  if (fromIndex === toIndex || fromIndex === toIndex - 1) return [...indexes];
  const next = [...indexes];
  const [moved] = next.splice(fromIndex, 1);
  if (moved === undefined) return next;
  const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex;
  next.splice(insertAt, 0, moved);
  return next;
}

export function canInsertBankIndex(
  indexes: readonly number[],
  bankIndex: number,
  answerLength: number,
): boolean {
  if (indexes.includes(bankIndex)) return false;
  return answerLength > 0 && indexes.length < answerLength;
}

/** Pick tray insert index from pointer X and chip midpoints (Duolingo-style gap targeting). */
export function computeTrayInsertIndex(
  clientX: number,
  chipMidpoints: readonly number[],
): number {
  if (chipMidpoints.length === 0) return 0;
  for (let index = 0; index < chipMidpoints.length; index += 1) {
    if (clientX < chipMidpoints[index]!) return index;
  }
  return chipMidpoints.length;
}
