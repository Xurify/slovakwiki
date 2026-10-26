import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import {
  HEAVY,
  freeHand,
  handHolding,
  heldBy,
  putDown,
  sinkAt,
  type Cue,
  type ObjectKind,
  type SetPlan,
  type World,
} from "./acts";
import { REST_POSE, easeInOut, type StickPose } from "./pose";
import { mouthOf, reachFor, type Hand } from "./reach";
import { HEAD_RADIUS, solveRig, type Point } from "./rig";
import { OBJECT_SIZE, SINK, tipFromHand } from "./set-pieces";

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
  /** A point from the hand's own shoulder: up beside the head, where a seated figure's reach is as a standing one's. */
  | { up: Point }
  /** Where the hand lets go of what it puts down: the object's grip once it is there. */
  | { landing: true; dx?: number; dy?: number }
  /** Toward a named point, the arm straight out: pointing at it. */
  | { toward: string };

export interface MotionKey {
  at: number;
  /** A hand's target; left out, the hand is wherever the talking puts it. */
  lead?: Target;
  rear?: Target;
  /**
   * The other hand on what the lead one holds too: `true` on the near handle
   * of a pot held by its far one, or a point, the other hand's offset from
   * the lead one (the far cup of a pair of headphones).
   */
  both?: boolean | Point;
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
  /** What it falls into: the stream stops at its rim. */
  to?: string;
}

/**
 * Where the tip of what a hand holds must be over part of a motion. `over`:
 * above the opening of `to`, so what pours falls in; `in`: down inside `to`,
 * under its rim, where the stage hides it behind the pot's side; `lips`: at
 * the mouth. The episode checks measure each one on the solved arm.
 */
export interface Contact {
  hand: Hand;
  /** What the held thing does at `to`: pours over its opening, dips in it, is at the lips, or stands down in it (a pot in the sink). */
  tip: "over" | "in" | "lips" | "down";
  to?: string;
  from: number;
  until: number;
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
  contacts?: Contact[];
}

const REACHED = 420;
/**
 * A pot is held by both handles, the lead hand on the far one and the other
 * hand a pot's width back on the near one, so both hands show on it. Side-on,
 * with the hands one behind the other, it read as a bag held by one fist.
 */
const FAR_HAND: Point = { x: -2 * OBJECT_SIZE.pot.grip.x, y: 0 };
/** Headphones in both hands, one on each cup: held by the near cup, the far one a band's width back. */
export const PAIR: Point = { x: -2 * OBJECT_SIZE.headphones.grip.x, y: 0 };
/** Against the belly, elbows bent, where both hands carry a pot: the arms cannot hold it further out. */
export const CARRY: Point = { x: 24, y: 79 };

function hands(hand: Hand, target: Target | undefined): Pick<MotionKey, Hand> {
  return hand === "lead" ? { lead: target } : { rear: target };
}

function other(hand: Hand): Hand {
  return hand === "lead" ? "rear" : "lead";
}

const still: Motion = { ms: 0, keys: [] };

/**
 * Where the hand goes, from a point, so that the tip of the `kind` it holds
 * (OBJECT_TIP), turned `turn` degrees, lands `dx`, `dy` from that point:
 * the spout over the pot, not the fist.
 */
function aim(kind: ObjectKind, turn: number, dx = 0, dy = 0): { dx: number; dy: number } {
  const tip = tipFromHand(kind, turn);
  return { dx: dx - tip.x, dy: dy - tip.y };
}

/**
 * The motion for `cue` by `who`, from the world it starts in. A hand-over
 * also moves the other person: `partner` is their half of it. `plan` says
 * where the set's sinks are.
 */
