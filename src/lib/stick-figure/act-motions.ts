import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import {
  HEAVY,
  freeHand,
  handHolding,
  heldBy,
  type Cue,
  type ObjectKind,
  type World,
} from "./acts";
import { REST_POSE, easeInOut, type StickPose } from "./pose";
import { mouthOf, reachFor, type Hand } from "./reach";
import { solveRig, type Point } from "./rig";
import { OBJECT_SIZE } from "./set-pieces";

/**
 * How each verb moves the body: keys in time, each hand on a target or
 * free, and the moment the cue takes effect (the spoon is in the hand once
 * the hand has closed on it). Targets are worked out every frame from where
 * everyone and everything is, so a reach lands on the pot wherever the
 * stage has put it.
 */

/** Where a hand goes. */
export type Target =
  /**
   * A named point of the stage: an object (its grip, the top of what is in
   * it, or its base), a place or piece of the set (its surface), a person,
   * or a thing of the backdrop. `dx` and `dy` move it, in rig units.
   */
  | { to: string; as?: "grip" | "top" | "base"; dx?: number; dy?: number }
  /** At the lips: `dx` further out in front of them, `dy` lower. */
  | { mouth: true; dx?: number; dy?: number }
  /** Halfway to the other person, at chest height: where two hands meet to hand something over. */
  | { meet: LessonCharacterId }
  /** A point in the figure's own space, facing +x. */
  | { at: Point }
  /** Where the hand lets go of what it puts down: the object's grip once it is there. */
  | { landing: true; dx?: number; dy?: number }
  /** Toward a named point, the arm straight out: pointing at it. */
  | { toward: string };

export interface MotionKey {
  at: number;
  /** A hand's target; left out, the hand is wherever the talking puts it. */
  lead?: Target;
  rear?: Target;
  /** The other hand on the far side of what the lead one holds: a pot carried by both handles. */
  both?: boolean;
  /** Added to the talking pose. */
  body?: Partial<StickPose>;
  /** Degrees a held object turns from upright, per hand: a spoon tipped to the mouth. */
  turn?: Partial<Record<Hand, number>>;
  /** A mark drawn at the mouth: heat off a burnt tongue, a breath blown out. */
  emote?: Emote;
}

export type Emote = "hot" | "blow" | "sniff";

export type FoleyId =
  | "clink"
  | "lid"
  | "slurp"
  | "blow"
  | "steam"
  | "hop"
  | "knock"
  | "door"
  | "tap"
  | "fill"
  | "pour"
  | "chop"
  | "peel"
  | "salt"
  | "splash"
  | "plop"
  | "gas"
  | "keys"
  | "chair"
  | "thud"
  | "sniff"
  | "rattle";

/** Something the stage draws while a motion runs: water from the tap, a stream from a jug, salt. */
export interface Effect {
  kind: "tap" | "stream" | "salt" | "peel";
  from: number;
  until: number;
  /** For a tap, the piece it is on; otherwise the hand whose object it comes out of. */
  piece?: string;
  hand?: Hand;
}

export interface Motion {
  ms: number;
  keys: MotionKey[];
  /** When the cue takes effect, ms in: the hand closes, the spoon leaves the soup. */
  takes?: number;
  sounds?: Array<{ at: number; id: FoleyId }>;
  effects?: Effect[];
  /**
   * Holds its last key after it ends: `true` until the person's next cue
   * (a spoon held out until it is taken), `"line"` until the line is over
   * (arms folded while she says it).
   */
  hold?: boolean | "line";
  /** Which way the figure faces while it moves: toward what it reaches for. */
  face?: string;
}

const REACHED = 420;
/**
 * A pot is carried turned side-on to the stage, a handle in each hand: the
 * near hand on the handle toward us and the far one just behind it, on the
 * handle away from us.
 */
const FAR_HAND: Point = { x: -2.5, y: 1 };
/** Low in front of the body, arms bent a little, where both hands carry a pot. */
export const CARRY: Point = { x: 17, y: 84 };

function hands(hand: Hand, target: Target | undefined): Pick<MotionKey, Hand> {
  return hand === "lead" ? { lead: target } : { rear: target };
}

function other(hand: Hand): Hand {
  return hand === "lead" ? "rear" : "lead";
}

const still: Motion = { ms: 0, keys: [] };

/** The part of each kind that goes to the mouth, in its own drawing's space: a spoon's bowl, a cup's near rim. */
const TO_MOUTH: Partial<Record<ObjectKind, Point>> = {
  spoon: { x: 0, y: -13 },
  ladle: { x: 0, y: -19 },
  cup: { x: -3.5, y: -7 },
};

