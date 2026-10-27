import type { ObjectKind, SetPlan, World } from "./acts";
import { GROUND_Y, SEAT_Y, type Point } from "./rig";

/**
 * What a place's cast works at: a counter with a sink, a stove, a table.
 * Unlike the backdrop, pieces are drawn at the cast's scale and stand on
 * the cast's floor, in rig units (StickSet.svelte), so a hand reaching for
 * the pot lands on the pot at any stage size. A `ledge` and the `floor`
 * are surfaces only: the shelf in the counter's open cupboard, the spot on
 * the floor a plant stands on. The `desk` is the studio's, drawn with it.
 * Things on a `rail` hang from its hooks: a ladle, a lid. A rail a few
 * units wide is a single hook on the wall: a towel.
 */
export type PieceKind =
  "counter" | "stove" | "table" | "rail" | "ledge" | "floor" | "desk";

export interface SetPiece {
  id: string;
  kind: PieceKind;
  /** Its middle, as an x in the backdrop drawing. */
  x?: number;
  /** Or rig units from another piece's middle, so pieces that stand together stay together at any cast size. */
  at?: { piece: string; dx: number };
  /** Surface height off the floor, for a ledge. */
  height?: number;
  width?: number;
  /** Drawn over the cast: a table people sit behind. */
  front?: boolean;
  /** A counter's sink, rig units from its middle: the tap over it and the open cupboard under it. A counter without one has closed doors. */
  sink?: number;
  /** Not drawn, as what it is on draws it: the oven door's handle, which a towel hangs over. */
  bare?: boolean;
}

/**
 * Size in rig units, to the figure's body rather than the room: its head is
 * big and its legs short, so a worktop at a real 90 cm (about 50) would come
 * up to its chest. 44 is just over its hip, where its hands work at a counter.
 */
const SIZE: Record<PieceKind, { width: number; height: number }> = {
  counter: { width: 80, height: 44 },
  stove: { width: 38, height: 44 },
  table: { width: 120, height: 37 },
  // A bar on the wall, about shoulder high, with hooks.
  rail: { width: 40, height: 80 },
  ledge: { width: 30, height: 12 },
  floor: { width: 40, height: 0 },
  // StudioDesk.svelte's top, lower than a real desk's.
  desk: { width: 200, height: 28 },
};

/**
 * How far StudioDesk runs past the outer hosts, in rig units: room for the
 * mugs and the boom arms, and short of the studio plant, so whoever waters
 * it stands clear of the desk's end, not half behind it.
 */
export const DESK_REACH = 46;

/**
 * A desk mic in the rig space of the host seated facing +x behind it, and
 * the mouth it points at from the chin. It stands a hand's width out from
 * the lips, so a head that leans in on a word still clears it.
 */
export const DESK_MIC = { at: { x: 19, y: 73 }, mouth: { x: -1, y: 69 } };

/**
 * The mic's head as StudioDesk draws it, on the line from DESK_MIC.at to the
 * mouth: the foam's middle 5 units mouthward, the body's rounded end 5.4
 * back, and 4 thick.
 */
const MIC_HEAD = (() => {
  const { at, mouth } = DESK_MIC;
  const length = Math.hypot(mouth.x - at.x, mouth.y - at.y);
  const along = (by: number): Point => ({
    x: at.x + ((mouth.x - at.x) / length) * by,
    y: at.y + ((mouth.y - at.y) / length) * by,
  });
  return { foam: along(5), tail: along(-5.4), thick: 4 };
})();

/**
 * How far something round, `half` across from its middle at `point`, goes
 * into the desk mic of a seated host, in their rig space: `side` is -1 when
 * they have turned away from their seat's facing. Over 0 it overlaps.
 */
export function intoDeskMic(point: Point, half: number, side: 1 | -1 = 1): number {
  const [a, b] = [MIC_HEAD.foam, MIC_HEAD.tail].map((end) => ({
    x: end.x * side,
    y: end.y,
  }));
  const [dx, dy] = [b.x - a.x, b.y - a.y];
  const t = Math.max(
    0,
    Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy)),
  );
  return (
    half + MIC_HEAD.thick - Math.hypot(point.x - (a.x + dx * t), point.y - (a.y + dy * t))
  );
}

