import { z } from "zod";

import type { SearchDocKind } from "$lib/content/search-documents";

export const searchHistoryKey = "slovak-wiki.search-history.v1";
export const SEARCH_HISTORY_LIMIT = 8;

export interface SearchHistoryItem {
  at: number;
  href: string;
  kind: SearchDocKind;
  label: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

const kindSchema = z.enum([
  "word",
  "grammar",
  "pronunciation",
  "case",
  "lesson",
  "practice",
]);

const itemSchema = z.object({
  at: z.number(),
  href: z.string().min(1),
  kind: kindSchema,
  label: z.string().min(1),
});

const stateSchema = z.object({
  items: z.array(itemSchema),
  version: z.literal(1),
});

export function normalizeHistoryHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) {
    return "";
  }

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      return new URL(trimmed).pathname;
    }
  } catch {
    // Fall through to path-only cleanup.
  }

  const path = trimmed.split(/[?#]/u)[0] ?? trimmed;
  return path.startsWith("/") ? path : `/${path}`;
}

export function readSearchHistory(storage: StorageLike): SearchHistoryItem[] {
  const raw = storage.getItem(searchHistoryKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      storage.removeItem(searchHistoryKey);
      return [];
    }

    return parsed.data.items
      .map((item) => ({
        ...item,
        href: normalizeHistoryHref(item.href),
      }))
      .filter((item) => item.href.length > 0)
      .slice(0, SEARCH_HISTORY_LIMIT);
  } catch {
    storage.removeItem(searchHistoryKey);
    return [];
  }
}

export function writeSearchHistory(
  storage: StorageLike,
  items: SearchHistoryItem[],
): void {
  storage.setItem(
    searchHistoryKey,
    JSON.stringify({
      version: 1,
      items: items.slice(0, SEARCH_HISTORY_LIMIT).map((item) => ({
        at: item.at,
        href: normalizeHistoryHref(item.href),
        kind: item.kind,
        label: item.label.trim(),
      })),
    }),
  );
}

export function pushSearchHistory(
  storage: StorageLike,
  item: Omit<SearchHistoryItem, "at"> & { at?: number },
): SearchHistoryItem[] {
  const href = normalizeHistoryHref(item.href);
  const label = item.label.trim();
  if (!href || !label) {
    return readSearchHistory(storage);
  }

  const nextItem: SearchHistoryItem = {
    at: item.at ?? Date.now(),
    href,
    kind: item.kind,
    label,
  };

  const next = [
    nextItem,
    ...readSearchHistory(storage).filter((entry) => entry.href !== href),
  ].slice(0, SEARCH_HISTORY_LIMIT);

  writeSearchHistory(storage, next);
  return next;
}

export function clearSearchHistory(storage: StorageLike): void {
  storage.removeItem(searchHistoryKey);
}
