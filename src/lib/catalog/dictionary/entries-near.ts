import type { ContentEntry } from "../types";
import { dictionaryPathForSense } from "./lemma-senses";

export interface NearbyEntry {
  current: boolean;
  english: string;
  href: string;
  slovak: string;
}

const collator = new Intl.Collator("sk");

// One row per lemma, in Slovak alphabetical order; built once per word list.
const alphabetCache = new WeakMap<readonly ContentEntry[], ContentEntry[]>();

function alphabetical(words: readonly ContentEntry[]): ContentEntry[] {
  const cached = alphabetCache.get(words);
  if (cached) return cached;

  const seen = new Set<string>();
  const lemmas: ContentEntry[] = [];
  for (const word of words) {
    if (word.kind !== "word" || word.variantOf || seen.has(word.slovak)) continue;
    seen.add(word.slovak);
    lemmas.push(word);
  }

  lemmas.sort((left, right) => collator.compare(left.slovak, right.slovak));
  alphabetCache.set(words, lemmas);
  return lemmas;
}

/** The lemma with the dictionary entries just before and after it. */
export function entriesNear(
  entry: ContentEntry,
  words: readonly ContentEntry[],
  span = 3,
): NearbyEntry[] {
  const lemmas = alphabetical(words);
  const index = lemmas.findIndex((word) => word.slovak === entry.slovak);
  if (index < 0) return [];

  const start = Math.max(0, Math.min(index - span, lemmas.length - (span * 2 + 1)));

  return lemmas.slice(start, start + span * 2 + 1).map((word) => ({
    current: word.slovak === entry.slovak,
    english: word.english.split(";")[0]!.trim(),
    href: dictionaryPathForSense(word, words),
    slovak: word.slovak,
  }));
}
