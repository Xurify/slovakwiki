import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import { freeHand, handHolding, type Cue, type World } from "./acts";
import { REST_POSE, easeInOut, type StickPose } from "./pose";
import { mouthOf, reachFor, type Hand } from "./reach";
import { solveRig, type Point } from "./rig";

/**
 * How each verb moves the body: keys in time, each hand on a target or
 * free, and the moment the cue takes effect (the spoon is in the hand once
 * the hand has closed on it). Targets are worked out every frame from where
 * everyone and everything is, so a reach lands on the pot wherever the
 * stage has put it.
 */

/** Where a hand goes. */
export type Target =
  /** An object of the set, `dy` above or below its grip point, in rig units. */
  | { object: string; dx?: number; dy?: number }
  /** In front of the mouth: `dx` further out, `dy` lower. */
  | { mouth: true; dx?: number; dy?: number }
  /** Halfway to the other person, at chest height: where two hands meet to hand something over. */
  | { meet: LessonCharacterId }
  /** A point in the figure's own space, facing +x. */
  | { at: Point };

export interface MotionKey {
  at: number;
  /** A hand's target; left out, the hand is wherever the talking puts it. */
  lead?: Target;
  rear?: Target;
  /** Added to the talking pose. */
  body?: Partial<StickPose>;
  /** Degrees a held object turns from upright, per hand: a spoon tipped to the mouth. */
  turn?: Partial<Record<Hand, number>>;
  /** A mark drawn at the mouth: heat off a burnt tongue, a breath blown out. */
  emote?: Emote;
}

export type Emote = "hot" | "blow";

export type FoleyId = "clink" | "lid" | "slurp" | "blow" | "steam" | "hop";

export interface Motion {
  ms: number;
  keys: MotionKey[];
  /** When the cue takes effect, ms in: the hand closes, the spoon leaves the soup. */
  takes?: number;
  sounds?: Array<{ at: number; id: FoleyId }>;
  /** Holds its last key until the line is over: a spoon held out until it is taken. */
  hold?: boolean;
  /** Which way the figure faces while it moves: toward what it reaches for. */
  face?: LessonCharacterId | string;
}

const REACHED = 420;

function hands(hand: Hand, target: Target | undefined): Pick<MotionKey, Hand> {
  return hand === "lead" ? { lead: target } : { rear: target };
}

function other(hand: Hand): Hand {
  return hand === "lead" ? "rear" : "lead";
}

/**
 * The motion for `cue` by `who`, from the world it starts in. A hand-over
 * also moves the other person: `partner` is their half of it.
 */
