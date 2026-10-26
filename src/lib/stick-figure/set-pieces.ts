import type { ObjectKind, SetObject, World } from "./acts";
import { GROUND_Y, type Point } from "./rig";

/**
 * Work surfaces a place's cast uses with their hands: a counter with a
 * sink, a stove. Unlike the backdrop, they are drawn at the cast's scale
 * and stand on the cast's floor, in rig units (StickSet.svelte), so a hand
 * reaching for the pot lands on the pot at any stage size.
 */
export type PieceKind = "counter" | "stove";

export interface SetPiece {
  id: string;
  kind: PieceKind;
  /** Its middle, as an x in the backdrop drawing. */
  x: number;
}

/** Size in rig units: a figure is about 96 tall, so 50 is a 90 cm worktop. */
export const PIECE_SIZE: Record<PieceKind, { width: number; height: number }> = {
  counter: { width: 64, height: 50 },
  stove: { width: 38, height: 50 },
};

export function pieceTop(kind: PieceKind): number {
  return GROUND_Y - PIECE_SIZE[kind].height;
}

/**
 * Where a hand holds each kind, above the point it stands on: a pot by its
 * rim, a spoon by the end of its handle. `top` is how tall it stands, for
 * what goes in or on it.
 */
export const OBJECT_SIZE: Record<ObjectKind, { grip: number; top: number }> = {
  pot: { grip: 15, top: 15 },
  lid: { grip: 4, top: 4 },
  crock: { grip: 11, top: 11 },
  spoon: { grip: 5, top: 15 },
};

/** Where an object sits inside another: a lid on the rim, a spoon standing in the crock. */
const INSIDE: Partial<Record<ObjectKind, number>> = {
  lid: 0,
  spoon: -2,
};

export interface SetGeometry {
  /** A piece's middle in cast space, rig units from the stage's left edge. */
  pieceX(id: string): number | undefined;
  pieces: readonly SetPiece[];
}

/**
 * Where an object stands, in cast space (x rig units from the stage's left
 * edge, y in rig units as a figure's): its base and its grip. Undefined in
 * someone's hand, where the figure draws it.
 */
export function objectBase(
  world: World,
  id: string,
  objects: readonly SetObject[],
  geometry: SetGeometry,
): Point | undefined {
  const state = world.objects[id];
  const kind = objects.find((object) => object.id === id)?.kind;
  if (!state || !kind) return undefined;
  const { where } = state;

  if ("on" in where) {
    const piece = geometry.pieces.find((candidate) => candidate.id === where.on);
    const x = geometry.pieceX(where.on);
    if (!piece || x === undefined) return undefined;
    return { x: x + where.dx, y: pieceTop(piece.kind) };
  }
  if ("in" in where) {
    const holder = objects.find((object) => object.id === where.in);
    const base = objectBase(world, where.in, objects, geometry);
    if (!holder || !base) return undefined;
    return { x: base.x, y: base.y - OBJECT_SIZE[holder.kind].top - (INSIDE[kind] ?? 0) };
  }
  return undefined;
}

export function objectGrip(
  world: World,
  id: string,
  objects: readonly SetObject[],
  geometry: SetGeometry,
): Point | undefined {
  const base = objectBase(world, id, objects, geometry);
  const kind = objects.find((object) => object.id === id)?.kind;
  if (!base || !kind) return undefined;
  return { x: base.x, y: base.y - OBJECT_SIZE[kind].grip };
}

/** Where someone stands to work at a piece: at its left end, facing it, an arm's length from its middle. */
export function spotX(geometry: SetGeometry, spot: string): number | undefined {
  const piece = geometry.pieces.find((candidate) => candidate.id === spot);
  const x = geometry.pieceX(spot);
  if (!piece || x === undefined) return undefined;
  return x - PIECE_SIZE[piece.kind].width / 2 - 8;
}
