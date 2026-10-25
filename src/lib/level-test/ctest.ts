import type { CTestGap, CTestPart } from "./types";

const SENTENCE_SPLIT = /(?<=[.!?…])\s+/u;
const WORD = /[\p{L}\p{M}]+/gu;

export const MAX_CTEST_GAPS = 20;

export function splitSentences(text: string): string[] {
  return text
    .trim()
    .split(SENTENCE_SPLIT)
    .filter((sentence) => sentence.length > 0);
}

function canDamage(word: string, startsSentence: boolean): boolean {
  if ([...word].length < 2) return false;
  const capitalized = word[0] !== word[0]?.toLocaleLowerCase("sk");
  return startsSentence || !capitalized;
}

/**
 * The classic C-test rule: leave the first and last sentences whole, then cut
 * the second half of every other word (the larger half when the length is odd).
 * One-letter words and names are never cut and do not count toward the alternation.
 */
export function damagePassage(
  text: string,
  wordDifficulty: (word: string) => number,
): CTestPart[] {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return [text.trim()];

  const parts: CTestPart[] = [];
  let buffer = `${sentences[0]} `;
  let damageNext = false;
  let gaps = 0;

  const middle = sentences.slice(1, -1);
  middle.forEach((sentence, sentenceIndex) => {
    let cursor = 0;
    let firstWord = true;

    for (const match of sentence.matchAll(WORD)) {
      const word = match[0];
      const start = match.index ?? 0;
      buffer += sentence.slice(cursor, start);
      cursor = start + word.length;

      const eligible = canDamage(word, firstWord);
      firstWord = false;

      if (!eligible || gaps >= MAX_CTEST_GAPS) {
        buffer += word;
        continue;
      }

      if (damageNext) {
        const letters = [...word];
        const keep = Math.floor(letters.length / 2);
        if (buffer) parts.push(buffer);
        buffer = "";
        parts.push({
          prefix: letters.slice(0, keep).join(""),
          missing: letters.slice(keep).join(""),
          difficulty: wordDifficulty(word),
        });
        gaps += 1;
      } else {
        buffer += word;
      }
      damageNext = !damageNext;
    }

    buffer += sentence.slice(cursor);
    if (sentenceIndex < middle.length - 1) buffer += " ";
  });

  buffer += ` ${sentences[sentences.length - 1]}`;
  parts.push(buffer);
  return parts;
}

export function ctestGaps(parts: readonly CTestPart[]): CTestGap[] {
  return parts.filter((part): part is CTestGap => typeof part !== "string");
}
