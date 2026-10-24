import type { Weather } from "./scene-mood";

/**
 * How a figure's things look where it stands, from the weather falling on
 * it: a scarf is on only in the snow, and an umbrella comes out up only in
 * the rain. Indoors, or once on board the tram, nothing falls on them. An
 * umbrella that is out stays as it is until the stage folds it.
 */
export interface Dress {
  scarf: boolean;
  umbrellaUp: boolean;
}

export function dressFor(weatherOnThem: Weather): Dress {
  return { scarf: weatherOnThem === "snow", umbrellaUp: weatherOnThem === "rain" };
}
