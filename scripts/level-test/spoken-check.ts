import path from "node:path";

import { readJsonFile } from "../lib/json-file";
import { ROOT } from "../lib/paths";

export const SPOKEN_CHECK_PATH = path.join(
  ROOT,
  "content",
  "level-test",
  "spoken-check.json",
);

export interface SpokenCheck {
  heard: string;
  /** True when every word heard is attested Slovak and is not the pseudoword itself. */
  heardAsReal: boolean;
}

export function loadSpokenChecks(): Promise<Record<string, SpokenCheck>> {
  return readJsonFile<Record<string, SpokenCheck>>(SPOKEN_CHECK_PATH, {});
}

export const LENGTH_CHECK_PATH = path.join(
  ROOT,
  "content",
  "level-test",
  "length-check.json",
);

export interface LengthCheck {
  heard: string;
  /** True when speech-to-text heard exactly this word, vowel length included. */
  clear: boolean;
  /** Milliseconds of speech in the clip, leading and trailing silence cut. */
  speechMs?: number;
}

/**
 * How much longer the long clip of a pair must be for the length to be heard.
 * A long vowel adds about 100 ms in these clips; pairs under 50 ms are the
 * ones where the voice barely lengthened it.
 */
export const MIN_LENGTH_GAP_MS = 50;

/**
 * Speech-to-text on one isolated word favours the commoner form (it hears
 * pary as pár, vina as vína), so its verdict only decides a pair until both
 * clips have been timed.
 */
export function lengthAudible(
  short: string,
  long: string,
  checks: Readonly<Record<string, LengthCheck>>,
): boolean {
  const shortMs = checks[short]?.speechMs;
  const longMs = checks[long]?.speechMs;
  if (shortMs !== undefined && longMs !== undefined) {
    return longMs - shortMs >= MIN_LENGTH_GAP_MS;
  }
  return checks[short]?.clear !== false && checks[long]?.clear !== false;
}

/** Short/long vowel clips, transcribed and timed: an inaudible pair drops out. */
export function loadLengthChecks(): Promise<Record<string, LengthCheck>> {
  return readJsonFile<Record<string, LengthCheck>>(LENGTH_CHECK_PATH, {});
}