export function motionFor(
  cue: Cue,
  who: LessonCharacterId,
  world: World,
  plan?: SetPlan,
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
      if (heavy) return { motion: liftMotion(what, sinkAt(plan, where)) };
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
      const sink = heavy && plan ? sinkAt(plan, putDown(plan, world, cue)) : undefined;
      if (sink) return { motion: intoSinkMotion(sink) };
      if (object?.kind === "headphones") {
        // Down by both cups, the way they came off, and let go.
        return {
          motion: {
            ms: 1100,
            face: to,
            takes: 600,
            sounds: [{ at: 580, id: "thud" }],
            keys: [
              { at: 0, lead: { mouth: true, dx: 13, dy: 13 }, both: PAIR },
              { at: 420, lead: { ...where, dy: -4 }, both: PAIR, body: { lean: 4 } },
              { at: 600, lead: where, both: PAIR, body: { lean: 4 } },
              { at: 750, lead: where, both: PAIR, body: { lean: 3 } },
              { at: 1100 },
            ],
          },
        };
      }
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
      // Down into the soup and once round the pot, the bowl under the rim, and up full.
      const kind = object?.kind ?? "spoon";
      const turn = { [hand]: 160 };
      const into = (dx: number, dy: number) =>
        hands(hand, { to, as: "top", ...aim(kind, 160, dx, dy) });
      return {
        motion: {
          ms: 1500,
          face: to,
          takes: 1000,
          sounds: [{ at: 620, id: "clink" }],
          contacts: [{ hand, tip: "in", to, from: 600, until: 1050 }],
          keys: [
            { at: 0 },
            { at: 420, ...into(-1, -4), turn, body: { lean: 4 } },
            { at: 650, ...into(-3, 5), turn, body: { lean: 5 } },
            { at: 820, ...into(3, 6), turn, body: { lean: 5 } },
            { at: 1000, ...into(0, 4), turn, body: { lean: 5 } },
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
      // Halfway to the mouth, and held there: about to eat, until something stops it. A recorder is held up to be seen, above a desk mic.
      const up =
        object?.kind === "mic"
          ? { ...hands(hand, { up: { x: 14, y: -24 } }), body: { lean: -1, brow: 0.4 } }
          : { ...hands(hand, { mouth: true, dx: 18, dy: 10.5 }), turn: { [hand]: -20 } };
      return {
        motion: {
          ms: 800,
          hold: true,
          keys: [{ at: 0 }, { at: 650, ...up }, { at: 800, ...up }],
        },
      };
    }
    case "taste": {
      // Into the mouth: the spoon's bowl between the lips, a cup's rim at them. At a desk the microphone is in front of the mouth, so a seated drinker sits back from it and tips the head back.
      const kind = object?.kind ?? "spoon";
      const tilt = kind === "cup" ? -40 : -55;
      const back = world.seated?.includes(who)
        ? { lean: -10, tilt: -6 }
        : { lean: 0, tilt: 0 };
      const sip = {
        ...hands(hand, { mouth: true, ...aim(kind, tilt, 0.8) }),
        turn: { [hand]: tilt },
      };
      return {
        motion: {
          ms: 1300,
          takes: 700,
          sounds: [{ at: 620, id: "slurp" }],
          contacts: [{ hand, tip: "lips", from: 560, until: 820 }],
          keys: [
            { at: 0 },
            {
              at: 380,
              ...hands(hand, { mouth: true, ...aim(kind, tilt * 0.7, 5, 3) }),
              turn: { [hand]: tilt * 0.7 },
              body: { tilt: 3, lean: 1 },
            },
            {
              at: 560,
              ...sip,
              body: { tilt: -2 + back.tilt, lean: 2 + back.lean, brow: 0.3, mouth: 0.35 },
            },
            {
              at: 820,
              ...sip,
              body: { tilt: -3 + back.tilt, lean: 2 + back.lean, brow: 0.4, mouth: 0.25 },
            },
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
      // Both hands in the towel, rubbing up and down against each other, far enough to be seen.
      for (let at = 350, rub = 0; at <= 1500; at += 190, rub += 1) {
        keys.push({
          at,
          lead: { to, as: "base", dx: 2, dy: rub % 2 ? 0 : 7 },
          rear: { to, as: "base", dx: -2, dy: rub % 2 ? 7 : 0 },
          body: { lean: 6, bob: rub % 2 ? 0.5 : 0 },
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
      // The jug (or can) held under the running tap; a pot stands in the sink under it.
      const standing = sinkAt(plan, object?.where);
      if (standing || (heavy && !holding))
        return { motion: tapFillMotion(standing ?? (to || "basin")) };
      const sink = to || "basin";
      const hold = { lead: { to: sink, as: "grip" as const, dy: -12 } };
      return {
        motion: {
          ms: 3000,
          face: sink,
          takes: 2300,
          keys: [
            { at: 0 },
            { at: 600, ...hold, body: { lean: 6 } },
            { at: 2400, ...hold, body: { lean: 6 } },
            { at: 3000 },
          ],
          sounds: [{ at: 650, id: "fill" }],
          effects: [{ kind: "tap", from: 650, until: 2300, piece: sink }],
        },
      };
    }
    case "pour": {
      const kind = object?.kind ?? "jug";
      const board = kind === "board";
      // A board only tips enough for the pieces to slide off its far end; a can's long spout needs less than a jug's lip.
      const tilt = board ? 22 : kind === "can" ? 40 : 70;
      // The spout just over the near side of the opening, so the jug itself stays outside the pot, at the chest rather than the face.
      const spout = (turn: number, dy: number) => ({
        ...hands(hand, { to, as: "top", ...aim(kind, turn, -2, dy) }),
        turn: { [hand]: turn },
      });
      const high = board ? -2 : -4;
      // Over the rim, not over the pot: a board held out leans the cook less than a jug does.
      const lean = board ? 2 : 6;
      const ms = board ? 1800 : 2600;
      return {
        motion: {
          ms,
          face: to,
          takes: ms - 700,
          contacts: [{ hand, tip: "over", to, from: 900, until: ms - 600 }],
          keys: [
            { at: 0 },
            { at: 600, ...spout(tilt * 0.3, high - 4), body: { lean: lean - 1 } },
            { at: 900, ...spout(tilt, high), body: { lean } },
            // Tipped further as it empties, the spout kept where it was.
            {
              at: ms - 600,
              ...spout(tilt + (board ? 6 : 14), high),
              body: { lean: lean + 0.5 },
            },
            { at: ms - 300, ...spout(tilt * 0.3, high - 4), body: { lean: lean - 2 } },
            { at: ms },
          ],
          sounds: [{ at: 900, id: board ? "plop" : "pour" }],
          effects: board
            ? []
            : [{ kind: "stream", from: 900, until: ms - 600, hand, to }],
        },
      };
    }
    case "shake": {
      // Turned over, holes down above the pot, and shaken from the wrist: each flick down and a little further over drops a pinch.
      const kind = object?.kind ?? "salt";
      const over = (turn: number, dx: number, dy: number) => ({
        ...hands(hand, { to, as: "top", ...aim(kind, turn, dx, dy) }),
        turn: { [hand]: turn },
      });
      const keys: MotionKey[] = [
        { at: 0 },
        { at: 450, ...over(150, -3, -7), body: { lean: 4 } },
      ];
      const flicks: number[] = [];
      for (let at = 650, flick = 0; at + 230 <= 3000; at += 230, flick += 1) {
        // Wandering a little over the pot, as a hand does salting.
        const dx = [-3, -1, -4, -2][flick % 4];
        keys.push({ at, ...over(148, dx, -6.5), body: { lean: 4, brow: 0.3 } });
        keys.push({
          at: at + 110,
          ...over(170, dx + 1, -3.5),
          body: { lean: 4.6, bob: 0.5, brow: 0.4 },
        });
        flicks.push(at + 110);
      }
      // Done, the shaker back upright in front of him, held out until it is taken from him.
      keys.push({ at: 3150, ...over(150, -3, -8) });
      keys.push({
        at: 3500,
        ...hands(hand, { at: { x: 15, y: 78 } }),
        turn: { [hand]: 0 },
      });
      return {
        motion: {
          ms: 3500,
          face: to,
          takes: 1200,
          hold: true,
          keys,
          contacts: [
            { hand, tip: "over", to, from: 650, until: flicks[flicks.length - 1] },
          ],
          sounds: flicks.map((at) => ({ at, id: "salt" as const })),
          effects: flicks.map((at) => ({
            kind: "salt" as const,
            from: at - 30,
            until: at + 230,
            hand,
            to,
          })),
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
      const away = hands(spoonHand, { up: { x: 13, y: 24 } });
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
      // Out in front, toward who it is for: any nearer, seen side-on, the hand reads as on the chin. Seated, the desk's microphone is out there, so nearer.
      const out = world.seated?.includes(who) ? 15 : 21;
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 280, wag = 0; at <= 1100; at += 160, wag += 1) {
        keys.push({
          at,
          ...hands(free, { up: { x: out + (wag % 2 ? 2.5 : -2.5), y: -11 } }),
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
        const y = stroke % 2 ? 92 : 82;
        keys.push({
          at,
          lead: { at: { x: 8, y } },
          rear: { at: { x: 2, y: y + 1 } },
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
      // Head back, mouth wide behind a hand, a breath out after. At a desk the microphone is in front of the mouth, so further back, clear of it.
      const cover = { ...hands(free, { mouth: true, dx: 4, dy: 0.5 }) };
      const back = world.seated?.includes(who) ? 7 : 0;
      return {
        motion: {
          ms: 2000,
          keys: [
            { at: 0 },
            {
              at: 350,
              ...cover,
              body: { tilt: -6, lean: -3 - back, mouth: 0.9, brow: 0.6 },
            },
            {
              at: 1300,
              ...cover,
              body: { tilt: -8, lean: -4 - back, mouth: 1, brow: 0.7 },
            },
            { at: 1650, body: { tilt: 2, nod: 0.5, mouth: 0 } },
            { at: 2000 },
          ],
        },
      };
    }
    case "fold": {
      // From the shoulders, so a seated figure folds them over the chest too, not up under the chin.
      const folded = {
        lead: { up: { x: -5, y: 11 } },
        rear: { up: { x: 11, y: 9 } },
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
      // The hand up beside the head, swinging from the elbow, clear of the hair and a headset's cup. Seated, a microphone is in front of the face, so the outer hand waves.
      const side: Hand =
        world.seated?.includes(who) && !heldBy(world, who).rear ? "rear" : free;
      const out = side === "lead" ? 1 : -1;
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 300, swing = 0; at <= 1500; at += 220, swing += 1) {
        keys.push({
          at,
          ...hands(side, {
            up: { x: out * (swing % 2 ? 24 : 18), y: swing % 2 ? -15 : -22 },
          }),
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

/**
 * Over the worktop is how a pot goes in and out of the sink: held low in
 * front of the counter it would seem to pass through it. `dy` from its grip
 * standing in the sink to its base just clear of the worktop.
 */
const OVER_SINK = -SINK.depth - 3;

/** A heavy pot lifted over the sink's edge and stood down in it, under the tap. */
function intoSinkMotion(sink: string): Motion {
  return {
    ms: 1400,
    face: sink,
    takes: 850,
    sounds: [{ at: 820, id: "thud" }],
    keys: [
      { at: 0, lead: { at: CARRY }, both: true },
      { at: 450, lead: { landing: true, dy: OVER_SINK }, both: true, body: { lean: 5 } },
      { at: 850, lead: { landing: true }, both: true, body: { lean: 7, bob: 1 } },
      { at: 1050, lead: { landing: true }, both: true, body: { lean: 5 } },
      { at: 1400 },
    ],
    contacts: [{ hand: "lead", tip: "down", to: sink, from: 850, until: 850 }],
  };
}

/**
 * Filling what stands in the sink: the tap's lever turned on (StickSet
 * draws it 7 right of the sink and 7 up), the hands away from the stream
 * while it runs, so it is seen going in, and the lever off.
 */
function tapFillMotion(sink: string): Motion {
  const lever = { lead: { to: sink, dx: 7, dy: -7 } };
  return {
    ms: 3400,
    face: sink,
    takes: 2700,
    keys: [
      { at: 0 },
      { at: 400, ...lever, body: { lean: 5 } },
      { at: 560, ...lever, body: { lean: 5, look: 0.2 } },
      { at: 950, body: { lean: 2, tilt: 4 } },
      { at: 1800, body: { lean: 1, tilt: 6, look: 0.2 } },
      { at: 2400, body: { lean: 2, tilt: 4 } },
      { at: 2700, ...lever, body: { lean: 5 } },
      { at: 2850, ...lever, body: { lean: 5 } },
      { at: 3400 },
    ],
    sounds: [{ at: 560, id: "fill" }],
    effects: [{ kind: "tap", from: 560, until: 2700, piece: sink }],
  };
}

/**
 * Bending to a heavy pot by both handles and coming up with it, a step
 * unsteady; out of a sink, up over its edge first.
 */
function liftMotion(what: string, sink?: string): Motion {
  if (sink) {
    return {
      ms: 1900,
      face: what,
      takes: 750,
      keys: [
        { at: 0 },
        {
          at: 450,
          lead: { to: what, as: "grip", dy: -2 },
          both: true,
          body: { lean: 5 },
        },
        { at: 750, lead: { to: what, as: "grip" }, both: true, body: { lean: 6 } },
        {
          at: 1200,
          lead: { to: what, as: "grip", dy: OVER_SINK },
          both: true,
          body: { lean: 2, bob: 1, brow: 1 },
        },
        {
          at: 1650,
          lead: { at: CARRY },
          both: true,
          body: { lean: -6, bob: 2, brow: 0.6 },
        },
        { at: 1900, lead: { at: CARRY }, both: true, body: { lean: -4 } },
      ],
      contacts: [{ hand: "lead", tip: "down", to: sink, from: 750, until: 750 }],
    };
  }
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
        lead: { at: { x: 24, y: 92 } },
        both: true,
        body: { lean: -6, bob: 4 },
      },
      {
        at: 1600,
        lead: { at: { x: 24, y: 85 } },
        both: true,
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

/**
 * Headphones off, both hands: the rear one on the near cup at the back of
 * the head, as it goes to a phone at the ear, and the lead one on the far
 * cup behind the head. Taken as the hands close on the cups, so the pair
 * they hold sits where the worn one did; lifted, brought round in front of
 * the face and down, held by both cups. Set from the lips, so it fits a
 * head on a chair as one standing.
 */
function offHeadMotion(): Motion {
  const cups = (lift: number): Pick<MotionKey, Hand> => ({
    lead: { mouth: true, dx: 8.3, dy: -9.4 - lift },
    rear: { mouth: true, dx: -14, dy: -6.2 - lift },
  });
  const held = { lead: { mouth: true, dx: 13, dy: 13 }, both: PAIR } as const;
  return {
    ms: 1700,
    takes: 450,
    hold: true,
    keys: [
      { at: 0 },
      { at: 380, ...cups(0), body: { tilt: 3 } },
      { at: 520, ...cups(0), body: { tilt: 3 } },
      { at: 760, ...cups(6), body: { tilt: -3, lean: -2 } },
      {
        at: 1050,
        lead: { mouth: true, dx: 13, dy: 1 },
        rear: { mouth: true, dx: 1, dy: 1 },
        body: { tilt: 2 },
      },
      { at: 1400, ...held, body: { lean: 1 } },
      { at: 1700, ...held },
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
  /** Where each hand on a target was sent: the arm falls short of it when it is out of reach. */
  aimed?: Partial<Record<Hand, Point>>;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function targetPoint(
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
  if ("up" in target) {
    const shoulder = hand === "lead" ? rig.leadShoulder : rig.rearShoulder;
    return { x: shoulder.x + target.up.x, y: shoulder.y + target.up.y };
  }
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
    const aim = around.pointOf(target.toward, "top") ?? around.pointOf(target.toward);
    if (!aim) return rest;
    // Pointing across a room the arm stays about level: aimed down at a thing's foot it went into the desk or table between.
    const across = Math.abs(aim.x - shoulder.x);
    const at = { x: aim.x, y: Math.min(aim.y, shoulder.y + across * POINT_DROP) };
    const length = Math.hypot(at.x - shoulder.x, at.y - shoulder.y) || 1;
    return {
      x: shoulder.x + ((at.x - shoulder.x) / length) * 28,
      y: shoulder.y + ((at.y - shoulder.y) / length) * 28,
    };
  }
  const at = around.pointOf(target.to, target.as ?? "grip");
  return at ? { x: at.x + (target.dx ?? 0), y: at.y + (target.dy ?? 0) } : rest;
}

/** The steepest a point goes below level, as a slope: about 6 degrees. */
const POINT_DROP = 0.1;

/** The arm's length, upper arm and forearm, a little short of straight. */
const ARM_REACH = 28.5;
/** The most a figure leans in, in degrees, to reach what is in front of it. */
const MOST_LEAN = 14;

/** How much further to lean so each hand reaches its point in front: none if they already do, or if leaning would not help. */
function leanToReach(
  body: StickPose,
  points: Partial<Record<Hand, Point>>,
  sit: number,
): number {
  // Low down, the knees bend with the lean, as they do lifting something off a low shelf.
  const low = Object.values(points).some((point) => point && point.y > STOOP_Y);
  const shortfall = (lean: number) => {
    const bob = low && sit === 0 ? lean * 0.5 : 0;
    const rig = solveRig({ ...body, lean: body.lean + lean, bob: body.bob + bob }, sit);
    let worst = 0;
    for (const hand of ["lead", "rear"] as const) {
      const point = points[hand];
      if (!point) continue;
      const shoulder = hand === "lead" ? rig.leadShoulder : rig.rearShoulder;
      worst = Math.max(
        worst,
        Math.hypot(point.x - shoulder.x, point.y - shoulder.y) - ARM_REACH,
      );
    }
    return worst;
  };
  if (shortfall(0) <= 0) return 0;
  let best = 0;
  for (let lean = 1; lean <= MOST_LEAN; lean += 1) {
    if (shortfall(lean) < shortfall(best)) best = lean;
    if (shortfall(lean) <= 0) return lean;
  }
  return best;
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

  // Where each hand is headed, worked out on the body before any stoop. A
  // key with `both` puts the rear hand on the far side of what the lead one
  // holds, so going from one hand to two it travels there, not jumps.
  const points: Partial<Record<Hand, Point>> = {};
  const ends = (key: Omit<MotionKey, "at">): Partial<Record<Hand, Point>> => {
    const lead = targetPoint(key.lead, "lead", body, around, sit);
    const far = key.both === true ? FAR_HAND : key.both;
    return {
      lead,
      rear: far
        ? { x: lead.x + far.x, y: lead.y + far.y }
        : targetPoint(key.rear, "rear", body, around, sit),
    };
  };
  const start = ends(from);
  const end = ends(to);
  for (const hand of ["lead", "rear"] as const) {
    const moved = from[hand] || to[hand] || (hand === "rear" && (from.both || to.both));
    if (!moved) continue;
    const a = start[hand]!;
    const b = end[hand]!;
    points[hand] = { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
  }

  // A reach below the waist bends the figure down to it, more the lower it goes.
  const lowest = Math.max(0, ...Object.values(points).map((point) => point?.y ?? 0));
  if (lowest > STOOP_Y && sit === 0) {
    const depth = lowest - STOOP_Y;
    body.lean += depth * 1.6;
    body.bob += depth * 0.9;
  }

  // Still out of reach, the figure leans in to it, as far as it must.
  const leaned = leanToReach(body, points, sit);
  const low = Object.values(points).some((point) => point && point.y > STOOP_Y);
  body.lean += leaned;
  if (low && sit === 0) body.bob += leaned * 0.5;

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

  return { pose, turn, emote: t < 0.5 ? from.emote : to.emote, aimed: points };
}

/**
 * The door pushed to behind someone just come in: a hand out to its edge
 * as it starts to swing (`takes`), riding the edge in as it shuts, and back.
 */
export const CLOSE_DOOR: Motion = {
  ms: 1100,
  // The swing eases in, so starting it as the hand is still on its way puts the first visible movement under the hand.
  takes: 200,
  keys: [
    { at: 0 },
    { at: 300, lead: { at: { x: 28, y: 75 } }, body: { lean: 8 } },
    { at: 550, lead: { at: { x: 23, y: 76 } }, body: { lean: 6 } },
    { at: 800, lead: { at: { x: 18, y: 77 } }, body: { lean: 4 } },
    { at: 1100 },
  ],
};

/** Carrying a heavy pot in both hands between cues: the arms stay on its handles. */
export const CARRYING: Omit<MotionKey, "at"> = {
  lead: { at: CARRY },
  both: true,
  body: { lean: -4 },
};

/** What can be poured into or dipped in, in the mover's rig space: the middle of its rim, and its opening (OPENING). */
export interface Opening {
  top: Point;
  half: number;
  depth: number;
}

/** Closer than this, in rig units, a hand is on its mark. */
const ON_MARK = 1.5;
/** A tip this near the lips is in the mouth. */
const AT_LIPS = 2.5;
/** The highest a stream or salt is poured from, above the rim: any higher, with the stove at the hip, the jug is at the face. */
const POUR_HEIGHT = 10;
/** A pot fills the sink, so it stands within this of the sink's middle or its side shows through the worktop. */
const IN_SINK = 1.5;
/** Closer than this to the head's middle, what a hand works with is in front of the face. */
const FACE_CLEAR = HEAD_RADIUS + 4;
/** Over a repeated action, the tool moves at least this much (units, or degrees turned) in any stretch of FROZEN_MS. */
const STIR = 0.6;
const FROZEN_MS = 600;
const SAMPLE_MS = 50;

/**
 * What a motion gets wrong about where hands and what they hold go,
 * measured on the solved arm as the stage draws it: a hand short of its
 * mark (out of reach), a tip that misses its contact (a stream beside the
 * pot, a spoon not in it, a spoon not at the lips), a tool that freezes
 * while the action it repeats goes on.
 */
export function motionMisses(
  motion: Motion,
  around: Surroundings,
  holding: Partial<Record<Hand, ObjectKind>>,
  openingOf: (name: string) => Opening | undefined,
  sit = 0,
): string[] {
  const misses: string[] = [];
  const frameAt = (ms: number) => sampleMotion(motion, ms, REST_POSE, around, sit);
  const handAt = (frame: MotionFrame, hand: Hand) =>
    solveRig(frame.pose, sit)[hand === "lead" ? "leadArm" : "rearArm"].end;

  for (const key of motion.keys) {
    const frame = frameBetween(key, key, 1, REST_POSE, around, sit);
    for (const hand of ["lead", "rear"] as const) {
      const target = key[hand];
      const aimed = frame.aimed?.[hand];
      if (!aimed || (target && "toward" in target)) continue;
      const at = handAt(frame, hand);
      const short = Math.hypot(at.x - aimed.x, at.y - aimed.y);
      if (short > ON_MARK) {
        misses.push(
          `the ${hand} hand falls ${short.toFixed(1)} short of its mark at ${key.at} ms: out of reach from where they stand`,
        );
      }
    }
  }

  for (const contact of motion.contacts ?? []) {
    const kind = holding[contact.hand];
    if (!kind) continue;
    const opening = contact.to ? openingOf(contact.to) : undefined;
    if (contact.tip !== "lips" && !opening) continue;
    const tips: Array<{ at: number; tip: Point; turn: number }> = [];
    for (let at = contact.from; at <= contact.until; at += SAMPLE_MS) {
      const frame = frameAt(at);
      const hand = handAt(frame, contact.hand);
      const turn = frame.turn[contact.hand] ?? 0;
      const offset = tipFromHand(kind, turn);
      tips.push({ at, turn, tip: { x: hand.x + offset.x, y: hand.y + offset.y } });
    }
    const miss = tips.find(({ tip, at }) => {
      if (contact.tip === "lips") {
        const lips = mouthOf(frameAt(at).pose, sit);
        return Math.hypot(tip.x - lips.x, tip.y - lips.y) > AT_LIPS;
      }
      const { top, half, depth } = opening!;
      const across = Math.abs(tip.x - top.x);
      if (contact.tip === "down") {
        // Down in it, `tip` is its base: under the tap, the rim over the worktop and enough water showing above it.
        const rim = tip.y - OBJECT_SIZE[kind].top;
        return across > IN_SINK || rim > top.y - 2 || rim < top.y - SINK.spout + 4;
      }
      return contact.tip === "over"
        ? across > half - 1 || tip.y >= top.y || top.y - tip.y > POUR_HEIGHT
        : across > half - 1.5 || tip.y <= top.y + 1 || tip.y >= top.y + depth;
    });
    const faced = tips.find(({ at }) => {
      const frame = frameAt(at);
      const { head } = solveRig(frame.pose, sit);
      const hand = handAt(frame, contact.hand);
      return Math.hypot(hand.x - head.x, hand.y - head.y) < FACE_CLEAR;
    });
    if (contact.tip !== "lips" && faced) {
      misses.push(`the ${kind} is held up in front of the face at ${faced.at} ms`);
    }
    if (miss) {
      const where =
        contact.tip === "lips"
          ? "at the lips"
          : contact.tip === "over"
            ? `over ${contact.to}'s opening`
            : contact.tip === "down"
              ? `standing in ${contact.to} under the tap`
              : `down inside ${contact.to}`;
      const off =
        contact.tip === "lips" || !opening
          ? ""
          : ` (${(miss.tip.x - opening.top.x).toFixed(1)} across, ${(miss.tip.y - opening.top.y).toFixed(1)} below the rim)`;
      misses.push(`the ${kind}'s tip is not ${where} at ${miss.at} ms${off}`);
    }
    if (contact.tip === "lips" || contact.tip === "down") continue;
    const window = FROZEN_MS / SAMPLE_MS;
    for (let start = 0; start + window < tips.length; start += 1) {
      const span = tips.slice(start, start + window + 1);
      const moved = Math.max(
        ...span.map(({ tip }) =>
          Math.hypot(tip.x - span[0].tip.x, tip.y - span[0].tip.y),
        ),
        ...span.map(({ turn }) => Math.abs(turn - span[0].turn) / 5),
      );
      if (moved < STIR) {
        misses.push(
          `the ${kind} hangs still for ${FROZEN_MS} ms from ${span[0].at} ms while it ${contact.tip === "in" ? "stirs" : "pours"}: a held tool keeps moving`,
        );
        break;
      }
    }
  }
  return misses;
}
