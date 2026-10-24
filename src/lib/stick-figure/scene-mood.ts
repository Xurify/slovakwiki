import type { StageSetting } from "./stage-setting";
import { foldLine } from "./line-gesture";

export type TimeOfDay = "morning" | "day" | "evening" | "night";
export type Weather = "clear" | "sunny" | "cloudy" | "rain" | "snow";

export interface SceneMood {
  time: TimeOfDay;
  weather: Weather;
}

export const DAYTIME: SceneMood = { time: "day", weather: "clear" };

/** How long the sky takes to change, so rain coming on or easing off reads as weather, not a cut. */
export const WEATHER_FADE_MS = 900;

/** No cloud, rain or snow: the sun or the stars can show. */
export function isFair(weather: Weather): boolean {
  return weather === "clear" || weather === "sunny";
}

export function isFalling(weather: Weather): boolean {
  return weather === "rain" || weather === "snow";
}

const OUTDOORS: readonly StageSetting[] = ["default", "market", "plaza", "street"];

/** Under the sky, where weather falls on everything and the cast dresses for it. */
export function isOutdoors(setting: StageSetting): boolean {
  return OUTDOORS.includes(setting);
}

export const TIMES_OF_DAY: readonly TimeOfDay[] = ["morning", "day", "evening", "night"];

/** The hour the clocks in a place show at each time of day. */
export const CLOCK_HOURS: Record<TimeOfDay, number> = {
  day: 13,
  evening: 19,
  morning: 8,
  night: 23,
};
export const WEATHERS: readonly Weather[] = ["clear", "sunny", "cloudy", "rain", "snow"];

/** Folded greetings that tell the time of day; Dobrý deň says nothing new. */
const GREETING_TIMES: Array<[string, TimeOfDay]> = [
  ["dobre rano", "morning"],
  ["dobry vecer", "evening"],
  ["dobru noc", "night"],
];

/** Folded words for the weather: prší, sneží and slnko whole, dážď, sneh and oblak in any case. Sunny is clear with the sun out. */
const WEATHER_WORDS: Array<[string, Weather]> = [
  ["prsi", "rain"],
  ["prsalo", "rain"],
  ["prsat", "rain"],
  ["snezi", "snow"],
  ["snezilo", "snow"],
  ["snezit", "snow"],
  ["slnko", "sunny"],
  ["slnecno", "sunny"],
  ["oblacno", "cloudy"],
  ["zamracene", "cloudy"],
];
const WEATHER_STEMS: Array<[string, Weather]> = [
  ["dazd", "rain"],
  ["sneh", "snow"],
  ["oblak", "cloudy"],
  ["mrak", "cloudy"],
];

/**
 * The light and weather a scene's own words call for at line `upTo`: the
 * first greeting that names a time of day, and the weather named last by
 * then, so a sky that clouds over and rains changes as the lines say so.
 * Without `upTo`, the weather the scene ends in. Past the last line the
 * scene is over and rain or snow has let up, so it does not end mid-shower.
 */
export function sceneMood(lines: readonly string[], upTo = lines.length - 1): SceneMood {
  const folded = lines.map(foldLine);
  const time =
    folded
      .map(
        (line) =>
          GREETING_TIMES.find(
            ([greeting]) => line === greeting || line.startsWith(`${greeting} `),
          )?.[1],
      )
      .find(Boolean) ?? "day";
  const weather =
    folded
      .slice(0, upTo + 1)
      .flatMap((line) => line.split(" "))
      .map(
        (word) =>
          WEATHER_WORDS.find(([whole]) => word === whole)?.[1] ??
          WEATHER_STEMS.find(([stem]) => word.startsWith(stem))?.[1],
      )
      .findLast(Boolean) ?? "clear";

  const over = upTo >= lines.length && isFalling(weather);
  return { time, weather: over ? "cloudy" : weather };
}