export function motionFor(
  cue: Cue,
  who: LessonCharacterId,
  world: World,
): { motion: Motion; partner?: { who: LessonCharacterId; motion: Motion } } {
  const what = cue.what ?? "";
  const holding = handHolding(world, who, cue.what);

  switch (cue.do) {
    case "take": {
      const where = world.objects[what]?.where;
      const giver = where && "hand" in where ? where.hand : undefined;
      const hand = freeHand(world, who, what) ?? "lead";
      if (giver) {
        const handOver = handOverMotion(hand, giver);
        return {
          motion: { ...handOver, face: giver },
          partner: {
            who: giver,
            motion: {
              ...handOverMotion(where && "side" in where ? where.side : "lead", who),
              face: who,
            },
          },
        };
      }
      return {
        motion: {
          ms: 900,
          face: what,
          takes: REACHED + 80,
          sounds:
            what === "lid"
              ? [
                  { at: REACHED + 60, id: "lid" },
                  { at: REACHED + 200, id: "steam" },
                ]
              : [{ at: REACHED + 60, id: "clink" }],
          keys: [
            { at: 0 },
            { at: REACHED, ...hands(hand, { object: what, dy: -3 }), body: { lean: 3 } },
            { at: REACHED + 100, ...hands(hand, { object: what }), body: { lean: 3 } },
            { at: 900 },
          ],
        },
      };
    }
    case "give": {
      const to = cue.to as LessonCharacterId;
      const hand = holding ?? "lead";
      return {
        motion: { ...handOverMotion(hand, to), face: to },
        partner: {
          who: to,
          motion: {
            ...handOverMotion(freeHand(world, to, what) ?? "lead", who),
            face: who,
          },
        },
      };
    }
    case "put": {
      const hand = holding ?? "lead";
      const into = cue.to ?? "";
      return {
        motion: {
          ms: 900,
          face: into,
          takes: REACHED + 80,
          sounds: [{ at: REACHED + 60, id: what === "lid" ? "lid" : "clink" }],
          keys: [
            { at: 0 },
            { at: REACHED, ...hands(hand, { object: into, dy: -4 }), body: { lean: 3 } },
            { at: REACHED + 100, ...hands(hand, { object: into }), body: { lean: 3 } },
            { at: 900 },
          ],
        },
      };
    }
    case "dip": {
      const hand = holding ?? "lead";
      const into = cue.to ?? "";
      const tip = { [hand]: 160 };
      return {
        motion: {
          ms: 1500,
          face: into,
          takes: 1000,
          sounds: [{ at: 620, id: "clink" }],
          keys: [
            { at: 0 },
            {
              at: 420,
              ...hands(hand, { object: into, dy: -14 }),
              turn: tip,
              body: { lean: 4 },
            },
            {
              at: 650,
              ...hands(hand, { object: into, dy: -6 }),
              turn: tip,
              body: { lean: 5 },
            },
            {
              at: 820,
              ...hands(hand, { object: into, dx: 2, dy: -5 }),
              turn: tip,
              body: { lean: 5 },
            },
            {
              at: 1000,
              ...hands(hand, { object: into, dy: -7 }),
              turn: tip,
              body: { lean: 5 },
            },
            {
              at: 1250,
              ...hands(hand, { object: into, dy: -16 }),
              turn: { [hand]: 0 },
              body: { lean: 2 },
            },
            { at: 1500, ...hands(hand, { at: { x: 14, y: 82 } }) },
          ],
        },
      };
    }
    case "offer": {
      const hand = holding ?? "lead";
      const to = cue.to as LessonCharacterId;
      const out = {
        ...hands(hand, { meet: to }),
        turn: { [hand]: 20 },
        body: { lean: 3, tilt: 4, brow: 0.5 },
      };
      return {
        motion: {
          ms: 700,
          face: to,
          hold: true,
          keys: [{ at: 0 }, { at: 550, ...out }, { at: 700, ...out }],
        },
      };
    }
    case "taste": {
      const hand = holding ?? "lead";
      const sip = {
        ...hands(hand, { mouth: true, dx: 7, dy: 6 }),
        turn: { [hand]: -55 },
      };
      return {
        motion: {
          ms: 1300,
          takes: 700,
          sounds: [{ at: 620, id: "slurp" }],
          keys: [
            { at: 0 },
            {
              at: 380,
              ...hands(hand, { mouth: true, dx: 10, dy: 9 }),
              turn: { [hand]: -40 },
              body: { tilt: 3, lean: 1 },
            },
            { at: 560, ...sip, body: { tilt: -2, lean: 2, brow: 0.3 } },
            { at: 820, ...sip, body: { tilt: -3, lean: 2, brow: 0.4 } },
            {
              at: 1300,
              ...hands(hand, { mouth: true, dx: 12, dy: 14 }),
              turn: { [hand]: -20 },
            },
          ],
        },
      };
    }
    case "burn": {
      // The spoon goes out of the way, the free hand fans the mouth, and the
      // whole body hops: the soup was hotter than the warning made it sound.
      const spoonHand = holding ?? (heldHand(world, who) || "lead");
      const fan = other(spoonHand);
      const away = hands(spoonHand, { at: { x: 20, y: 96 } });
      const keys: MotionKey[] = [
        { at: 0 },
        {
          at: 110,
          ...away,
          ...hands(fan, { mouth: true, dx: 6, dy: 1 }),
          body: { lean: -6, tilt: -12, bob: -2.5, brow: 1, look: -0.4 },
          emote: "hot",
        },
      ];
      for (let at = 250, flap = 0; at <= 1500; at += 125, flap += 1) {
        keys.push({
          at,
          ...away,
          ...hands(fan, { mouth: true, dx: 6, dy: flap % 2 ? -3 : 3 }),
          body: {
            lean: -3,
            tilt: flap % 2 ? -6 : -3,
            bob: at < 1150 ? (Math.floor(flap / 2) % 2 ? -3.4 : 0.6) : 0,
            brow: 1,
          },
          emote: "hot",
        });
      }
      keys.push({ at: 1800 });
      return {
        motion: {
          ms: 1800,
          keys,
          sounds: [
            { at: 360, id: "hop" },
            { at: 860, id: "hop" },
          ],
        },
      };
    }
    case "blow": {
      const hand = holding ?? "lead";
      const near = {
        ...hands(hand, { mouth: true, dx: 14, dy: 5 }),
        turn: { [hand]: -30 },
      };
      return {
        motion: {
          ms: 1500,
          takes: 1100,
          sounds: [{ at: 450, id: "blow" }],
          keys: [
            { at: 0 },
            { at: 380, ...near, body: { tilt: 4, nod: 0.6 } },
            { at: 450, ...near, body: { tilt: 4, nod: 0.6 }, emote: "blow" },
            { at: 1100, ...near, body: { tilt: 4, nod: 0.6 }, emote: "blow" },
            { at: 1500 },
          ],
        },
      };
    }
    case "wag": {
      const hand = freeHand(world, who) ?? "rear";
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 280, wag = 0; at <= 1100; at += 160, wag += 1) {
        keys.push({
          at,
          ...hands(hand, { at: { x: 12 + (wag % 2 ? 2.5 : -2.5), y: 56 } }),
          body: { brow: 0.8, nod: 0.6, tilt: -3 },
        });
      }
      keys.push({ at: 1400 });
      return { motion: { ms: 1400, keys } };
    }
    case "go":
    case "camera":
      return { motion: { ms: 0, keys: [] } };
  }
}

