/** Where the street's tram is: waiting off the right edge, pulling in, or stopped at the sign. */
export type TramState = "away" | "coming" | "here";

/** The tram as the street backdrop draws it, in backdrop px, once it has stopped. */
export const TRAM = {
  /** The middle of its door, where the cast gets on. */
  door: 640,
  /** How far off the right edge it waits, and how long it takes to pull in. */
  away: 700,
  ms: 2600,
} as const;

/** CSS's `ease-out`, cubic-bezier(0, 0, 0.58, 1), which Street.svelte pulls the tram in with: progress at time fraction `t`. */
function easeOutCss(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const bezier = (u: number, a: number, b: number) =>
    3 * (1 - u) * (1 - u) * u * a + 3 * (1 - u) * u * u * b + u * u * u;
  let low = 0;
  let high = 1;
  for (let step = 0; step < 30; step += 1) {
    const u = (low + high) / 2;
    if (bezier(u, 0, 0.58) < t) low = u;
    else high = u;
  }
  return bezier((low + high) / 2, 0, 1);
}

/** How far right of its stop, in backdrop px, the tram still is `ms` after it starts to pull in: where a look or a point follows it. */
export function tramShift(ms: number): number {
  return TRAM.away * (1 - easeOutCss(ms / TRAM.ms));
}