/**
 * Where the hand goes, from the lips, so that what it holds turned `turn`
 * degrees touches them; `ahead` and `below` hold it off that far.
 */
function toLips(
  kind: ObjectKind,
  turn: number,
  ahead = 0.8,
  below = 0,
): { dx: number; dy: number } {
  const tip = TO_MOUTH[kind] ?? { x: 0, y: 0 };
  const { grip } = OBJECT_SIZE[kind];
  const x = tip.x - grip.x;
  const y = tip.y + grip.y;
  const angle = (turn * Math.PI) / 180;
  return {
    dx: ahead - (x * Math.cos(angle) - y * Math.sin(angle)),
    dy: below - (x * Math.sin(angle) + y * Math.cos(angle)),
  };
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
  const to = cue.to ?? "";
  const object = world.objects[what];
  const heavy = object ? HEAVY.includes(object.kind) : false;
  const holding = handHolding(world, who, cue.what);
  const hand = holding ?? "lead";
  const free = freeHand(world, who) ?? other(hand);

  switch (cue.do) {
    case "take": {
      const where = object?.where;
      if (where && "hand" in where) {
        const giver = where.hand;
        return {
          motion: { ...handOverMotion(freeHand(world, who, what) ?? "lead", giver) },
          partner: { who: giver, motion: handOverMotion(where.side, who) },
        };
      }
      if (where && "pocket" in where) {
        return {
          motion: pocketMotion("out", what, freeHand(world, who, what) ?? "lead"),
        };
      }
      if (where && "wear" in where) return { motion: offHeadMotion() };
      const into = freeHand(world, who, what) ?? "lead";
      if (heavy) return { motion: liftMotion(what) };
      return {
        motion: {
          ms: 900,
          face: what,
          takes: REACHED + 80,
          sounds: [{ at: REACHED + 60, id: soundOf(object?.kind) }],
          ...(object?.kind === "lid" ? { sounds: lidSounds(world, what) } : {}),
          keys: [
            { at: 0 },
            { at: REACHED, ...hands(into, { to: what, dy: -3 }), body: { lean: 3 } },
            { at: REACHED + 100, ...hands(into, { to: what }), body: { lean: 3 } },
            { at: 900 },
          ],
        },
      };
    }
    case "give":
      return {
        motion: handOverMotion(hand, to as LessonCharacterId),
        partner: {
          who: to as LessonCharacterId,
          motion: handOverMotion(
            freeHand(world, to as LessonCharacterId, what) ?? "lead",
            who,
          ),
        },
      };
    case "put": {
      const where = { landing: true } as const;
      if (heavy) {
        return {
          motion: {
            ms: 1300,
            face: to,
            takes: 850,
            sounds: [{ at: 820, id: "thud" }],
            keys: [
              { at: 0, lead: { at: CARRY }, both: true },
              { at: 650, lead: { ...where, dy: -6 }, both: true, body: { lean: 6 } },
              { at: 850, lead: where, both: true, body: { lean: 7, bob: 1 } },
              { at: 1050, lead: where, both: true, body: { lean: 5 } },
              { at: 1300 },
            ],
          },
        };
      }
      return {
        motion: {
          ms: 900,
          face: to,
          takes: REACHED + 80,
          sounds: [
            { at: REACHED + 60, id: what === "lid" ? "lid" : soundOf(object?.kind) },
          ],
          keys: [
            { at: 0 },
            { at: REACHED, ...hands(hand, { ...where, dy: -4 }), body: { lean: 3 } },
            { at: REACHED + 100, ...hands(hand, where), body: { lean: 3 } },
            { at: 900 },
          ],
        },
      };
    }
    case "pocket":
      return { motion: pocketMotion("in", what, hand) };
    case "dip": {
      const tip = { [hand]: 160 };
      return {
        motion: {
          ms: 1500,
          face: to,
          takes: 1000,
          sounds: [{ at: 620, id: "clink" }],
          keys: [
            { at: 0 },
            {
              at: 420,
              ...hands(hand, { to, as: "top", dy: -12 }),
              turn: tip,
              body: { lean: 4 },
            },
            {
              at: 650,
              ...hands(hand, { to, as: "top", dy: -3 }),
              turn: tip,
              body: { lean: 5 },
            },
            {
              at: 820,
              ...hands(hand, { to, as: "top", dx: 2, dy: -2 }),
              turn: tip,
              body: { lean: 5 },
            },
            {
              at: 1000,
              ...hands(hand, { to, as: "top", dy: -4 }),
              turn: tip,
              body: { lean: 5 },
            },
            {
              at: 1250,
              ...hands(hand, { to, as: "top", dy: -14 }),
              turn: { [hand]: 0 },
              body: { lean: 2 },
            },
            { at: 1500, ...hands(hand, { at: { x: 14, y: 82 } }) },
          ],
        },
      };
    }
    case "offer": {
      const out = {
        ...hands(hand, { meet: to as LessonCharacterId }),
        turn: { [hand]: object?.kind === "spoon" ? 20 : 0 },
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
    case "raise": {
      // Halfway to the mouth, and held there: about to eat, until something stops it.
      const up = {
        ...hands(hand, { mouth: true, dx: 18, dy: 10.5 }),
        turn: { [hand]: -20 },
      };
      return {
        motion: {
          ms: 800,
          hold: true,
          keys: [{ at: 0 }, { at: 650, ...up }, { at: 800, ...up }],
        },
      };
    }
    case "taste": {
      // Into the mouth: the spoon's bowl between the lips, a cup's rim at them.
      const kind = object?.kind ?? "spoon";
      const tilt = kind === "cup" ? -40 : -55;
      const sip = {
        ...hands(hand, { mouth: true, ...toLips(kind, tilt) }),
        turn: { [hand]: tilt },
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
              ...hands(hand, { mouth: true, ...toLips(kind, tilt * 0.7, 5, 3) }),
              turn: { [hand]: tilt * 0.7 },
              body: { tilt: 3, lean: 1 },
            },
            { at: 560, ...sip, body: { tilt: -2, lean: 2, brow: 0.3, mouth: 0.35 } },
            { at: 820, ...sip, body: { tilt: -3, lean: 2, brow: 0.4, mouth: 0.25 } },
            {
              at: 1300,
              ...hands(hand, { mouth: true, dx: 18, dy: 12.5 }),
              turn: { [hand]: -20 },
            },
          ],
        },
      };
    }
    case "blow": {
      const near = {
        ...hands(hand, { mouth: true, dx: 20, dy: 3.5 }),
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
    case "wash": {
      // Tap on, both hands rubbing under it, tap off, a shake of the hands.
      const sink = to || "basin";
      const keys: MotionKey[] = [
        { at: 0 },
        { at: 380, lead: { to: sink, dx: 2, dy: -14 }, body: { lean: 6 } },
      ];
      for (let at = 700, rub = 0; at <= 2300; at += 200, rub += 1) {
        keys.push({
          at,
          lead: { to: sink, dx: rub % 2 ? 3 : -1, dy: -9 },
          rear: { to: sink, dx: rub % 2 ? -3 : 1, dy: -8 },
          body: { lean: 8, look: -0.2, tilt: 6 },
        });
      }
      keys.push(
        {
          at: 2550,
          lead: { to: sink, dx: 2, dy: -14 },
          rear: { to: sink, dy: -9 },
          body: { lean: 6 },
        },
        { at: 2800, lead: { at: { x: 12, y: 78 } }, rear: { at: { x: 8, y: 80 } } },
        { at: 2950, lead: { at: { x: 12, y: 84 } }, rear: { at: { x: 8, y: 85 } } },
        { at: 3100, lead: { at: { x: 12, y: 77 } }, rear: { at: { x: 8, y: 79 } } },
        { at: 3250, lead: { at: { x: 12, y: 84 } }, rear: { at: { x: 8, y: 85 } } },
        { at: 3500 },
      );
      return {
        motion: {
          ms: 3500,
          face: sink,
          keys,
          sounds: [{ at: 420, id: "tap" }],
          effects: [{ kind: "tap", from: 450, until: 2500, piece: sink }],
        },
      };
    }
    case "dry": {
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 350, rub = 0; at <= 1500; at += 190, rub += 1) {
        keys.push({
          at,
          lead: { to, as: "base", dx: 1, dy: rub % 2 ? 4 : 9 },
          rear: { to, as: "base", dx: -1, dy: rub % 2 ? 9 : 4 },
          body: { lean: 6 },
        });
      }
      keys.push({ at: 1800 });
      return { motion: { ms: 1800, face: to, keys } };
    }
    case "peel": {
      // The carrot steadied by its top, strokes of the knife along it, peel falling.
      const keys: MotionKey[] = [
        { at: 0 },
        {
          at: 380,
          rear: { to: what, dx: -6, dy: -1 },
          ...hands(hand, { to: what, dx: -2, dy: -2 }),
          body: { lean: 6 },
        },
      ];
      for (let at = 560, stroke = 0; at <= 2200; at += 330, stroke += 1) {
        keys.push(
          {
            at,
            rear: { to: what, dx: -6, dy: -1 },
            ...hands(hand, { to: what, dx: -2, dy: -2 }),
            turn: { [hand]: -15 },
            body: { lean: 7, tilt: 5 },
          },
          {
            at: at + 200,
            rear: { to: what, dx: -6, dy: -1 },
            ...hands(hand, { to: what, dx: 6, dy: -1 }),
            turn: { [hand]: -15 },
            body: { lean: 7, tilt: 5 },
          },
        );
      }
      keys.push({ at: 2600 });
      return {
        motion: {
          ms: 2600,
          face: what,
          takes: 2000,
          keys,
          sounds: [600, 930, 1260, 1590, 1920].map((at) => ({ at, id: "peel" as const })),
          effects: [{ kind: "peel", from: 600, until: 2300, hand }],
        },
      };
    }
    case "chop": {
      const small = to === "small";
      const step = small ? 150 : 420;
      const count = small ? 12 : 4;
      const keys: MotionKey[] = [
        { at: 0 },
        {
          at: 380,
          rear: { to: what, dx: -6, dy: -1 },
          ...hands(hand, { to: what, dx: -1, dy: -10 }),
          body: { lean: 6 },
        },
      ];
      const sounds: Motion["sounds"] = [];
      for (let index = 0; index < count; index += 1) {
        const at = 450 + index * step;
        const along = small ? -2 + (index % 6) * 1.6 : -3 + index * 2.6;
        keys.push(
          {
            at,
            rear: { to: what, dx: -7, dy: -1 },
            ...hands(hand, { to: what, dx: along, dy: -9 }),
            turn: { [hand]: 20 },
            body: { lean: 7, tilt: 6 },
          },
          {
            at: at + step * 0.45,
            rear: { to: what, dx: -7, dy: -1 },
            ...hands(hand, { to: what, dx: along, dy: -1 }),
            turn: { [hand]: 20 },
            body: { lean: 7, tilt: 6 },
          },
        );
        sounds.push({ at: at + step * 0.45, id: "chop" });
      }
      const ms = 450 + count * step + 400;
      keys.push({ at: ms });
      return {
        motion: { ms, face: what, takes: 450 + count * step * 0.6, keys, sounds },
      };
    }
    case "fill": {
      // The pot (or jug, or can) set in the sink under the running tap.
      const sink = to || "basin";
      const both = heavy;
      const hold = { lead: { to: sink, as: "grip" as const, dy: -12 }, both };
      return {
        motion: {
          ms: 3000,
          face: sink,
          takes: 2300,
          keys: [
            { at: 0, ...(both ? { lead: { at: CARRY }, both } : {}) },
            { at: 600, ...hold, body: { lean: 6 } },
            { at: 2400, ...hold, body: { lean: 6, bob: both ? 2 : 0 } },
            {
              at: 3000,
              ...(both ? { lead: { at: CARRY }, both, body: { lean: -4, bob: 2 } } : {}),
            },
          ],
          sounds: [{ at: 650, id: "fill" }],
          effects: [{ kind: "tap", from: 650, until: 2300, piece: sink }],
        },
      };
    }
    case "pour": {
      const kind = object?.kind;
      const board = kind === "board";
      // A board only tips enough for the pieces to slide off, its far end kept over the rim.
      const tilt = board ? 22 : kind === "can" ? 40 : 75;
      // The hand stays short of the target by what it pours from: a board's edge, a can's long spout.
      const short = board ? -12 : kind === "can" ? -16 : -8;
      const over = hands(hand, { to, as: "top", dx: short, dy: board ? -8 : -12 });
      const ms = board ? 1800 : 2600;
      return {
        motion: {
          ms,
          face: to,
          takes: ms - 700,
          keys: [
            { at: 0 },
            { at: 600, ...over, body: { lean: 5 } },
            { at: 900, ...over, turn: { [hand]: tilt }, body: { lean: 6 } },
            { at: ms - 600, ...over, turn: { [hand]: tilt }, body: { lean: 6 } },
            { at: ms - 300, ...over, body: { lean: 4 } },
            { at: ms },
          ],
          sounds: [{ at: 900, id: board ? "plop" : "pour" }],
          effects: board ? [] : [{ kind: "stream", from: 900, until: ms - 600, hand }],
        },
      };
    }
    case "shake": {
      const above = hands(hand, { to, as: "top", dx: -4, dy: -14 });
      const keys: MotionKey[] = [{ at: 0 }, { at: 500, ...above, turn: { [hand]: 180 } }];
      for (let at = 650, shake = 0; at <= 2700; at += 150, shake += 1) {
        keys.push({
          at,
          ...hands(hand, { to, as: "top", dx: -4, dy: shake % 2 ? -10 : -15 }),
          turn: { [hand]: 180 },
          body: { lean: 4, brow: 0.3 },
        });
      }
      keys.push({ at: 2900, ...above, turn: { [hand]: 180 } });
      return {
        motion: {
          ms: 2900,
          face: to,
          takes: 1200,
          hold: true,
          keys,
          sounds: [700, 1300, 1900, 2500].map((at) => ({ at, id: "salt" as const })),
          effects: [{ kind: "salt", from: 650, until: 2750, hand }],
        },
      };
    }
    case "ladle": {
      const pot = cue.from ?? "pot";
      const into = world.objects[to];
      const held = into && "hand" in into.where && into.where.hand === who;
      // A bowl in her own other hand is held out by the pot; one on a surface is ladled into where it stands.
      const bowl: Target = held ? { at: { x: 22, y: 82 } } : { to, as: "top", dy: -8 };
      const keys: MotionKey[] = [
        { at: 0 },
        {
          at: 400,
          ...hands(hand, { to: pot, as: "top", dy: -14 }),
          turn: { [hand]: 180 },
          body: { lean: 5 },
        },
        {
          at: 700,
          ...hands(hand, { to: pot, as: "top", dy: -2 }),
          turn: { [hand]: 180 },
          body: { lean: 6 },
        },
        {
          at: 1000,
          ...hands(hand, { to: pot, as: "top", dy: -14 }),
          turn: { [hand]: 0 },
          body: { lean: 5 },
        },
        { at: 1400, ...hands(hand, bowl), turn: { [hand]: 0 }, body: { lean: 4 } },
        { at: 1700, ...hands(hand, bowl), turn: { [hand]: 110 }, body: { lean: 4 } },
        { at: 2000, ...hands(hand, bowl), turn: { [hand]: 0 } },
        { at: 2200 },
      ];
      if (held) {
        const side = other(hand);
        for (const key of keys) {
          if (key.at > 0 && key.at < 2200)
            Object.assign(key, hands(side, { at: { x: 21, y: 88 } }));
        }
      }
      return {
        motion: {
          ms: 2200,
          face: pot,
          takes: 1750,
          keys,
          sounds: [
            { at: 700, id: "clink" },
            { at: 1700, id: "splash" },
          ],
          effects: [{ kind: "stream", from: 1650, until: 1950, hand }],
        },
      };
    }
    case "switch":
      return {
        motion: {
          ms: 1000,
          face: what,
          takes: 520,
          sounds: [{ at: 500, id: to === "off" ? "clink" : "gas" }],
          keys: [
            { at: 0 },
            {
              at: 400,
              ...hands(free, { to: what, dx: -8, dy: 6 }),
              body: { lean: 6, tilt: 6 },
            },
            {
              at: 600,
              ...hands(free, { to: what, dx: -8, dy: 6.5 }),
              body: { lean: 6, tilt: 6 },
            },
            { at: 1000 },
          ],
        },
      };
    case "call":
      // The ear pose is the figure's own (StickFigure's `call`); this lifts the phone to it.
      return { motion: { ms: 500, takes: 250, keys: [] } };
    case "hangup":
      return {
        motion: {
          ms: 900,
          takes: 300,
          keys: [
            { at: 0 },
            { at: 450, ...hands(hand, { at: { x: 12, y: 72 } }), turn: { [hand]: -10 } },
            { at: 900 },
          ],
        },
      };
    case "burn": {
      // The spoon goes out of the way, the free hand fans the mouth, and the
      // whole body hops: the soup was hotter than the warning made it sound.
      const held = heldBy(world, who);
      const spoonHand: Hand = held.lead ? "lead" : held.rear ? "rear" : "lead";
      const fan = other(spoonHand);
      const away = hands(spoonHand, { at: { x: 20, y: 96 } });
      const keys: MotionKey[] = [
        { at: 0 },
        {
          at: 110,
          ...away,
          ...hands(fan, { mouth: true, dx: 12, dy: -0.5 }),
          body: { lean: -6, tilt: -12, bob: -2.5, brow: 1, look: -0.4 },
          emote: "hot",
        },
      ];
      for (let at = 250, flap = 0; at <= 1500; at += 125, flap += 1) {
        keys.push({
          at,
          ...away,
          ...hands(fan, { mouth: true, dx: 12, dy: flap % 2 ? -4.5 : 1.5 }),
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
    case "wag": {
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 280, wag = 0; at <= 1100; at += 160, wag += 1) {
        keys.push({
          at,
          // Out in front of the face: any nearer, seen side-on, the finger is lost against the cheek.
          ...hands(free, { at: { x: 19 + (wag % 2 ? 2.5 : -2.5), y: 58 } }),
          body: { brow: 0.8, nod: 0.6, tilt: -3 },
        });
      }
      keys.push({ at: 1400 });
      return { motion: { ms: 1400, keys } };
    }
    case "beckon": {
      // A palm up, curling in twice: come in, come here.
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 250, curl = 0; at <= 1250; at += 250, curl += 1) {
        keys.push({
          at,
          ...hands(free, { at: curl % 2 ? { x: 12, y: 70 } : { x: 19, y: 76 } }),
          body: { lean: 2, tilt: 3, brow: 0.5, look: 0.8 },
        });
      }
      keys.push({ at: 1550 });
      return { motion: { ms: 1550, face: to || undefined, keys } };
    }
    case "wipe": {
      // Hands wiped down the front of an apron.
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 250, stroke = 0; at <= 1100; at += 210, stroke += 1) {
        const y = stroke % 2 ? 98 : 86;
        keys.push({
          at,
          lead: { at: { x: 7, y } },
          rear: { at: { x: 3, y: y + 1 } },
          body: { tilt: 8, look: -0.3 },
        });
      }
      keys.push({ at: 1350 });
      return { motion: { ms: 1350, keys } };
    }
    case "facepalm": {
      const brow = { at: { x: 10, y: 41 } };
      return {
        motion: {
          ms: 1700,
          keys: [
            { at: 0 },
            {
              at: 300,
              ...hands(free, brow),
              body: { tilt: 12, nod: 1.5, lean: 2, brow: -0.8 },
            },
            {
              at: 1350,
              ...hands(free, brow),
              body: { tilt: 14, nod: 1.8, lean: 2, brow: -0.8 },
            },
            { at: 1700 },
          ],
        },
      };
    }
    case "yawn": {
      // Head back, mouth wide behind a hand, a breath out after.
      const cover = { ...hands(free, { mouth: true, dx: 4, dy: 0.5 }) };
      return {
        motion: {
          ms: 2000,
          keys: [
            { at: 0 },
            { at: 350, ...cover, body: { tilt: -6, lean: -3, mouth: 0.9, brow: 0.6 } },
            { at: 1300, ...cover, body: { tilt: -8, lean: -4, mouth: 1, brow: 0.7 } },
            { at: 1650, body: { tilt: 2, nod: 0.5, mouth: 0 } },
            { at: 2000 },
          ],
        },
      };
    }
    case "fold": {
      const folded = {
        lead: { at: { x: -1, y: 77 } },
        rear: { at: { x: 7, y: 75 } },
        body: { lean: -2, brow: 0.4 },
      };
      return {
        motion: {
          ms: 600,
          hold: "line",
          keys: [{ at: 0 }, { at: 450, ...folded }, { at: 600, ...folded }],
        },
      };
    }
    case "lean": {
      const near = { body: { lean: 10, tilt: 6, brow: 0.6, look: 1 } };
      return {
        motion: {
          ms: 700,
          hold: "line",
          face: to || undefined,
          keys: [{ at: 0 }, { at: 500, ...near }, { at: 700, ...near }],
        },
      };
    }
    case "thumbs":
      return {
        motion: {
          ms: 1600,
          keys: [
            { at: 0 },
            {
              at: 380,
              ...hands(free, { at: { x: 16, y: 66 } }),
              body: { brow: 0.8, nod: 0.8 },
            },
            {
              at: 1250,
              ...hands(free, { at: { x: 16, y: 65 } }),
              body: { brow: 0.8, nod: 0.8 },
            },
            { at: 1600 },
          ],
        },
      };
    case "sniff":
      return {
        motion: {
          ms: 1500,
          sounds: [{ at: 200, id: "sniff" }],
          keys: [
            { at: 0 },
            {
              at: 300,
              body: { tilt: -10, lean: -2, brow: 0.9, look: 1 },
              emote: "sniff",
            },
            {
              at: 1100,
              body: { tilt: -9, lean: -1, brow: 0.9, look: 1 },
              emote: "sniff",
            },
            { at: 1500 },
          ],
        },
      };
    case "wave": {
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 300, swing = 0; at <= 1500; at += 220, swing += 1) {
        keys.push({
          at,
          ...hands(free, { at: { x: swing % 2 ? 16 : 9, y: 34 } }),
          body: { brow: 0.6, tilt: 3 },
        });
      }
      keys.push({ at: 1800 });
      return { motion: { ms: 1800, keys } };
    }
    case "point":
      // The arm comes up as the figure turns round to what it points at (TURN_MS), and stays long enough to follow.
      return {
        motion: {
          ms: 1900,
          face: to,
          keys: [
            { at: 0 },
            { at: 450, ...hands(free, { toward: to }), body: { look: 1, brow: 0.3 } },
            { at: 1500, ...hands(free, { toward: to }), body: { look: 1, brow: 0.3 } },
            { at: 1900 },
          ],
        },
      };
    case "shrug": {
      const up = {
        lead: { at: { x: 16, y: 86 } },
        rear: { at: { x: -10, y: 86 } },
        body: { tilt: 8, brow: 0.9, bob: -1.5 },
      };
      return {
        motion: {
          ms: 1200,
          keys: [{ at: 0 }, { at: 350, ...up }, { at: 800, ...up }, { at: 1200 }],
        },
      };
    }
    case "nod":
      return {
        motion: {
          ms: 1100,
          keys: [
            { at: 0 },
            { at: 250, body: { nod: 2.4, tilt: 4 } },
            { at: 500, body: { nod: 0 } },
            { at: 750, body: { nod: 2.2, tilt: 4 } },
            { at: 1100 },
          ],
        },
      };
    case "laugh": {
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 180, shake = 0; at <= 1100; at += 140, shake += 1) {
        keys.push({
          at,
          body: {
            lean: -3,
            tilt: shake % 2 ? -6 : -2,
            bob: shake % 2 ? -1 : 0.5,
            brow: 0.8,
          },
        });
      }
      keys.push({ at: 1400 });
      return { motion: { ms: 1400, keys } };
    }
    case "look":
      return {
        motion: {
          ms: 1400,
          face: to,
          hold: "line",
          keys: [
            { at: 0 },
            { at: 350, body: { look: 1, brow: 0.3 } },
            { at: 1400, body: { look: 1, brow: 0.3 } },
          ],
        },
      };
    case "knock":
      return { motion: { ms: 900, keys: [], sounds: [{ at: 0, id: "knock" }] } };
    case "skip":
      // The lights dip and the clock runs on: SKIP_MS in StickStage.
      return { motion: { ms: 2600, keys: [], takes: 1300 } };
    case "stand":
      return { motion: { ms: 650, keys: [], sounds: [{ at: 100, id: "chair" }] } };
    case "go":
    case "enter":
    case "sit":
    case "face":
    case "camera":
      return { motion: still };
  }
}

