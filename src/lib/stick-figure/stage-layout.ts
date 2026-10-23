import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import { BACKDROP_HEIGHT } from "./scene-things";
import type { StageSetting } from "./stage-setting";
import type { Facing } from "./staging";

/** The stage's side padding, px. */
export const STAGE_PADDING = 24;
/** Between neighbours, as a share of the stage's inner width: close enough to be talking. */
const GAP_SHARE = 0.02;

/**
 * Where a place's cast gathers, as an x in the backdrop's drawing: by the
 * counter in the café and at the desk, by the stall at the market, beside
 * the bag on the rug at home.
 * Elsewhere the middle of the stage.
 */
export const STAGE_POSTS: Partial<Record<StageSetting, number>> = {
  cafe: 690,
  // Left of the bag on the rug, so nobody stands on it.
  home: 360,
  market: 660,
  registration: 560,
};
/**
 * A figure's width on a stage this size: in step with the stage's height,
 * so on a phone's shorter stage the cast keeps its size against the place;
 * smaller in a crowd, and never wider than its share. A wide stage is as
 * tall as the backdrop.
 */
export function figureWidth(
  castSize: number,
  stageWidth: number,
  stageHeight = BACKDROP_HEIGHT,
): number {
  const preferred = ((castSize > 2 ? 110 : 150) * stageHeight) / BACKDROP_HEIGHT;
  const inner = stageWidth - 2 * STAGE_PADDING;
  const gaps = GAP_SHARE * inner * Math.max(0, castSize - 1);
  return Math.max(40, Math.min(preferred, (inner - gaps) / Math.max(1, castSize)));
}

/**
 * Each figure's mark, as the left edge in px: the cast in a row, a gap
 * apart, centred on `at` (the middle of the stage unless the place has a
 * post). Whoever is on stage stands there; someone who walks on later
 * takes no room until then, but the row is kept far enough over that they
 * still fit when they arrive.
 */
export function stageMarks(
  cast: readonly LessonCharacterId[],
  entering: Partial<Record<LessonCharacterId, Facing>>,
  stageWidth: number,
  at = stageWidth / 2,
  stageHeight = BACKDROP_HEIGHT,
): { marks: Partial<Record<LessonCharacterId, number>>; width: number } {
  const width = figureWidth(cast.length, stageWidth, stageHeight);
  const step = width + GAP_SHARE * (stageWidth - 2 * STAGE_PADDING);
  const present = cast.flatMap((id, index) => (id in entering ? [] : [index]));
  const shown = present.length > 0 ? present : cast.map((_, index) => index);
  const middle = ((shown[0] + shown[shown.length - 1]) / 2) * step + width / 2;
  const row = (cast.length - 1) * step + width;
  const lowest = Math.min(STAGE_PADDING, (stageWidth - row) / 2);
  const highest = Math.max(stageWidth - STAGE_PADDING - row, (stageWidth - row) / 2);
  const start = Math.min(highest, Math.max(lowest, at - middle));

  return {
    marks: Object.fromEntries(cast.map((id, index) => [id, start + index * step])),
    width,
  };
}
