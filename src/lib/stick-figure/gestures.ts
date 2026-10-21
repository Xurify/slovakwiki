import { REST_POSE, easeInOut, lerpPose, type StickPose } from "./pose";

export const STICK_GESTURE_IDS = [
  "talk",
  "wave",
  "nod",
  "shake",
  "ask",
  "shrug",
  "self",
  "point",
  "cheer",
  "apologize",
  "think",
  "lean",
  "show",
] as const;

export type StickGestureId = (typeof STICK_GESTURE_IDS)[number];

/** `tento` points at something near, `tamten` reaches for something over there. */
export type PointReach = "near" | "far";

/** Where a point goes: degrees above level toward the facing side, and how far. */
export interface PointAim {
  /** The rear hand points when the lead one holds a prop. */
  hand?: "lead" | "rear";
  reach?: PointReach;
  rise?: number;
}

interface GestureKey {
  at: number;
  pose: StickPose;
}

interface StickGesture {
  keys: GestureKey[];
  /** The still frame that stands in for the whole gesture under reduced motion. */
  peak: StickPose;
}

function key(at: number, pose: Partial<StickPose> = {}): GestureKey {
  return { at, pose: { ...REST_POSE, ...pose } };
}

function gesture(peak: Partial<StickPose>, keys: GestureKey[]): StickGesture {
  return { keys, peak: { ...REST_POSE, ...peak } };
}

const beat = { leadRaise: 34, leadBend: -70, look: 0.6 };
const waveUp = { leadRaise: 120, tilt: 4, brow: 0.6 };
const openHands = {
  leadRaise: 36,
  leadBend: 46,
  rearRaise: 30,
  rearBend: 46,
  tilt: 9,
  brow: 1,
};
const shrugUp = {
  leadRaise: 24,
  leadBend: 100,
  rearRaise: 24,
  rearBend: 100,
  bob: -1,
  nod: -1,
  tilt: -7,
  brow: 1,
};
const handOnChest = { leadRaise: 40, leadBend: -155, tilt: 3, look: 0.6 };
const armsUp = {
  leadRaise: 135,
  leadBend: 15,
  rearRaise: 135,
  rearBend: 15,
  bob: -1,
  brow: 1,
};
const sorry = { leadRaise: 40, leadBend: -155, nod: 2.5, tilt: -5, brow: -1, look: 0 };
const handOnChin = { leadRaise: 75, leadBend: -210, tilt: -6, look: -0.4, brow: 0.6 };
const leanIn = { lean: 5, tilt: 6, nod: 0.8, look: 1, brow: 0.6 };
const holdOut = { leadRaise: 55, leadBend: 45, lean: 2, tilt: 3, look: 1, brow: 0.6 };

/** A point with no target aims a little below level, at someone's hands or the table. */
const POINT_RISE = -9;

/**
 * A straight-ish arm toward `rise`. The upper arm leaves at `raise − lean`
 * from straight down and the forearm adds about half the elbow bend, so the
 * raise is solved from the lean and bend to land the hand on the aim. The
 * rear arm mirrors it, swinging forward from behind the body. A far point
 * straightens the arm, leans in and lifts the head; a near one bends the
 * elbow. Each shifts the aim a little so the two read apart.
 */
function pointing({ hand = "lead", reach, rise = POINT_RISE }: PointAim): StickGesture {
  const lean = reach === "far" ? 5 : reach === "near" ? 2 : 3;
  const bend = reach === "far" ? 0 : reach === "near" ? 24 : 4;
  const shift = reach === "far" ? 6 : reach === "near" ? -6 : 0;
  const raise = 90 + rise + shift + lean - bend * 0.48;
  const arm =
    hand === "rear"
      ? { rearRaise: -raise, rearBend: -bend }
      : { leadRaise: raise, leadBend: bend };
  const at = {
    ...arm,
    lean,
    look: 1,
    tilt: reach === "far" ? -2 : 0,
    bob: reach === "far" ? -0.8 : 0,
  };
  return gesture(at, [key(0), key(320, at), key(950, at), key(1250)]);
}

