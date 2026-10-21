import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";
import { foldLine } from "./line-gesture";

export type TimeOfDay = "morning" | "day" | "evening" | "night";
export type Weather = "clear" | "rain" | "snow";

export interface SceneMood {
  time: TimeOfDay;
  weather: Weather;
}

export const DAYTIME: SceneMood = { time: "day", weather: "clear" };

const OUTDOORS: readonly LessonSceneArtId[] = ["default", "market", "plaza"];

/** Under the sky, where weather falls on everything and the cast dresses for it. */
export function isOutdoors(setting: LessonSceneArtId): boolean {
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
export const WEATHERS: readonly Weather[] = ["clear", "rain", "snow"];

/** Folded greetings that tell the time of day; Dobrý deň says nothing new. */
const GREETING_TIMES: Array<[string, TimeOfDay]> = [
  ["dobre rano", "morning"],
  ["dobry vecer", "evening"],
  ["dobru noc", "night"],
];

/** Folded words for the weather: prší and sneží whole, dážď and sneh in any case. */
const WEATHER_WORDS: Array<[string, Weather]> = [
  ["prsi", "rain"],
  ["prsalo", "rain"],
  ["prsat", "rain"],
  ["snezi", "snow"],
  ["snezilo", "snow"],
  ["snezit", "snow"],
];
const WEATHER_STEMS: Array<[string, Weather]> = [
  ["dazd", "rain"],
  ["sneh", "snow"],
];

/**
 * The light and weather a scene's own words call for: the first greeting
 * that names a time of day, and rain or snow if anyone mentions it.
 */
export function sceneMood(lines: readonly string[]): SceneMood {
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
      .flatMap((line) => line.split(" "))
      .map(
        (word) =>
          WEATHER_WORDS.find(([whole]) => word === whole)?.[1] ??
          WEATHER_STEMS.find(([stem]) => word.startsWith(stem))?.[1],
      )
      .find(Boolean) ?? "clear";

  return { time, weather };
}
