import type { StickGestureId } from "./gestures";
import { APOLOGIES, GOODBYES, HELLOS, THANKS, foldLine, opens } from "./slovak-text";

type Opener = [phrase: string, gesture: StickGestureId];

/** Opening words of a line, folded (no diacritics, lowercase, words only). */
const OPENERS: Opener[] = [
  ...[...HELLOS, ...GOODBYES].map((phrase): Opener => [phrase, "wave"]),

  ["ano", "nod"],
  ["jasne", "nod"],
  ["dobre", "nod"],
  ["v poriadku", "nod"],
  ["presne", "nod"],
  ["spravne", "nod"],
  ["urcite", "nod"],
  ["tesi ma", "nod"],
  ["aj mna", "nod"],
  ...THANKS.map((phrase): Opener => [phrase, "nod"]),
  ["rado sa stalo", "nod"],
  ["nie je za co", "nod"],

  ["nie", "shake"],
  ["nespravne", "shake"],
  ["vobec", "shake"],
  ["nikdy", "shake"],

  ...APOLOGIES.map((phrase): Opener => [phrase, "apologize"]),

  ["volam sa", "self"],
  ["moje meno", "self"],
  ["ja som", "self"],
  ["som", "self"],
  ["ja", "self"],

  ["trochu", "shrug"],
  ["neviem", "shrug"],
  ["ja neviem", "shrug"],
  ["ani neviem", "shrug"],
  ["asi", "shrug"],

  ["mozno", "think"],
  ["hm", "think"],
  ["hmm", "think"],
  ["pockajte", "think"],
  ["pockaj", "think"],

  ["tam", "point"],
  ["tamto", "point"],
  ["tu", "point"],
  ["tuto", "point"],
  ["vlavo", "point"],
  ["vpravo", "point"],
  ["rovno", "point"],
  ["pozrite", "point"],
  ["pozri", "point"],

  ["super", "cheer"],
  ["vyborne", "cheer"],
  ["skvele", "cheer"],
  ["hura", "cheer"],
  ["paradne", "cheer"],
  ["bravo", "cheer"],
];

/** Longest first, so "nie je za co" wins over "nie" and "ja neviem" over "ja". */
const OPENERS_BY_LENGTH = [...OPENERS].sort(([a], [b]) => b.length - a.length);

/**
 * Pick a gesture from what the line says, so every scene line animates
 * without hand-authored keyframes: greetings wave, "áno" nods, "nie"
 * shakes, questions open the hands, an exclamation gets a beat of the
 * hand, words that trail off a tilt of the head, and a plain statement
 * a small open hand.
 */
export function gestureForLine(slovak: string): StickGestureId {
  const folded = foldLine(slovak);
  const opener = OPENERS_BY_LENGTH.find(([phrase]) => opens(folded, phrase));
  if (opener) return opener[1];
  if (slovak.includes("?")) return "ask";
  if (slovak.includes("!")) return "stress";
  if (slovak.includes("…")) return "muse";
  return "tell";
}
