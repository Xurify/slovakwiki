import type { Weather } from "./scene-mood";

/**
 * How a figure's things look where it stands, from the weather falling on
 * it and the place itself: a scarf is on only in the snow, an umbrella
 * comes out up only in the rain, and headphones are on where the place
 * hands them out (the podcast studio). Indoors, or once on board the tram,
 * nothing falls on them. An umbrella that is out stays as it is until the
 * stage folds it.
 */
export interface Dress {
  headphones: boolean;
  scarf: boolean;
  umbrellaUp: boolean;
}

export function dressFor(
  weatherOnThem: Weather,
  place: { headphones?: boolean } = {},
): Dress {
  return {
    headphones: place.headphones ?? false,
    scarf: weatherOnThem === "snow",
    umbrellaUp: weatherOnThem === "rain",
  };
}
