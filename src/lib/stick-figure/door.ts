import type { Point } from "./rig";
import type { StageSetting } from "./stage-setting";

/** How long the door takes to swing open, and shut: about a second, as a door does. */
export const DOOR_OPEN_MS = 1100;
export const DOOR_SHUT_MS = 800;

/**
 * How far the door swings in for someone to come through: wide enough to
 * pass, and its handle still in reach of whoever pushes it to from beside
 * it. At 0.5 the handle swung further than an arm reaches.
 */
export const AJAR = 0.38;

/** A door in the backdrop, in its units: hinged at `hinge`, its free edge at `edge` shut, `top` to the floor `height` below. */
export interface Door {
  hinge: number;
  edge: number;
  top: number;
  height: number;
}

/** The places whose door swings open on stage. */
export const DOORS: Partial<Record<StageSetting, Door>> = {
  kitchen: { hinge: 196, edge: 256, top: 46, height: 180 },
  studio: { hinge: 196, edge: 256, top: 46, height: 180 },
};

/** The handle, `u` across from the hinge and `v` down the door. */
export const HANDLE = { u: 0.8, v: 0.511 };

/**
 * A point on the door swung `open` (0 shut, 1 wide open against the wall),
 * `u` from its hinge to its free edge and `v` from top to bottom. The free
 * edge swings from the frame's far side round past the hinge toward us, so
 * it grows a little taller as it comes near.
 */
export function doorPoint(door: Door, open: number, u: number, v: number): Point {
  const width = door.edge - door.hinge;
  const edge = door.edge - width * 1.43 * open;
  const near = 10 * open * u;
  return {
    x: door.hinge + (edge - door.hinge) * u,
    y: door.top - near + (door.height + 2 * near) * v,
  };
}
