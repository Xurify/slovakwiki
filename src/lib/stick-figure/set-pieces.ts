import type { ObjectKind, SetPlan, World } from "./acts";
import { GROUND_Y, type Point } from "./rig";

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
 * a pot by both handles at its rim, turned side-on as it comes up (the
 * hands meet over its middle), a spoon by the end of its handle, a cup by
 * the handle on its right, a bowl from underneath. `top` is how tall it
 * stands, for what goes in or on it.
 */
export const OBJECT_SIZE: Record<
  ObjectKind,
  { grip: Point; top: number; width: number }
> = {
  pot: { grip: { x: 0, y: 12.5 }, top: 15, width: 31 },
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
  keys: { grip: { x: 0, y: 2 }, top: 1, width: 5 },
  mic: { grip: { x: 0, y: 3 }, top: 10, width: 4 },
  cup: { grip: { x: 5, y: 4 }, top: 7, width: 9 },
  can: { grip: { x: -2, y: 14 }, top: 12, width: 26 },
  plant: { grip: { x: 0, y: 12 }, top: 24, width: 25 },
  headphones: { grip: { x: 0, y: 6 }, top: 6, width: 10 },
};

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
    return { x: x + where.dx, y: pieceTop(piece) };
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