const STICK_GESTURES: Record<StickGestureId, StickGesture> = {
  talk: gesture(beat, [
    key(0),
    key(260, beat),
    key(520, { leadRaise: 26, leadBend: -55, look: 0.6 }),
    key(780, { leadRaise: 36, leadBend: -74, look: 0.6 }),
    key(1150),
  ]),
  wave: gesture({ ...waveUp, leadBend: 10 }, [
    key(0),
    key(280, { ...waveUp, leadBend: 25 }),
    key(460, { ...waveUp, leadBend: -15 }),
    key(640, { ...waveUp, leadBend: 25 }),
    key(820, { ...waveUp, leadBend: -15 }),
    key(1000, { ...waveUp, leadBend: 10 }),
    key(1350),
  ]),
  nod: gesture({ nod: 3, look: 0.6, brow: 0.3 }, [
    key(0),
    key(200, { nod: 3, look: 0.6, brow: 0.3 }),
    key(400, { nod: -0.5, brow: 0.3 }),
    key(600, { nod: 2.5, look: 0.6, brow: 0.3 }),
    key(900),
  ]),
  shake: gesture({ look: -1, tilt: -4, brow: -0.4 }, [
    key(0),
    key(180, { look: -1, tilt: -4, brow: -0.4 }),
    key(380, { look: 1, tilt: 4, brow: -0.4 }),
    key(580, { look: -1, tilt: -4, brow: -0.4 }),
    key(780, { brow: -0.4 }),
    key(1000),
  ]),
  ask: gesture(openHands, [
    key(0),
    key(320, openHands),
    key(900, { ...openHands, tilt: 7 }),
    key(1250),
  ]),
  shrug: gesture(shrugUp, [key(0), key(300, shrugUp), key(800, shrugUp), key(1100)]),
  self: gesture(handOnChest, [
    key(0),
    key(300, handOnChest),
    key(950, handOnChest),
    key(1250),
  ]),
  point: pointing({}),
  cheer: gesture(armsUp, [
    key(0),
    key(260, armsUp),
    key(420, { ...armsUp, bob: 1 }),
    key(600, armsUp),
    key(1000),
  ]),
  apologize: gesture(sorry, [key(0), key(320, sorry), key(950, sorry), key(1250)]),
  think: gesture(handOnChin, [
    key(0),
    key(340, handOnChin),
    key(1000, handOnChin),
    key(1300),
  ]),
  lean: gesture(leanIn, [key(0), key(340, leanIn), key(1100, leanIn), key(1450)]),
  show: gesture(holdOut, [key(0), key(320, holdOut), key(1200, holdOut), key(1550)]),
};

export function gestureDuration(id: StickGestureId): number {
  const { keys } = STICK_GESTURES[id];
  return keys[keys.length - 1].at;
}

function gestureFor(id: StickGestureId, aim?: PointAim): StickGesture {
  return id === "point" && aim ? pointing(aim) : STICK_GESTURES[id];
}

export function sampleGesture(
  id: StickGestureId,
  elapsed: number,
  aim?: PointAim,
): StickPose {
  const { keys } = gestureFor(id, aim);

  for (let index = 1; index < keys.length; index += 1) {
    const previous = keys[index - 1];
    const next = keys[index];
    if (elapsed > next.at) continue;

    const t = (elapsed - previous.at) / (next.at - previous.at);
    return lerpPose(previous.pose, next.pose, easeInOut(t));
  }

  return keys[keys.length - 1].pose;
}

/** The still frame that stands in for the whole gesture under reduced motion. */
export function gesturePeak(id: StickGestureId, aim?: PointAim): StickPose {
  return gestureFor(id, aim).peak;
}

/**
 * Mouth flap for a clip without a loudness track. A fast sine reads as
 * syllables (~5 a second, the slowed ElevenLabs pace); the slow one starts
 * wide and closes down, like a phrase's loudness falling toward its end.
 */
export function mouthAt(elapsed: number): number {
  const syllable = Math.abs(Math.sin(elapsed / 62));
  const phrase = 0.55 + 0.45 * Math.sin(elapsed / 410 + 1.3);
  return Math.min(1, syllable * phrase);
}
