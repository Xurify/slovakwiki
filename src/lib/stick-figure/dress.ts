import type { Weather } from "./scene-mood";

/**
 * How a figure's things look where it stands, from the weather falling on
 * it: an umbrella in hand is up only in the rain, and a scarf is on only
 * in the snow. Indoors, or once on board the tram, nothing falls on them,
 * so the umbrella folds and the scarf comes off. A thing that should react
 * to the weather gets its rule here, so no scene has to say "open it".
 */
export interface Dress {
  scarf: boolean;
  umbrellaUp: boolean;
}

export function dressFor(weatherOnThem: Weather): Dress {
  return { scarf: weatherOnThem === "snow", umbrellaUp: weatherOnThem === "rain" };
}
