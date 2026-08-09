import type { DictionaryIndexSidecarEntry } from "./dictionary-browse";
import { findLiveWordForLemma } from "./frequency";
import { dictionaryHrefForSense } from "./lemma-senses";
import type { FrequencyPartOfSpeech } from "./frequency-types";
import type { ContentEntry } from "./types";

export interface DictionaryLiveLink {
  english: string;
  hash?: string;
  slug: string;
}

const PART_TO_CATEGORY: Record<FrequencyPartOfSpeech, string> = {
  verb: "Verbs",
  noun: "Nouns",
  adjective: "Adjectives",
  adverb: "Adverbs",
};

export function dictionaryPathForLiveLink(live: DictionaryLiveLink): string {
  return live.hash ? `/dictionary/${live.slug}#${live.hash}` : `/dictionary/${live.slug}`;
}

export function liveLinkFromHref(
  english: string,
  href: { hash?: string; slug: string },
): DictionaryLiveLink {
  return {
    english,
    slug: href.slug,
    ...(href.hash ? { hash: href.hash } : {}),
  };
}

/** Server-side: resolve a frequency row to the canonical dictionary href. */
export function liveLinkForLemma(
  lemma: string,
  words: readonly ContentEntry[],
  partOfSpeech: FrequencyPartOfSpeech,
): DictionaryLiveLink | undefined {
  const live = findLiveWordForLemma(lemma, words, partOfSpeech);
  if (!live) return undefined;
  return liveLinkFromHref(live.english, dictionaryHrefForSense(live, words));
}

/** Client-side: index rows keyed by lemma + dictionary category. */
export function buildLiveLinksFromIndex(
  index: readonly DictionaryIndexSidecarEntry[],
): Record<string, DictionaryLiveLink> {
  const map: Record<string, DictionaryLiveLink> = {};

  for (const entry of index) {
    map[`${entry.slovak}|${entry.category}`] = {
      english: entry.english,
      slug: entry.hrefSlug ?? entry.slug,
      ...(entry.hash ? { hash: entry.hash } : {}),
    };
  }

  return map;
}

export function resolveLiveLinkFromIndex(
  lemma: string,
  partOfSpeech: FrequencyPartOfSpeech,
  map: Record<string, DictionaryLiveLink>,
): DictionaryLiveLink | undefined {
  const category = PART_TO_CATEGORY[partOfSpeech];
  const direct = map[`${lemma}|${category}`];
  if (direct) return direct;
  if (partOfSpeech === "noun") {
    return map[`${lemma}|Places`];
  }
  return undefined;
}
