import type { SearchDocKind } from "$lib/content/search-documents";

export interface PagefindResultData {
  excerpt: string;
  meta: {
    kind?: string;
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

let pagefindPromise: Promise<PagefindApi> | null = null;

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
      return api;
    })().catch((error: unknown) => {
      pagefindPromise = null;
      throw error;
    });
  }

  try {
    return await pagefindPromise;
  } catch {
    return null;
  }
}
