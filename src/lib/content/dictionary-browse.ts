import { words } from "$lib/content/data";
import { searchFormsForLemma } from "$lib/content/search-forms";

import {
  buildWikiViewFromEntries,
  type BrowseTopicSlug,
  type DictionaryIndexEntry,
  type WikiPageView,
} from "./dictionary-browse-utils";

export {
  BROWSE_CATEGORY_LABELS,
  BROWSE_TOPIC_SLUGS,
  buildBrowseQueryHref,
  buildPageItems,
  buildTopicOptions,
  buildWikiViewFromEntries,
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
  type WikiPageView,
} from "./dictionary-browse-utils";

let cachedEntries: DictionaryIndexEntry[] | null = null;

export function getDictionaryIndexEntries(): DictionaryIndexEntry[] {
  if (!cachedEntries) {
    cachedEntries = words.map((word) => ({
      category: word.category,
      english: word.english,
      frequencyRank: word.frequency?.rank,
      origin: word.origin,
      slug: word.slug,
      slovak: word.slovak,
    }));
  }

  return cachedEntries;
}

export function buildWikiPageView(
  topic: BrowseTopicSlug,
  letter: string,
  page: number,
): WikiPageView {
  return buildWikiViewFromEntries(getDictionaryIndexEntries(), topic, letter, page);
}

export interface DictionaryIndexSidecarEntry {
  category: string;
  english: string;
  forms?: string[];
  frequencyRank?: number;
  origin?: DictionaryIndexEntry["origin"];
  slug: string;
  slovak: string;
}

export function buildDictionaryIndexSidecar(): DictionaryIndexSidecarEntry[] {
  return words.map((word) => {
    const forms = searchFormsForLemma(word.slovak, word.category);
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
    };
  });
}
