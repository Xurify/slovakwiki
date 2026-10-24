import type { Weather } from "./scene-mood";

/** What a place puts on a head: the studio's open-back headphones, or a headset with a boom mic. */
export type Headwear = "headphones" | "headset";

/**
 * How a figure's things look where it stands, from the weather falling on
 * it and the place itself: a scarf is on only in the snow, an umbrella
 * comes out up only in the rain, and headwear is on where the place hands
 * it out (the podcast studio). Indoors, or once on board the tram, nothing
 * falls on them. An umbrella that is out stays as it is until the stage
 * folds it.
 */
export interface Dress {
  headwear?: Headwear;
  scarf: boolean;
  umbrellaUp: boolean;
}

export function dressFor(
  weatherOnThem: Weather,
  place: { headwear?: Headwear } = {},
): Dress {
  return {
    headwear: place.headwear,
    scarf: weatherOnThem === "snow",
    umbrellaUp: weatherOnThem === "rain",
  };
}
