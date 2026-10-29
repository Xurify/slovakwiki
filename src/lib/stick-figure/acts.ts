import {
  LESSON_CHARACTER_IDS,
  type LessonCharacterId,
} from "$lib/catalog/lessons/character-ids";
import type { Hand } from "./reach";

/**
 * Stage directions as data. A line's `act` lists what the cast does while
 * it plays, each cue on a word of the line or before or after the voice:
 * walk to the stove, take the spoon out of the crock, hold it out to Marek.
 * Every object has one place at a time (on the counter, in the pot, in a
 * hand or a pocket), and only a cue moves it, so nothing appears from
 * nowhere and nothing vanishes while the story still uses it. `worlds`
 * replays the cues without a browser, for seeking and for tests.
 */

/** What can be done on stage. Each verb has a motion in act-motions.ts. */
export const VERBS = [
  // Where people are.
  "go",
  "enter",
  "leave",
  "sit",
  "stand",
  "kneel",
  "face",
  "look",
  // Hands and objects.
  "take",
  "give",
  "put",
  "slide",
  "pocket",
  "offer",
  "raise",
  "dip",
  "taste",
  "blow",
  "wash",
  "dry",
  "peel",
  "chop",
  "fill",
  "pour",
  "shake",
  "ladle",
  "switch",
  "call",
  "hangup",
  "leash",
  "throw",
  // The body alone.
  "burn",
  "compute",
  "wag",
  "beckon",
  "wipe",
  "pat",
  "facepalm",
  "yawn",
  "fold",
  "thumbs",
  "sniff",
  "lean",
  "wave",
  "point",
  "shrug",
  "nod",
  "laugh",
  // The stage.
  "knock",
  "camera",
  "skip",
] as const;

export type Verb = (typeof VERBS)[number];

/**
 * When a cue starts: on a word of the line (its first match, folded, so
 * `ochutnaj` finds "ochutnaj,"), or `before` the voice (the line waits for
 * it), with the voice at `start`, as it `end`s, or `after` it (the next line
 * waits). Cues by the same person run one after the other; unanchored, a
 * cue follows the one before it. `dark` cues happen at once while a `skip`
 * has the lights down: the cut between two moments, everyone tidied away.
 */
export type CueAnchor = "before" | "start" | "end" | "after" | "dark" | (string & {});

export interface Cue {
  /** Who does it: the line's speaker unless set. */
  who?: LessonCharacterId;
  do: Verb;
  /** The object it is done with: an id in the place's set. */
  what?: string;
  /**
   * Where to, or to whom: a spot of the set ("sink"), a place on a piece
   * ("place-l"), a piece ("counter"), an object ("pot"), a person, a thing
   * of the backdrop to look at ("clock"), or for the camera "wide". For
   * `switch`, "on" or "off"; for `chop`, "small" for fine pieces; for
   * `leave`, the edge walked off by, "left" or "right"; for `leash`, the dog;
   * for `slide`, the piece it is pushed along, to `dx`.
   */
  to?: LessonCharacterId | (string & {});
  /** What it comes out of: the pot a ladle is filled from; for `enter` where there is no door, the edge spot they walk on from. */
  from?: string;
  on?: CueAnchor;
  /** Rig units along a piece, for `put` straight onto one or `slide` along it. */
  dx?: number;
  /** The camera's zoom on `to`: 1 is the whole stage. */
  zoom?: number;
  /** How far `skip` moves the clock on. */
  minutes?: number;
  /** For `go` by a dog: at a run, bounding over the same ground in a shorter time. */
  run?: boolean;
}

/** Where an object is. */
export type Where =
  /** On a piece of the set, `dx` rig units from its middle. */
  | { on: string; dx: number }
  /** In or on another object: the lid on the pot, the spoon in the crock; `dx` along it. */
  | { in: string; dx?: number }
  /** In someone's hand; `both` carries it in two, as a heavy pot. */
  | { hand: LessonCharacterId; side: Hand; both?: boolean }
  /** Out of sight in someone's pocket. */
  | { pocket: LessonCharacterId }
  /** On someone's head: headphones. */
  | { wear: LessonCharacterId };

