/**
 * `count` points over a `width` × `height` box from `left`, the same for a
 * seed every time, so stars and drops do not reshuffle between renders.
 * `size` runs 0–1.
 */
export function scatter(
  count: number,
  seed: number,
  width: number,
  height: number,
  left = 0,
): Array<{ size: number; x: number; y: number }> {
  let state = seed;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  return Array.from({ length: count }, () => ({
    size: next(),
    x: left + next() * width,
    y: next() * height,
  }));
}
