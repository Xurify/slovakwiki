import { normalizeSearchText } from "$lib/content/search-ui";

import type { PagefindResultData } from "./pagefind-client";

interface DictionaryIndexEntry {
  category: string;
  english: string;
  slug: string;
  slovak: string;
}

let indexPromise: Promise<DictionaryIndexEntry[]> | null = null;

function loadDictionaryIndex(): Promise<DictionaryIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch("/dictionary/index.json")
      .then((response) => (response.ok ? response.json() : []))
      .catch(() => [] as DictionaryIndexEntry[]);
  }

  return indexPromise;
}

function englishGlosses(english: string): string[] {
  return english.split(";").map((gloss) => normalizeSearchText(gloss.trim()));
}

function scoreEntry(entry: DictionaryIndexEntry, query: string): number {
  const slovak = normalizeSearchText(entry.slovak);
  const glosses = englishGlosses(entry.english);
  const english = normalizeSearchText(entry.english);

  if (slovak === query) {
    return 5;
  }

  if (slovak.startsWith(query)) {
    return 4;
  }

  if (glosses.some((gloss) => gloss === query || gloss.startsWith(query))) {
    return 3;
  }

  if (slovak.includes(query)) {
    return 2;
  }

  if (english.includes(query)) {
    return 1;
  }

  return 0;
}

export async function lookupDictionary(
  query: string,
  limit = 8,
): Promise<PagefindResultData[]> {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return [];
  }

  const index = await loadDictionaryIndex();

  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, normalized) }))
    .filter((result) => result.score > 0)
    .toSorted((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return first.entry.slovak.localeCompare(second.entry.slovak, "sk");
    })
    .slice(0, limit)
    .map(({ entry }) => ({
      url: `/dictionary/${entry.slug}`,
      excerpt: "",
      meta: {
        title: entry.slovak,
        summary: entry.english,
        kind: "word",
        category: entry.category,
      },
    }));
}

export function mergeSearchResults(
  dictionary: PagefindResultData[],
  pagefind: PagefindResultData[],
  limit = 8,
): PagefindResultData[] {
  const seen = new Set<string>();
  const merged: PagefindResultData[] = [];

  for (const result of [...dictionary, ...pagefind]) {
    if (seen.has(result.url)) {
      continue;
    }

    seen.add(result.url);
    merged.push(result);

    if (merged.length >= limit) {
      break;
    }
  }

  return merged;
}
