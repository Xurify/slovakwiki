import { answersForTime, type QuarterMinute } from "$lib/learning/time/clock";
import { foldLine, matchesWord, opens, type WordCues } from "./slovak-text";

export type TimeOfDay = "morning" | "day" | "evening" | "night";
export type Weather = "clear" | "sunny" | "cloudy" | "rain" | "snow";

export interface SceneMood {
  time: TimeOfDay;
  weather: Weather;
  /** The hour the lines tell, with its minutes as a fraction (11.5 for pol dvanástej); the time of day's hour when they tell none. */
  hour?: number;
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
/** What a clock shows: the hour the scene tells, or the time of day's. */
export function clockHour(mood: SceneMood): number {
  return mood.hour ?? CLOCK_HOURS[mood.time];
}

/** Words that make a told time a time of day: pol, štvrť, trištvrte, hodín, poludnie. A bare number may be a count. */
const TELLING_WORDS = [
  "pol",
  "stvrt",
  "tristvrte",
  "hodin",
  "hodina",
  "hodiny",
  "poludnie",
  "polnoc",
];
/** Before a time, these make it a time something happens at or by, not the time now: O dvanástej ide von. */
const NOT_NOW = new Set(["o", "do", "od", "po", "okolo", "pred", "na"]);

/** Every way to tell each quarter hour, folded, longest first, with the hour it tells. */
const TOLD_TIMES: ReadonlyArray<[string, number]> = Array.from(
  { length: 24 },
  (_, hour) =>
    ([0, 15, 30, 45] as QuarterMinute[]).flatMap((minute) =>
      answersForTime({ hour, minute })
        .map(foldLine)
        .filter((said) => said.split(" ").some((word) => TELLING_WORDS.includes(word)))
        .map((said): [string, number] => [said, hour + minute / 60]),
    ),
)
  .flat()
  .sort(([a], [b]) => b.length - a.length);

/**
 * The hour the first line that tells the time now says (`Pol dvanástej.`,
 * `Je sedem hodín.`), on a 12-hour face: a time something happens at
 * (`O dvanástej ide von.`) is not the time now.
 */
export function toldHour(lines: readonly string[]): number | undefined {
  for (const line of lines) {
    const folded = ` ${foldLine(line)} `;
    for (const [said, hour] of TOLD_TIMES) {
      const at = folded.indexOf(` ${said} `);
      if (at < 0) continue;
      const before = folded.slice(0, at).trim().split(" ").at(-1) ?? "";
      if (!NOT_NOW.has(before)) return hour % 12;
    }
  }
  return undefined;
}

/** A told time with the part of the day after it, on a scene card: Šesť hodín večer. Pol deviatej ráno. */
function toldTimeOfDay(folded: string): TimeOfDay | undefined {
  const line = ` ${folded} `;
  for (const [said] of TOLD_TIMES) {
    for (const [part, time] of [
      ["rano", "morning"],
      ["vecer", "evening"],
    ] as const) {
      const at = line.indexOf(` ${said} ${part} `);
      if (at < 0) continue;
      const before = line.slice(0, at).trim().split(" ").at(-1) ?? "";
      if (!NOT_NOW.has(before)) return time;
    }
  }
  return undefined;
}

export const WEATHERS: readonly Weather[] = ["clear", "sunny", "cloudy", "rain", "snow"];

/** Folded greetings that tell the time of day; Dobrý deň says nothing new. */
const GREETING_TIMES: Array<[string, TimeOfDay]> = [
  ["dobre rano", "morning"],
  ["dobry vecer", "evening"],
  ["dobru noc", "night"],
];

/** Folded phrases that say what time of day it is now, anywhere in a line; zajtra ráno is another day. */
const SAID_TIMES: Array<[string, TimeOfDay]> = [
  ["je rano", "morning"],
  ["je skoro rano", "morning"],
  ["je este skoro rano", "morning"],
  ["je este strasne skoro", "morning"],
  ["je strasne skoro", "morning"],
  ["je vecer", "evening"],
  ["je uz vecer", "evening"],
  ["je noc", "night"],
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
 * first greeting or line that names the time of day (`Je ráno.`), the time a line tells for the
 * clocks, and the weather named last by
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
          GREETING_TIMES.find(([greeting]) => opens(line, greeting))?.[1] ??
          SAID_TIMES.find(([said]) => ` ${line} `.includes(` ${said} `))?.[1] ??
          toldTimeOfDay(line),
      )
      .find(Boolean) ?? "day";
  const weather =
    folded
      .slice(0, upTo + 1)
      .flatMap((line) => line.split(" "))
      .map((word) => WEATHER_CUES.find(([, cues]) => matchesWord(word, cues))?.[0])
      .findLast(Boolean) ?? "clear";

  const over = upTo >= lines.length && isFalling(weather);
  const hour = toldHour(lines);
  return {
    time,
    weather: over ? "cloudy" : weather,
    ...(hour === undefined ? {} : { hour }),
  };
}
