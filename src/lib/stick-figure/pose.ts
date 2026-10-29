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
  /** A dog's bounding run: the phase of its bound, in radians (see gallopPose). */
  gallop: number;
  /** How far into a bounding run the dog's legs are, 0 walking or at rest to 1 at full stride. */
  gallopAmp: number;
  /** -1 worried, 0 neutral, 1 raised. */
  brow: number;
  /** 0 closed, 1 wide open. */
  mouth: number;
  /** Lip rounding for o/u: 0 spread, 1 round. */
  round: number;
  /** Mouth width against a neutral `a`. */
  mouthWidth: number;
  /** Eyes: 0 open, 1 squeezed shut, as in a yawn or a belly laugh. */
  shut: number;
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
  gallop: 0,
  gallopAmp: 0,
  brow: 0,
  mouth: 0,
  round: 0,
  mouthWidth: 1,
  shut: 0,
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

/**
 * A seated talker's beat: the share of the arm's swing out that it keeps,
 * and the forearm's angle from straight down. The elbow stays by the side
 * and the forearm comes up, so the hand beats in front of the chest, between
 * the desk's mug and the microphone, not out along the desk.
 */
const OVER_TABLE = { swing: 0.4, forearm: 125 };
/** An arm raised further than this from rest points or waves, and is left be. */
const RAISED = 50;

/**
 * Seated at a table or desk, a talking hand gestures over it. An arm held
 * out from the body draws in and bends up the more the figure sits; one
 * folded to the chest or chin, or raised to point, stays as it is.
 */
export function overTable(pose: StickPose, sit: number): StickPose {
  if (sit <= 0) return pose;
  const lift = (raise: number, bend: number, rest: number, seated = sit) => {
    const out = raise - rest;
    if (bend < -30 || Math.abs(out) < 4 || Math.abs(out) > RAISED) return { raise, bend };
    const k = seated * Math.min(1, Math.abs(out) / 20);
    const drawn = raise - out * (1 - OVER_TABLE.swing) * seated;
    const up = Math.sign(out) * OVER_TABLE.forearm - drawn;
    return { raise: drawn, bend: bend + (up - bend) * k };
  };
  const lead = lift(pose.leadRaise, pose.leadBend, REST_POSE.leadRaise);
  let rear = lift(pose.rearRaise, pose.rearBend, REST_POSE.rearRaise);
  // Swung back, the far hand went behind a seated talker onto whatever lay on the desk there (the critic read it as grabbing the recorder): it comes up in front, as the near one does, a little lower.
  const back = pose.rearRaise - REST_POSE.rearRaise;
  if (back >= 4 && back <= RAISED && pose.rearBend >= -30) {
    const ahead = lift(
      REST_POSE.rearRaise + back * 0.8,
      pose.rearBend,
      REST_POSE.rearRaise,
      1,
    );
    rear = {
      raise: pose.rearRaise + (-ahead.raise - pose.rearRaise) * sit,
      bend: pose.rearBend + (-ahead.bend - pose.rearBend) * sit,
    };
  }
  return {
    ...pose,
    leadRaise: lead.raise,
    leadBend: lead.bend,
    rearRaise: rear.raise,
    rearBend: rear.bend,
  };
}