export type ObjectKind =
  | "pot"
  | "lid"
  | "spoon"
  | "crock"
  | "board"
  | "knife"
  | "carrot"
  | "salt"
  | "jug"
  | "bowl"
  | "ladle"
  | "cutlery"
  | "towel"
  | "phone"
  | "keys"
  | "mic"
  | "cup"
  | "can"
  | "plant"
  | "headphones"
  | "lead"
  | "ball"
  | "suitcase"
  | "apple"
  | "bag"
  | "basket"
  | "book"
  | "clipboard"
  | "umbrella"
  | "cheese"
  | "plate"
  /** A bag the backdrop draws, standing in for it on the set so what is in it can be taken out. */
  | "stash";

/** What is in a pot, a bowl, a spoon, a jug or a cup. */
export type Fill = "water" | "soup" | "coffee" | "kibble";

export interface ObjectState {
  kind: ObjectKind;
  where: Where;
  /** Steaming hot: 0 cold, 1 just off the boil. */
  heat?: number;
  fill?: Fill;
  /** Whether food (like an apple) has a bite taken out of it. */
  bitten?: boolean;
  /** A carrot: 0 whole, 1 peeled, 2 in chunks, 3 in small pieces. */
  cut?: number;
  /** Shakes of salt it has had. */
  salt?: number;
  /** A plant: 1 yellow and drooping, 0 green and upright. */
  wilt?: number;
  /** A phone held to the ear: a call is on. */
  call?: boolean;
  /** A lead clipped to the dog's collar, its other end in a hand. */
  clipped?: boolean;
  /** Whose it is: the headphones one host wears, bareheaded once they are off. */
  of?: LessonCharacterId;
  /** Drawn mirrored, the way someone facing left holds it: a mug's handle on their far side, so it does not flip as they take or put it. */
  turned?: boolean;
}

/** An object in a place's set, where it starts. */
export interface SetObject {
  id: string;
  kind: ObjectKind;
  start: Omit<ObjectState, "kind">;
}

export type Side = 1 | -1;

/** Where someone stands or sits, by name, so the cues say "sink", not a number. */
export type Spot =
  /** At a piece of the set, `dx` rig units from its middle, facing `facing`. */
  | { piece: string; dx: number; facing: Side }
  /** At a point of the backdrop, `x` in its units: a doorway. */
  | { x: number; facing: Side }
  /** On the place's chair at that index in its furniture, facing as it does. */
  | { chair: number };

/** What the cast works at and with: pieces, objects, and the named spots and places. */
export interface SetPlan {
  /** `sink`: a counter's sink, rig units from its middle (SetPiece). */
  pieces: readonly { id: string; sink?: number }[];
  objects: readonly SetObject[];
  spots?: Readonly<Record<string, Spot>>;
  /** Where things are put down by name: a seat's place at the table. */
  places?: Readonly<Record<string, { piece: string; dx: number }>>;
  /** The spot in the doorway, where `enter` comes in. */
  door?: string;
}

export interface CameraShot {
  /** Whose head the camera frames, or a spot or piece of the set it closes in on; left out, the whole stage. */
  on?: string;
  zoom: number;
}

export const WIDE: CameraShot = { zoom: 1 };

/** Everything the cues have changed, as the stage stands between two lines. */
export interface World {
  camera: CameraShot;
  objects: Record<string, ObjectState>;
  /** Where people stand or sit, by spot, or beside someone (their id), instead of their mark. */
  spots: Partial<Record<LessonCharacterId, string>>;
  /** Who is not in yet: they come in through the door later. */
  out?: LessonCharacterId[];
  /** Who sits, on the chair their spot names. */
  seated?: LessonCharacterId[];
  /** Pieces switched on: a stove's burner. */
  lit?: string[];
  /** Minutes the story has skipped forward: the clock shows them. */
  minutes?: number;
}

