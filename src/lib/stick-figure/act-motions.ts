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
import { DOOR_OPEN_MS, DOOR_SHUT_MS } from "./door";
import { REST_POSE, easeInOut, type StickPose } from "./pose";
import { mouthOf, reachFor, type Hand } from "./reach";
import { HEAD_RADIUS, solveRig, type Point } from "./rig";
import { OBJECT_SIZE, SINK, intoDeskMic, tipFromHand } from "./set-pieces";
import { SCOOT_MS, sitMs } from "./walk";

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
  /** What an empty hand shows, turned by `turn`, only where the gesture is the finger itself (a thumbs up, counting): anywhere else a finger sticking out of the circle looks wrong. */
  sign?: Partial<Record<Hand, Sign>>;
}

export type Emote = "hot" | "blow" | "sniff";
/** An empty hand's shape: the index finger out, the thumb up, or the fingers spread, palm up. */
export type Sign = "finger" | "thumb" | "open";

export type FoleyId =
  | "clink"
  | "lid"
  | "slurp"
  | "blow"
  | "steam"
  | "hop"
  | "knock"
  | "door-open"
  | "door-shut"
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
  | "rattle"
  | "ring";

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
/**
 * A board held level in front of the waist: the near end in one hand, the
 * other under its middle. A hand's width apart, both fists sat at the near end
 * and it read as held like a paddle.
 */