function soundOf(kind: string | undefined): FoleyId {
  switch (kind) {
    case "keys":
      return "keys";
    case "board":
    case "carrot":
    case "phone":
    case "mic":
    case "towel":
    case "plant":
    case "headphones":
      return "thud";
    default:
      return "clink";
  }
}

function lidSounds(world: World, lid: string): Motion["sounds"] {
  const where = world.objects[lid]?.where;
  const hot = where && "in" in where && (world.objects[where.in]?.heat ?? 0) > 0;
  return [
    { at: REACHED + 60, id: "lid" },
    ...(hot ? [{ at: REACHED + 200, id: "steam" as const }] : []),
  ];
}

/** Bending to a heavy pot by both handles and coming up with it, a step unsteady. */
function liftMotion(what: string): Motion {
  return {
    ms: 2200,
    face: what,
    takes: 900,
    sounds: [{ at: 1350, id: "thud" }],
    keys: [
      { at: 0 },
      { at: 600, lead: { to: what, as: "grip", dy: -2 }, both: true },
      { at: 900, lead: { to: what, as: "grip" }, both: true },
      {
        at: 1300,
        lead: { at: { x: 19, y: 92 } },
        both: true,
        turn: { lead: 6 },
        body: { lean: -6, bob: 4 },
      },
      {
        at: 1600,
        lead: { at: { x: 18, y: 88 } },
        both: true,
        turn: { lead: -3 },
        body: { lean: -10, bob: 2, brow: 1 },
      },
      {
        at: 1900,
        lead: { at: CARRY },
        both: true,
        body: { lean: -5, bob: 1, brow: 0.6 },
      },
      { at: 2200, lead: { at: CARRY }, both: true, body: { lean: -4 } },
    ],
  };
}