function heldHand(world: World, who: LessonCharacterId): Hand | undefined {
  for (const { where } of Object.values(world.objects)) {
    if ("hand" in where && where.hand === who) return where.side;
  }
  return undefined;
}

/** One half of a hand-over: out to where the two hands meet, a beat there, and back. */
function handOverMotion(hand: Hand, to: LessonCharacterId): Motion {
  const meet = hands(hand, { meet: to });
  return {
    ms: 1000,
    takes: 520,
    sounds: [],
    keys: [
      { at: 0 },
      { at: 420, ...meet, body: { lean: 4 } },
      { at: 600, ...meet, body: { lean: 4 } },
      { at: 1000 },
    ],
  };
}

/** Everything a motion needs to know about the stage at a moment, in the mover's own rig space. */
export interface Surroundings {
  /** A point of the set, or of anyone's body, in this figure's rig space. */
  objectAt(id: string): Point | undefined;
  /** Halfway to `who`, at chest height. */
  meetWith(who: LessonCharacterId): Point | undefined;
}

export interface MotionFrame {
  pose: StickPose;
  turn: Partial<Record<Hand, number>>;
  emote?: Emote;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function targetPoint(
  target: Target | undefined,
  hand: Hand,
  pose: StickPose,
  around: Surroundings,
  sit: number,
): Point {
  const rest = solveRig(pose, sit)[hand === "lead" ? "leadArm" : "rearArm"].end;
  if (!target) return rest;
  if ("at" in target) return target.at;
  if ("mouth" in target) {
    const mouth = mouthOf(pose, sit);
    return { x: mouth.x + (target.dx ?? 0), y: mouth.y + (target.dy ?? 0) };
  }
  if ("meet" in target) return around.meetWith(target.meet) ?? rest;
  const at = around.objectAt(target.object);
  return at ? { x: at.x + (target.dx ?? 0), y: at.y + (target.dy ?? 0) } : rest;
}

/**
 * The figure `ms` into a motion, on top of `base`, the pose its talking
 * gives it now. Hands on a target are solved onto it; between keys the
 * hand travels in a straight eased line, so a spoon goes to the mouth and
 * not round it.
 */
export function sampleMotion(
  motion: Motion,
  ms: number,
  base: StickPose,
  around: Surroundings,
  sit = 0,
): MotionFrame {
  const { keys } = motion;
  if (keys.length === 0) return { pose: base, turn: {} };
  const time = Math.min(ms, motion.ms);
  let index = keys.findIndex((key) => key.at >= time);
  if (index === -1) index = keys.length - 1;
  const from = keys[Math.max(0, index - 1)];
  const to = keys[index];
  const span = to.at - from.at;
  const t = span > 0 ? easeInOut((time - from.at) / span) : 1;

  const body = { ...base };
  for (const key of Object.keys(REST_POSE) as Array<keyof StickPose>) {
    const a = from.body?.[key] ?? 0;
    const b = to.body?.[key] ?? 0;
    body[key] = base[key] + lerp(a, b, t);
  }

  let pose = body;
  for (const hand of ["lead", "rear"] as const) {
    const a = from[hand];
    const b = to[hand];
    if (!a && !b) continue;
    const start = targetPoint(a, hand, body, around, sit);
    const end = targetPoint(b, hand, body, around, sit);
    pose = {
      ...pose,
      ...reachFor(
        pose,
        hand,
        { x: lerp(start.x, end.x, t), y: lerp(start.y, end.y, t) },
        sit,
      ),
    };
  }

  const turn: Partial<Record<Hand, number>> = {};
  for (const hand of ["lead", "rear"] as const) {
    const a = from.turn?.[hand];
    const b = to.turn?.[hand];
    if (a === undefined && b === undefined) continue;
    turn[hand] = lerp(a ?? 0, b ?? 0, t);
  }

  return { pose, turn, emote: t < 0.5 ? from.emote : to.emote };
}
