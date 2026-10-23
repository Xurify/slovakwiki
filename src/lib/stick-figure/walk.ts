import type { StickPose } from "./pose";

/** One step, foot to foot. A walk is a whole number of them, so it ends feet together. */
export const STEP_MS = 280;
/** Ground a step covers, in figure widths: the swing of each foot (±9 of the 80-wide box). */
const STEP_WIDTHS = 0.225;
/** The legs ease in and out over this long, so a walk does not start or stop mid-stride. */
const EASE_MS = 160;
/** Feet close in under the body while walking, so a full stride stays within reach of the hip. */
const WALK_STANCE = 4;
const LIFT = 2.4;
const HIP_DIP = 1.6;

/** Steps to cover `widths` figure widths, at least two so a walk reads as one. */
export function stepsFor(widths: number): number {
  return Math.max(2, Math.round(Math.abs(widths) / STEP_WIDTHS));
}

export function walkDuration(steps: number): number {
  return Math.max(1, Math.round(steps)) * STEP_MS;
}

/**
 * Legs of a walk on top of whatever the body is doing: feet swing in turn,
 * the forward foot lifts, and the hip dips at each full stride.
 */
export function walkPose(
  pose: StickPose,
  elapsed: number,
  durationMs: number,
): StickPose {
  if (elapsed <= 0 || elapsed >= durationMs) return pose;

  const phase = (elapsed / STEP_MS) * Math.PI;
  const ease = Math.min(1, elapsed / EASE_MS, (durationMs - elapsed) / EASE_MS);
  const swing = Math.sin(phase) * ease;

  return {
    ...pose,
    stance: pose.stance + (WALK_STANCE - pose.stance) * ease,
    stride: swing,
    lift: LIFT * Math.cos(phase) * ease,
    bob: pose.bob + HIP_DIP * Math.abs(swing),
  };
}