/** A hand into the trouser pocket and out with what is in it, or the other way. */
function pocketMotion(way: "in" | "out", what: string, hand: Hand = "lead"): Motion {
  const pocket = { at: { x: 3, y: 96 } };
  return {
    ms: 1000,
    takes: way === "out" ? 450 : 500,
    sounds: what.includes("key") ? [{ at: 480, id: "keys" }] : [],
    keys:
      way === "out"
        ? [
            { at: 0 },
            { at: 380, ...hands(hand, pocket), body: { tilt: 6, look: -0.2 } },
            { at: 700, ...hands(hand, { at: { x: 13, y: 76 } }), body: { tilt: 4 } },
            { at: 1000, ...hands(hand, { at: { x: 13, y: 76 } }) },
          ]
        : [
            { at: 0 },
            { at: 420, ...hands(hand, pocket), body: { tilt: 5 } },
            { at: 600, ...hands(hand, pocket) },
            { at: 1000 },
          ],
  };
}

/** Headphones off over the head, both hands. */
function offHeadMotion(): Motion {
  return {
    ms: 1100,
    takes: 500,
    keys: [
      { at: 0 },
      {
        at: 380,
        lead: { at: { x: 9, y: 40 } },
        rear: { at: { x: -9, y: 40 } },
        body: { tilt: 4 },
      },
      {
        at: 650,
        lead: { at: { x: 11, y: 32 } },
        rear: { at: { x: -6, y: 33 } },
        body: { tilt: 2 },
      },
      { at: 1100, lead: { at: { x: 14, y: 76 } } },
    ],
  };
}

