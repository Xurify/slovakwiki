import { dictionaryPathFromIndexFields } from "$lib/catalog/dictionary/lemma-senses";
import { DICTIONARY_BROWSE_INDEX_URL } from "$lib/catalog/dictionary/browse-query";
import { normalizeSearchText } from "$lib/catalog/search/ui";
import type { WordRegister } from "$lib/catalog/types";

import type { PagefindResultData } from "./pagefind-client";

export interface DictionaryIndexEntry {
  category: string;
  english: string;
  forms?: string[];
  hash?: string;
  hrefSlug?: string;
  register?: WordRegister;
  slug: string;
  slovak: string;
}

/** Only promote dictionary hits at or above this score (exact lemma/form/prefix/gloss). */
export const MIN_DICTIONARY_LOOKUP_SCORE = 3;

type PreparedEntry = {
  entry: DictionaryIndexEntry;
  forms: string[];
  glosses: string[];
  slovak: string;
};

let indexPromise: Promise<DictionaryIndexEntry[]> | null = null;
let preparedPromise: Promise<PreparedEntry[]> | null = null;

function loadDictionaryIndex(): Promise<DictionaryIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch(DICTIONARY_BROWSE_INDEX_URL)
      .then((response) => (response.ok ? response.json() : []))
      .catch(() => [] as DictionaryIndexEntry[]);
  }

  return indexPromise;
}

function englishGlosses(english: string): string[] {
  const glosses: string[] = [];
  const seen = new Set<string>();

  const add = (value: string): void => {
    const normalized = normalizeSearchText(value.trim());
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    glosses.push(normalized);
  };

  for (const segment of english.split(";")) {
    add(segment);
    for (const token of segment.split(/\s+/)) {
      add(token);
    }
  }

  return glosses;
}

function normalizedForms(entry: DictionaryIndexEntry): string[] {
  return (entry.forms ?? []).map((form) => normalizeSearchText(form));
}

function prepareEntry(entry: DictionaryIndexEntry): PreparedEntry {
  return {
    entry,
    slovak: normalizeSearchText(entry.slovak),
    forms: normalizedForms(entry),
    glosses: englishGlosses(entry.english),
  };
}

function loadPreparedIndex(): Promise<PreparedEntry[]> {
  if (!preparedPromise) {
    preparedPromise = loadDictionaryIndex().then((index) => index.map(prepareEntry));
  }

  return preparedPromise;
}

/** Prefetch + normalize the browse index so the first typed query is not a main-thread stall. */
export function warmDictionaryLookup(): void {
  void loadPreparedIndex();
}

function scorePrepared(
  prepared: Pick<PreparedEntry, "forms" | "glosses" | "slovak">,
  query: string,
): number {
  if (prepared.slovak === query || prepared.forms.includes(query)) {
    return 5;
  }

  if (
    prepared.slovak.startsWith(query) ||
    prepared.forms.some((form) => form.startsWith(query))
  ) {
    return 4;
  }

  if (prepared.glosses.some((gloss) => gloss === query)) {
    return 3;
  }

  if (query.length > 3 && prepared.slovak.includes(query)) {
    return 2;
  }

  return 0;
}

/** @internal exported for unit tests */
export function scoreDictionaryEntry(entry: DictionaryIndexEntry, query: string): number {
  return scorePrepared(prepareEntry(entry), query);
}

export async function lookupDictionary(
  query: string,
  limit = 8,
): Promise<PagefindResultData[]> {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return [];
  }

  const index = await loadPreparedIndex();

  return index
    .map((prepared) => ({
      entry: prepared.entry,
      score: scorePrepared(prepared, normalized),
    }))
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
        ...(entry.register ? { register: entry.register } : {}),
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
