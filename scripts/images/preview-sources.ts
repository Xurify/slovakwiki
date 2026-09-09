/**
 * Preview SK / EN / Commons / Openverse hits without writing the live manifest.
 *
 * Usage:
 *   bun scripts/images/preview-sources.ts -- --limit 24
 *   bun scripts/images/preview-sources.ts -- --only obed,vlak,pes
 *   bun scripts/images/preview-sources.ts -- --pos noun --limit 12
 *
 * Writes tmp/image-source-preview.json. View at /dev/images/compare
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  ImageSourceHit,
  ImageSourcePreviewFile,
  ImageSourcePreviewRow,
} from "../../src/lib/catalog/dictionary/image-source-preview";
import { getImageManifestEntry } from "../../src/lib/catalog/dictionary/images";
import { ROOT } from "../lib/paths";
import {
  THUMB_WIDTH,
  USER_AGENT,
  allowsCommonsAutoPromote,
  collectImageTargets,
  glossSearchTitle,
  hasCommonsSafeTheme,
  isBitmapMime,
  isRejectedCommonsTitle,
  isVerbLikeCategory,
  normalizeCommonsFile,
  nounCommonsQueries,
  pickTitledCommonsHit,
  prefersCartoonCommons,
  stripHtml,
  type ImageTarget,
} from "./shared";

const PREVIEW_PATH = path.join(ROOT, "tmp", "image-source-preview.json");
const FREE_LICENSE_HINT = /^(cc0|cc[-\s]?by|public domain|pd|pdm|gfdl|creativecommons)/i;
const OPENVERSE_LICENSE = /^(cc0|pdm|by|by-sa)$/i;

function parsePreviewArgs(argv: string[]): {
  abstracts: boolean;
  limit: number;
  only: string[] | undefined;
  partOfSpeech: string | undefined;
} {
  let abstracts = false;
  let limit = 24;
  let only: string[] | undefined;
  let partOfSpeech: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--abstracts") abstracts = true;
    else if (arg === "--limit") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error("--limit requires a positive number");
      }
      limit = Math.floor(value);
      i += 1;
    } else if (arg === "--only") {
      const raw = argv[i + 1];
      if (!raw) throw new Error("--only requires a slug or comma list");
      only = raw
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean);
      i += 1;
    } else if (arg === "--pos") {
      partOfSpeech = argv[i + 1];
      if (!partOfSpeech) throw new Error("--pos requires a value");
      i += 1;
    } else if (arg?.startsWith("-")) {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return { abstracts, limit, only, partOfSpeech };
}

function licenseLooksFree(license: string | undefined): boolean {
  if (!license) return false;
  const cleaned = stripHtml(license);
  if (/noncommercial|no derivatives|all rights reserved/i.test(cleaned)) return false;
  return FREE_LICENSE_HINT.test(cleaned) || /public domain/i.test(cleaned);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

interface PageImageHit {
  fileTitle: string;
  thumbUrl: string;
  wikiTitle: string;
}

async function fetchPageImages(
  lang: "sk" | "en",
  titles: string[],
): Promise<Map<string, PageImageHit>> {
  const hits = new Map<string, PageImageHit>();
  if (titles.length === 0) return hits;

  const endpoint =
    lang === "sk"
      ? "https://sk.wikipedia.org/w/api.php"
      : "https://en.wikipedia.org/w/api.php";

  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    const url = new URL(endpoint);
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("formatversion", "2");
    url.searchParams.set("prop", "pageimages");
    url.searchParams.set("piprop", "thumbnail|name");
    url.searchParams.set("pithumbsize", String(THUMB_WIDTH));
    url.searchParams.set("pilicense", "free");
    url.searchParams.set("pilimit", "50");
    url.searchParams.set("redirects", "1");
    url.searchParams.set("titles", batch.join("|"));

    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`${lang} wiki HTTP ${response.status}`);
    const data = (await response.json()) as {
      query?: {
        normalized?: Array<{ from: string; to: string }>;
        pages?: Array<{
          missing?: boolean;
          pageimage?: string;
          title?: string;
          thumbnail?: { source?: string };
        }>;
        redirects?: Array<{ from: string; to: string }>;
      };
    };

    const remap = new Map<string, string>();
    for (const row of data.query?.normalized ?? []) remap.set(row.from, row.to);
    for (const row of data.query?.redirects ?? []) remap.set(row.from, row.to);

    const resolve = (title: string): string => {
      let current = title;
      const seen = new Set<string>();
      while (remap.has(current) && !seen.has(current)) {
        seen.add(current);
        current = remap.get(current)!;
      }
      return current;
    };

    const byPage = new Map<string, PageImageHit>();
    for (const page of data.query?.pages ?? []) {
      if (!page.title || page.missing || !page.pageimage || !page.thumbnail?.source) {
        continue;
      }
      if (isRejectedCommonsTitle(page.pageimage)) continue;
      byPage.set(page.title, {
        fileTitle: normalizeCommonsFile(page.pageimage).replace(/^File:/i, ""),
        thumbUrl: page.thumbnail.source,
        wikiTitle: page.title,
      });
    }

    for (const requested of batch) {
      const hit = byPage.get(resolve(requested));
      if (hit) hits.set(requested, hit);
    }
    await sleep(350);
  }

  return hits;
}

async function searchCommons(query: string): Promise<ImageSourceHit[]> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "8");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|extmetadata");
  url.searchParams.set("iiurlwidth", String(THUMB_WIDTH));

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    return [];
  }
  if (!response.ok) return [];
  const data = (await response.json()) as {
    query?: {
      pages?: Array<{
        missing?: boolean;
        title?: string;
        imageinfo?: Array<{
          descriptionurl?: string;
          extmetadata?: Record<string, { value?: string }>;
          mime?: string;
          thumburl?: string;
          url?: string;
        }>;
      }>;
    };
  };

  const out: ImageSourceHit[] = [];
  for (const page of data.query?.pages ?? []) {
    if (!page.title || page.missing) continue;
    if (isRejectedCommonsTitle(page.title)) continue;
    const info = page.imageinfo?.[0];
    if (!info || !isBitmapMime(info.mime)) continue;
    const thumbUrl = info.thumburl || info.url;
    if (!thumbUrl) continue;
    const meta = info.extmetadata ?? {};
    const licenseRaw = meta.LicenseShortName?.value ?? meta.License?.value;
    const license = licenseRaw ? stripHtml(licenseRaw) : undefined;
    if (license && !licenseLooksFree(license)) continue;
    out.push({
      fileTitle: normalizeCommonsFile(page.title).replace(/^File:/i, ""),
      query,
      sourcePageUrl: info.descriptionurl,
      thumbUrl,
    });
  }
  await sleep(400);
  return out;
}

async function findCommonsHit(target: ImageTarget): Promise<ImageSourceHit | undefined> {
  const head = glossSearchTitle(target.gloss);
  if (!head) return undefined;
  const queries = nounCommonsQueries(target);
  const allowArticle = target.category !== "Nouns";

  for (const query of queries.slice(0, 5)) {
    const hits = await searchCommons(query);
    const titled = pickTitledCommonsHit(hits, head, {
      allowArticle,
      preferCartoon: prefersCartoonCommons(target),
    });
    if (titled) return titled;
  }
  return undefined;
}

async function searchOpenverse(query: string): Promise<ImageSourceHit | undefined> {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", query);
  url.searchParams.set("page_size", "5");
  url.searchParams.set("mature", "false");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    console.warn(`openverse timeout for “${query}”`);
    return undefined;
  }
  if (!response.ok) {
    console.warn(`openverse HTTP ${response.status} for “${query}”`);
    return undefined;
  }
  const data = (await response.json()) as {
    results?: Array<{
      foreign_landing_url?: string;
      license?: string;
      thumbnail?: string;
      title?: string;
      url?: string;
    }>;
  };

  for (const row of data.results ?? []) {
    const thumbUrl = row.thumbnail || row.url;
    if (!thumbUrl) continue;
    const license = row.license?.trim() ?? "";
    if (license && !OPENVERSE_LICENSE.test(license.replace(/^cc-/, ""))) continue;
    if (isRejectedCommonsTitle(row.title ?? "")) continue;
    return {
      fileTitle: row.title?.trim() || query,
      query,
      sourcePageUrl: row.foreign_landing_url,
      thumbUrl,
    };
  }
  return undefined;
}

function toHit(page: PageImageHit | undefined): ImageSourceHit | null {
  if (!page) return null;
  return {
    fileTitle: page.fileTitle,
    sourcePageUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(page.fileTitle)}`,
    thumbUrl: page.thumbUrl,
  };
}

async function main(): Promise<void> {
  const { abstracts, limit, only, partOfSpeech } = parsePreviewArgs(
    process.argv.slice(2),
  );

  let targets = collectImageTargets({
    only: only?.length === 1 ? only[0] : undefined,
    partOfSpeech,
  });
  if (only && only.length > 1) {
    const want = new Set(only);
    targets = collectImageTargets().filter((target) => want.has(target.slug));
  }
  if (!abstracts && !only) {
    targets = targets.filter(
      (target) => allowsCommonsAutoPromote(target) || hasCommonsSafeTheme(target),
    );
  }
  targets = targets.slice(0, limit);

  console.log(`Preview targets: ${targets.length}`);

  const skTitles = [...new Set(targets.map((target) => target.slovak))];
  const enTitles = [
    ...new Set(
      targets
        .filter((target) => !isVerbLikeCategory(target.category))
        .map((target) => glossSearchTitle(target.gloss))
        .filter((title) => title.length > 0),
    ),
  ];

  console.log(`Querying sk.wikipedia (${skTitles.length})…`);
  const skHits = await fetchPageImages("sk", skTitles);
  console.log(`Querying en.wikipedia (${enTitles.length})…`);
  const enHits = await fetchPageImages("en", enTitles);

  const rows: ImageSourcePreviewRow[] = [];
  for (const target of targets) {
    const enTitle = glossSearchTitle(target.gloss);
    const commons = await findCommonsHit(target);
    const openverseQuery = nounCommonsQueries(target)[0] ?? enTitle;
    const openverse = openverseQuery ? await searchOpenverse(openverseQuery) : undefined;
    await sleep(150);

    const live = getImageManifestEntry(target.slug);
    const liveFile = live?.status === "ok" ? live.file : undefined;
    const cdn = process.env.PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, "");

    rows.push({
      category: target.category,
      english: target.english,
      hits: {
        sk: toHit(skHits.get(target.slovak)),
        en: enTitle ? toHit(enHits.get(enTitle)) : null,
        commons: commons ?? null,
        openverse: openverse ?? null,
      },
      liveSrc: liveFile
        ? cdn
          ? `${cdn}/images/dictionary/${liveFile}`
          : `/images/dictionary/${liveFile}`
        : undefined,
      slovak: target.slovak,
      slug: target.slug,
    });
    console.log(
      `${target.slug}: sk=${rows.at(-1)?.hits.sk ? "y" : "n"} en=${rows.at(-1)?.hits.en ? "y" : "n"} commons=${commons ? "y" : "n"} openverse=${openverse ? "y" : "n"}`,
    );
  }

  const file: ImageSourcePreviewFile = {
    generatedAt: new Date().toISOString(),
    rows,
  };
  await mkdir(path.dirname(PREVIEW_PATH), { recursive: true });
  await writeFile(PREVIEW_PATH, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path.relative(ROOT, PREVIEW_PATH)}`);
  console.log("Open /dev/images/compare");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