/** One half of a hand-over: out to where the two hands meet, a beat there, and back. */
function handOverMotion(hand: Hand, to: LessonCharacterId): Motion {
  const meet = hands(hand, { meet: to });
  return {
    ms: 1000,
    takes: 520,
    face: to,
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
  /** A named point of the stage, as `Target` names them. */
  pointOf(name: string, as?: "grip" | "top" | "base"): Point | undefined;
  /** Halfway to `who`, at chest height. */
  meetWith(who: LessonCharacterId): Point | undefined;
  /** Where what is being put down will be held once it is there. */
  landing?(): Point | undefined;
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
  const rig = solveRig(pose, sit);
  const rest = rig[hand === "lead" ? "leadArm" : "rearArm"].end;
  if (!target) return rest;
  if ("at" in target) return target.at;
  if ("mouth" in target) {
    const mouth = mouthOf(pose, sit);
    return { x: mouth.x + (target.dx ?? 0), y: mouth.y + (target.dy ?? 0) };
  }
  if ("meet" in target) return around.meetWith(target.meet) ?? rest;
  if ("landing" in target) {
    const at = around.landing?.();
    return at ? { x: at.x + (target.dx ?? 0), y: at.y + (target.dy ?? 0) } : rest;
  }
  if ("toward" in target) {
    const shoulder = hand === "lead" ? rig.leadShoulder : rig.rearShoulder;
    const at = around.pointOf(target.toward);
    if (!at) return rest;
    const length = Math.hypot(at.x - shoulder.x, at.y - shoulder.y) || 1;
    return {
      x: shoulder.x + ((at.x - shoulder.x) / length) * 28,
      y: shoulder.y + ((at.y - shoulder.y) / length) * 28,
    };
  }
  const at = around.pointOf(target.to, target.as ?? "grip");
  return at ? { x: at.x + (target.dx ?? 0), y: at.y + (target.dy ?? 0) } : rest;
}

/** Lowest a hand reaches standing straight; below it the figure bends at the hip and knees. */
const STOOP_Y = 98;

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
  return frameBetween(from, to, t, base, around, sit);
}