export function startWorld(objects: readonly SetObject[] = []): World {
  return {
    camera: WIDE,
    objects: Object.fromEntries(
      objects.map(({ id, kind, start }) => [id, { ...start, kind }]),
    ),
    spots: {},
  };
}

/**
 * What a scene adds to the place's set and changes before it starts: a
 * plant that has gone yellow, where the cook stands as the scene opens.
 */
export interface SetSetup {
  objects?: readonly SetObject[];
  state?: Readonly<Record<string, Partial<Omit<ObjectState, "kind">>>>;
  spots?: Readonly<Partial<Record<LessonCharacterId, string>>>;
  seated?: readonly LessonCharacterId[];
}

/** `world` with what a scene adds to or changes in the set before it starts. */
export function setUp(world: World, setup: SetSetup | undefined): World {
  if (!setup) return world;
  const objects = { ...world.objects };
  for (const { id, kind, start } of setup.objects ?? []) {
    if (!objects[id]) objects[id] = { ...start, kind };
  }
  for (const [id, change] of Object.entries(setup.state ?? {})) {
    if (objects[id]) objects[id] = { ...objects[id], ...change };
  }
  return {
    ...world,
    objects,
    spots: { ...world.spots, ...setup.spots },
    ...(setup.seated ? { seated: [...setup.seated] } : {}),
  };
}

/** The hand `who` holds `what` in, if they do. */
export function handHolding(
  world: World,
  who: LessonCharacterId,
  what: string | undefined,
): Hand | undefined {
  const where = what ? world.objects[what]?.where : undefined;
  return where && "hand" in where && where.hand === who ? where.side : undefined;
}

/** What `who` has in each hand: a two-handed carry fills both. */
export function heldBy(
  world: World,
  who: LessonCharacterId,
): Partial<Record<Hand, string>> {
  const held: Partial<Record<Hand, string>> = {};
  for (const [id, { where }] of Object.entries(world.objects)) {
    if (!("hand" in where) || where.hand !== who) continue;
    held[where.side] = id;
    if (where.both) held[where.side === "lead" ? "rear" : "lead"] = id;
  }
  return held;
}

/** Carried in both hands: a big pot, full or not. */
export const HEAVY: readonly ObjectKind[] = ["pot"];
/** Held in both hands though not heavy: a board of chopped carrots, carried level, as people do. One end in one hand read as a paddle. */
export const TWO_HANDED: readonly ObjectKind[] = [...HEAVY, "board"];
/**
 * Kept in the other hand, out of the way, so the working hand stays free: a
 * lid off the pot, a bowl to ladle into, a phone (at the ear on a call).
 */
const OFF_HAND: readonly ObjectKind[] = ["lid", "bowl", "phone"];

/** The hand a person takes something in: the lead one unless it is full, or the thing is one held aside. */
export function freeHand(
  world: World,
  who: LessonCharacterId,
  what?: string,
): Hand | undefined {
  const held = heldBy(world, who);
  const kind = what ? world.objects[what]?.kind : undefined;
  if (kind && TWO_HANDED.includes(kind))
    return held.lead || held.rear ? undefined : "lead";
  const order: Hand[] =
    kind && OFF_HAND.includes(kind) ? ["rear", "lead"] : ["lead", "rear"];
  return order.find((hand) => !held[hand]);
}

export function setObject(world: World, id: string, change: Partial<ObjectState>): World {
  const current = world.objects[id];
  if (!current) return world;
  return { ...world, objects: { ...world.objects, [id]: { ...current, ...change } } };
}

/** What is wrong with a cue in the world it is played in: taking what is not there, giving what one does not hold. */
export class CueError extends Error {}

/** Objects inside `id`, as the carrots on the board or the lid on the pot. */
export function contents(world: World, id: string): string[] {
  return Object.entries(world.objects).flatMap(([other, { where }]) =>
    "in" in where && where.in === id ? [other] : [],
  );
}

