import type { SearchDocKind } from "$lib/content/search-ui";

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

const SEARCH_KINDS = new Set<SearchDocKind>([
  "word",
  "grammar",
  "pronunciation",
  "case",
  "lesson",
  "practice",
]);

function isSearchDocKind(value: unknown): value is SearchDocKind {
  return typeof value === "string" && SEARCH_KINDS.has(value as SearchDocKind);
}

function parseHistoryItem(value: unknown): SearchHistoryItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.at !== "number" || !Number.isFinite(item.at)) return null;
  if (typeof item.href !== "string" || item.href.trim().length === 0) return null;
  if (typeof item.label !== "string" || item.label.trim().length === 0) return null;
  if (!isSearchDocKind(item.kind)) return null;
  return {
    at: item.at,
    href: item.href,
    kind: item.kind,
    label: item.label,
  };
}

export function normalizeHistoryHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) {
    return "";
  }

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      return new URL(trimmed).pathname;
    }
  } catch {}

  const path = trimmed.split(/[?#]/u)[0] ?? trimmed;
  return path.startsWith("/") ? path : `/${path}`;
}

export function readSearchHistory(storage: StorageLike): SearchHistoryItem[] {
  const raw = storage.getItem(searchHistoryKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      storage.removeItem(searchHistoryKey);
      return [];
    }

    const state = parsed as Record<string, unknown>;
    if (state.version !== 1 || !Array.isArray(state.items)) {
      storage.removeItem(searchHistoryKey);
      return [];
    }

    return state.items
      .map(parseHistoryItem)
      .filter((item): item is SearchHistoryItem => item !== null)
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
