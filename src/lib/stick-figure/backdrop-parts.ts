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
  cafe: {
    clock: { hand: 10, r: 17, ticks: true, x: 652, y: 42 },
    // Hangs from the ceiling: its pot's foot at 100, the trailing leaves past it.
    plant: { x: 472, y: 128 },
  },
  classroom: {
    clock: { hand: 12, r: 20, x: 800, y: 78 },
    plant: { x: 944, y: 232 },
  },
  default: {
    // The bench stands at the promenade's edge, its back to the river.
    bench: { ground: 266, width: 104, x: 616 },
    lamp: { ground: 262, x: 370 },
  },
  home: { plant: { x: 40, y: 244 } },
  plaza: {
    // Bench and tree stand past what a 1280-wide stage shows (x 120 to 840), whole on a wider one.
    bench: { ground: 250, width: 104, x: 4 },
    clock: { hand: 12, r: 17, x: 283, y: 128 },
    lamp: { ground: 238, x: 240 },
    tree: { ground: 250, planter: true, x: 902 },
  },
  kitchen: {
    clock: { hand: 10, r: 18, ticks: false, x: 496, y: 70 },
  },
  registration: {
    clock: { hand: 11, r: 20, ticks: true, x: 462, y: 54 },
    // A small pot at the binder shelf's end.
    plant: { x: 732, y: 132 },
  },
  street: {
    // The bench is in the shelter; the lamp stands on the platform between the tram's first door and
    // its middle bogie; the tree is past what a 1280-wide stage shows.
    bench: { ground: 268, width: 126, x: 220 },
    lamp: { ground: 276, x: 710 },
    tree: { ground: 272, x: 58 },
  },
  studio: {
    clock: { hand: 9, r: 16, ticks: true, x: 308, y: 76 },
    plant: { x: 706, y: 246 },
  },
} as const satisfies Partial<
  Record<
    StageSetting,
    { bench?: Bench; clock?: WallClock; lamp?: StreetLamp; plant?: Plant; tree?: Tree }
  >
>;