export function pieceSize(piece: Pick<SetPiece, "kind" | "height" | "width">): {
  width: number;
  height: number;
} {
  const size = SIZE[piece.kind];
  return { width: piece.width ?? size.width, height: piece.height ?? size.height };
}

export function pieceTop(piece: Pick<SetPiece, "kind" | "height">): number {
  return GROUND_Y - (piece.height ?? SIZE[piece.kind].height);
}

/**
 * How each kind is held, from the point it stands on (y up from its base):
 * a pot by its far handle, the other hand on the near one, a spoon by the
 * end of its handle, a cup by the handle on its right, a bowl from
 * underneath. `top` is how tall it stands, for what goes in or on it.
 */
export const OBJECT_SIZE: Record<
  ObjectKind,
  { grip: Point; top: number; width: number }
> = {
  pot: { grip: { x: 13.75, y: 11.5 }, top: 15, width: 31 },
  lid: { grip: { x: 0, y: 5.6 }, top: 4, width: 26 },
  spoon: { grip: { x: 0, y: 5 }, top: 15, width: 5 },
  crock: { grip: { x: 0, y: 11 }, top: 11, width: 9 },
  board: { grip: { x: -10, y: 1 }, top: 2, width: 22 },
  knife: { grip: { x: -5, y: 1 }, top: 1, width: 13 },
  carrot: { grip: { x: 0, y: 2 }, top: 3, width: 14 },
  salt: { grip: { x: 0, y: 4 }, top: 8, width: 5 },
  jug: { grip: { x: -6, y: 8 }, top: 12, width: 14 },
  bowl: { grip: { x: 0, y: 0 }, top: 5, width: 14 },
  ladle: { grip: { x: 0, y: 4 }, top: 19, width: 6 },
  cutlery: { grip: { x: -4, y: 0.6 }, top: 1, width: 10 },
  towel: { grip: { x: 0, y: -4 }, top: 0, width: 7 },
  phone: { grip: { x: 0, y: 3.5 }, top: 1, width: 4 },
  // Held by the ring, the keys hanging under the fist.
  keys: { grip: { x: 0, y: 6.4 }, top: 1, width: 5 },
  mic: { grip: { x: 0, y: 3.5 }, top: 12.7, width: 5 },
  cup: { grip: { x: 5, y: 4 }, top: 7, width: 9 },
  can: { grip: { x: -2, y: 14 }, top: 12, width: 26 },
  plant: { grip: { x: 0, y: 12 }, top: 24, width: 25 },
  // Over-ear, a head's width across: held by the near cup, the band arched over.
  headphones: { grip: { x: 6, y: 4.5 }, top: 18, width: 18 },
  // Held from underneath in the fingers, the ball over the fist.
  ball: { grip: { x: 0, y: 0 }, top: 8.4, width: 8.4 },
  // Carried by the handle on its top, hanging beside the leg.
  suitcase: { grip: { x: 0, y: 17 }, top: 15, width: 18 },
  // Held by its handle's loop, the strap hanging down to the clip.
  lead: { grip: { x: 0, y: -3 }, top: 0, width: 5 },
};

/**
 * The working end of each kind, in its own drawing's space: where a jug or
 * can pours from, a shaker's holes, a spoon's or ladle's bowl, a cup's near
 * rim, a board's far end. Motions aim it, not the hand, and the stage draws what pours from it.
 */
export const OBJECT_TIP: Partial<Record<ObjectKind, Point>> = {
  jug: { x: 7, y: -12 },
  can: { x: 14, y: -12 },
  ladle: { x: 0, y: -18 },
  spoon: { x: 0, y: -13 },
  salt: { x: 0, y: -9 },
  knife: { x: 5, y: -1 },
  cup: { x: -3.5, y: -7 },
  // The far end, where the pieces slide off.
  board: { x: 10.5, y: -2.4 },
};

