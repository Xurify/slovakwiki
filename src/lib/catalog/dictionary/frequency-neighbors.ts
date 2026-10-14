import { findLiveWordForLemma } from "../frequency";
import type { FrequencyListFile, FrequencyPartOfSpeech } from "../frequency/types";
import type { ContentEntry, WordFrequency } from "../types";
import { dictionaryPathForSense } from "./lemma-senses";

export interface FrequencyNeighbor {
  count?: number;
  current: boolean;
  /** Present only when the lemma has its own dictionary entry. */
  href?: string;
  lemma: string;
  rank: number;
}

// Every dictionary page looks up five list rows; cache per word list.
const hrefCache = new WeakMap<readonly ContentEntry[], Map<string, string | undefined>>();

function hrefForLemma(
  lemma: string,
  partOfSpeech: FrequencyPartOfSpeech,
  words: readonly ContentEntry[],
): string | undefined {
  let cache = hrefCache.get(words);
  if (!cache) {
    cache = new Map();
    hrefCache.set(words, cache);
  }

  const key = `${partOfSpeech}:${lemma}`;
  if (!cache.has(key)) {
    const word = findLiveWordForLemma(lemma, words, partOfSpeech);
    cache.set(key, word ? dictionaryPathForSense(word, words) : undefined);
  }

  return cache.get(key);
}

/**
 * The entry's row in its SNK list plus the lemmas ranked just above and below,
 * so a rank reads against real neighbours instead of standing alone.
 */
export function frequencyNeighbors(
  frequency: WordFrequency,
  list: FrequencyListFile,
  words: readonly ContentEntry[],
  span = 2,
): FrequencyNeighbor[] {
  const index = frequency.rank - 1;
  const start = Math.max(0, Math.min(index - span, list.entries.length - (span * 2 + 1)));
  const rows = list.entries.slice(start, start + span * 2 + 1);

  return rows.map((row) => ({
    count: row.count,
    current: row.rank === frequency.rank,
    href: hrefForLemma(row.lemma, row.partOfSpeech, words),
    lemma: row.lemma,
    rank: row.rank,
  }));
}
