/**
 * Slovak text as the stage reads it. A line is folded (words only, lower
 * case, no diacritics) before it is matched, so "Ďakujem!" and "dakujem"
 * meet, and every list of phrases the stage looks for is written folded.
 */

/** "Ďakujem, Anna!" → "dakujem anna". */
export function foldLine(text: string): string {
  const words = text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("sk")
    .match(/\p{L}+/gu);

  return words ? words.join(" ") : "";
}

/** The sentences of a line, each with its end mark. */
export function lineSentences(slovak: string): string[] {
  return (slovak.match(/[^.!?…]+[.!?…]*/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter((sentence) => /\p{L}/u.test(sentence));
}

/** The words of a line, in the order they are said. */
export function lineWords(slovak: string): string[] {
  return slovak.match(/\p{L}+/gu) ?? [];
}

/** Which sentence each of the line's words is in. */
export function wordSentences(slovak: string): number[] {
  return lineSentences(slovak).flatMap((sentence, index) =>
    lineWords(sentence).map(() => index),
  );
}

/** Whether folded text opens with a folded phrase, word for word: "dobry den anna" opens with "dobry den". */
export function opens(folded: string, phrase: string): boolean {
  return folded === phrase || folded.startsWith(`${phrase} `);
}

/** Whether a sentence opens with one of the phrases. */
export function opensWith(sentence: string, phrases: readonly string[]): boolean {
  const folded = foldLine(sentence);
  return phrases.some((phrase) => opens(folded, phrase));
}

/** Whether a sentence says one of the phrases anywhere, as whole words. */
export function mentions(sentence: string, phrases: readonly string[]): boolean {
  const folded = ` ${foldLine(sentence)} `;
  return phrases.some((phrase) => folded.includes(` ${phrase} `));
}

/**
 * What a folded word can be: one of `words` whole, or any word that starts
 * with one of `stems`. Whole words stay whole where a stem would catch
 * something else (`kav` is also in `kaviareň`).
 */
export interface WordCues {
  stems?: readonly string[];
  words?: readonly string[];
}

export function matchesWord(
  folded: string,
  { stems = [], words = [] }: WordCues,
): boolean {
  return words.includes(folded) || stems.some((stem) => folded.startsWith(stem));
}

/** Hellos: the speaker waves, and someone who opens with one after the start walks on. */
export const HELLOS = [
  "ahoj",
  "ahojte",
  "cau",
  "dobry den",
  "dobry vecer",
  "dobre rano",
  "vitajte",
  "vitaj",
  "zdravim",
  "nazdar",
];

/** Goodbyes: the speaker waves, and walks off when it is their last line. */
export const GOODBYES = [
  "dovidenia",
  "do videnia",
  "maj sa",
  "majte sa",
  "zbohom",
  "dobru noc",
];

/** Thanks, which the one thanked nods at. */
export const THANKS = ["dakujem", "dakujeme", "vdaka"];

/** Apologies, which the one apologised to nods at. */
export const APOLOGIES = ["prepacte", "prepac", "pardon", "ospravedlnujem"];
