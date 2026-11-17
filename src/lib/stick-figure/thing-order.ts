import type { SceneThing, ThingBox } from "./thing-words";

/** Boxes starting closer than this across, in backdrop units, count as one above the other. */
const SAME_X = 1;

const centreX = (box: ThingBox) => box.x + box.width / 2;
const centreY = (box: ThingBox) => box.y + box.height / 2;

/**
 * Where the wall stops and the room's floor and furniture begin, in
 * backdrop units down: half way down the 300 of the drawing.
 */
const ROW_SPLIT = 150;

/**
 * The order Left and Right walk the things in: the things up on the wall
 * and in the sky first, then the ones down at the cast's height, each row
 * from left to right by where each box starts. By centres alone the keys
 * went up and down the room (robot, hrnček, vankúš, obraz at home), and
 * from the café's lamp back left to the window it hangs in front of.
 * Boxes that start at the same x go top first.
 */
export function arrowOrder<T extends { box: ThingBox }>(hits: readonly T[]): T[] {
  const row = (box: ThingBox) => (centreY(box) < ROW_SPLIT ? 0 : 1);
  return hits.slice().sort((a, b) => {
    const rows = row(a.box) - row(b.box);
    if (rows) return rows;
    const across = a.box.x - b.box.x;
    return Math.abs(across) >= SAME_X ? across : centreY(a.box) - centreY(b.box);
  });
}

/**
 * The thing Up or Down goes to from `from`, an index in `ordered`: the
 * nearest whose centre lies above (dir -1) or below (dir 1) the centre of
 * this one's box, nearest across first. None there keeps the focus put.
 */
export function verticalNeighbour(
  ordered: readonly { box: ThingBox }[],
  from: number,
  dir: 1 | -1,
): number {
  const here = ordered[from]?.box;
  if (!here) return from;
  let best = from;
  let score = Number.POSITIVE_INFINITY;
  ordered.forEach(({ box }, index) => {
    const down = (centreY(box) - centreY(here)) * dir;
    // A box must clear the half-height of this one, or it sits in the same row.
    if (index === from || down <= here.height / 2) return;
    const cost = Math.abs(centreX(box) - centreX(here)) * 2 + down;
    if (cost < score) {
      score = cost;
      best = index;
    }
  });
  return best;
}

/** A box cut to the part of the drawing the stage shows, `pad` inside its edges, so a ring never runs past them. */
export function clipBox(
  box: ThingBox,
  view: { x: number; y: number; width: number; height: number },
  pad = 0,
): ThingBox {
  const left = Math.max(box.x, view.x + pad);
  const top = Math.max(box.y, view.y + pad);
  const right = Math.min(box.x + box.width, view.x + view.width - pad);
  const bottom = Math.min(box.y + box.height, view.y + view.height - pad);
  return {
    ...box,
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

/**
 * The order the tap targets are laid one over another, bottom first, so a
 * tap where two overlap goes to the one in front: scenery at the back
 * (`behind`) under everything, the set's things (`of`) over the backdrop's,
 * as the set is drawn over it, and otherwise the smaller box on top, so
 * what stands in front of a bigger thing (the fountain before a house, the
 * TV in the bookcase) gets its tap.
 */
export function tapOrder<
  T extends { box: ThingBox; thing: Pick<SceneThing, "of" | "behind"> },
>(hits: readonly T[]): T[] {
  const layer = ({ thing }: T) => (thing.behind ? 0 : thing.of ? 2 : 1);
  return hits
    .slice()
    .sort(
      (a, b) =>
        layer(a) - layer(b) || b.box.width * b.box.height - a.box.width * a.box.height,
    );
}
