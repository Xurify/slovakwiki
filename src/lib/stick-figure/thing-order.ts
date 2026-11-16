import type { ThingBox } from "./thing-words";

/** Centres closer than this across, in backdrop units, count as one above the other. */
const SAME_X = 1;

const centreX = (box: ThingBox) => box.x + box.width / 2;
const centreY = (box: ThingBox) => box.y + box.height / 2;

/**
 * The order Left and Right walk the things in: by the centre of each box
 * across the screen, so a step right never lands further left. Boxes that
 * stand one above the other go top first.
 */
export function arrowOrder<T extends { box: ThingBox }>(hits: readonly T[]): T[] {
  return hits.slice().sort((a, b) => {
    const across = centreX(a.box) - centreX(b.box);
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
