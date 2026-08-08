import { words } from "$lib/content/data";

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
  frequencyRank?: number;
  origin?: DictionaryIndexEntry["origin"];
  slug: string;
  slovak: string;
}

export function buildDictionaryIndexSidecar(): DictionaryIndexSidecarEntry[] {
  return getDictionaryIndexEntries().map(
    ({ slug, slovak, english, category, frequencyRank, origin }) => ({
      slug,
      slovak,
      english,
      category,
      ...(frequencyRank !== undefined ? { frequencyRank } : {}),
      ...(origin !== undefined ? { origin } : {}),
    }),
  );
}
