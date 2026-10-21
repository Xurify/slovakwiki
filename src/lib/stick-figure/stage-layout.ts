import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { Facing } from "./staging";

/** The stage's side padding, px. */
export const STAGE_PADDING = 24;
/** Between neighbours, as a share of the stage's inner width. */
const GAP_SHARE = 0.06;
/** Below this stage width figures take their narrow size. */
const NARROW_STAGE = 560;

/** A figure's width on a stage this wide: smaller in a crowd and on phones, never wider than its share. */
export function figureWidth(castSize: number, stageWidth: number): number {
  const narrow = stageWidth < NARROW_STAGE;
  const preferred = castSize > 2 ? (narrow ? 80 : 110) : narrow ? 120 : 150;
  const inner = stageWidth - 2 * STAGE_PADDING;
  const gaps = GAP_SHARE * inner * Math.max(0, castSize - 1);
  return Math.max(40, Math.min(preferred, (inner - gaps) / Math.max(1, castSize)));
}

/**
 * Each figure's mark, as the left edge in px: the cast in a row, a gap
 * apart. Whoever is on stage stands centred; someone who walks on later
 * takes no room until then, but the row is kept far enough over that they
 * still fit when they arrive.
 */
export function stageMarks(
  cast: readonly LessonCharacterId[],
  entering: Partial<Record<LessonCharacterId, Facing>>,
  stageWidth: number,
): { marks: Partial<Record<LessonCharacterId, number>>; width: number } {
  const width = figureWidth(cast.length, stageWidth);
  const step = width + GAP_SHARE * (stageWidth - 2 * STAGE_PADDING);
  const present = cast.flatMap((id, index) => (id in entering ? [] : [index]));
  const shown = present.length > 0 ? present : cast.map((_, index) => index);
  const middle = ((shown[0] + shown[shown.length - 1]) / 2) * step + width / 2;
  const row = (cast.length - 1) * step + width;
  const lowest = Math.min(STAGE_PADDING, (stageWidth - row) / 2);
  const highest = Math.max(stageWidth - STAGE_PADDING - row, (stageWidth - row) / 2);
  const start = Math.min(highest, Math.max(lowest, stageWidth / 2 - middle));

  return {
    marks: Object.fromEntries(cast.map((id, index) => [id, start + index * step])),
    width,
  };
}
