import { n } from "./draw";
import type { Point } from "./rig";

/**
 * A lead hanging from a hand to a collar, as an SVG path in stage px. It is
 * `length` long, so it hangs in a dip while they are close and pulls straight
 * as they part.
 */
export function leashPath(hand: Point, collar: Point, length: number): string {
  const span = Math.hypot(collar.x - hand.x, collar.y - hand.y);
  // Pulled down to a V by its middle, the lead would dip this far; a rope's curve rides a little higher.
  const sag = 0.6 * (Math.sqrt(Math.max(0, length ** 2 - span ** 2)) / 2);
  // A quadratic's middle sits halfway to its control point, so the control goes twice as low.
  const control = {
    x: (hand.x + collar.x) / 2,
    y: (hand.y + collar.y) / 2 + 2 * sag,
  };
  return `M${n(hand.x)} ${n(hand.y)}Q${n(control.x)} ${n(control.y)} ${n(collar.x)} ${n(collar.y)}`;
}