/** The piece an object rests on, through whatever holds it; undefined in a hand or pocket. */
export function restingOn(world: World, id: string): string | undefined {
  const seen = new Set<string>();
  let at: string | undefined = id;
  while (at && !seen.has(at)) {
    seen.add(at);
    const where: Where | undefined = world.objects[at]?.where;
    if (!where) return undefined;
    if ("on" in where) return where.on;
    at = "in" in where ? where.in : undefined;
  }
  return undefined;
}

/** Who has an object, through whatever holds it: the carrots on the board Anna carries. */
export function carriedBy(world: World, id: string): LessonCharacterId | undefined {
  const seen = new Set<string>();
  let at: string | undefined = id;
  while (at && !seen.has(at)) {
    seen.add(at);
    const where: Where | undefined = world.objects[at]?.where;
    if (!where) return undefined;
    if ("hand" in where) return where.hand;
    at = "in" in where ? where.in : undefined;
  }
  return undefined;
}

function on<T>(list: readonly T[] | undefined, item: T, yes: boolean): T[] {
  const rest = (list ?? []).filter((other) => other !== item);
  return yes ? [...rest, item] : rest;
}

/** Where `put` leaves an object: in another, at a named place, or on a piece. */
/** The named place of a counter's sink that `where` stands down in, if it does: where a pot is stood to fill. */
export function sinkAt(
  plan: Pick<SetPlan, "pieces" | "places"> | undefined,
  where: Where | undefined,
): string | undefined {
  if (!plan?.places || !where || !("on" in where)) return undefined;
  const piece = plan.pieces.find((candidate) => candidate.id === where.on);
  if (piece?.sink === undefined || piece.sink !== where.dx) return undefined;
  return Object.entries(plan.places).find(
    ([, place]) => place.piece === where.on && place.dx === where.dx,
  )?.[0];
}

/** Where `cue` puts what it puts down: in an object, on a named place, or on a piece. */
export function putDown(plan: SetPlan | undefined, world: World, cue: Cue): Where {
  const to = cue.to ?? "";
  if (world.objects[to]) return { in: to };
  const place = plan?.places?.[to];
  if (place) return { on: place.piece, dx: place.dx + (cue.dx ?? 0) };
  if (plan && !plan.pieces.some((piece) => piece.id === to)) {
    throw new CueError(`put ${cue.what}: no "${to}" to put it on or in`);
  }
  return { on: to, dx: cue.dx ?? 0 };
}

function holds(world: World, who: LessonCharacterId, cue: Cue): void {
  if (!cue.what || !handHolding(world, who, cue.what)) {
    throw new CueError(`${who} ${cue.do} ${cue.what ?? ""}: not in ${who}'s hand`);
  }
}

/**
 * The world once `cue` has been played by `who`. This is what the motions
 * do at their key moments, all at once: the stage applies the same changes
 * as they happen, and seeking applies them here. With `plan`, spots and
 * places are checked too.
 */
