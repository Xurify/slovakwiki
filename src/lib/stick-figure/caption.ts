import { sanitizeMarks, type TextMark, type TextRole } from "$lib/learning/marked-text";

/** A stretch of a caption: inside one word (or between words), under one mark. */
export interface CaptionRun {
  role?: TextRole;
  text: string;
  /** Index among the line's words, as `planLine` times them; unset between words. */
  word?: number;
}

/**
 * Cut a line at every word and mark boundary, so a caption can light the
 * word being said and still colour what the lesson marks.
 */
export function captionRuns(text: string, marks?: readonly TextMark[]): CaptionRun[] {
  const words = [...text.matchAll(/\p{L}+/gu)].map((match, index) => ({
    end: match.index + match[0].length,
    index,
    start: match.index,
  }));
  const safe = sanitizeMarks(text, marks);
  const cuts = [
    ...new Set([
      0,
      text.length,
      ...words.flatMap(({ end, start }) => [start, end]),
      ...safe.flatMap(({ end, start }) => [start, end]),
    ]),
  ].sort((a, b) => a - b);

  return cuts.slice(0, -1).map((start, at) => {
    const end = cuts[at + 1];
    return {
      role: safe.find((mark) => start >= mark.start && end <= mark.end)?.role,
      text: text.slice(start, end),
      word: words.find((word) => start >= word.start && end <= word.end)?.index,
    };
  });
}

/** Word tiles for building a line: words keep the punctuation after them. */
export function lineTiles(slovak: string): string[] {
  return slovak.split(/\s+/).filter(Boolean);
}

/**
 * The tiles in a fixed order for the line, never the right one: the same
 * every time the line comes up, so a retry is not a new puzzle.
 */
export function shuffledTiles(tiles: readonly string[], seed: string): string[] {
  let state = [...seed].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };

  const shuffled = [...tiles];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }

  const same = shuffled.every((tile, index) => tile === tiles[index]);
  return same && shuffled.length > 1 ? [...shuffled.slice(1), shuffled[0]] : shuffled;
}
