import type { TokenSpan } from "./grade";
import type { InteractiveReadingSet, ReadingPart } from "./types";

export interface PassageToken {
  text: string;
  start: number;
  end: number;
  /** False for punctuation and spaces, which cannot start or end a highlight. */
  word: boolean;
}

const TOKEN = /[\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}]+/gu;

export function tokenizePassage(text: string): PassageToken[] {
  return [...text.matchAll(TOKEN)].map((match) => {
    const start = match.index ?? 0;
    return {
      text: match[0],
      start,
      end: start + match[0].length,
      word: /[\p{L}\p{N}]/u.test(match[0]),
    };
  });
}

/** Token span covering an exact substring, or null when it is not in the text. */
export function spanOfSubstring(
  tokens: readonly PassageToken[],
  text: string,
  substring: string,
): TokenSpan | null {
  const at = text.indexOf(substring);
  if (at < 0) return null;
  const end = at + substring.length;
  const inside = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.word && token.start >= at && token.end <= end);
  const first = inside[0];
  const last = inside.at(-1);
  return first && last ? { start: first.index, end: last.index } : null;
}

export function fillOpening(parts: readonly ReadingPart[]): string {
  return parts
    .map((part) => (typeof part === "string" ? part : (part.options[part.answer] ?? "")))
    .join("");
}

/** The whole passage as Highlight the Answer shows it, with every gap restored. */
export function fullReadingPassage(set: InteractiveReadingSet): string {
  const missing = set.missingSentence.options[set.missingSentence.answer] ?? "";
  return `${fillOpening(set.opening)} ${missing} ${set.closing}`;
}