/** From the hand to the tip of a `kind` it holds turned `turn` degrees, in the holder's rig space. */
export function tipFromHand(kind: ObjectKind, turn = 0): Point {
  const tip = OBJECT_TIP[kind] ?? { x: 0, y: 0 };
  const { grip } = OBJECT_SIZE[kind];
  const x = tip.x - grip.x;
  const y = tip.y + grip.y;
  const angle = (turn * Math.PI) / 180;
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

/**
 * Half the width of what can be poured into or dipped in, inside its rim,
 * and how deep it is under the rim (StickSetObject.svelte): a stream or a
 * spoon outside this misses.
 */
export const OPENING: Partial<Record<ObjectKind, { half: number; depth: number }>> = {
  pot: { half: 11, depth: 14 },
  bowl: { half: 6, depth: 4.5 },
  plant: { half: 10.5, depth: 4 },
  crock: { half: 4, depth: 10 },
};

/**
 * A counter's sink, sunk in the worktop (StickSet.svelte): half its width,
 * how high over the worktop the tap's spout is, and how far down in it what
 * stands there stands: two thirds of a pot stands out of it, both handles
 * showing, under a spout well over its rim, so the stream is seen falling
 * in. Sunk deeper, only its top showed and it read as a flat pan.
 */
export const SINK = { half: 12, spout: 19, depth: 5 };

/** How far down into what holds it an object sits: a spoon in the crock, a lid on the rim, carrots on the board. */
const INSIDE: Partial<Record<ObjectKind, number>> = {
  lid: 0,
  spoon: -2,
  ladle: -2,
  knife: 0,
  carrot: 0,
  bowl: 0,
};

/** Where a piece and the stage's other things are, in cast space: rig units from the stage's left edge. */
export interface SetGeometry {
  /** A piece's middle. */
  pieceX(id: string): number | undefined;
  pieces: readonly SetPiece[];
}

export function pieceOf(geometry: SetGeometry, id: string): SetPiece | undefined {
  return geometry.pieces.find((piece) => piece.id === id);
}

/**
 * Where an object stands, in cast space (x rig units from the stage's left
 * edge, y in rig units as a figure's): its base. Undefined in someone's
 * hand or pocket, where the figure draws it, or hides it.
 */
export function objectBase(
  world: World,
  id: string,
  geometry: SetGeometry,
  seen: ReadonlySet<string> = new Set(),
): Point | undefined {
  const state = world.objects[id];
  if (!state || seen.has(id)) return undefined;
  const { where } = state;

  if ("on" in where) {
    const piece = pieceOf(geometry, where.on);
    const x = geometry.pieceX(where.on);
    if (!piece || x === undefined) return undefined;
    const down = piece.sink === where.dx ? SINK.depth : 0;
    return { x: x + where.dx, y: pieceTop(piece) + down };
  }
  if ("in" in where) {
    const holder = world.objects[where.in];
    const base = objectBase(world, where.in, geometry, new Set([...seen, id]));
    if (!holder || !base) return undefined;
    return {
      x: base.x + (where.dx ?? 0),
      y: base.y - OBJECT_SIZE[holder.kind].top - (INSIDE[state.kind] ?? 0),
    };
  }
  return undefined;
}

/** Where a hand takes hold of an object resting somewhere, facing `facing`: a pot's far handle is the one ahead. */
export function objectGrip(
  world: World,
  id: string,
  geometry: SetGeometry,
  facing: 1 | -1 = 1,
): Point | undefined {
  const base = objectBase(world, id, geometry);
  const kind = world.objects[id]?.kind;
  if (!base || !kind) return undefined;
  // Hanging from a hook, it is taken by the end that hangs there.
  if (hangs(world, id, geometry)) return { x: base.x, y: base.y + 2 };
  const { grip } = OBJECT_SIZE[kind];
  return { x: base.x + grip.x * facing, y: base.y - grip.y };
}

/** Whether a named place of the set is a counter's sink, which a pot is stood down in to fill. */
export function isSink(
  set: Pick<SetPlan, "places"> | undefined,
  geometry: SetGeometry,
  name: string,
): boolean {
  const place = set?.places?.[name];
  return place !== undefined && pieceOf(geometry, place.piece)?.sink === place.dx;
}

/** Whether an object hangs from a rail rather than standing on something. */
export function hangs(world: World, id: string, geometry: SetGeometry): boolean {
  const where = world.objects[id]?.where;
  return Boolean(where && "on" in where && pieceOf(geometry, where.on)?.kind === "rail");
}

/** Where a piece's surface is at `dx` from its middle. */
export function surfaceAt(geometry: SetGeometry, id: string, dx = 0): Point | undefined {
  const piece = pieceOf(geometry, id);
  const x = geometry.pieceX(id);
  return piece && x !== undefined ? { x: x + dx, y: pieceTop(piece) } : undefined;
}

/** A spot's middle in cast space and the way it faces, for one standing or sitting there; chairs are the stage's. */
export function spotAt(
  plan: Pick<SetPlan, "spots">,
  geometry: SetGeometry,
  spot: string,
  backdropX: (x: number) => number,
): { x: number; facing: 1 | -1 } | undefined {
  const at = plan.spots?.[spot];
  if (!at || "chair" in at) return undefined;
  if ("piece" in at) {
    const x = geometry.pieceX(at.piece);
    return x === undefined ? undefined : { x: x + at.dx, facing: at.facing };
  }
  return { x: backdropX(at.x), facing: at.facing };
}

/** What a stage point is worked out from: the world now, the set as laid out, and where the cast stand. */
export interface StageContext {
  world: World | undefined;
  set: Pick<SetPlan, "spots" | "places"> | undefined;
  geometry: SetGeometry;
  /** A backdrop x in cast units. */
  castX(x: number): number;
  /** A cast member's middle in cast units; undefined for a name that is not one of the cast. */
  middleOf(name: string): number | undefined;
  /** A chair's middle in cast units. */
  seatX(chair: number): number | undefined;
}

/**
 * A named point of the stage in cast units: an object (its grip, top or
 * base), a place or piece of the set (its surface), a person's head height,
 * a chair's seat, or a spot. Backdrop things are the stage's to add.
 */
export function stagePoint(
  context: StageContext,
  name: string,
  as: "grip" | "top" | "base",
  facing: 1 | -1,
): Point | undefined {
  const { world, set, geometry } = context;
  const state = world?.objects[name];
  if (world && state) {
    if (as === "grip") return objectGrip(world, name, geometry, facing);
    const base = objectBase(world, name, geometry);
    if (!base) return undefined;
    return as === "top" ? { x: base.x, y: base.y - OBJECT_SIZE[state.kind].top } : base;
  }
  const place = set?.places?.[name];
  if (place) return surfaceAt(geometry, place.piece, place.dx);
  const piece = surfaceAt(geometry, name);
  if (piece) return piece;
  const middle = context.middleOf(name);
  if (middle !== undefined) return { x: middle, y: 50 };
  const spot = set?.spots?.[name];
  if (spot && "chair" in spot) {
    const x = context.seatX(spot.chair);
    return x === undefined ? undefined : { x, y: SEAT_Y };
  }
  const at = set && spotAt(set, geometry, name, context.castX);
  return at && { x: at.x, y: 84 };
}

/** Chest high, where two people's hands meet to hand something over: six under the shoulders (66). Ten under, by the worktop, it read as handed at the hip. */
const HANDOVER_Y = 72;

/**
 * How high two hands meet between cast x `from` and `to`: chest high, or
 * above whatever stands between them, so a spoon handed across the stove
 * goes over the pot and not in front of it.
 */
export function handOverY(
  world: World,
  geometry: SetGeometry,
  from: number,
  to: number,
): number {
  const [left, right] = from < to ? [from, to] : [to, from];
  let y = HANDOVER_Y;
  for (const [id, state] of Object.entries(world.objects)) {
    if ("hand" in state.where) continue;
    const base = objectBase(world, id, geometry);
    if (!base || base.x < left + 4 || base.x > right - 4) continue;
    y = Math.min(y, base.y - OBJECT_SIZE[state.kind].top - 8);
  }
  return y;
}

/** The middle x of each piece in cast space, given where the anchored ones are. */
export function placePieces(
  pieces: readonly SetPiece[],
  anchored: (piece: SetPiece) => number | undefined,
): Map<string, number> {
  const placed = new Map<string, number>();
  const resolve = (piece: SetPiece, depth = 0): number | undefined => {
    if (placed.has(piece.id)) return placed.get(piece.id);
    if (depth > pieces.length) return undefined;
    let x: number | undefined;
    if (piece.at) {
      const from = pieces.find((other) => other.id === piece.at!.piece);
      const base = from ? resolve(from, depth + 1) : undefined;
      x = base === undefined ? undefined : base + piece.at.dx;
    } else {
      x = anchored(piece);
    }
    if (x !== undefined) placed.set(piece.id, x);
    return x;
  };
  for (const piece of pieces) resolve(piece);
  return placed;
}
