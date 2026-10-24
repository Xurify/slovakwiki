import { backdropAlign, type Glass } from "./places";
import { STICK_BOX, type Point } from "./rig";
import type { StageSetting } from "./stage-setting";
import { thingBoxes, type SceneThing } from "./thing-words";

/** The backdrops' drawing space (StickBackdrop.svelte). */
export const BACKDROP_WIDTH = 960;
export const BACKDROP_HEIGHT = 300;

/** Px per backdrop unit on a stage `width` × `height` px: the drawing is sliced to fill it. */
export function backdropScale(width: number, height: number): number {
  return Math.max(width / BACKDROP_WIDTH, height / BACKDROP_HEIGHT);
}

/** Where a backdrop point lands on a stage `width` × `height` px, sliced to fill it as StickBackdrop draws it. */
export function backdropToStage(
  { x, y }: Point,
  width: number,
  height: number,
  align = 0.5,
): Point {
  const scale = backdropScale(width, height);
  return {
    x: (width - BACKDROP_WIDTH * scale) * align + x * scale,
    y: height - BACKDROP_HEIGHT * scale + y * scale,
  };
}

/** How much of a copy must be on the stage for it to count as there to tap. */
const IN_VIEW_SHARE = 0.6;

/**
 * The things a stage `width` × `height` px shows enough of to tap, most of
 * one copy inside it as the backdrop is sliced to fill it. A phone shows
 * the café's counter but not its window.
 */
export function thingsInView(
  things: readonly SceneThing[],
  setting: StageSetting,
  width: number,
  height: number,
): SceneThing[] {
  if (!width || !height) return [...things];

  const align = backdropAlign(setting);
  return things.filter((thing) =>
    thingBoxes(thing).some((box) => {
      const left = backdropToStage({ x: box.x, y: 0 }, width, height, align).x;
      const right = backdropToStage(
        { x: box.x + box.width, y: 0 },
        width,
        height,
        align,
      ).x;
      return Math.min(right, width) - Math.max(left, 0) >= (right - left) * IN_VIEW_SHARE;
    }),
  );
}

/** Where a point of the rig lands for a figure drawn `width` px wide at `left`, `top`. */
export function figureToStage(
  { x, y }: Point,
  { left, top, width }: { left: number; top: number; width: number },
  facing: 1 | -1,
): Point {
  const scale = width / STICK_BOX.width;
  return {
    x: left + (x * facing - STICK_BOX.x) * scale,
    y: top + (y - STICK_BOX.y) * scale,
  };
}

/** Pointing much lower or higher than this reads as a hanging arm or a hand up to ask. */
const MIN_RISE = -40;
const MAX_RISE = 40;

/** Which way to face and how many degrees above level to point, from `from` to `to` in screen px. */
export function aimAt(from: Point, to: Point): { facing: 1 | -1; rise: number } {
  const dx = to.x - from.x;
  const rise = (Math.atan2(from.y - to.y, Math.abs(dx)) * 180) / Math.PI;
  return {
    facing: dx < 0 ? -1 : 1,
    rise: Math.min(MAX_RISE, Math.max(MIN_RISE, rise)),
  };
}

/** The glass as an SVG path in backdrop units. */
export function glassPath({ arch, height, width, x, y }: Glass): string {
  if (!arch) return `M${x} ${y}h${width}v${height}h${-width}Z`;
  const r = width / 2;
  return `M${x} ${y + height}V${y + r}A${r} ${r} 0 0 1 ${x + width} ${y + r}V${y + height}Z`;
}
