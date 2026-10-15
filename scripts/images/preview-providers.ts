/**
 * Stock photo sources for preview-sources.ts. Preview only — none of these feed
 * the live manifest.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  ImageSourceHit,
  ImageSourceId,
} from "../../src/lib/catalog/dictionary/image-source-preview";
import { ROOT } from "../lib/paths";
import { USER_AGENT, glossSearchTitle, stripInfinitiveMarker } from "./shared";

export type ProviderId = Extract<ImageSourceId, "pexels" | "unsplash" | "pixabay">;

export interface ProviderInput {
  english: string;
  gloss: string;
  slovak: string;
  slug: string;
}

export interface Provider {
  id: ProviderId;
  /** Env var that must be set, if any. */
  envKey?: string;
  search: (input: ProviderInput) => Promise<ImageSourceHit | null>;
}

const PHOTO_QUERIES_PATH = path.join(ROOT, "scripts", "images", "photo-queries.json");

export function plainQuery(input: ProviderInput): string {
  return stripInfinitiveMarker(glossSearchTitle(input.gloss)).toLowerCase();
}

let photoQueries: Promise<Record<string, string>> | undefined;

/**
 * Stock searches on a bare gloss drift ("milk" → dairy farm portraits), so a
 * hand-picked concrete phrase in photo-queries.json wins when one exists.
 */
async function photoQuery(input: ProviderInput): Promise<string> {
  photoQueries ??= readFile(PHOTO_QUERIES_PATH, "utf8")
    .then((raw) => JSON.parse(raw) as Record<string, string>)
    .catch(() => ({}));
  return (await photoQueries)[input.slug] ?? plainQuery(input);
}

async function getJson<T>(url: URL | string, headers: Record<string, string> = {}) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json", ...headers },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      console.warn(`${new URL(url).host} HTTP ${response.status}`);
      return undefined;
    }
    return (await response.json()) as T;
  } catch {
    console.warn(`${new URL(url).host} request failed`);
    return undefined;
  }
}

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

const pexels: Provider = {
  id: "pexels",
  envKey: "PEXELS_API_KEY",
  async search(input) {
    const query = await photoQuery(input);
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "landscape");
    const data = await getJson<{
      photos?: Array<{
        alt?: string;
        photographer?: string;
        src?: { medium?: string };
        url?: string;
      }>;
    }>(url, { Authorization: env("PEXELS_API_KEY") });
    const photo = data?.photos?.[0];
    if (!photo?.src?.medium) return null;
    return {
      fileTitle: `${photo.alt || query} — ${photo.photographer ?? "Pexels"}`,
      query,
      sourcePageUrl: photo.url,
      thumbUrl: photo.src.medium,
    };
  },
};

const unsplash: Provider = {
  id: "unsplash",
  envKey: "UNSPLASH_ACCESS_KEY",
  async search(input) {
    const query = await photoQuery(input);
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "5");
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("content_filter", "high");
    const data = await getJson<{
      results?: Array<{
        alt_description?: string;
        links?: { html?: string };
        sponsorship?: unknown;
        urls?: { small?: string };
        user?: { name?: string };
      }>;
    }>(url, { Authorization: `Client-ID ${env("UNSPLASH_ACCESS_KEY")}` });
    // Unsplash puts paid brand campaigns first (the dairy-farm "milk" hit).
    const photo = data?.results?.find((result) => !result.sponsorship);
    if (!photo?.urls?.small) return null;
    return {
      fileTitle: `${photo.alt_description || query} — ${photo.user?.name ?? "Unsplash"}`,
      query,
      sourcePageUrl: photo.links?.html,
      thumbUrl: photo.urls.small,
    };
  },
};

const pixabay: Provider = {
  id: "pixabay",
  envKey: "PIXABAY_API_KEY",
  async search(input) {
    const query = await photoQuery(input);
    const url = new URL("https://pixabay.com/api/");
    url.searchParams.set("key", env("PIXABAY_API_KEY"));
    url.searchParams.set("q", query);
    url.searchParams.set("per_page", "3");
    url.searchParams.set("image_type", "photo");
    url.searchParams.set("orientation", "horizontal");
    url.searchParams.set("safesearch", "true");
    const data = await getJson<{
      hits?: Array<{
        pageURL?: string;
        tags?: string;
        user?: string;
        webformatURL?: string;
      }>;
    }>(url);
    const hit = data?.hits?.[0];
    if (!hit?.webformatURL) return null;
    return {
      fileTitle: `${hit.tags?.split(",").slice(0, 3).join(",") || query} — ${hit.user ?? "Pixabay"}`,
      query,
      sourcePageUrl: hit.pageURL,
      thumbUrl: hit.webformatURL,
    };
  },
};

export const PREVIEW_PROVIDERS: Provider[] = [pexels, unsplash, pixabay];

/** Providers that can run now, plus the reason each other one was skipped. */
export function availableProviders(): {
  ready: Provider[];
  skipped: Partial<Record<ProviderId, string>>;
} {
  const ready: Provider[] = [];
  const skipped: Partial<Record<ProviderId, string>> = {};
  for (const provider of PREVIEW_PROVIDERS) {
    if (provider.envKey && !env(provider.envKey)) {
      skipped[provider.id] = `${provider.envKey} not set`;
    } else {
      ready.push(provider);
    }
  }
  return { ready, skipped };
}