/** The pose `t` of the way from key `from` to key `to`. */
export function frameBetween(
  from: Omit<MotionKey, "at">,
  to: Omit<MotionKey, "at">,
  t: number,
  base: StickPose,
  around: Surroundings,
  sit = 0,
): MotionFrame {
  const body = { ...base };
  for (const key of Object.keys(REST_POSE) as Array<keyof StickPose>) {
    const a = from.body?.[key] ?? 0;
    const b = to.body?.[key] ?? 0;
    body[key] = base[key] + lerp(a, b, t);
  }

  // Where each hand is headed, worked out on the body before any stoop.
  const points: Partial<Record<Hand, Point>> = {};
  for (const hand of ["lead", "rear"] as const) {
    const a = from[hand];
    const b = to[hand];
    if (!a && !b) continue;
    const start = targetPoint(a, hand, body, around, sit);
    const end = targetPoint(b, hand, body, around, sit);
    points[hand] = { x: lerp(start.x, end.x, t), y: lerp(start.y, end.y, t) };
  }
  // The rear hand on the pot's other handle.
  const both = (from.both && to.both) || (t < 0.5 ? from.both : to.both);
  if (both && points.lead) {
    points.rear = { x: points.lead.x + FAR_HAND.x, y: points.lead.y + FAR_HAND.y };
  }

  // A reach below the waist bends the figure down to it, more the lower it goes.
  const lowest = Math.max(0, ...Object.values(points).map((point) => point?.y ?? 0));
  if (lowest > STOOP_Y && sit === 0) {
    const depth = lowest - STOOP_Y;
    body.lean += depth * 1.6;
    body.bob += depth * 0.9;
  }

  let pose = body;
  for (const hand of ["lead", "rear"] as const) {
    const point = points[hand];
    if (point) pose = { ...pose, ...reachFor(pose, hand, point, sit) };
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

/** Carrying a heavy pot in both hands between cues: the arms stay on its handles. */
export const CARRYING: Omit<MotionKey, "at"> = {
  lead: { at: CARRY },
  both: true,
  body: { lean: -4 },
};
