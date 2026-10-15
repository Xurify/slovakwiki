/**
 * Extra comparison sources for preview-sources.ts: stock photo APIs, Fluent Emoji,
 * ARASAAC pictograms and a Claude-drawn SVG. Preview only — none of these feed the
 * live manifest.
 */

import Anthropic from "@anthropic-ai/sdk";

import type {
  ImageSourceHit,
  ImageSourceId,
} from "../../src/lib/catalog/dictionary/image-source-preview";
import { USER_AGENT, glossSearchTitle, stripInfinitiveMarker } from "./shared";

export type ProviderId = Extract<
  ImageSourceId,
  "pexels" | "unsplash" | "pixabay" | "emoji" | "arasaac" | "claude"
>;

export interface ProviderInput {
  english: string;
  gloss: string;
  slovak: string;
}

export interface Provider {
  id: ProviderId;
  /** Env var that must be set, if any. */
  envKey?: string;
  search: (input: ProviderInput) => Promise<ImageSourceHit | null>;
}

const EMOJIBASE_URL = "https://cdn.jsdelivr.net/npm/emojibase-data@16.0.3/en/data.json";
const FLUENT_BASE =
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";
const CLAUDE_MODEL = "claude-opus-5-5";

export function plainQuery(input: ProviderInput): string {
  return stripInfinitiveMarker(glossSearchTitle(input.gloss)).toLowerCase();
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
    const query = plainQuery(input);
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
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
    const query = plainQuery(input);
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("content_filter", "high");
    const data = await getJson<{
      results?: Array<{
        alt_description?: string;
        links?: { html?: string };
        urls?: { small?: string };
        user?: { name?: string };
      }>;
    }>(url, { Authorization: `Client-ID ${env("UNSPLASH_ACCESS_KEY")}` });
    const photo = data?.results?.[0];
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
    const query = plainQuery(input);
    const url = new URL("https://pixabay.com/api/");
    url.searchParams.set("key", env("PIXABAY_API_KEY"));
    url.searchParams.set("q", query);
    url.searchParams.set("per_page", "3");
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
      fileTitle: `${hit.tags || query} — ${hit.user ?? "Pixabay"}`,
      query,
      sourcePageUrl: hit.pageURL,
      thumbUrl: hit.webformatURL,
    };
  },
};

interface EmojibaseEntry {
  emoji: string;
  group?: number;
  label: string;
  skins?: unknown[];
  tags?: string[];
}

let emojiIndex: Promise<EmojibaseEntry[]> | undefined;

function loadEmojiIndex(): Promise<EmojibaseEntry[]> {
  emojiIndex ??= getJson<EmojibaseEntry[]>(EMOJIBASE_URL).then((rows) =>
    // Group 2 is skin-tone / hair components, group 9 is flags.
    (rows ?? []).filter((row) => row.group !== 2 && row.group !== 9),
  );
  return emojiIndex;
}

export function rankEmoji(entries: EmojibaseEntry[], query: string): EmojibaseEntry[] {
  const exact = entries.filter((entry) => entry.label === query);
  // Fewer tags means the emoji is about the query, not merely related to it
  // (milk → glass of milk, not cow; car → automobile, not taxi).
  const tagged = entries
    .filter((entry) => entry.label !== query && entry.tags?.includes(query))
    .sort(
      (a, b) =>
        (a.tags?.length ?? 0) - (b.tags?.length ?? 0) || a.label.length - b.label.length,
    );
  return [...exact, ...tagged];
}

/** Fluent folders use the CLDR name with a capital first letter; skin-tone emoji nest a Default/ folder. */
export function fluentEmojiUrl(entry: Pick<EmojibaseEntry, "label" | "skins">): string {
  const folder = entry.label.charAt(0).toUpperCase() + entry.label.slice(1);
  const base = entry.label
    .toLowerCase()
    .replace(/[:'’.!]/g, "")
    .replace(/\s+/g, "_");
  const tail = entry.skins?.length
    ? `Default/3D/${base}_3d_default.png`
    : `3D/${base}_3d.png`;
  return `${FLUENT_BASE}/${encodeURIComponent(folder)}/${tail}`;
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

const emoji: Provider = {
  id: "emoji",
  async search(input) {
    const query = plainQuery(input);
    if (!query) return null;
    for (const entry of rankEmoji(await loadEmojiIndex(), query).slice(0, 3)) {
      const thumbUrl = fluentEmojiUrl(entry);
      if (!(await urlExists(thumbUrl))) continue;
      return {
        fileTitle: `${entry.emoji} ${entry.label}`,
        query,
        sourcePageUrl: "https://github.com/microsoft/fluentui-emoji",
        thumbUrl,
      };
    }
    return null;
  },
};

const arasaac: Provider = {
  id: "arasaac",
  async search(input) {
    const query = plainQuery(input);
    if (!query) return null;
    const data = await getJson<
      Array<{ _id: number; keywords?: Array<{ keyword?: string }> }>
    >(`https://api.arasaac.org/v1/pictograms/en/search/${encodeURIComponent(query)}`);
    const picto = data?.[0];
    if (!picto) return null;
    return {
      fileTitle: `#${picto._id} ${picto.keywords?.[0]?.keyword ?? query}`,
      query,
      sourcePageUrl: `https://arasaac.org/pictograms/en/${picto._id}`,
      thumbUrl: `https://static.arasaac.org/pictograms/${picto._id}/${picto._id}_500.png`,
    };
  },
};

let anthropic: Anthropic | undefined;

const claude: Provider = {
  id: "claude",
  envKey: "ANTHROPIC_API_KEY",
  async search(input) {
    anthropic ??= new Anthropic();
    const query = plainQuery(input);
    let response: Anthropic.Beta.BetaMessage;
    try {
      response = await anthropic.beta.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 16_000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" },
        messages: [
          {
            role: "user",
            content: `Draw one simple, friendly flat illustration for a Slovak learner dictionary.

Word: ${input.slovak} (English: ${input.english})
Show the sense "${query}". One clear subject, centered, no background scene.

Rules: reply with a single <svg> element only, viewBox="0 0 400 300", no text or letters, no external references, no scripts.`,
          },
        ],
      });
    } catch (error: unknown) {
      console.warn(
        `claude ${input.slovak}: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
    if (response.stop_reason === "refusal") return null;
    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");
    const svg = text.match(/<svg[\s\S]*<\/svg>/i)?.[0];
    if (!svg) return null;
    return {
      fileTitle: `${CLAUDE_MODEL} SVG`,
      query,
      thumbUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    };
  },
};

export const PREVIEW_PROVIDERS: Provider[] = [
  pexels,
  unsplash,
  pixabay,
  emoji,
  arasaac,
  claude,
];

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
