import type { StickPose } from "./pose";

export interface Point {
  x: number;
  y: number;
}

export interface StickLimb {
  /** Elbow or knee. */
  joint: Point;
  /** Hand or foot. */
  end: Point;
}

export interface StickRig {
  head: Point;
  /** Head rotation for drawing, degrees clockwise. */
  headAngle: number;
  hip: Point;
  /** The torso's lean for drawing, degrees toward the facing side: the pose's, and the bow of sitting down. */
  lean: number;
  leadArm: StickLimb;
  leadLeg: StickLimb;
  leadShoulder: Point;
  neck: Point;
  rearArm: StickLimb;
  rearLeg: StickLimb;
  rearShoulder: Point;
}

export const GROUND_Y = 130;
export const HEAD_RADIUS = 12.5;

/** The drawing box, centred on x = 0 so facing left is a plain `scale(-1 1)`. */
export const STICK_BOX = { x: -40, y: 22, width: 80, height: 114 };
export const STICK_VIEWBOX = `${STICK_BOX.x} ${STICK_BOX.y} ${STICK_BOX.width} ${STICK_BOX.height}`;

const HIP_HEIGHT = 38;
const TORSO = 30;
const SHOULDER_DROP = 4;
/** Inside the 10-wide torso stroke, so arms leave from its edge, clear of the head. */
const SHOULDER_HALF_WIDTH = 4;
const NECK = 3;
const UPPER_ARM = 15;
const FOREARM = 14;
const THIGH = 19.5;
const SHIN = 19.5;
/** A chair seat's height off the floor (StickFurniture.svelte): a sitting hip rests on it. */
export const SEAT_Y = GROUND_Y - 20;
/** How far a full stride carries each foot from its stance, px: about a person's step for the figure's height. */
export const STRIDE = 13;

const RAD = Math.PI / 180;

/** Angles count from straight down, positive toward the facing side (+x). */
function along(origin: Point, angle: number, length: number): Point {
  return {
    x: origin.x + Math.sin(angle * RAD) * length,
    y: origin.y + Math.cos(angle * RAD) * length,
  };
}

function arm(
  shoulder: Point,
  lean: number,
  side: 1 | -1,
  raise: number,
  bend: number,
): StickLimb {
  const upper = -lean + side * raise;
  const joint = along(shoulder, upper, UPPER_ARM);
  const end = along(joint, upper + side * bend, FOREARM);
  return { joint, end };
}

/** Two-bone IK with the knee bending toward the facing side. */
function leg(hip: Point, foot: Point): StickLimb {
  const dx = foot.x - hip.x;
  const dy = foot.y - hip.y;
  const reach = Math.hypot(dx, dy);
  const ux = dx / reach;
  const uy = dy / reach;
  const span = Math.min(reach, THIGH + SHIN - 0.001);
  const toKnee = (THIGH * THIGH - SHIN * SHIN + span * span) / (2 * span);
  const out = Math.sqrt(Math.max(0, THIGH * THIGH - toKnee * toKnee));

  return {
    joint: { x: hip.x + ux * toKnee + uy * out, y: hip.y + uy * toKnee - ux * out },
    end: foot,
  };
}

/**
 * Sitting down, a person bows forward and pushes the hips back over the seat
 * as they lower, then sits up once on it; getting up runs the same way back.
 * Degrees and px at the middle of the move.
 */
const SIT_BOW = 18;
const SIT_BACK = 6;

/** `sit` runs from 0, standing, to 1, on a chair: the hip lowers onto the seat and the feet come forward. */
export function solveRig(pose: StickPose, sit = 0): StickRig {
  const standingHip = GROUND_Y - HIP_HEIGHT + pose.bob;
  const midway = Math.sin(Math.PI * Math.min(1, Math.max(0, sit)));
  const hip = {
    x: -3 * sit - SIT_BACK * midway,
    y: standingHip + (SEAT_Y - 2 - standingHip) * sit,
  };
  const lean = pose.lean + SIT_BOW * midway;
  const up = 180 - lean;
  const neck = along(hip, up, TORSO);
  const shoulders = along(hip, up, TORSO - SHOULDER_DROP);
  const leadShoulder = along(shoulders, 90 - lean, SHOULDER_HALF_WIDTH);
  const rearShoulder = along(shoulders, -90 - lean, SHOULDER_HALF_WIDTH);
  const head = along(neck, up - pose.tilt, NECK + HEAD_RADIUS - pose.nod);

  return {
    hip,
    lean,
    neck,
    leadShoulder,
    rearShoulder,
    head,
    headAngle: lean + pose.tilt,
    leadArm: arm(leadShoulder, lean, 1, pose.leadRaise, pose.leadBend),
    rearArm: arm(rearShoulder, lean, -1, pose.rearRaise, pose.rearBend),
    leadLeg: leg(hip, {
      x: pose.stance + pose.stride * STRIDE + 10 * sit,
      y: GROUND_Y - Math.max(0, pose.lift),
    }),
    rearLeg: leg(hip, {
      x: -pose.stance - pose.stride * STRIDE + (pose.stance + 4) * sit,
      y: GROUND_Y - Math.max(0, -pose.lift),
    }),
  };
}