export function applyCue(
  world: World,
  who: LessonCharacterId,
  cue: Cue,
  plan?: SetPlan,
): World {
  const { what, to } = cue;
  const object = what ? world.objects[what] : undefined;
  // A switch is a piece's (the stove's), not an object's.
  if (what && !object && cue.do !== "switch") {
    throw new CueError(`${who} ${cue.do}: no "${what}" on this set`);
  }
  const isOut = world.out?.includes(who) ?? false;
  if (isOut && cue.do !== "enter" && cue.do !== "knock") {
    throw new CueError(`${who} ${cue.do}: not in yet, an "enter" cue comes first`);
  }
  if (plan && (cue.do === "go" || cue.do === "sit") && to) {
    const spot = plan.spots?.[to];
    if (!spot && !isPerson(to)) throw new CueError(`${who} ${cue.do}: no spot "${to}"`);
    if (cue.do === "sit" && !(spot && "chair" in spot)) {
      throw new CueError(`${who} sit: "${to}" is not a chair`);
    }
  }
  if (
    world.seated?.includes(who) &&
    (cue.do === "go" || cue.do === "enter" || cue.do === "leave")
  ) {
    throw new CueError(`${who} ${cue.do}: still sitting, a "stand" cue comes first`);
  }

  switch (cue.do) {
    case "enter":
      if (!isOut) throw new CueError(`${who} enter: already in`);
      return {
        ...world,
        out: on(world.out, who, false),
        spots: { ...world.spots, [who]: to ?? plan?.door ?? "door" },
      };
    case "go":
      return { ...world, spots: { ...world.spots, [who]: to ?? "" } };
    case "leave": {
      if (to !== "left" && to !== "right") {
        throw new CueError(`${who} leave: by the "left" or the "right" edge?`);
      }
      const { [who]: _, ...spots } = world.spots;
      return { ...world, out: on(world.out, who, true), spots };
    }
    case "sit":
      return {
        ...world,
        spots: { ...world.spots, [who]: to ?? world.spots[who] ?? "" },
        seated: on(world.seated, who, true),
      };
    case "stand":
      return { ...world, seated: on(world.seated, who, false) };
    case "kneel":
    case "compute":
    case "pat":
      return world;
    case "take": {
      if (!what || !object) throw new CueError(`${who} take: what?`);
      if (handHolding(world, who, what)) return world;
      if ("pocket" in object.where && object.where.pocket !== who) {
        throw new CueError(
          `${who} take ${what}: it is in ${object.where.pocket}'s pocket`,
        );
      }
      const hand = freeHand(world, who, what);
      if (!hand) throw new CueError(`${who} take ${what}: hands are full`);
      const both = TWO_HANDED.includes(object.kind);
      return setObject(world, what, {
        where: { hand: who, side: hand, ...(both ? { both } : {}) },
      });
    }
    case "give": {
      if (!what || !to) throw new CueError(`${who} give: what, and to whom?`);
      holds(world, who, cue);
      const hand = freeHand(world, to as LessonCharacterId, what);
      if (!hand) throw new CueError(`${who} give ${what}: ${to}'s hands are full`);
      return setObject(world, what, {
        where: { hand: to as LessonCharacterId, side: hand },
      });
    }
    case "put": {
      if (!what || !to) throw new CueError(`${who} put: what, and where?`);
      holds(world, who, cue);
      return setObject(world, what, { where: putDown(plan, world, cue), call: false });
    }
    case "slide": {
      // Pushed along the surface it stands on, to someone too far off to hand it to across a desk.
      const where = object?.where;
      if (!where || !("on" in where)) {
        throw new CueError(
          `${who} slide ${what}: put it down first, it slides along a surface`,
        );
      }
      const there = putDown(plan, world, cue);
      if (!("on" in there) || there.on !== where.on) {
        throw new CueError(
          `${who} slide ${what}: along the ${where.on} it stands on, not onto another`,
        );
      }
      return setObject(world, what!, { where: there });
    }
    case "pocket":
      holds(world, who, cue);
      return setObject(world, what!, { where: { pocket: who }, call: false });
    case "dip": {
      if (!to) throw new CueError(`${who} dip: into what?`);
      holds(world, who, cue);
      const from = world.objects[to];
      return setObject(world, what!, { fill: from?.fill, heat: from?.heat ?? 0 });
    }
    case "taste":
      holds(world, who, cue);
      // A spoonful is gone in one go; a cup of coffee takes more than a sip.
      return object?.kind === "cup"
        ? world
        : setObject(world, what!, { fill: undefined, bitten: true });
    case "blow":
      holds(world, who, cue);
      return setObject(world, what!, { heat: Math.max(0, (object?.heat ?? 0) - 0.5) });
    case "offer":
    case "raise":
      holds(world, who, cue);
      return world;
    case "peel":
      if (!object || object.kind !== "carrot")
        throw new CueError(`${who} peel: a carrot?`);
      return setObject(world, what!, { cut: Math.max(object.cut ?? 0, 1) });
    case "chop": {
      if (!object || object.kind !== "carrot")
        throw new CueError(`${who} chop: a carrot?`);
      const knife = Object.values(world.objects).some(
        ({ kind, where }) => kind === "knife" && "hand" in where && where.hand === who,
      );
      if (!knife) throw new CueError(`${who} chop ${what}: no knife in hand`);
      return setObject(world, what!, {
        cut: Math.max(object.cut ?? 0, to === "small" ? 3 : 2),
      });
    }
    case "fill":
      // A pot is stood in the sink and filled from the tap: held under it, the arms hid the water.
      if (object && HEAVY.includes(object.kind)) {
        if (plan && !sinkAt(plan, object.where)) {
          throw new CueError(`${who} fill ${what}: put it in the sink first`);
        }
      } else holds(world, who, cue);
      return setObject(world, what!, { fill: "water" });
    case "pour": {
      holds(world, who, cue);
      if (!to || !world.objects[to])
        throw new CueError(`${who} pour ${what}: into what?`);
      const into = world.objects[to];
      // A board tips what is on it in; a jug or a can pours water.
      let next = world;
      for (const inside of contents(world, what!)) {
        next = setObject(next, inside, { where: { in: to } });
      }
      if (object!.kind === "board") {
        return setObject(next, to, { fill: into.fill === "water" ? "soup" : into.fill });
      }
      if (!object!.fill) throw new CueError(`${who} pour ${what}: it is empty`);
      next = setObject(next, to, {
        fill: into.fill ?? object!.fill,
        ...(into.kind === "plant" ? { wilt: 0 } : {}),
      });
      return object!.kind === "can" ? setObject(next, what!, { fill: undefined }) : next;
    }
    case "shake": {
      holds(world, who, cue);
      if (!to || !world.objects[to])
        throw new CueError(`${who} shake ${what}: over what?`);
      return setObject(world, to, { salt: (world.objects[to].salt ?? 0) + 1 });
    }
    case "ladle": {
      holds(world, who, cue);
      const from = cue.from ? world.objects[cue.from] : undefined;
      if (!from?.fill)
        throw new CueError(`${who} ladle: from a pot with something in it?`);
      if (!to || !world.objects[to]) throw new CueError(`${who} ladle: into what?`);
      return setObject(world, to, { fill: from.fill, heat: from.heat });
    }
    case "switch": {
      const piece = what ?? "";
      if (plan && !plan.pieces.some(({ id }) => id === piece)) {
        throw new CueError(`${who} switch: no "${piece}" to switch`);
      }
      const lit = to !== "off";
      let next: World = { ...world, lit: on(world.lit, piece, lit) };
      // What stands on a lit burner starts to warm; off, it keeps its heat.
      if (lit) {
        for (const [id, state] of Object.entries(world.objects)) {
          if ("on" in state.where && state.where.on === piece && state.fill) {
            next = setObject(next, id, { heat: Math.max(state.heat ?? 0, 0.3) });
          }
        }
      }
      return next;
    }
    case "throw": {
      // Thrown to a dog: out of sight with it until it brings the ball back and `take`s it from there.
      holds(world, who, cue);
      if (!to || !isPerson(to)) throw new CueError(`${who} throw ${what}: to whom?`);
      return setObject(world, what!, { where: { pocket: to } });
    }
    case "call":
      holds(world, who, cue);
      return setObject(world, what!, { call: true });
    case "hangup":
      holds(world, who, cue);
      return setObject(world, what!, { call: false });
    case "leash":
      holds(world, who, cue);
      if (object?.kind !== "lead") throw new CueError(`${who} leash: a lead?`);
      if (!to || !isPerson(to)) throw new CueError(`${who} leash ${what}: onto whom?`);
      return setObject(world, what!, { clipped: true });
    case "camera":
      return {
        ...world,
        camera: !to || to === "wide" ? WIDE : { on: to, zoom: cue.zoom ?? 1.6 },
      };
    case "skip": {
      // Whatever cooks on a lit burner is done when the clock comes back.
      let next: World = { ...world, minutes: (world.minutes ?? 0) + (cue.minutes ?? 60) };
      for (const [id, state] of Object.entries(world.objects)) {
        const piece = restingOn(world, id);
        if (piece && world.lit?.includes(piece) && state.fill) {
          next = setObject(next, id, {
            heat: 1,
            fill:
              state.fill === "water" && contents(world, id).length ? "soup" : state.fill,
          });
        }
      }
      return next;
    }
    case "wash":
    case "dry":
    case "face":
    case "look":
    case "burn":
    case "wag":
    case "beckon":
    case "wipe":
    case "facepalm":
    case "yawn":
    case "fold":
    case "thumbs":
    case "sniff":
    case "lean":
    case "wave":
    case "point":
    case "shrug":
    case "nod":
    case "laugh":
    case "knock":
      return world;
  }
}

