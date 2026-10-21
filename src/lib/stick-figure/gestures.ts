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
] as const;

export type StickGestureId = (typeof STICK_GESTURE_IDS)[number];

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
const aim = { leadRaise: 82, leadBend: 4, lean: 3, look: 1 };
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
  point: gesture(aim, [key(0), key(320, aim), key(950, aim), key(1250)]),
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
};

export function gestureDuration(id: StickGestureId): number {
  const { keys } = STICK_GESTURES[id];
  return keys[keys.length - 1].at;
}

export function sampleGesture(id: StickGestureId, elapsed: number): StickPose {
  const { keys } = STICK_GESTURES[id];

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
export function gesturePeak(id: StickGestureId): StickPose {
  return STICK_GESTURES[id].peak;
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
