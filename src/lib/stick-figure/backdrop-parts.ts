import type { StageSetting } from "./stage-setting";
import type { Rect } from "./thing-words";

/**
 * Scenery that more than one place draws and a learner can tap: where each
 * piece stands, and the box a tap finds it in. The backdrops draw them from
 * these same numbers, so moving one here moves the drawing and its box
 * together.
 */

/** A potted plant, its pot standing on the floor at x, y. */
export interface Plant {
  x: number;
  y: number;
}

/** A wall clock round x, y with a rim `r`, an hour hand `hand` long, and marks at the quarters. */
export interface WallClock {
  hand: number;
  r: number;
  ticks?: boolean;
  x: number;
  y: number;
}

/** A town tree on the ground at x, or in a planter on the square. */
export interface Tree {
  ground: number;
  planter?: boolean;
  x: number;
}

export interface StreetLamp {
  ground: number;
  x: number;
}

/** A bench from x, `width` long; the square's, 112 long, is the one the others scale. */
export interface Bench {
  ground: number;
  width: number;
  x: number;
}

/** The square's bench is 112 wide and stands 51 tall. */
export const BENCH = { height: 51, width: 112 };
/** Every lamp's head is at the same height, whatever the ground under it. */
export const LAMP_TOP = 66;
/** A town tree's crown starts here, the same on every street. */
export const TREE_TOP = 100;

export function plantBox({ x, y }: Plant): Rect {
  return [x - 22, y - 108, 44, 108];
}

export function clockBox({ r, x, y }: WallClock): Rect {
  return [x - r, y - r, 2 * r, 2 * r];
}

export function treeBox({ ground, x }: Tree): Rect {
  return [x - 48, TREE_TOP, 98, ground - TREE_TOP];
}

export function lampBox({ ground, x }: StreetLamp): Rect {
  return [x - 14, LAMP_TOP, 28, ground - LAMP_TOP];
}

export function benchBox({ ground, width, x }: Bench): Rect {
  const height = Math.round((BENCH.height * width) / BENCH.width);
  return [x, ground - height, width, height];
}

/** Where each place's shared scenery stands. */
export const PARTS = {
  cafe: { plant: { x: 44, y: 246 } },
  classroom: {
    clock: { hand: 12, r: 20, x: 800, y: 78 },
    plant: { x: 944, y: 232 },
  },
  default: {
    bench: { ground: 266, width: 104, x: 662 },
    lamp: { ground: 264, x: 252 },
  },
  home: { plant: { x: 40, y: 244 } },
  plaza: {
    bench: { ground: 251, width: 112, x: 24 },
    clock: { hand: 9, r: 14, x: 283, y: 128 },
    lamp: { ground: 231, x: 779 },
    tree: { ground: 250, planter: true, x: 902 },
  },
  kitchen: {
    clock: { hand: 10, r: 18, ticks: false, x: 520, y: 70 },
  },
  registration: {
    clock: { hand: 12, r: 24, ticks: true, x: 300, y: 72 },
    plant: { x: 256, y: 228 },
  },
  street: {
    bench: { ground: 279, width: 130, x: 668 },
    lamp: { ground: 257, x: 300 },
    tree: { ground: 258, x: 100 },
  },
  studio: {
    clock: { hand: 10, r: 18, ticks: true, x: 289, y: 74 },
    plant: { x: 724, y: 246 },
  },
} as const satisfies Partial<
  Record<
    StageSetting,
    { bench?: Bench; clock?: WallClock; lamp?: StreetLamp; plant?: Plant; tree?: Tree }
  >
>;
