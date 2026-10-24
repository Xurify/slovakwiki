import type { Point, StickLimb } from "./rig";

/** Two decimals are finer than a pixel at any stage size, and keep paths short. */
export function n(value: number): number {
  return Math.round(value * 100) / 100;
}

/** The ink line of an arm or leg: from the shoulder or hip, through the joint, to the end. */
export function limbPath(from: Point, limb: StickLimb): string {
  return `M${n(from.x)} ${n(from.y)}L${n(limb.joint.x)} ${n(limb.joint.y)}L${n(limb.end.x)} ${n(limb.end.y)}`;
}

function between(a: Point, b: Point, t: number): string {
  return `${n(a.x + (b.x - a.x) * t)} ${n(a.y + (b.y - a.y) * t)}`;
}

/** A sleeve along an arm: `reach` 1 ends at the elbow, 2 at the wrist. */
export function sleevePath(from: Point, limb: StickLimb, reach: number): string {
  if (reach <= 1) return `M${n(from.x)} ${n(from.y)}L${between(from, limb.joint, reach)}`;
  return `M${n(from.x)} ${n(from.y)}L${n(limb.joint.x)} ${n(limb.joint.y)}L${between(limb.joint, limb.end, reach - 1)}`;
}
