import { REST_POSE, easeInOut, lerpPose, type StickPose } from "./pose";

export const STICK_GESTURE_IDS = [
  "tell",
  "stress",
  "muse",
  "wave",
  "waveOut",
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
  "glance",
  "puzzle",
  "laugh",
  "frown",
  "chuckle",
  "sigh",
  "yawn",
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

// No talking gesture turns the face past the front (look below 0): with the eyes off the person spoken to, it read as facing the wrong way.

/** A statement, offered on a small open hand turned out at the waist. */
const telling = { leadRaise: 28, leadBend: 38, tilt: 2, look: 0.6, brow: 0.2 };
/** An exclamation: a short beat of the hand with a nod on the word. */
const stressing = { leadRaise: 46, leadBend: 12, nod: 1.6, look: 0.6, brow: 0.5 };
/** Words that trail off, or a long thought: head on one side, hands still. */
const musing = { tilt: 6, lean: 1, look: 0.3, brow: 0.35 };
const waveUp = { leadRaise: 120, tilt: 4, brow: 0.6 };
const waveOut = { rearRaise: 140, tilt: 4, brow: 0.6 };
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
const sorry = { leadRaise: 40, leadBend: -155, nod: 2.5, tilt: -5, brow: -1, look: 0.4 };
const handOnChin = { leadRaise: 75, leadBend: -210, tilt: -6, look: 0.2, brow: 0.6 };
const leanIn = { lean: 5, tilt: 6, nod: 0.8, look: 1, brow: 0.6 };
const holdOut = { leadRaise: 55, leadBend: 45, lean: 2, tilt: 3, look: 1, brow: 0.6 };
/** Head up a little and eyes ahead: following where someone points. */
const lookOver = { tilt: -12, look: 1, brow: 0.6, lean: -1 };
/** Head on one side, brows up, eyes off: did I hear that right? */
const puzzled = {
  tilt: 13,
  brow: 1,
  look: 0.2,
  lean: -1.5,
  rearRaise: 30,
  rearBend: 70,
};
/** Head back, mouth open, a hand to the stomach: a friend amused at a slip. */
const laughing = {
  tilt: -9,
  brow: 0.7,
  mouth: 0.45,
  mouthWidth: 1.2,
  leadRaise: 32,
  leadBend: -130,
  look: 0.6,
};
/** A quiet laugh to oneself: head dipped, a hand loose at the chest, shoulders shaking. */
const chuckling = {
  tilt: 4,
  nod: 1.2,
  brow: 0.5,
  look: 0.3,
  leadRaise: 28,
  leadBend: -110,
};
/** Breath in, shoulders up and head back… */
const sighIn = { bob: -1.6, tilt: -5, brow: 0.4, lean: -1, look: 0.4 };
/** …then out, everything dropping: fond exasperation. */
const sighOut = { bob: 1.2, nod: 2.2, tilt: 3, brow: -0.6, lean: 1, look: 0.2 };
/**
 * The near hand up over the mouth and the head back: still half asleep. The
 * far arm's raise swings it backwards, so it could never reach the mouth.
 */
const yawning = {
  leadRaise: 130,
  leadBend: 126,
  tilt: -8,
  brow: -0.4,
  look: 0.2,
  bob: -0.6,
};
/** Arms folded, leaning back, brows drawn: politely put out by too familiar a word. */
const putOut = {
  leadRaise: 42,
  leadBend: -150,
  rearRaise: 42,
  rearBend: -150,
  lean: -3,
  tilt: -3,
  brow: -0.8,
  look: 0.2,
};

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
  puzzle: gesture(puzzled, [
    key(0),
    key(300, puzzled),
    key(1300, { ...puzzled, tilt: 10 }),
    key(1650),
  ]),
  laugh: gesture(laughing, [
    key(0),
    key(220, laughing),
    key(420, { ...laughing, bob: 1, mouth: 0.25 }),
    key(620, laughing),
    key(820, { ...laughing, bob: 1, mouth: 0.25 }),
    key(1020, laughing),
    key(1350),
  ]),
  chuckle: gesture(chuckling, [
    key(0),
    key(200, chuckling),
    key(360, { ...chuckling, bob: 0.8, nod: 1.8 }),
    key(520, chuckling),
    key(680, { ...chuckling, bob: 0.8, nod: 1.8 }),
    key(840, chuckling),
    key(1150),
  ]),
  sigh: gesture(sighOut, [
    key(0),
    key(450, sighIn),
    key(1000, sighOut),
    key(1500, sighOut),
    key(1900),
  ]),
  yawn: gesture(yawning, [key(0), key(400, yawning), key(1400, yawning), key(1800)]),
  frown: gesture(putOut, [key(0), key(380, putOut), key(1500, putOut), key(1850)]),
  tell: gesture(telling, [
    key(0),
    key(300, telling),
    key(900, { ...telling, tilt: 3, leadBend: 44 }),
    key(1250),
  ]),
  stress: gesture(stressing, [
    key(0),
    key(220, { ...stressing, leadRaise: 52, leadBend: 0, nod: -0.5 }),
    key(400, { ...stressing, leadRaise: 40, leadBend: 24, nod: 2 }),
    key(600, stressing),
    key(1000),
  ]),
  muse: gesture(musing, [key(0), key(340, musing), key(1100, musing), key(1400)]),
  wave: gesture({ ...waveUp, leadBend: 10 }, [
    key(0),
    key(280, { ...waveUp, leadBend: 25 }),
    key(460, { ...waveUp, leadBend: -15 }),
    key(640, { ...waveUp, leadBend: 25 }),
    key(820, { ...waveUp, leadBend: -15 }),
    key(1000, { ...waveUp, leadBend: 10 }),
    key(1350),
  ]),
  // With the other hand, up beside the head: seated behind a desk mic, the near one waved into its boom.
  waveOut: gesture({ ...waveOut, rearBend: -10 }, [
    key(0),
    key(280, { ...waveOut, rearBend: -25 }),
    key(460, { ...waveOut, rearBend: 15 }),
    key(640, { ...waveOut, rearBend: -25 }),
    key(820, { ...waveOut, rearBend: 15 }),
    key(1000, { ...waveOut, rearBend: -10 }),
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
  glance: gesture(lookOver, [key(0), key(260, lookOver), key(1300, lookOver), key(1600)]),
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
