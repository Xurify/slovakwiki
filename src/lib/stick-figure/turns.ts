import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";

/** A turn round, through the front, this long: at 400 ms, eased, the face was at the front for under a frame of a 6 fps review and the turn read as a snap. */
export const TURN_MS = 520;
/** The others turn to the speaker this long after the speaker turns. */
export const TURN_AFTER_MS = 180;
/** Each figure further from the speaker turns this much later than the last. */
export const TURN_APART_MS = 90;

export type TurnDelays = Partial<Record<LessonCharacterId, number>>;

/**
 * When each figure begins its turn, in ms. `focus` (the speaker, or whoever
 * has just walked on) turns at once and the rest a beat later, the nearest
 * first, so a change of speaker ripples across the stage instead of
 * snapping everyone round on the same frame.
 */
export function turnDelays(
  cast: readonly LessonCharacterId[],
  focus: LessonCharacterId | null | undefined,
): TurnDelays {
  const at = focus ? cast.indexOf(focus) : -1;
  const delays: TurnDelays = {};
  for (const [index, id] of cast.entries()) {
    const apart = at === -1 ? 1 : Math.abs(index - at);
    delays[id] = apart === 0 ? 0 : TURN_AFTER_MS + TURN_APART_MS * (apart - 1);
  }
  return delays;
}