/** Whether a cue's `to` names a person rather than a spot: `go` beside them. */
function isPerson(to: string): to is LessonCharacterId {
  return (LESSON_CHARACTER_IDS as readonly string[]).includes(to);
}

/** Who does a cue: its `who`, else the line's speaker. */
export function cueActor(
  cue: Cue,
  speaker: LessonCharacterId | null,
): LessonCharacterId | undefined {
  return cue.who ?? speaker ?? undefined;
}

export interface ActedLine {
  act?: readonly Cue[];
  characterId: LessonCharacterId | null;
}

/** Who comes in through the door during these lines, so they are not in before. */
export function comingIn(lines: readonly ActedLine[]): LessonCharacterId[] {
  const first = new Map<LessonCharacterId, Verb>();
  for (const line of lines) {
    for (const cue of line.act ?? []) {
      const who = cueActor(cue, line.characterId);
      if (who && !first.has(who) && cue.do !== "knock") first.set(who, cue.do);
    }
  }
  return [...first].flatMap(([who, verb]) => (verb === "enter" ? [who] : []));
}

/** `start` with whoever comes in through the door during these lines not in yet. */
export function opening(lines: readonly ActedLine[], start: World): World {
  const entering = comingIn(lines);
  if (!entering.length) return start;
  // Not in yet, they are not in their seat either: the studio sits its hosts down from the start.
  const seated = start.seated?.filter((who) => !entering.includes(who));
  return {
    ...start,
    out: [...new Set([...(start.out ?? []), ...entering])],
    ...(seated ? { seated } : {}),
  };
}

