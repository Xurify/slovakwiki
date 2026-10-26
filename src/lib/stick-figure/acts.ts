import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { Hand } from "./reach";

/**
 * Stage directions as data. A line's `act` lists what the cast does while
 * it plays, each cue on a word of the line or before or after the voice:
 * walk to the stove, take the spoon out of the crock, hold it out to Marek.
 * Every object has one place at a time (on a counter, in a pot, in someone's
 * hand or pocket), and only a cue moves it, so nothing appears from nowhere
 * and nothing vanishes while the story still uses it. `worldAfter` replays
 * the cues without a browser, for seeking and for tests.
 */

/** What can be done on stage. Each verb has a motion in act-motions.ts. */
export const VERBS = [
  "go",
  "take",
  "give",
  "put",
  "dip",
  "offer",
  "taste",
  "burn",
  "blow",
  "wag",
  "camera",
] as const;

export type Verb = (typeof VERBS)[number];

/**
 * When a cue starts: on a word of the line (its first match, folded, so
 * `ochutnaj` finds "ochutnaj,"), or `before` the voice (the line waits for
 * it), with the voice at `start`, as it `end`s, or `after` it (the next line
 * waits). Cues by the same person run one after the other; unanchored, a
 * cue follows the one before it.
 */
export type CueAnchor = "before" | "start" | "end" | "after" | (string & {});

export interface Cue {
  /** Who does it: the line's speaker unless set. */
  who?: LessonCharacterId;
  do: Verb;
  /** The object it is done with: an id in the place's set. */
  what?: string;
  /** Where to, or to whom: a spot ("stove"), an object ("pot"), a person, or "wide" for the camera. */
  to?: LessonCharacterId | (string & {});
  on?: CueAnchor;
  /** The camera's zoom on `to`: 1 is the whole stage. */
  zoom?: number;
}

/** Where an object is. */
export type Where =
  { on: string; dx: number } | { in: string } | { hand: LessonCharacterId; side: Hand };

export interface ObjectState {
  kind?: ObjectKind;
  where: Where;
  /** Steaming hot: 0 cold, 1 just off the boil. */
  heat?: number;
  /** Holding a spoonful: a spoon dipped and not yet tasted. */
  full?: boolean;
}

export type ObjectKind = "pot" | "lid" | "spoon" | "crock";

/** An object in a place's set, where it starts. */
export interface SetObject {
  id: string;
  kind: ObjectKind;
  start: ObjectState;
}

export interface CameraShot {
  /** Whose head the camera frames, or the whole stage. */
  on?: LessonCharacterId;
  zoom: number;
}

export const WIDE: CameraShot = { zoom: 1 };

/** Everything the cues have changed, as the stage stands between two lines. */
export interface World {
  camera: CameraShot;
  objects: Record<string, ObjectState>;
  /** Who stands at a spot of the set, or beside someone, instead of their mark. */
  spots: Partial<Record<LessonCharacterId, string>>;
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

/** The hand `who` holds `what` in, if they do. */
export function handHolding(
  world: World,
  who: LessonCharacterId,
  what: string | undefined,
): Hand | undefined {
  const where = what ? world.objects[what]?.where : undefined;
  return where && "hand" in where && where.hand === who ? where.side : undefined;
}

/** What `who` has in each hand. */
export function heldBy(
  world: World,
  who: LessonCharacterId,
): Partial<Record<Hand, string>> {
  const held: Partial<Record<Hand, string>> = {};
  for (const [id, { where }] of Object.entries(world.objects)) {
    if ("hand" in where && where.hand === who) held[where.side] = id;
  }
  return held;
}

/** Kept in the other hand, out of the way, so the working hand stays free: a lid off the pot. */
const OFF_HAND: readonly ObjectKind[] = ["lid"];

/** The hand a person takes something in: the lead one unless it is full, or the thing is one held aside. */
export function freeHand(
  world: World,
  who: LessonCharacterId,
  what?: string,
): Hand | undefined {
  const held = heldBy(world, who);
  const kind = what ? world.objects[what]?.kind : undefined;
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

/**
 * The world once `cue` has been played by `who`. This is what the motions
 * do at their key moments, all at once: the stage applies the same changes
 * as they happen, and seeking applies them here.
 */
export function applyCue(world: World, who: LessonCharacterId, cue: Cue): World {
  const { what, to } = cue;
  const object = what ? world.objects[what] : undefined;
  if (what && !object) throw new CueError(`${who} ${cue.do}: no "${what}" on this set`);

  switch (cue.do) {
    case "go":
      return { ...world, spots: { ...world.spots, [who]: to ?? "" } };
    case "take": {
      if (!what || !object) throw new CueError(`${who} take: what?`);
      if (handHolding(world, who, what)) return world;
      const hand = freeHand(world, who, what);
      if (!hand) throw new CueError(`${who} take ${what}: both hands are full`);
      return setObject(world, what, { where: { hand: who, side: hand } });
    }
    case "give": {
      if (!what || !to) throw new CueError(`${who} give: what, and to whom?`);
      if (!handHolding(world, who, what)) {
        throw new CueError(`${who} give ${what}: not in ${who}'s hand`);
      }
      const hand = freeHand(world, to as LessonCharacterId, what);
      if (!hand) throw new CueError(`${who} give ${what}: ${to}'s hands are full`);
      return setObject(world, what, {
        where: { hand: to as LessonCharacterId, side: hand },
      });
    }
    case "put": {
      if (!what || !to) throw new CueError(`${who} put: what, and where?`);
      if (!handHolding(world, who, what)) {
        throw new CueError(`${who} put ${what}: not in ${who}'s hand`);
      }
      const into = world.objects[to];
      return setObject(world, what, {
        where: into ? { in: to } : { on: to, dx: 0 },
      });
    }
    case "dip": {
      if (!what || !to) throw new CueError(`${who} dip: what, and into what?`);
      if (!handHolding(world, who, what)) {
        throw new CueError(`${who} dip ${what}: not in ${who}'s hand`);
      }
      return setObject(world, what, { full: true, heat: world.objects[to]?.heat ?? 0 });
    }
    case "taste":
      if (!what || !handHolding(world, who, what)) {
        throw new CueError(`${who} taste ${what}: not in ${who}'s hand`);
      }
      return setObject(world, what, { full: false });
    case "blow":
      if (!what || !handHolding(world, who, what)) {
        throw new CueError(`${who} blow ${what}: not in ${who}'s hand`);
      }
      return setObject(world, what, { heat: Math.max(0, (object?.heat ?? 0) - 0.5) });
    case "offer":
      if (!what || !handHolding(world, who, what)) {
        throw new CueError(`${who} offer ${what}: not in ${who}'s hand`);
      }
      return world;
    case "camera":
      return {
        ...world,
        camera:
          !to || to === "wide"
            ? WIDE
            : { on: to as LessonCharacterId, zoom: cue.zoom ?? 1.6 },
      };
    case "burn":
    case "wag":
      return world;
  }
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

/** The world before each line and after the last: what the cues have done so far. */
export function worlds(
  lines: readonly ActedLine[],
  objects: readonly SetObject[],
  start: World = startWorld(objects),
): World[] {
  const out: World[] = [start];
  for (const line of lines) {
    let world = out[out.length - 1];
    for (const cue of line.act ?? []) {
      const who = cueActor(cue, line.characterId);
      if (who) world = applyCue(world, who, cue);
    }
    out.push(world);
  }
  return out;
}

/** Whether a scene is acted from cues: then its props come only from them, never from words. */
export function isActed(lines: readonly ActedLine[]): boolean {
  return lines.some((line) => (line.act?.length ?? 0) > 0);
}
