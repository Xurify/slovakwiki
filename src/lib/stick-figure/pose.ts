/**
 * A cast member's pose in figure space: the figure faces +x, angles are
 * degrees. "Lead" is the arm on the side the figure faces (toward the
 * person it talks to), "rear" the other one.
 */
export interface StickPose {
  /** Arm lift away from the body: 0 hangs down, 90 is level, 180 points up. */
  leadRaise: number;
  /** Elbow: positive opens the forearm outward, negative folds it toward the chest. */
  leadBend: number;
  rearRaise: number;
  rearBend: number;
  /** Torso lean toward the facing side. */
  lean: number;
  /** Head tilt on top of the torso. */
  tilt: number;
  /** Head dip in px, read as a nod. */
  nod: number;
  /** Eye direction: -1 away, 0 ahead, 1 toward the facing side. */
  look: number;
  /** Hip drop in px; negative rises. Feet stay planted and knees take it up. */
  bob: number;
  /** Feet distance from centre, px. */
  stance: number;
  /** Walking: -1…1 swings the lead foot back or forward and the rear foot the other way. */
  stride: number;
  /** Walking: px the moving foot is off the ground; positive lifts the lead foot, negative the rear. */
  lift: number;
  /** -1 worried, 0 neutral, 1 raised. */
  brow: number;
  /** 0 closed, 1 wide open. */
  mouth: number;
  /** Lip rounding for o/u: 0 spread, 1 round. */
  round: number;
  /** Mouth width against a neutral `a`. */
  mouthWidth: number;
}

export const REST_POSE: StickPose = {
  leadRaise: 14,
  leadBend: -6,
  rearRaise: 14,
  rearBend: -6,
  lean: 0,
  tilt: 0,
  nod: 0,
  look: 0.4,
  bob: 0,
  stance: 8,
  stride: 0,
  lift: 0,
  brow: 0,
  mouth: 0,
  round: 0,
  mouthWidth: 1,
};

const POSE_KEYS = Object.keys(REST_POSE) as Array<keyof StickPose>;

export function lerpPose(from: StickPose, to: StickPose, t: number): StickPose {
  const pose = { ...from };

  for (const key of POSE_KEYS) {
    pose[key] = from[key] + (to[key] - from[key]) * t;
  }

  return pose;
}

export function easeInOut(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2;
}
