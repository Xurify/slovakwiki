import type { StickPose } from "./pose";
import { solveRig, type Point } from "./rig";

/** The arm bones in rig.ts: upper arm, forearm. */
const UPPER_ARM = 15;
const FOREARM = 14;
const RAD = Math.PI / 180;

export type Hand = "lead" | "rear";

/** `angle` in degrees from straight down, toward +x, as rig.ts measures it. */
function direction(from: Point, to: Point): number {
  return Math.atan2(to.x - from.x, to.y - from.y) / RAD;
}

/** `angle` written as the turn nearest `near`, so a blend from `near` never spins the long way round. */
function nearest(angle: number, near: number): number {
  return angle + 360 * Math.round((near - angle) / 360);
}

/**
 * The raise and bend that put one hand on `target`, in the rig space of a
 * figure facing +x, worked out on `pose` (its lean and sit). The elbow
 * drops below the line to the target, as a relaxed arm's does; a target out
 * of reach gets a straight arm toward it.
 */
export function reachFor(
  pose: StickPose,
  hand: Hand,
  target: Point,
  sit = 0,
): Pick<StickPose, "leadRaise" | "leadBend"> | Pick<StickPose, "rearRaise" | "rearBend"> {
  const rig = solveRig(pose, sit);
  const shoulder = hand === "lead" ? rig.leadShoulder : rig.rearShoulder;
  const side = hand === "lead" ? 1 : -1;
  const span = Math.hypot(target.x - shoulder.x, target.y - shoulder.y);
  const reach = Math.min(
    UPPER_ARM + FOREARM - 0.01,
    Math.max(Math.abs(UPPER_ARM - FOREARM) + 0.01, span),
  );
  const toward = direction(shoulder, target);
  const open =
    Math.acos((UPPER_ARM ** 2 + reach ** 2 - FOREARM ** 2) / (2 * UPPER_ARM * reach)) /
    RAD;

  // Of the two elbows that reach the target, the lower one.
  const uppers = [toward - open, toward + open];
  const elbows = uppers.map((upper) => ({
    upper,
    joint: {
      x: shoulder.x + Math.sin(upper * RAD) * UPPER_ARM,
      y: shoulder.y + Math.cos(upper * RAD) * UPPER_ARM,
    },
  }));
  const { upper, joint } = elbows[0].joint.y >= elbows[1].joint.y ? elbows[0] : elbows[1];
  const fore = span > UPPER_ARM + FOREARM ? upper : direction(joint, target);

  const raise = side * (upper + pose.lean);
  const bend = side * (fore - upper);
  if (hand === "lead") {
    const leadRaise = nearest(raise, pose.leadRaise);
    return { leadRaise, leadBend: nearest(bend, pose.leadBend) };
  }
  const rearRaise = nearest(raise, pose.rearRaise);
  return { rearRaise, rearBend: nearest(bend, pose.rearBend) };
}

/** Where a figure's mouth is in rig space, on `pose`: just in front of the face, under the nose. */
export function mouthOf(pose: StickPose, sit = 0): Point {
  const { head, headAngle } = solveRig(pose, sit);
  const angle = headAngle * RAD;
  // Measured on StickHead: the lips sit 7 units ahead of the head's centre and 5 below it.
  const ahead = 8;
  const below = 5;
  return {
    x: head.x + Math.cos(angle) * ahead - Math.sin(angle) * below,
    y: head.y + Math.sin(angle) * ahead + Math.cos(angle) * below,
  };
}
