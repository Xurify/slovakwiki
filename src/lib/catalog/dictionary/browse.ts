import { words } from "$lib/catalog/entries";
import { dictionaryHrefForSense } from "$lib/catalog/dictionary/lemma-senses";
import { searchFormsForLemma } from "$lib/catalog/search/forms";

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
    cachedEntries = words.map((word) => {
      const href = dictionaryHrefForSense(word, words);
      return {
        category: word.category,
        english: word.english,
        frequencyRank: word.frequency?.rank,
        origin: word.origin,
        slug: word.slug,
        slovak: word.slovak,
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
  frequencyRank?: number;
  hash?: string;
  hrefSlug?: string;
  origin?: DictionaryIndexEntry["origin"];
  slug: string;
  slovak: string;
}

export function buildDictionaryIndexSidecar(): DictionaryIndexSidecarEntry[] {
  return words.map((word) => {
    const forms = searchFormsForLemma(word.slovak, word.category);
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
      ...(forms.length > 0 ? { forms } : {}),
      ...(href.slug !== word.slug ? { hrefSlug: href.slug } : {}),
      ...(href.hash ? { hash: href.hash } : {}),
    };
  });
}