/** Who comes in through the door or from an edge during these lines, with the way they face. */
export function cueEntrances(
  lines: readonly ActedLine[],
  setPlan?: SetPlan,
): Partial<Record<LessonCharacterId, Side>> {
  const result: Partial<Record<LessonCharacterId, Side>> = {};
  for (const who of comingIn(lines)) {
    let facing: Side = 1;
    for (const line of lines) {
      const enterCue = line.act?.find(
        (cue) => cue.do === "enter" && cueActor(cue, line.characterId) === who,
      );
      if (enterCue) {
        const spot = enterCue.from ? setPlan?.spots?.[enterCue.from] : undefined;
        facing =
          (spot && "facing" in spot ? spot.facing : undefined) ??
          (enterCue.from?.includes("right") ? -1 : 1);
        break;
      }
    }
    result[who] = facing;
  }
  return result;
}

/** The world before each line and after the last: what the cues have done so far. */
export function worlds(
  lines: readonly ActedLine[],
  plan: SetPlan,
  start: World = startWorld(plan.objects),
): World[] {
  const out: World[] = [opening(lines, start)];
  for (const line of lines) {
    let world = out[out.length - 1];
    for (const cue of line.act ?? []) {
      const who = cueActor(cue, line.characterId);
      if (who) world = applyCue(world, who, cue, plan);
    }
    out.push(world);
  }
  return out;
}

/** Whether a scene is acted from cues: then its props come only from them, never from words. */
export function isActed(lines: readonly ActedLine[]): boolean {
  return lines.some((line) => (line.act?.length ?? 0) > 0);
}
