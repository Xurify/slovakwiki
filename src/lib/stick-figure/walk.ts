import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import { LOOKS } from "./looks";
import type { StickPose } from "./pose";
import { STICK_BOX, STRIDE } from "./rig";

/** One step, foot to foot. A walk is a whole number of them, so it ends feet together. */
export const STEP_MS = 280;

/** One step of `who`'s: each walks at their own pace. */
export function stepMs(who?: LessonCharacterId): number {
  return Math.round(STEP_MS * ((who && LOOKS[who]?.gait) || 1));
}
/** Ground a step covers, in figure widths: one foot's whole swing, so the planted foot does not slide. */
const STEP_WIDTHS = (2 * STRIDE) / STICK_BOX.width;
/** The legs ease in and out over this long, so a walk does not start or stop mid-stride. */
const EASE_MS = 160;
/** Feet close in under the body while walking, so a full stride stays within reach of the hip. */
const WALK_STANCE = 4;
const LIFT = 2.4;
/** The hip drops at the widest stride so both feet still reach the ground. */
const HIP_DIP = 3.2;

/** Steps to cover `widths` figure widths, at least two so a walk reads as one. */
export function stepsFor(widths: number): number {
  return Math.max(2, Math.round(Math.abs(widths) / STEP_WIDTHS));
}

/**
 * Lowering onto a chair and getting up off it, at `who`'s own pace, so two
 * people sitting down together never go down as one. At 850 ms eased, the
 * drop read as a hinge.
 */
export const SIT_MS = 1150;
export const STAND_MS = 950;
/** A chair scooted in to the table under someone, or pushed back before they get up. */
export const SCOOT_MS = 600;
/** Rig units an empty chair at a table stands drawn back, room to step in front of it. */
export const CHAIR_OUT = 12;

export function sitMs(who?: LessonCharacterId, rising = false): number {
  return Math.round((rising ? STAND_MS : SIT_MS) * ((who && LOOKS[who]?.gait) || 1));
}

export function walkDuration(steps: number, who?: LessonCharacterId): number {
  return Math.max(1, Math.round(steps)) * stepMs(who);
}

/**
 * Legs of a walk on top of whatever the body is doing: feet swing in turn,
 * the forward foot lifts, and the hip dips at each full stride.
 */
export function walkPose(
  pose: StickPose,
  elapsed: number,
  durationMs: number,
  step = STEP_MS,
  who?: LessonCharacterId,
): StickPose {
  if (elapsed <= 0 || elapsed >= durationMs) return pose;

  const phase = (elapsed / step) * Math.PI;
  const ease = Math.min(1, elapsed / EASE_MS, (durationMs - elapsed) / EASE_MS);
  const isRobot = Boolean(who && LOOKS[who]?.robot);
  const swing = Math.sin(phase) * ease * (isRobot ? 0.75 : 1);

  return {
    ...pose,
    stance: pose.stance + (WALK_STANCE - pose.stance) * ease,
    stride: swing,
    lift: LIFT * Math.cos(phase) * ease * (isRobot ? 0.7 : 1),
    bob: pose.bob + (isRobot ? HIP_DIP * 0.4 : HIP_DIP) * Math.abs(swing),
  };
}

/** How far a dog leans into a gallop, in degrees. */
const GALLOP_LEAN = 8;

/**
 * A dog's gallop, one bound to every two steps. The phase advances with the
 * steps, and the legs ease in and out as a walk's do. StickDog draws the bound
 * from `gallop` and `gallopAmp`, swinging the legs clear of the ground rather
 * than shuffling them at walking reach.
 */
export function gallopPose(
  pose: StickPose,
  elapsed: number,
  durationMs: number,
  step: number,
): StickPose {
  if (elapsed <= 0 || elapsed >= durationMs) return pose;

  const ease = Math.min(1, elapsed / EASE_MS, (durationMs - elapsed) / EASE_MS);
  return {
    ...pose,
    gallop: (elapsed / step) * Math.PI,
    gallopAmp: ease,
    lean: pose.lean + GALLOP_LEAN * ease,
  };
}
