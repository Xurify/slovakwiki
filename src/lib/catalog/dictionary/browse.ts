import { words } from "$lib/catalog/entries";
import { dictionaryHrefForSense } from "$lib/catalog/dictionary/lemma-senses";
import { formsVerified, searchFormsForLemma } from "$lib/catalog/search/forms";
import type { NounGender, PluralOnlyGender } from "$lib/catalog/types";

import {
  buildDictionaryViewFromEntries,
  type BrowseTopicSlug,
  type DictionaryIndexEntry,
  type DictionaryBrowseView,
} from "./browse-query";

export {
  BROWSE_CATEGORY_LABELS,
  BROWSE_TOPIC_SLUGS,
  buildBrowseQueryHref,
  buildPageItems,
  buildTopicOptions,
  buildDictionaryViewFromEntries,
  browseLetters,
  browseStateNeedsIndex,
  DICTIONARY_PAGE_SIZE,
  filterBrowseEntries,
  hasActiveBrowseFilters,
  isBrowseTopicSlug,
  parseBrowseSearchParams,
  resetBrowseHref,
  type BrowseQueryState,
  type BrowseTopicSlug,
  type DictionaryIndexEntry,
  type TopicOption,
  type DictionaryBrowseView,
} from "./browse-query";

let cachedEntries: DictionaryIndexEntry[] | null = null;

export function getDictionaryIndexEntries(): DictionaryIndexEntry[] {
  if (!cachedEntries) {
    cachedEntries = words
      .filter((word) => !word.variantOf)
      .map((word) => {
        const href = dictionaryHrefForSense(word, words);
        return {
          category: word.category,
          english: word.english,
          frequencyRank: word.frequency?.rank,
          origin: word.origin,
          slug: word.slug,
          slovak: word.slovak,
          ...(word.register ? { register: word.register } : {}),
          ...(href.slug !== word.slug ? { hrefSlug: href.slug } : {}),
          ...(href.hash ? { hash: href.hash } : {}),
        };
      });
  }

  return cachedEntries;
}

export function buildDictionaryBrowseView(
  topic: BrowseTopicSlug,
  letter: string,
  page: number,
): DictionaryBrowseView {
  return buildDictionaryViewFromEntries(getDictionaryIndexEntries(), topic, letter, page);
}

export interface DictionaryIndexSidecarEntry {
  category: string;
  english: string;
  forms?: string[];
  /** The forms are real Slovak, not only search keys, so they may be shown. */
  formsVerified?: true;
  frequencyRank?: number;
  gender?: NounGender;
  hash?: string;
  hrefSlug?: string;
  origin?: DictionaryIndexEntry["origin"];
  pluralOnlyGender?: PluralOnlyGender;
  register?: DictionaryIndexEntry["register"];
  slug: string;
  slovak: string;
}

export function buildDictionaryIndexSidecar(): DictionaryIndexSidecarEntry[] {
  return words.map((word) => {
    const forms = searchFormsForLemma(word.slovak, word.category, word.gender);
    const href = dictionaryHrefForSense(word, words);
    return {
      slug: word.slug,
      slovak: word.slovak,
      english: word.english,
      category: word.category,
      ...(word.frequency?.rank !== undefined
        ? { frequencyRank: word.frequency.rank }
        : {}),
      ...(word.origin !== undefined ? { origin: word.origin } : {}),
      ...(word.register ? { register: word.register } : {}),
      ...(word.gender ? { gender: word.gender } : {}),
      ...(word.pluralOnlyGender ? { pluralOnlyGender: word.pluralOnlyGender } : {}),
      ...(forms.length > 0 ? { forms } : {}),
      ...(forms.length > 0 && formsVerified(word.slovak, word.category, word.gender)
        ? { formsVerified: true as const }
        : {}),
      ...(href.slug !== word.slug ? { hrefSlug: href.slug } : {}),
      ...(href.hash ? { hash: href.hash } : {}),
    };
  });
}
