import { dictionaryPathFromIndexFields } from "$lib/catalog/dictionary/lemma-senses";
import { fetchDictionaryIndex } from "$lib/catalog/dictionary/browse-query";
import { normalizeSearchText } from "$lib/catalog/search/ui";
import type { WordRegister } from "$lib/catalog/types";

import type { PagefindResultData } from "./pagefind-client";

export interface DictionaryIndexEntry {
  category: string;
  english: string;
  forms?: string[];
  frequencyRank?: number;
  hash?: string;
  hrefSlug?: string;
  register?: WordRegister;
  slug: string;
  slovak: string;
}

/** Only promote dictionary hits at or above this score (exact lemma/form/prefix/gloss). */
export const MIN_DICTIONARY_LOOKUP_SCORE = 3;

export type PreparedEntry = {
  entry: DictionaryIndexEntry;
  forms: string[];
  /** Whole meanings (“to be”), ranked above single words inside a meaning. */
  gloss: string[];
  glosses: string[];
  slovak: string;
};

let indexPromise: Promise<DictionaryIndexEntry[]> | null = null;
let preparedPromise: Promise<PreparedEntry[]> | null = null;
let preparedIndex: PreparedEntry[] | null = null;

function loadDictionaryIndex(): Promise<DictionaryIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetchDictionaryIndex<DictionaryIndexEntry>().catch(
      (error: unknown) => {
        indexPromise = null;
        throw error;
      },
    );
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
    add(segmentWithoutNotes(segment));
    for (const token of segment.split(/\s+/)) {
      add(token);
    }
  }

  return glosses;
}

/** “this (m.)” → “this”: grammar notes in brackets aren't part of the meaning. */
function segmentWithoutNotes(segment: string): string {
  return segment.replace(/\([^)]*\)/gu, " ").replace(/\s+/gu, " ");
}

function wholeGlosses(english: string): string[] {
  return english
    .split(";")
    .flatMap((segment) => [segment, segmentWithoutNotes(segment)])
    .map((segment) => normalizeSearchText(segment))
    .filter(Boolean);
}

function normalizedForms(entry: DictionaryIndexEntry): string[] {
  return (entry.forms ?? []).map((form) => normalizeSearchText(form));
}

export function prepareEntry(entry: DictionaryIndexEntry): PreparedEntry {
  return {
    entry,
    slovak: normalizeSearchText(entry.slovak),
    forms: normalizedForms(entry),
    gloss: wholeGlosses(entry.english),
    glosses: englishGlosses(entry.english),
  };
}

export function loadPreparedIndex(): Promise<PreparedEntry[]> {
  if (!preparedPromise) {
    preparedPromise = loadDictionaryIndex()
      .then((index) => {
        preparedIndex = index.map(prepareEntry);
        return preparedIndex;
      })
      .catch((error: unknown) => {
        preparedPromise = null;
        throw error;
      });
  }

  return preparedPromise;
}

/** Prefetch + normalize the browse index so the first typed query is not a main-thread stall. */
export function warmDictionaryLookup(): void {
  void loadPreparedIndex().catch(() => {
    // Ignore warm-up failure so future lookups can retry.
  });
}

export function isDictionaryLookupReady(): boolean {
  return preparedIndex !== null;
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

  let index: PreparedEntry[];
  try {
    index = await loadPreparedIndex();
  } catch {
    return [];
  }

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

/** Why a word matched, strongest first. */
export type WordMatchKind =
  "lemma" | "form" | "prefix" | "gloss" | "gloss-word" | "contains";

export const MATCH_ORDER: Record<WordMatchKind, number> = {
  lemma: 0,
  form: 1,
  prefix: 2,
  gloss: 3,
  "gloss-word": 4,
  contains: 5,
};

export interface WordMatch {
  entry: DictionaryIndexEntry;
  /** The inflected form the query hit, when it is not the lemma. */
  form?: string;
  kind: WordMatchKind;
}

function matchPrepared(prepared: PreparedEntry, query: string): WordMatch | null {
  const { entry } = prepared;

  if (prepared.slovak === query) {
    return { entry, kind: "lemma" };
  }

  const formIndex = prepared.forms.indexOf(query);
  if (formIndex !== -1) {
    return { entry, kind: "form", form: entry.forms?.[formIndex] ?? query };
  }

  if (prepared.slovak.startsWith(query)) {
    return { entry, kind: "prefix" };
  }

  if (prepared.gloss.includes(query)) {
    return { entry, kind: "gloss" };
  }

  if (prepared.glosses.includes(query)) {
    return { entry, kind: "gloss-word" };
  }

  if (query.length > 3 && prepared.slovak.includes(query)) {
    return { entry, kind: "contains" };
  }

  return null;
}

/** Every dictionary entry the query names, strongest match first, then most frequent. */
export function rankDictionaryMatches(
  index: readonly PreparedEntry[],
  query: string,
): WordMatch[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return [];
  }

  const matches: WordMatch[] = [];
  for (const prepared of index) {
    const match = matchPrepared(prepared, normalized);
    if (match) {
      matches.push(match);
    }
  }

  return matches.toSorted((first, second) => {
    const byKind = MATCH_ORDER[first.kind] - MATCH_ORDER[second.kind];
    if (byKind !== 0) return byKind;

    const byFrequency =
      (first.entry.frequencyRank ?? Number.MAX_SAFE_INTEGER) -
      (second.entry.frequencyRank ?? Number.MAX_SAFE_INTEGER);
    if (byFrequency !== 0) return byFrequency;

    return first.entry.slovak.localeCompare(second.entry.slovak, "sk");
  });
}

export function dictionaryEntryHref(entry: DictionaryIndexEntry): string {
  return dictionaryPathFromIndexFields(entry);
}
