import type { SearchDocKind } from "$lib/catalog/search/ui";

export interface PagefindResultData {
  excerpt: string;
  meta: {
    category?: string;
    kind?: string;
    register?: string;
    summary?: string;
    title?: string;
  };
  url: string;
}

export interface PagefindSearchResult {
  data: () => Promise<PagefindResultData>;
  id: string;
}

export interface PagefindSearchResponse {
  results: PagefindSearchResult[];
}

export interface PagefindApi {
  debouncedSearch: (
    query: string,
    options?: { filters?: Record<string, string | string[]> },
    debounceMs?: number,
  ) => Promise<PagefindSearchResponse | null>;
  destroy: () => Promise<void>;
  init: () => Promise<void>;
  options: (options: { bundlePath?: string }) => Promise<void>;
  preload: (query: string) => Promise<void>;
  search: (
    query: string,
    options?: { filters?: Record<string, string | string[]> },
  ) => Promise<PagefindSearchResponse>;
}

export const SEARCH_DEBOUNCE_MS = 100;

let pagefindPromise: Promise<PagefindApi> | null = null;
let pagefindWarm = false;
let idleWarmScheduled = false;

export function isSearchDocKind(value: string | undefined): value is SearchDocKind {
  return (
    value === "word" ||
    value === "grammar" ||
    value === "pronunciation" ||
    value === "case" ||
    value === "lesson" ||
    value === "practice"
  );
}

export function isPagefindWarm(): boolean {
  return pagefindWarm;
}

/**
 * Warm Pagefind after paint / idle so first `/` or focus search skips the cold import.
 * Safe to call from multiple SearchBox mounts — schedules once.
 */
export function schedulePagefindIdleWarm(): void {
  if (typeof window === "undefined" || idleWarmScheduled || pagefindWarm) {
    return;
  }

  idleWarmScheduled = true;

  const run = (): void => {
    void getPagefind();
  };

  const win = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  };

  if (typeof win.requestIdleCallback === "function") {
    win.requestIdleCallback(run, { timeout: 2000 });
  } else {
    window.setTimeout(run, 200);
  }
}

export async function getPagefind(): Promise<PagefindApi | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (!pagefindPromise) {
    pagefindPromise = (async () => {
      // Generated into /pagefind by `bun run index:search` / `astro build`.
      const loader = new Function("url", "return import(url)") as (
        url: string,
      ) => Promise<PagefindApi | { default: PagefindApi }>;
      const module = await loader("/pagefind/pagefind.js");
      const api =
        "default" in module && module.default ? module.default : (module as PagefindApi);
      await api.options({ bundlePath: "/pagefind/" });
      await api.init();
      pagefindWarm = true;
      return api;
    })().catch((error: unknown) => {
      pagefindPromise = null;
      pagefindWarm = false;
      throw error;
    });
  }

  try {
    return await pagefindPromise;
  } catch {
    return null;
  }
}
