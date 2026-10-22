import type { StickGestureId } from "./gestures";

/** Opening words of a line, folded (no diacritics, lowercase, words only). */
const OPENERS: Array<[string, StickGestureId]> = [
  ["ahoj", "wave"],
  ["ahojte", "wave"],
  ["cau", "wave"],
  ["dobry den", "wave"],
  ["dobry vecer", "wave"],
  ["dobre rano", "wave"],
  ["dobru noc", "wave"],
  ["dovidenia", "wave"],
  ["do videnia", "wave"],
  ["vitajte", "wave"],
  ["vitaj", "wave"],
  ["zdravim", "wave"],
  ["maj sa", "wave"],
  ["majte sa", "wave"],

  ["ano", "nod"],
  ["jasne", "nod"],
  ["dobre", "nod"],
  ["v poriadku", "nod"],
  ["presne", "nod"],
  ["spravne", "nod"],
  ["urcite", "nod"],
  ["tesi ma", "nod"],
  ["aj mna", "nod"],
  ["dakujem", "nod"],
  ["dakujeme", "nod"],
  ["vdaka", "nod"],
  ["rado sa stalo", "nod"],
  ["nie je za co", "nod"],

  ["nie", "shake"],
  ["nespravne", "shake"],
  ["vobec", "shake"],
  ["nikdy", "shake"],

  ["prepacte", "apologize"],
  ["prepac", "apologize"],
  ["pardon", "apologize"],
  ["ospravedlnujem", "apologize"],

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

export function foldLine(text: string): string {
  const words = text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("sk")
    .match(/\p{L}+/gu);

  return words ? words.join(" ") : "";
}

/**
 * Pick a gesture from what the line says, so every scene line animates
 * without hand-authored keyframes: greetings wave, "áno" nods, "nie"
 * shakes, questions open the hands, everything else gets a talking beat.
 */
export function gestureForLine(slovak: string): StickGestureId {
  const folded = foldLine(slovak);

  for (const [opener, gesture] of OPENERS_BY_LENGTH) {
    if (folded === opener || folded.startsWith(`${opener} `)) return gesture;
  }

  return slovak.includes("?") ? "ask" : "talk";
}
