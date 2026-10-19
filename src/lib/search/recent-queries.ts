import { normalizeSearchText } from "$lib/catalog/search/ui";

import type { StorageLike } from "./search-history";

export const RECENT_QUERIES_STORAGE_KEY = "slovak.wiki.recent-queries.v1";

export const RECENT_QUERIES_LIMIT = 8;

export interface RecentQuery {
  query: string;
  searchedAt: number;
}

function parseRecentQuery(value: unknown): RecentQuery | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.query !== "string" || !item.query.trim()) return null;
  if (typeof item.searchedAt !== "number" || !Number.isFinite(item.searchedAt)) {
    return null;
  }
  return { query: item.query.trim(), searchedAt: item.searchedAt };
}

export function readRecentQueries(storage: StorageLike): RecentQuery[] {
  try {
    const raw = storage.getItem(RECENT_QUERIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseRecentQuery)
      .filter((item): item is RecentQuery => item !== null)
      .slice(0, RECENT_QUERIES_LIMIT);
  } catch {
    return [];
  }
}

/** Newest first; typing the same query again (with or without diacritics) moves it up. */
export function pushRecentQuery(
  storage: StorageLike,
  query: string,
  searchedAt = Date.now(),
): RecentQuery[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return readRecentQueries(storage);
  }

  const key = normalizeSearchText(trimmed);
  const next = [
    { query: trimmed, searchedAt },
    ...readRecentQueries(storage).filter(
      (item) => normalizeSearchText(item.query) !== key,
    ),
  ].slice(0, RECENT_QUERIES_LIMIT);

  try {
    storage.setItem(RECENT_QUERIES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota: the list just doesn't persist.
  }

  return next;
}

export function clearRecentQueries(storage: StorageLike): void {
  try {
    storage.removeItem(RECENT_QUERIES_STORAGE_KEY);
  } catch {
    // Ignore private-mode failures.
  }
}
