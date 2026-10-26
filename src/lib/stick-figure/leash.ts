import { STICK_BOX, type Point } from "./rig";
import type { Mark } from "./stage-frame";
import type { Facing } from "./staging";

/** The loop of a held lead, in figure space: round the lead hand at rest. */
const HAND: Point = { x: 9.6, y: 93.4 };
/** Where the lead clips on, in the dog's figure space (StickDog's collar). */
const COLLAR: Point = { x: 12.8, y: 101 };

/** A lead from a hand to a collar, as a box on the stage: where it starts and ends, in px. */
export interface LeashSpan {
  /** True when the hand is right of the collar, so the drawing is mirrored. */
  flip: boolean;
  /** Distances up from the box's bottom edge to the hand and to the collar. */
  hand: number;
  collar: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

function onStage(mark: Mark, facing: Facing, at: Point): Point {
  const scale = mark.width / STICK_BOX.width;
  return {
    x: mark.left + (at.x * facing - STICK_BOX.x) * scale,
    y: mark.top + (at.y - STICK_BOX.y) * scale,
  };
}

/**
 * The box a lead is drawn in between whoever holds it and the dog. Kept as a
 * box rather than two points so the stage can move it with the same linear
 * transition that walks both figures: its corners then stay on the hand and
 * the collar all the way.
 */
export function leashSpan(
  holder: { mark: Mark; facing: Facing },
  dog: { mark: Mark; facing: Facing },
): LeashSpan {
  const hand = onStage(holder.mark, holder.facing, HAND);
  const collar = onStage(dog.mark, dog.facing, COLLAR);
  const top = Math.min(hand.y, collar.y);
  const bottom = Math.max(hand.y, collar.y);
  return {
    collar: bottom - collar.y,
    flip: hand.x > collar.x,
    hand: bottom - hand.y,
    height: Math.max(1, bottom - top),
    left: Math.min(hand.x, collar.x),
    top,
    width: Math.max(1, Math.abs(hand.x - collar.x)),
  };
}
