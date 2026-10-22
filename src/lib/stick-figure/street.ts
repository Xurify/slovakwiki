/** Where the street's tram is: waiting off the right edge, pulling in, or stopped at the sign. */
export type TramState = "away" | "coming" | "here";

/** The tram as the street backdrop draws it, in backdrop px, once it has stopped. */
export const TRAM = {
  /** The middle of its door, where the cast gets on. */
  door: 621,
  /** How far off the right edge it waits, and how long it takes to pull in. */
  away: 460,
  ms: 2600,
} as const;
