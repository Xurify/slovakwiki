import type { SearchDocKind } from "$lib/catalog/search/ui";

export const SEARCH_HISTORY_STORAGE_KEY = "slovak.wiki.search-history.v1";

const LEGACY_SEARCH_HISTORY_STORAGE_KEY = "slovak-wiki.search-history.v1";

export const SEARCH_HISTORY_LIMIT = 8;

export interface SearchHistoryItem {
  category?: string;
  href: string;
  kind: SearchDocKind;
  label: string;
  visitedAt: number;
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

function parseVisitedAt(item: Record<string, unknown>): number | null {
  if (typeof item.visitedAt === "number" && Number.isFinite(item.visitedAt)) {
    return item.visitedAt;
  }

  // Legacy persisted field name.
  if (typeof item.at === "number" && Number.isFinite(item.at)) {
    return item.at;
  }

  return null;
}

function parseHistoryItem(value: unknown): SearchHistoryItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const visitedAt = parseVisitedAt(item);
  if (visitedAt === null) return null;
  if (typeof item.href !== "string" || item.href.trim().length === 0) return null;
  if (typeof item.label !== "string" || item.label.trim().length === 0) return null;
  if (!isSearchDocKind(item.kind)) return null;

  const category =
    typeof item.category === "string" && item.category.trim().length > 0
      ? item.category.trim()
      : undefined;

  return {
    visitedAt,
    href: item.href,
    kind: item.kind,
    label: item.label,
    ...(category ? { category } : {}),
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

function readHistoryRaw(storage: StorageLike): string | null {
  return (
    storage.getItem(SEARCH_HISTORY_STORAGE_KEY) ??
    storage.getItem(LEGACY_SEARCH_HISTORY_STORAGE_KEY)
  );
}

export function readSearchHistory(storage: StorageLike): SearchHistoryItem[] {
  const raw = readHistoryRaw(storage);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      storage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
      storage.removeItem(LEGACY_SEARCH_HISTORY_STORAGE_KEY);
      return [];
    }

    const state = parsed as Record<string, unknown>;
    if (state.version !== 1 || !Array.isArray(state.items)) {
      storage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
      storage.removeItem(LEGACY_SEARCH_HISTORY_STORAGE_KEY);
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
    storage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    storage.removeItem(LEGACY_SEARCH_HISTORY_STORAGE_KEY);
    return [];
  }
}

export function writeSearchHistory(
  storage: StorageLike,
  items: SearchHistoryItem[],
): void {
  storage.setItem(
    SEARCH_HISTORY_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      items: items.slice(0, SEARCH_HISTORY_LIMIT).map((item) => ({
        visitedAt: item.visitedAt,
        href: normalizeHistoryHref(item.href),
        kind: item.kind,
        label: item.label.trim(),
        ...(item.category?.trim() ? { category: item.category.trim() } : {}),
      })),
    }),
  );
  storage.removeItem(LEGACY_SEARCH_HISTORY_STORAGE_KEY);
}

export function pushSearchHistory(
  storage: StorageLike,
  item: Omit<SearchHistoryItem, "visitedAt"> & { visitedAt?: number },
): SearchHistoryItem[] {
  const href = normalizeHistoryHref(item.href);
  const label = item.label.trim();
  if (!href || !label) {
    return readSearchHistory(storage);
  }

  const nextItem: SearchHistoryItem = {
    visitedAt: item.visitedAt ?? Date.now(),
    href,
    kind: item.kind,
    label,
    ...(item.category?.trim() ? { category: item.category.trim() } : {}),
  };

  const next = [
    nextItem,
    ...readSearchHistory(storage).filter((entry) => entry.href !== href),
  ].slice(0, SEARCH_HISTORY_LIMIT);

  writeSearchHistory(storage, next);
  return next;
}

export function clearSearchHistory(storage: StorageLike): void {
  storage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
  storage.removeItem(LEGACY_SEARCH_HISTORY_STORAGE_KEY);
}
