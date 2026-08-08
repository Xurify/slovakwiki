import { dictionaryPathFromIndexFields } from "$lib/content/lemma-senses";
import { DICTIONARY_BROWSE_INDEX_URL } from "$lib/content/dictionary-browse-utils";
import { normalizeSearchText } from "$lib/content/search-ui";

import type { PagefindResultData } from "./pagefind-client";

export interface DictionaryIndexEntry {
  category: string;
  english: string;
  forms?: string[];
  hash?: string;
  hrefSlug?: string;
  slug: string;
  slovak: string;
}

/** Only promote dictionary hits at or above this score (exact lemma/form/prefix/gloss). */
export const MIN_DICTIONARY_LOOKUP_SCORE = 3;

let indexPromise: Promise<DictionaryIndexEntry[]> | null = null;

function loadDictionaryIndex(): Promise<DictionaryIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch(DICTIONARY_BROWSE_INDEX_URL)
      .then((response) => (response.ok ? response.json() : []))
      .catch(() => [] as DictionaryIndexEntry[]);
  }

  return indexPromise;
}

function englishGlosses(english: string): string[] {
  return english
    .split(";")
    .flatMap((segment) => segment.split(/\s+/))
    .map((token) => normalizeSearchText(token.trim()))
    .filter(Boolean);
}

function normalizedForms(entry: DictionaryIndexEntry): string[] {
  return (entry.forms ?? []).map((form) => normalizeSearchText(form));
}

/** @internal exported for unit tests */
export function scoreDictionaryEntry(entry: DictionaryIndexEntry, query: string): number {
  const slovak = normalizeSearchText(entry.slovak);
  const forms = normalizedForms(entry);
  const glosses = englishGlosses(entry.english);

  if (slovak === query || forms.includes(query)) {
    return 5;
  }

  if (slovak.startsWith(query) || forms.some((form) => form.startsWith(query))) {
    return 4;
  }

  if (glosses.some((gloss) => gloss === query)) {
    return 3;
  }

  if (query.length > 3 && slovak.includes(query)) {
    return 2;
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
    .map((entry) => ({ entry, score: scoreDictionaryEntry(entry, normalized) }))
    .filter((result) => result.score >= MIN_DICTIONARY_LOOKUP_SCORE)
    .toSorted((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return first.entry.slovak.localeCompare(second.entry.slovak, "sk");
    })
    .slice(0, limit)
    .map(({ entry }) => ({
      url: dictionaryPathFromIndexFields(entry),
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
