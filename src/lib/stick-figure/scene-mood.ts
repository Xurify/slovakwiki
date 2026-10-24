import { foldLine, matchesWord, opens, type WordCues } from "./slovak-text";

export type TimeOfDay = "morning" | "day" | "evening" | "night";
export type Weather = "clear" | "sunny" | "cloudy" | "rain" | "snow";

export interface SceneMood {
  time: TimeOfDay;
  weather: Weather;
}

export const DAYTIME: SceneMood = { time: "day", weather: "clear" };

/** How long the sky takes to change, so rain coming on or easing off reads as weather, not a cut. */
export const WEATHER_FADE_MS = 900;

/** What each weather does: whether the sky is open, so the sun or the stars show, and what falls from it. */
const WEATHER_TRAITS: Record<Weather, { fair: boolean; falls?: "rain" | "snow" }> = {
  clear: { fair: true },
  cloudy: { fair: false },
  rain: { fair: false, falls: "rain" },
  snow: { fair: false, falls: "snow" },
  sunny: { fair: true },
};

/** No cloud, rain or snow: the sun or the stars can show. */
export function isFair(weather: Weather): boolean {
  return WEATHER_TRAITS[weather].fair;
}

/** Rain or snow coming down, or nothing. */
export function fallOf(weather: Weather): "rain" | "snow" | undefined {
  return WEATHER_TRAITS[weather].falls;
}

export function isFalling(weather: Weather): boolean {
  return fallOf(weather) !== undefined;
}

/** Evening and night: the lamps are lit and the birds have gone quiet. */
export function isDark(time: TimeOfDay): boolean {
  return time === "evening" || time === "night";
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
const WEATHER_CUES: Array<[Weather, WordCues]> = [
  ["rain", { stems: ["dazd"], words: ["prsi", "prsalo", "prsat"] }],
  ["snow", { stems: ["sneh"], words: ["snezi", "snezilo", "snezit"] }],
  ["sunny", { words: ["slnko", "slnecno"] }],
  ["cloudy", { stems: ["oblak", "mrak"], words: ["oblacno", "zamracene"] }],
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
      .map((line) => GREETING_TIMES.find(([greeting]) => opens(line, greeting))?.[1])
      .find(Boolean) ?? "day";
  const weather =
    folded
      .slice(0, upTo + 1)
      .flatMap((line) => line.split(" "))
      .map((word) => WEATHER_CUES.find(([, cues]) => matchesWord(word, cues))?.[0])
      .findLast(Boolean) ?? "clear";

  const over = upTo >= lines.length && isFalling(weather);
  return { time, weather: over ? "cloudy" : weather };
}