const BOARD_PAIR: Point = { x: 11, y: 0.5 };
export const BOARD_CARRYING: Omit<MotionKey, "at"> = {
  lead: { at: { x: 9, y: 82 } },
  both: BOARD_PAIR,
};

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
          motion: {
            ...handOverMotion(freeHand(world, who, what) ?? "lead", giver, object?.kind),
          },
          partner: { who: giver, motion: handOverMotion(where.side, who, object?.kind) },
        };
      }
      if (where && "pocket" in where) {
        const hand = freeHand(world, who, what) ?? "lead";
        return {
          motion:
            object?.kind === "phone"
              ? phoneOutMotion(hand)
              : pocketMotion("out", what, hand),
        };
      }
      if (where && "wear" in where) return { motion: offHeadMotion() };
      const into = freeHand(world, who, what) ?? "lead";
      if (heavy) return { motion: liftMotion(what, sinkAt(plan, where)) };
      if (object?.kind === "board") {
        // Both hands on it, then up level to the waist.
        return {
          motion: {
            ms: 1000,
            face: what,
            takes: REACHED + 100,
            hold: true,
            sounds: [{ at: REACHED + 60, id: soundOf(object.kind) }],
            keys: [
              { at: 0 },
              {
                at: REACHED,
                lead: { to: what, dy: -3 },
                both: BOARD_PAIR,
                body: { lean: 4 },
              },
              {
                at: REACHED + 120,
                lead: { to: what },
                both: BOARD_PAIR,
                body: { lean: 4 },
              },
              { at: 1000, ...BOARD_CARRYING },
            ],
          },
        };
      }
      // A spoon picked up at the table is held there, the fist on the edge: in the lap it was out of sight behind the table.
      const atTable = object?.kind === "cutlery" && world.seated?.includes(who);
      return {
        motion: {
          ms: 900,
          face: what,
          takes: REACHED + 80,
          ...(atTable ? { hold: true } : {}),
          sounds: [{ at: REACHED + 60, id: soundOf(object?.kind) }],
          ...(object?.kind === "lid" ? { sounds: lidSounds(world, what) } : {}),
          keys: [
            { at: 0 },
            { at: REACHED, ...hands(into, { to: what, dy: -3 }), body: { lean: 3 } },
            { at: REACHED + 100, ...hands(into, { to: what }), body: { lean: 3 } },
            atTable
              ? { at: 900, ...hands(into, ON_TABLE_EDGE), turn: { [into]: -90 } }
              : { at: 900 },
          ],
        },
      };
    }
    case "give":
      return {
        motion: handOverMotion(hand, to as LessonCharacterId, object?.kind),
        partner: {
          who: to as LessonCharacterId,
          motion: handOverMotion(
            freeHand(world, to as LessonCharacterId, what) ?? "lead",
            who,
            object?.kind,
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
              { at: 0, ...HEADPHONES_HELD },
              { at: 420, lead: { ...where, dy: -4 }, both: PAIR, body: { lean: 4 } },
              { at: 600, lead: where, both: PAIR, body: { lean: 4 } },
              { at: 750, lead: where, both: PAIR, body: { lean: 3 } },
              { at: 1100 },
            ],
          },
        };
      }
      if (object?.kind === "board") {
        return {
          motion: {
            ms: 1000,
            face: to,
            takes: 560,
            sounds: [{ at: 540, id: soundOf(object.kind) }],
            keys: [
              { at: 0, ...BOARD_CARRYING },
              {
                at: 420,
                lead: { ...where, dy: -3 },
                both: BOARD_PAIR,
                body: { lean: 4 },
              },
              { at: 560, lead: where, both: BOARD_PAIR, body: { lean: 4 } },
              { at: 700, lead: where, both: BOARD_PAIR, body: { lean: 3 } },
              { at: 1000 },
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
          ms: 1800,
          face: to,
          takes: 1000,
          sounds: [{ at: 620, id: "clink" }],
          contacts: [{ hand, tip: "in", to, from: 600, until: 1050 }],
          keys: [
            { at: 0 },
            // Over the pot upright first and tipped bowl down there: tipped on the way, the bowl swung out past the hip.
            {
              at: 300,
              ...hands(hand, { to, as: "top", dy: -15 }),
              turn: { [hand]: 20 },
              body: { lean: 3 },
            },
            { at: 520, ...into(-1, -4), turn, body: { lean: 4 } },
            { at: 650, ...into(-3, 5), turn, body: { lean: 5 } },
            { at: 820, ...into(3, 6), turn, body: { lean: 5 } },
            { at: 1000, ...into(0, 4), turn, body: { lean: 5 } },
            // Straight up out of the soup bowl down, and only turned up once clear of the rim: turned on the way out, the bowl swung out over the pot's side.
            { at: 1250, ...into(0, -3), turn, body: { lean: 3 } },
            {
              at: 1500,
              ...hands(hand, { to, as: "top", dy: -12 }),
              turn: { [hand]: 0 },
              body: { lean: 2 },
            },
            { at: 1800, ...hands(hand, { at: { x: 14, y: 82 } }) },
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
    case "throw": {
      // Back over the shoulder, then up and away: the ball leaves the hand at the top of the swing.
      const back = {
        ...hands(hand, { up: { x: -8, y: -22 } }),
        body: { lean: -3, tilt: -2 },
      };
      const away = {
        ...hands(hand, { up: { x: 24, y: -16 } }),
        body: { lean: 4, tilt: 2 },
      };
      return {
        motion: {
          ms: 700,
          takes: 520,
          keys: [{ at: 0 }, { at: 320, ...back }, { at: 520, ...away }, { at: 700 }],
        },
      };
    }
    case "raise": {
      // Halfway to the mouth, and held there: about to eat, until something stops it. A recorder is held up to be seen, straight up beside the head, where the arm clears a desk mic too.
      const up =
        object?.kind === "mic"
          ? { ...hands(hand, { up: { x: 7, y: -26 } }), body: { lean: -1, brow: 0.4 } }
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
      // The bowl a little in front of the lips, and the lips pursed at it: held out at arm's length, it read as looking at the spoon.
      const near = {
        ...hands(hand, { mouth: true, ...aim(object?.kind ?? "spoon", -45, 6, 1.5) }),
        turn: { [hand]: -45 },
      };
      const pursed = { tilt: 4, nod: 0.6, round: 1, mouth: 0.3, mouthWidth: -0.4 };
      return {
        motion: {
          ms: 1500,
          takes: 1100,
          sounds: [{ at: 450, id: "blow" }],
          keys: [
            { at: 0 },
            { at: 380, ...near, body: { tilt: 4, nod: 0.6 } },
            { at: 450, ...near, body: pursed, emote: "blow" },
            { at: 1100, ...near, body: pursed, emote: "blow" },
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
          // Off as the hand gets back to the tap, not before: water stopping under rubbing hands read as washing in nothing.
          effects: [{ kind: "tap", from: 450, until: 2560, piece: sink }],
        },
      };
    }
    case "dry": {
      const keys: MotionKey[] = [{ at: 0 }];
      // Both hands in the towel, rubbing up and down against each other, far enough to be seen.
      // In its upper half, where a hanging towel is taken: down at its hem, a standing person crouched to it.
      for (let at = 350, rub = 0; at <= 1500; at += 190, rub += 1) {
        keys.push({
          at,
          lead: { to, as: "top", dx: 2, dy: rub % 2 ? 3 : 8 },
          rear: { to, as: "top", dx: -2, dy: rub % 2 ? 8 : 3 },
          body: { lean: 5, bob: rub % 2 ? 0.5 : 0 },
        });
      }
      keys.push({
        at: 1700,
        ...hands("lead", { up: { x: 10, y: 22 } }),
        body: { lean: 2 },
      });
      keys.push({ at: 2000 });
      return { motion: { ms: 2000, face: to, keys } };
    }
    case "peel": {
      // The carrot steadied by its top, strokes of the knife along it, peel falling.
      // The blade lies on the carrot, its tip drawn from the steadying hand to the far end: aimed by the hand, it rode a hand's width above.
      const blade = (dx: number, turn: number) => ({
        ...hands(hand, { to: what, as: "top" as const, ...aim("knife", turn, dx, -0.6) }),
        turn: { [hand]: turn },
      });
      const keys: MotionKey[] = [
        { at: 0 },
        {
          at: 380,
          rear: { to: what, dx: -6, dy: -1 },
          ...blade(-1, -8),
          body: { lean: 6 },
        },
      ];
      for (let at = 560, stroke = 0; at <= 2200; at += 330, stroke += 1) {
        keys.push(
          {
            at,
            rear: { to: what, dx: -6, dy: -1 },
            ...blade(-1, -8),
            body: { lean: 7, tilt: 5 },
          },
          {
            at: at + 200,
            rear: { to: what, dx: -6, dy: -1 },
            ...blade(7, -3),
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
          // Onto the board the carrot lies on, not through it.
          effects: [
            {
              kind: "peel",
              from: 600,
              until: 2300,
              hand,
              to: object && "in" in object.where ? object.where.in : undefined,
            },
          ],
        },
      };
    }
    case "chop": {
      const small = to === "small";
      const step = small ? 150 : 420;
      const count = small ? 12 : 4;
      // Seen side on, the blade comes straight down through the carrot to the board, handle up, moving along it a slice at a time.
      // Held out level, the blade came down on the empty board past the carrot.
      const blade = (along: number, dy: number) => ({
        ...hands(hand, { to: what, as: "top" as const, ...aim("knife", 90, along, dy) }),
        turn: { [hand]: 90 },
      });
      const keys: MotionKey[] = [
        { at: 0 },
        {
          at: 380,
          rear: { to: what, dx: -6, dy: -1 },
          ...blade(-1, -7),
          body: { lean: 6 },
        },
      ];
      const sounds: Motion["sounds"] = [];
      for (let index = 0; index < count; index += 1) {
        const at = 450 + index * step;
        const along = small ? -1 + (index % 6) * 1.4 : -1 + index * 2.2;
        keys.push(
          {
            at,
            rear: { to: what, dx: -7, dy: -1 },
            ...blade(along, -6),
            body: { lean: 7, tilt: 6 },
          },
          {
            at: at + step * 0.45,
            rear: { to: what, dx: -7, dy: -1 },
            ...blade(along, 2.6),
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
      // A board stays in both hands, the other one under it tipping with it.
      const spout = (turn: number, dy: number) => ({
        ...hands(hand, { to, as: "top", ...aim(kind, turn, -2, dy) }),
        turn: { [hand]: turn },
        ...(board
          ? {
              both: {
                x: BOARD_PAIR.x * Math.cos((turn * Math.PI) / 180),
                y: BOARD_PAIR.y + BOARD_PAIR.x * Math.sin((turn * Math.PI) / 180),
              },
            }
          : {}),
      });
      const high = board ? -2 : -4;
      // Over the rim, not over the pot: a board held out leans the cook less than a jug does.
      const lean = board ? 2 : 6;
      // Off a board, long enough to see the pieces slide along it and drop in.
      const ms = board ? 2400 : 2600;
      return {
        motion: {
          ms,
          face: to,
          takes: ms - 700,
          contacts: [{ hand, tip: "over", to, from: 900, until: ms - 600 }],
          keys: [
            board ? { at: 0, ...BOARD_CARRYING } : { at: 0 },
            { at: 600, ...spout(tilt * 0.3, high - 4), body: { lean: lean - 1 } },
            { at: 900, ...spout(tilt, high), body: { lean } },
            // Tipped further as it empties, the spout kept where it was.
            {
              at: ms - 600,
              ...spout(tilt + (board ? 6 : 14), high),
              body: { lean: lean + 0.5 },
            },
            { at: ms - 300, ...spout(tilt * 0.3, high - 4), body: { lean: lean - 2 } },
            board ? { at: ms, ...BOARD_CARRYING } : { at: ms },
          ],
          sounds: [{ at: 900, id: board ? "plop" : "pour" }],
          // Off a board, the pieces are seen sliding off its end and dropping in, until they are in the pot.
          effects: [
            board
              ? { kind: "stream", from: 950, until: ms - 680, hand, to }
              : { kind: "stream", from: 900, until: ms - 600, hand, to },
          ],
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
      // A flick big enough to see at full speed: up and back, then down and over with the wrist, the body giving with it.
      for (let at = 650, flick = 0; at + 240 <= 3000; at += 240, flick += 1) {
        // Wandering a little over the pot, as a hand does salting.
        const dx = [-3, -1, -4, -2][flick % 4];
        keys.push({ at, ...over(138, dx - 1, -9), body: { lean: 3.6, brow: 0.3 } });
        keys.push({
          at: at + 110,
          ...over(176, dx + 1.5, -3),
          body: { lean: 4.8, bob: 1, brow: 0.4 },
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
          // One fall of grains for the whole salting: one per flick, overlapping, switched each other off.
          effects: [
            {
              kind: "salt" as const,
              from: flicks[0] - 30,
              until: flicks[flicks.length - 1] + 230,
              hand,
              to,
            },
          ],
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
      // The ear pose is the figure's own (StickFigure's `call`); this lifts the phone to it,
      // from where the hand held it, not from a drop to the side first.
      return {
        motion: {
          ms: 500,
          takes: 0,
          keys: [{ at: 0 }, { at: 500, ...hands(hand, PHONE_SCREEN) }],
        },
      };
    case "hangup": {
      // Down from the ear to in front of the chest, a look at the screen and a thumb on it, then the hand rests: dropped straight down, it read as a flick.
      const reading = { tilt: 6, look: 0.8, nod: 1.6 };
      return {
        motion: {
          ms: 1400,
          takes: 0,
          keys: [
            { at: 0 },
            { at: 450, ...hands(hand, PHONE_SCREEN), body: reading },
            { at: 750, ...hands(hand, PHONE_SCREEN), body: reading },
            {
              at: 850,
              ...hands(hand, PHONE_SCREEN),
              turn: { [hand]: -12 },
              body: reading,
            },
            { at: 1000, ...hands(hand, PHONE_SCREEN), body: reading },
            { at: 1400 },
          ],
        },
      };
    }
    case "leash": {
      // Bent down to the collar with the clip end, then up with the handle: the lead runs from the hand to the dog from then on.
      const collar = hands(hand, { to, as: "grip" });
      return {
        motion: {
          ms: 1500,
          face: to,
          takes: 800,
          sounds: [{ at: 780, id: "clink" }],
          keys: [
            { at: 0 },
            { at: 550, ...collar, body: { lean: 9, nod: 2, look: 1 } },
            { at: 850, ...collar, body: { lean: 9, nod: 2, look: 1 } },
            { at: 1500 },
          ],
        },
      };
    }
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
          ...hands(fan, { mouth: true, dx: 9, dy: -0.5 }),
          body: { lean: -6, tilt: -12, bob: -2.5, brow: -0.8, look: -0.4, mouth: 0.8 },
          emote: "hot",
        },
      ];
      for (let at = 250, flap = 0; at <= 1500; at += 125, flap += 1) {
        keys.push({
          at,
          ...away,
          ...hands(fan, { mouth: true, dx: 9, dy: flap % 2 ? -4 : 2 }),
          turn: { [fan]: flap % 2 ? 30 : -10 },
          body: {
            lean: -3,
            tilt: flap % 2 ? -6 : -3,
            bob: at < 1150 ? (Math.floor(flap / 2) % 2 ? -3.4 : 0.6) : 0,
            brow: -0.8,
            mouth: flap % 2 ? 0.8 : 0.6,
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
      // Hands are plain circles (Xurify: a finger only where the line is about one), so the whole hand goes side to side, and the head shakes with it.
      const out = world.seated?.includes(who) ? 15 : 21;
      const keys: MotionKey[] = [
        { at: 0 },
        {
          at: 300,
          ...hands(free, { up: { x: out, y: -11 } }),
          body: { brow: 0.8, nod: 0.6, tilt: -3 },
        },
      ];
      for (let at = 440, wag = 0; at <= 1280; at += 140, wag += 1) {
        keys.push({
          at,
          ...hands(free, { up: { x: out + (wag % 2 ? 4 : -4), y: wag % 2 ? -12 : -10 } }),
          body: { brow: 0.8, nod: 0.6, tilt: wag % 2 ? -4 : -2, look: wag % 2 ? 0.7 : 1 },
        });
      }
      keys.push({ at: 1420, ...hands(free, { up: { x: out, y: -11 } }) });
      keys.push({ at: 1750 });
      return { motion: { ms: 1750, keys } };
    }
    case "beckon": {
      // The hand out low and scooping back in to the chest twice: come in, come here. Low and toward the body, it does not read as a raised fist.
      // Seated, it scoops over the table: at the standing height it flapped under the board.
      const seated = world.seated?.includes(who);
      const scoop = seated
        ? [
            { x: 8, y: 1 },
            { x: 18, y: 5 },
          ]
        : [
            { x: 9, y: 12 },
            { x: 20, y: 19 },
          ];
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 300, curl = 0; at <= 1300; at += 250, curl += 1) {
        keys.push({
          at,
          ...hands(free, { up: scoop[curl % 2 ? 0 : 1] }),
          body: { lean: 2, tilt: 3, brow: 0.5, look: 0.8 },
        });
      }
      keys.push({ at: 1650 });
      return { motion: { ms: 1650, face: to || undefined, keys } };
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
      // The palm over the eyes and the head bowed into it: a hand at the hairline over a smile read as scratching the head.
      const brow = { mouth: true as const, dx: 2, dy: -9 };
      return {
        motion: {
          ms: 1900,
          keys: [
            { at: 0 },
            {
              at: 350,
              ...hands(free, brow),
              body: { tilt: 14, nod: 3, lean: 4, brow: -0.8, mouth: 0 },
            },
            {
              at: 1350,
              ...hands(free, brow),
              body: { tilt: 15, nod: 3.4, lean: 5, brow: -0.8, mouth: 0 },
            },
            {
              at: 1600,
              ...hands(free, { up: { x: 10, y: 14 } }),
              body: { tilt: 4, nod: 1 },
            },
            { at: 1900 },
          ],
        },
      };
    }
    case "yawn": {
      // A stretch: arms up, head back, the mouth wide open and the eyes squeezed shut, then a breath out. Behind a hand, it read as leaning on it. Up past the face and in front of it, the arms clear a desk microphone; seated, the head goes further back, clear of it too.
      const back = world.seated?.includes(who) ? 7 : 0;
      const tucked = { lead: { up: { x: 3, y: 10 } }, rear: { up: { x: 5, y: 12 } } };
      const stretched = (lift: number) => ({
        lead: { up: { x: 7, y: -26.5 - lift } },
        rear: { up: { x: -5, y: -26 - lift } },
      });
      return {
        motion: {
          ms: 2300,
          keys: [
            { at: 0 },
            { at: 250, ...tucked, body: { tilt: -3, lean: -1 - back, mouth: 0.4 } },
            {
              at: 650,
              ...stretched(0),
              body: {
                tilt: -10,
                lean: -3 - back,
                mouth: 1,
                round: 0.4,
                shut: 1,
                brow: 0.7,
              },
            },
            {
              at: 1400,
              ...stretched(1),
              body: {
                tilt: -12,
                lean: -4 - back,
                mouth: 1,
                round: 0.5,
                shut: 1,
                brow: 0.8,
              },
            },
            { at: 1750, ...tucked, body: { tilt: 2, nod: 0.8, mouth: 0.2 } },
            { at: 2300 },
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
    case "thumbs": {
      const thumb = { sign: { [free]: "thumb" as const } };
      return {
        motion: {
          ms: 1700,
          keys: [
            { at: 0 },
            {
              at: 380,
              ...hands(free, { up: { x: 15, y: 6 } }),
              ...thumb,
              body: { brow: 0.8, nod: 0.8 },
            },
            // A little push forward with it, as people do.
            {
              at: 620,
              ...hands(free, { up: { x: 17, y: 4 } }),
              ...thumb,
              body: { brow: 0.9, nod: 1.2 },
            },
            {
              at: 1300,
              ...hands(free, { up: { x: 16, y: 5 } }),
              ...thumb,
              body: { brow: 0.8, nod: 0.8 },
            },
            { at: 1700 },
          ],
        },
      };
    }
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
    case "point": {
      // The arm comes up as the figure turns round to what it points at (TURN_MS), and stays long enough to follow.
      return {
        motion: {
          ms: 1900,
          face: to,
          keys: [
            { at: 0 },
            {
              at: 450,
              ...hands(free, { toward: to }),
              body: { look: 1, brow: 0.3 },
            },
            {
              at: 1500,
              ...hands(free, { toward: to }),
              body: { look: 1, brow: 0.3 },
            },
            { at: 1900 },
          ],
        },
      };
    }
    case "shrug": {
      // Elbows in, forearms out, hands up at the sides, and the head sinking between shoulders that cannot rise. Seated, the hands stay above the desk.
      const drop = world.seated?.includes(who) ? 15 : 22;
      const open = (y: number, lift: number) => ({
        lead: { up: { x: 13, y } },
        rear: { up: { x: -9, y } },
        body: { tilt: 8 * lift, brow: lift, nod: 2 * lift, mouth: 0 },
      });
      return {
        motion: {
          ms: 1450,
          keys: [
            { at: 0 },
            { at: 220, ...open(drop + 4, 0.5) },
            { at: 420, ...open(drop - 1, 1) },
            { at: 900, ...open(drop, 0.9) },
            { at: 1150, ...open(drop + 6, 0.3) },
            { at: 1450 },
          ],
        },
      };
    }
    case "nod":
      return {
        motion: {
          ms: 1100,
          keys: [
            { at: 0 },
            { at: 250, body: { nod: 3.4, tilt: 2 } },
            { at: 500, body: { nod: 0.3 } },
            { at: 750, body: { nod: 3, tilt: 2 } },
            { at: 1100 },
          ],
        },
      };
    case "laugh": {
      // Mouth open, head tipped back, the shoulders shaking, a hand to the belly: a still smile did not read as a laugh.
      const belly = hands(free, { up: { x: 7, y: 25 } });
      const keys: MotionKey[] = [{ at: 0 }];
      for (let at = 200, shake = 0; at <= 1300; at += 150, shake += 1) {
        keys.push({
          at,
          ...belly,
          body: {
            lean: -4,
            tilt: shake % 2 ? -10 : -6,
            bob: shake % 2 ? -1.4 : 0.6,
            brow: 0.8,
            mouth: shake % 2 ? 0.95 : 0.6,
            shut: shake % 2 ? 1 : 0.6,
            look: 0.7,
          },
        });
      }
      keys.push({ at: 1650 });
      return { motion: { ms: 1650, keys } };
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
      // The chair pushed back from the table, then up off it, before anything else they do.
      return {
        motion: {
          ms: SCOOT_MS + sitMs(who, true),
          keys: [],
          sounds: [{ at: 100, id: "chair" }],
        },
      };
    case "go":
    case "enter":
    case "leave":
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
  // From the shoulder, so it is the hip at a desk too, where the hand goes down behind the desk's front with it.
  const pocket = { up: { x: 3, y: 27 } };
  return {
    ms: 1000,
    takes: way === "out" ? 450 : 500,
    sounds: what.includes("key") ? [{ at: 480, id: "keys" }] : [],
    keys:
      way === "out"
        ? [
            { at: 0 },
            { at: 380, ...hands(hand, pocket), body: { tilt: 6, look: -0.2 } },
            { at: 700, ...hands(hand, { up: { x: 12, y: 16 } }), body: { tilt: 4 } },
            { at: 1000, ...hands(hand, { up: { x: 12, y: 16 } }) },
          ]
        : // A glance down as the hand finds the pocket and pushes in: the head tilted with the torso, the body went over as one block.
          [
            { at: 0 },
            {
              at: 330,
              ...hands(hand, { up: { x: 5, y: 22 } }),
              body: { nod: 1, look: 0.2 },
            },
            { at: 500, ...hands(hand, pocket), body: { nod: 1.6, look: 0.2 } },
            { at: 650, ...hands(hand, { up: { x: 3, y: 28.5 } }), body: { nod: 0.8 } },
            { at: 1000 },
          ],
  };
}

/** A seated hand resting on the table's edge in front, from the shoulder. */
const ON_TABLE_EDGE = { up: { x: 9, y: 8 } };

/** A phone held up to read who calls: out past the chest, or the far hand holds it behind the body. */
const PHONE_SCREEN = { up: { x: 17, y: 0 } };

/**
 * A ringing phone out of the pocket and up in front of the chest, the head
 * bent to its screen to see who it is, held there till it goes to the ear.
 * At the hip, a seated caller's phone was behind the table the whole time.
 */
function phoneOutMotion(hand: Hand): Motion {
  const screen = PHONE_SCREEN;
  const reading = { tilt: 8, look: 0.8, nod: 2 };
  return {
    ms: 1100,
    takes: 450,
    hold: true,
    sounds: [
      { at: 0, id: "ring" },
      { at: 1000, id: "ring" },
    ],
    keys: [
      { at: 0 },
      { at: 380, ...hands(hand, { up: { x: 3, y: 27 } }), body: { tilt: 6, look: -0.2 } },
      { at: 800, ...hands(hand, screen), body: reading },
      { at: 1100, ...hands(hand, screen), body: reading },
    ],
  };
}

/** Headphones held by both cups at the chest: higher, a seated host held them against the desk mic. */
const HEADPHONES_HELD = { lead: { mouth: true, dx: 9, dy: 20 }, both: PAIR } as const;

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
  const held = HEADPHONES_HELD;
  return {
    ms: 1700,
    takes: 450,
    hold: true,
    keys: [
      { at: 0 },
      { at: 380, ...cups(0), body: { tilt: 3 } },
      { at: 520, ...cups(0), body: { tilt: 3 } },
      { at: 760, ...cups(6), body: { tilt: -3, lean: -2 } },
      // Quickly down past the face, which they hide on the way.
      {
        at: 960,
        lead: { mouth: true, dx: 9, dy: 8 },
        rear: { mouth: true, dx: -3, dy: 8 },
        body: { tilt: 2 },
      },
      { at: 1300, ...held, body: { lean: 1 } },
      { at: 1700, ...held },
    ],
  };
}

/** One half of a hand-over: out to where the two hands meet, a beat there, and back. */
function handOverMotion(hand: Hand, to: LessonCharacterId, kind?: ObjectKind): Motion {
  // A knife goes across blade down, the way it is handed safely: held out level, the blade hid behind the two fists and it read as a handshake.
  const meet = {
    ...hands(hand, { meet: to }),
    ...(kind === "knife" ? { turn: { [hand]: 90 } } : {}),
  };
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
  /**
   * Seated behind a desk mic: the side of the rig it is on (-1 when turned
   * away from it) and what each hand holds. Hands, what they hold and the
   * head go round it.
   */
  mic?: { side: 1 | -1; held: Partial<Record<Hand, ObjectKind>> };
}

export interface MotionFrame {
  pose: StickPose;
  turn: Partial<Record<Hand, number>>;
  emote?: Emote;
  sign?: Partial<Record<Hand, Sign>>;
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
    // Seated behind a desk mic, the hand stays in under it and the finger shows the way: held out level, the arm went behind the mic's boom and read as gripping it; raised over the mic, it crossed the boom.
    if (sit > 0.5 && around.mic?.side === 1 && aim.x > shoulder.x) {
      return { x: shoulder.x + UNDER_MIC_POINT.x, y: shoulder.y + UNDER_MIC_POINT.y };
    }
    // Seated, a point across the room stays about level: aimed down at a thing's foot it went into the desk or table between.
    // Standing, it goes down at a low pot or a carrot on the board: held level, it pointed at whoever stood beyond.
    const across = Math.abs(aim.x - shoulder.x);
    const drop = sit > 0.5 ? POINT_DROP : STANDING_POINT_DROP;
    const at = { x: aim.x, y: Math.min(aim.y, shoulder.y + Math.max(across, 1) * drop) };
    const length = Math.hypot(at.x - shoulder.x, at.y - shoulder.y) || 1;
    return {
      x: shoulder.x + ((at.x - shoulder.x) / length) * 28,
      y: shoulder.y + ((at.y - shoulder.y) / length) * 28,
    };
  }
  const at = around.pointOf(target.to, target.as ?? "grip");
  return at ? { x: at.x + (target.dx ?? 0), y: at.y + (target.dy ?? 0) } : rest;
}

/** A seated host's lean that would put the head into their desk mic, stopped short of it. */
export function headClearOfMic(pose: StickPose, sit: number, side: 1 | -1): StickPose {
  let body = pose;
  for (let step = 0; step < 40; step += 1) {
    if (intoDeskMic(solveRig(body, sit).head, HEAD_RADIUS, side) <= 0) break;
    body = { ...body, lean: body.lean - side * 0.5 };
  }
  return body;
}

/** Half a hand, with room to spare: the drawn hand is 2.3 across from its middle. */
const MIC_HAND = 2.8;

/**
 * A hand, and what it holds, moved the least way out of a seated host's
 * desk mic: back toward the body when it goes to the mouth, otherwise up
 * over the mic. Behind it, a hand read as gripping the mic.
 */
function clearOfMic(
  point: Point,
  mic: NonNullable<Surroundings["mic"]>,
  hand: Hand,
  turn: number,
  back: boolean,
): Point {
  const kind = mic.held[hand];
  const tip = kind ? tipFromHand(kind, turn) : undefined;
  const into = (at: Point) =>
    Math.max(
      intoDeskMic(at, MIC_HAND, mic.side),
      ...(tip
        ? [0.5, 1].map((share) =>
            intoDeskMic(
              { x: at.x + tip.x * share, y: at.y + tip.y * share },
              0.5,
              mic.side,
            ),
          )
        : []),
    );
  if (into(point) <= 0) return point;
  for (let by = 0.5; by <= 24; by += 0.5) {
    const moved = back
      ? { x: point.x - by * mic.side, y: point.y }
      : { x: point.x, y: point.y - by };
    if (into(moved) <= 0) return moved;
  }
  return point;
}

/** The steepest a point goes below level, as a slope: about 6 degrees. */
const POINT_DROP = 0.1;
/** Standing, about 60 degrees: steeper, the arm hangs down and reads as resting, not pointing. */
const STANDING_POINT_DROP = 1.7;
/** From a seated host's shoulder: in front of the chest, under the mic's head and short of its boom (StudioDesk). */
const UNDER_MIC_POINT: Point = { x: 13, y: 3 };

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

  const turn: Partial<Record<Hand, number>> = {};
  for (const hand of ["lead", "rear"] as const) {
    const a = from.turn?.[hand];
    const b = to.turn?.[hand];
    if (a === undefined && b === undefined) continue;
    turn[hand] = lerp(a ?? 0, b ?? 0, t);
  }

  // A pointing finger along the line from the hand to what it points at.
  const signs = t < 0.5 ? from.sign : to.sign;
  for (const hand of ["lead", "rear"] as const) {
    const target = [to[hand], from[hand]].find((key) => key && "toward" in key);
    const point = points[hand];
    if (signs?.[hand] !== "finger" || turn[hand] !== undefined || !point) continue;
    if (!target || !("toward" in target)) continue;
    const aim = around.pointOf(target.toward, "top") ?? around.pointOf(target.toward);
    if (aim) turn[hand] = (Math.atan2(aim.x - point.x, point.y - aim.y) * 180) / Math.PI;
  }

  const mic = sit > 0.5 ? around.mic : undefined;
  if (mic) {
    for (const hand of ["lead", "rear"] as const) {
      const point = points[hand];
      if (!point) continue;
      const atMouth = [from[hand], to[hand]].some(
        (target) => target && "mouth" in target,
      );
      points[hand] = clearOfMic(point, mic, hand, turn[hand] ?? 0, atMouth);
    }
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

  let pose = mic ? headClearOfMic(body, sit, mic.side) : body;
  for (const hand of ["lead", "rear"] as const) {
    const point = points[hand];
    if (point) pose = { ...pose, ...reachFor(pose, hand, point, sit) };
  }

  return {
    pose,
    turn,
    emote: t < 0.5 ? from.emote : to.emote,
    sign: t < 0.5 ? from.sign : to.sign,
    aimed: points,
  };
}

/**
 * The door's handle wherever the swing has it, so a hand on it moves with
 * the door. A fixed point in the figure's space was right for one stage
 * size only: on another the hand met the door's bottom edge.
 */
const ON_HANDLE: Target = { to: "door-handle" };

/**
 * The door pushed open from the doorway: the hand on its handle from the
 * click of the latch, leaning in as it swings, a beat holding it open, then
 * letting go to step in.
 */
export const OPEN_DOOR: Motion = {
  ms: DOOR_OPEN_MS + 550,
  keys: [
    { at: 0, lead: ON_HANDLE, body: { lean: 4 } },
    { at: DOOR_OPEN_MS * 0.6, lead: ON_HANDLE, body: { lean: 8 } },
    { at: DOOR_OPEN_MS + 200, lead: ON_HANDLE, body: { lean: 3 } },
    { at: DOOR_OPEN_MS + 550 },
  ],
  sounds: [{ at: 0, id: "door-open" }],
};

/** When the hand that pushes the door to is on its handle and the door starts to swing. */
const CLOSE_GRIP = 350;

/**
 * The door pushed to behind someone just come in: a hand out to its
 * handle, a push, and the hand on it until it shuts, so the bump into the
 * frame lands under the hand. Let go of mid-swing, it shut on its own once
 * the hand had dropped.
 */
export const CLOSE_DOOR: Motion = {
  ms: CLOSE_GRIP + DOOR_SHUT_MS + 500,
  takes: CLOSE_GRIP,
  keys: [
    { at: 0 },
    { at: CLOSE_GRIP, lead: ON_HANDLE, body: { lean: 4 } },
    { at: CLOSE_GRIP + DOOR_SHUT_MS * 0.5, lead: ON_HANDLE, body: { lean: 8 } },
    { at: CLOSE_GRIP + DOOR_SHUT_MS, lead: ON_HANDLE, body: { lean: 10 } },
    { at: CLOSE_GRIP + DOOR_SHUT_MS + 150, lead: ON_HANDLE, body: { lean: 6 } },
    { at: CLOSE_GRIP + DOOR_SHUT_MS + 500 },
  ],
  sounds: [{ at: CLOSE_GRIP + DOOR_SHUT_MS, id: "door-shut" }],
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
