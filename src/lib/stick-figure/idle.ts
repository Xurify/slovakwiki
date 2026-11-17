import type { StickPose } from "./pose";

/**
 * Life in a body nobody is moving: a breath every few seconds and a blink
 * now and then, each person on their own rhythm, so two people never breathe
 * or blink together. Held dead still between lines, a figure read as a
 * picture of one (critic, table segment: "not a single pixel moves for 8 s").
 */

/** A breath at rest takes about 4 s. */
const BREATH_MS = 4000;
/** Each blink falls somewhere in its own 4 s window, so they come 0.6 to 7.4 s apart, never on a beat. */
const BLINK_WINDOW_MS = 4000;
/** A blink is over in about 150 ms: the lids come down faster than they go up. */
const BLINK_CLOSE_MS = 60;
const BLINK_OPEN_MS = 90;
/** The shoulders rise with a breath by this much arm lift, degrees, and the head with them, px. */
const BREATH_ARMS = 1.4;
const BREATH_HEAD = 0.35;

function seedOf(id: string): number {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/** A fixed fraction in [0, 1) for the `n`th window of the person seeded `seed`. */
function noise(n: number, seed: number): number {
  let x = (Math.imul(n, 374761393) + Math.imul(seed, 668265263)) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

/** How shut a blink has the eyes at `now`: 0 open, 1 shut. */
export function blinkAt(now: number, id: string): number {
  const seed = seedOf(id);
  const at = now + (seed % BLINK_WINDOW_MS);
  const window = Math.floor(at / BLINK_WINDOW_MS);
  const start = 300 + noise(window, seed) * (BLINK_WINDOW_MS - 600);
  const t = at - window * BLINK_WINDOW_MS - start;
  if (t < 0 || t > BLINK_CLOSE_MS + BLINK_OPEN_MS) return 0;
  return t < BLINK_CLOSE_MS
    ? t / BLINK_CLOSE_MS
    : 1 - (t - BLINK_CLOSE_MS) / BLINK_OPEN_MS;
}

/** How far into a breath `now` is: 0 out, 1 in. */
export function breathAt(now: number, id: string): number {
  const seed = seedOf(id);
  const period = BREATH_MS * (0.9 + 0.2 * noise(0, seed));
  const phase = ((now + (seed % period)) / period) * 2 * Math.PI;
  return (1 - Math.cos(phase)) / 2;
}

/**
 * `pose` with the breath and blink at `now`. `arms`: whether the breath may
 * lift them; a hand doing something on cue stays where the cue puts it.
 */
export function alive(
  pose: StickPose,
  now: number,
  id: string,
  arms: boolean,
): StickPose {
  const breath = breathAt(now, id);
  const lift = arms ? breath * BREATH_ARMS : 0;
  return {
    ...pose,
    leadRaise: pose.leadRaise + lift,
    rearRaise: pose.rearRaise + lift,
    nod: pose.nod - breath * BREATH_HEAD,
    // A blink brings the lids down (StickHead: shut at 0.5), it does not squeeze the eyes.
    shut: Math.max(pose.shut, blinkAt(now, id) * 0.5),
  };
}

/** A dog at rest does one small thing in each window of this long: cocks its head, sniffs, wags. */
const DOG_WINDOW_MS = 6000;
/** How long one of those takes. */
const DOG_MOVE_MS = 1600;
/** A wag's swing, raise degrees of the tail (StickDog), and how fast it goes back and forth. */
const WAG = 24;
const WAG_MS = 260;

/**
 * A dog nobody is moving, one small thing at a time on its own rhythm: the
 * head cocked one way or the other, the nose down to sniff the floor, or a
 * few wags of the tail. Stood dead still for a minute, a dog read as a cut-out.
 */
export function dogIdle(pose: StickPose, now: number, id: string): StickPose {
  const seed = seedOf(id) ^ 0x5bd1;
  const at = now + (seed % DOG_WINDOW_MS);
  const window = Math.floor(at / DOG_WINDOW_MS);
  const start = 500 + noise(window, seed) * (DOG_WINDOW_MS - DOG_MOVE_MS - 1000);
  const t = (at - window * DOG_WINDOW_MS - start) / DOG_MOVE_MS;
  if (t <= 0 || t >= 1) return pose;
  const amount = Math.sin(Math.PI * t);
  const kind = Math.floor(noise(window + 7919, seed) * 4);
  switch (kind) {
    case 0:
    case 1:
      return { ...pose, tilt: pose.tilt + (kind === 0 ? -9 : 9) * amount };
    case 2:
      return { ...pose, nod: pose.nod + 5 * amount, tilt: pose.tilt + 16 * amount };
    default: {
      const swing = Math.sin(((t * DOG_MOVE_MS) / WAG_MS) * 2 * Math.PI);
      return { ...pose, rearRaise: pose.rearRaise + WAG * amount * swing };
    }
  }
}
