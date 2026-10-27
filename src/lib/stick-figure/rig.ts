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
  /** How far down onto the seat the hips are, 0 standing to 1 seated. */
  seated: number;
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
 * as they lower, the arms coming forward against the bow, then sits up once
 * on it. Getting up leans in first, then rises. Degrees and px at the most.
 */
const SIT_BOW = 18;
const SIT_REACH = 1.5;
/** The head stays this much nearer level than the bowing torso, eyes on where they sit. */
const SIT_HEAD_LEVEL = 0.7;
/** Without a chair drawn back to step in front of, the hips still go back that much. */
const SIT_BACK = 6;

/** How a figure gets onto or off a chair, for `solveRig`. */
export interface SitPath {
  /** Rig units the chair is drawn back from its place: the figure stood at the place, and sits that much further back. */
  out?: number;
  /** Getting up, as opposed to sitting down. */
  rising?: boolean;
}

function smooth(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

/**
 * Over a sit, from 0 standing to 1 seated: how far the hips have gone back,
 * how far down, and the bow. Down, the hips go back before they drop; up,
 * the bow brings the weight over the feet before the hips lift.
 */
function sitPhases(
  sit: number,
  rising: boolean,
): { back: number; down: number; bow: number } {
  if (rising) {
    const up = 1 - sit;
    return {
      back: 1 - smooth((up - 0.08) / 0.62),
      down: 1 - smooth((up - 0.22) / 0.72),
      bow: Math.sin(Math.PI * Math.min(1, Math.max(0, up / 0.85))),
    };
  }
  return {
    back: smooth(sit / 0.78),
    down: smooth((sit - 0.12) / 0.86),
    bow: Math.sin(Math.PI * Math.min(1, Math.max(0, (sit - 0.04) / 0.9))),
  };
}

/** `sit` runs from 0, standing, to 1, on a chair: the hip lowers onto the seat and the feet come forward. */
export function solveRig(pose: StickPose, sit = 0, path: SitPath = {}): StickRig {
  const standingHip = GROUND_Y - HIP_HEIGHT + pose.bob;
  const amount = Math.min(1, Math.max(0, sit));
  const out = path.out ?? 0;
  const { back, down, bow } =
    amount > 0 && amount < 1
      ? sitPhases(amount, path.rising ?? false)
      : { back: amount, down: amount, bow: 0 };
  const hip = {
    x: -(3 + out) * back - Math.max(0, SIT_BACK - out / 2) * bow,
    y: standingHip + (SEAT_Y - 2 - standingHip) * down,
  };
  const lean = pose.lean + SIT_BOW * bow;
  const reach = SIT_BOW * SIT_REACH * bow;
  const up = 180 - lean;
  const neck = along(hip, up, TORSO);
  const shoulders = along(hip, up, TORSO - SHOULDER_DROP);
  const leadShoulder = along(shoulders, 90 - lean, SHOULDER_HALF_WIDTH);
  const rearShoulder = along(shoulders, -90 - lean, SHOULDER_HALF_WIDTH);
  const level = SIT_BOW * SIT_HEAD_LEVEL * bow;
  const head = along(neck, up - pose.tilt + level, NECK + HEAD_RADIUS - pose.nod);

  return {
    hip,
    seated: down,
    lean,
    neck,
    leadShoulder,
    rearShoulder,
    head,
    headAngle: lean + pose.tilt - level,
    leadArm: arm(leadShoulder, lean, 1, pose.leadRaise + reach, pose.leadBend + bow * 12),
    rearArm: arm(
      rearShoulder,
      lean,
      -1,
      pose.rearRaise - reach,
      pose.rearBend - bow * 12,
    ),
    // Planted where they stood: the seat is `out` behind them, so the feet end that much nearer it.
    leadLeg: leg(hip, {
      x: pose.stance + pose.stride * STRIDE + (10 - out) * back,
      y: GROUND_Y - Math.max(0, pose.lift),
    }),
    rearLeg: leg(hip, {
      x: -pose.stance - pose.stride * STRIDE + (pose.stance + 4 - out) * back,
      y: GROUND_Y - Math.max(0, -pose.lift),
    }),
  };
}
