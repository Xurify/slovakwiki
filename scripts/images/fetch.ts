/**
 * Fetch free-licensed Wikipedia / Commons images for dictionary lemmas.
 *
 * Usage:
 *   bun scripts/images/fetch.ts
 *   bun scripts/images/fetch.ts -- --limit 100
 *   bun scripts/images/fetch.ts -- --pos noun
 *   bun scripts/images/fetch.ts -- --only kolac --force
 *
 * Order: override → SK pageimages → EN pageimages (non-verbs) →
 * Commons gloss search for concrete non-verbs (e.g. obed → “lunch meal”).
 * Verbs stay empty unless staged + promoted (false-friend risk).
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { ImageManifestEntry } from "../../src/lib/catalog/dictionary/images";
import {
  type ImageManifest,
  type ImageTarget,
  THUMB_WIDTH,
  USER_AGENT,
  allowsCommonsAutoPromote,
  commonsTitleMatchesGloss,
  collectImageTargets,
  ensureImagesDir,
  extensionFromMimeOrUrl,
  glossSearchTitle,
  hasCommonsSafeTheme,
  isBitmapMime,
  isRejectedCommonsTitle,
  isVerbLikeCategory,
  loadManifest,
  loadOverrides,
  localImagePath,
  missingEntry,
  MIN_THUMB_PX,
  normalizeCommonsFile,
  nounCommonsQueries,
  parseArgs,
  rejectedEntry,
  saveManifest,
  shouldSkipWithDisk,
  stripHtml,
} from "./shared";

type WikiLang = "en" | "sk";

interface PageImageHit {
  fileTitle: string;
  lang: WikiLang;
  thumbUrl?: string;
  wikiTitle: string;
}

interface FileMeta {
  artist?: string;
  descriptionUrl: string;
  height?: number;
  license?: string;
  licenseUrl?: string;
  mime?: string;
  thumbUrl: string;
  width?: number;
}

interface MwPage {
  missing?: boolean;
  pageimage?: string;
  title?: string;
  thumbnail?: { height?: number; source?: string; width?: number };
  imageinfo?: Array<{
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string }>;
    height?: number;
    mime?: string;
    thumburl?: string;
    url?: string;
    width?: number;
  }>;
}

interface MwQueryResponse {
  query?: {
    normalized?: Array<{ from: string; to: string }>;
    pages?: MwPage[] | Record<string, MwPage>;
    redirects?: Array<{ from: string; to: string }>;
  };
}

function pagesList(data: MwQueryResponse): MwPage[] {
  const pages = data.query?.pages;
  if (!pages) return [];
  return Array.isArray(pages) ? pages : Object.values(pages);
}

/** Map each requested title to its final resolved page title (normalize + redirect). */
function requestedToResolved(
  data: MwQueryResponse,
  requested: string[],
): Map<string, string> {
  const remap = new Map<string, string>();
  for (const row of data.query?.normalized ?? []) {
    remap.set(row.from, row.to);
  }
  for (const row of data.query?.redirects ?? []) {
    remap.set(row.from, row.to);
  }

  function resolve(title: string): string {
    let current = title;
    const seen = new Set<string>();
    while (remap.has(current) && !seen.has(current)) {
      seen.add(current);
      current = remap.get(current)!;
    }
    return current;
  }

  return new Map(requested.map((title) => [title, resolve(title)]));
}

const API: Record<WikiLang | "commons", string> = {
  sk: "https://sk.wikipedia.org/w/api.php",
  en: "https://en.wikipedia.org/w/api.php",
  commons: "https://commons.wikimedia.org/w/api.php",
};

const BATCH = 40;
const FREE_LICENSE_HINT = /^(cc0|cc[-\s]?by|public domain|pd|pdm|gfdl|creativecommons)/i;
const PAGEIMAGE_PAUSE_MS = 350;
const IMAGEINFO_PAUSE_MS = 400;
const DOWNLOAD_PAUSE_MS = 250;
const MAX_RETRIES = 8;

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function retryAfterMs(response: Response, attempt: number): number {
  const header = response.headers.get("retry-after");
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(seconds * 1000, 120_000);
    }
  }
  // Exponential backoff: 1s, 2s, 4s… capped at 60s
  return Math.min(1000 * 2 ** attempt, 60_000);
}

async function mwGet(
  endpoint: string,
  params: Record<string, string>,
): Promise<MwQueryResponse> {
  const url = new URL(endpoint);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });

    if (response.ok) {
      return (await response.json()) as MwQueryResponse;
    }

    if (response.status === 429 || response.status === 503) {
      const wait = retryAfterMs(response, attempt);
      console.warn(
        `rate-limited ${url.host} (HTTP ${response.status}); wait ${Math.round(wait / 1000)}s…`,
      );
      await sleep(wait);
      continue;
    }

    throw new Error(`MediaWiki HTTP ${response.status} for ${url.host}`);
  }

  throw new Error(`MediaWiki rate limit exhausted for ${url.host}`);
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function fetchPageImages(
  lang: WikiLang,
  titles: string[],
): Promise<Map<string, PageImageHit>> {
  const hits = new Map<string, PageImageHit>();
  if (titles.length === 0) return hits;

  for (const batch of chunk(titles, BATCH)) {
    const data = await mwGet(API[lang], {
      prop: "pageimages",
      piprop: "thumbnail|name",
      pithumbsize: String(THUMB_WIDTH),
      pilicense: "free",
      pilimit: "50",
      redirects: "1",
      titles: batch.join("|"),
    });
    await sleep(PAGEIMAGE_PAUSE_MS);

    const titleMap = requestedToResolved(data, batch);
    const byPageTitle = new Map<string, PageImageHit>();

    for (const page of pagesList(data)) {
      if (!page.title || page.missing || !page.pageimage) continue;
      if (isRejectedCommonsTitle(page.pageimage)) continue;
      const thumb = page.thumbnail;
      if (thumb?.width && thumb.width < MIN_THUMB_PX) continue;
      if (thumb?.height && thumb.height < MIN_THUMB_PX) continue;

      byPageTitle.set(page.title, {
        fileTitle: normalizeCommonsFile(page.pageimage),
        lang,
        thumbUrl: thumb?.source,
        wikiTitle: page.title,
      });
    }

    for (const requested of batch) {
      const resolved = titleMap.get(requested) ?? requested;
      const hit = byPageTitle.get(resolved);
      if (hit) hits.set(requested, hit);
    }
  }

  return hits;
}

function licenseLooksFree(license: string | undefined): boolean {
  if (!license) return false;
  const cleaned = stripHtml(license);
  if (/noncommercial|no derivatives|all rights reserved/i.test(cleaned)) {
    return false;
  }
  return FREE_LICENSE_HINT.test(cleaned) || /public domain/i.test(cleaned);
}

async function fetchFileMeta(
  fileTitle: string,
  preferredThumbUrl?: string,
  preferredLang?: WikiLang,
): Promise<FileMeta | undefined> {
  const title = normalizeCommonsFile(fileTitle);
  const endpoints =
    preferredLang === "en"
      ? [API.en, API.commons, API.sk]
      : preferredLang === "sk"
        ? [API.sk, API.commons, API.en]
        : [API.commons, API.sk, API.en];

  for (const endpoint of endpoints) {
    const data = await mwGet(endpoint, {
      prop: "imageinfo",
      titles: title,
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: String(THUMB_WIDTH),
    });
    await sleep(IMAGEINFO_PAUSE_MS);

    for (const page of pagesList(data)) {
      if (page.missing) continue;
      const info = page.imageinfo?.[0];
      if (!info) continue;

      const mime = info.mime;
      if (!isBitmapMime(mime)) continue;

      const thumbUrl = preferredThumbUrl || info.thumburl || info.url;
      if (!thumbUrl) continue;

      const width = info.width;
      const height = info.height;
      if ((width && width < MIN_THUMB_PX) || (height && height < MIN_THUMB_PX)) {
        continue;
      }

      const meta = info.extmetadata ?? {};
      const licenseRaw = meta.LicenseShortName?.value ?? meta.License?.value ?? undefined;
      const license = licenseRaw ? stripHtml(licenseRaw) : undefined;
      const licenseUrl = meta.LicenseUrl?.value
        ? stripHtml(meta.LicenseUrl.value)
        : undefined;
      const artist = meta.Artist?.value ? stripHtml(meta.Artist.value) : undefined;

      // pageimages already used pilicense=free; still gate override / commons picks
      if (license && !licenseLooksFree(license)) continue;

      return {
        artist: artist || undefined,
        descriptionUrl:
          info.descriptionurl ??
          `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
        height,
        license,
        licenseUrl,
        mime,
        thumbUrl,
        width,
      };
    }
  }

  return undefined;
}

async function downloadThumb(url: string, destPath: string): Promise<{ bytes: number }> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(destPath, buffer);
      await sleep(DOWNLOAD_PAUSE_MS);
      return { bytes: buffer.length };
    }

    if (response.status === 429 || response.status === 503) {
      const wait = retryAfterMs(response, attempt);
      console.warn(
        `rate-limited download (HTTP ${response.status}); wait ${Math.round(wait / 1000)}s…`,
      );
      await sleep(wait);
      continue;
    }

    throw new Error(`Download failed HTTP ${response.status}: ${url}`);
  }

  throw new Error(`Download rate limit exhausted: ${url}`);
}

function captionFor(target: ImageTarget): string {
  return (
    glossSearchTitle(target.english) ||
    target.english.split(";")[0]?.trim() ||
    target.slovak
  );
}

function resolveHitForTarget(
  target: ImageTarget,
  skHits: Map<string, PageImageHit>,
  enHits: Map<string, PageImageHit>,
): PageImageHit | undefined {
  const sk = skHits.get(target.slovak);
  if (sk) return sk;

  // Verbs: skip EN pageimages (false friends like "Time management" for robiť).
  // Commons search is staged + visually audited via images:stage / images:promote.
  if (isVerbLikeCategory(target.category)) {
    return undefined;
  }

  const enTitle = glossSearchTitle(target.gloss);
  if (!enTitle) return undefined;
  return enHits.get(enTitle);
}

interface CommonsSearchHit {
  commonsFile: string;
  thumbUrl: string;
}

async function searchCommonsByQuery(
  query: string,
  limit = 6,
): Promise<CommonsSearchHit[]> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", String(limit * 2));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|mime|extmetadata");
  url.searchParams.set("iiurlwidth", String(THUMB_WIDTH));

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (response.status === 429 || response.status === 503) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (!response.ok) throw new Error(`Commons HTTP ${response.status}`);

    const data = (await response.json()) as {
      query?: {
        pages?: Array<{
          missing?: boolean;
          title?: string;
          imageinfo?: Array<{
            extmetadata?: Record<string, { value?: string }>;
            mime?: string;
            thumburl?: string;
            url?: string;
          }>;
        }>;
      };
    };

    const out: CommonsSearchHit[] = [];
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
        commonsFile: normalizeCommonsFile(page.title).replace(/^File:/i, ""),
        thumbUrl,
      });
      if (out.length >= limit) break;
    }
    await sleep(IMAGEINFO_PAUSE_MS);
    return out;
  }
  return [];
}

/** Commons gloss fallback when Wikipedia pageimages miss (non-verbs only). */
async function findCommonsHitForTarget(
  target: ImageTarget,
): Promise<PageImageHit | undefined> {
  if (!allowsCommonsAutoPromote(target)) return undefined;

  const head = glossSearchTitle(target.gloss);
  if (!head) return undefined;

  const queries = nounCommonsQueries(target);
  let fallback: CommonsSearchHit | undefined;

  for (const query of queries.slice(0, 3)) {
    const hits = await searchCommonsByQuery(query, 6);
    const allowArticle = target.category !== "Nouns";
    const titled = hits.find((hit) =>
      commonsTitleMatchesGloss(hit.commonsFile, head, { allowArticle }),
    );
    if (titled) {
      return {
        fileTitle: titled.commonsFile,
        lang: "sk",
        thumbUrl: titled.thumbUrl,
        wikiTitle: target.slovak,
      };
    }
    // Safe visual themes: accept top free hit even without title match.
    // Skip Phrases / Essentials — short glosses need a title match.
    if (!fallback && hits[0] && hasCommonsSafeTheme(target)) {
      fallback = hits[0];
    }
  }

  if (!fallback) return undefined;
  return {
    fileTitle: fallback.commonsFile,
    lang: "sk",
    thumbUrl: fallback.thumbUrl,
    wikiTitle: target.slovak,
  };
}

async function applyOk(
  target: ImageTarget,
  hit: PageImageHit,
  now: string,
  manifest: ImageManifest,
): Promise<"ok" | "missing"> {
  if (isRejectedCommonsTitle(hit.fileTitle)) return "missing";

  const meta = await fetchFileMeta(hit.fileTitle, hit.thumbUrl, hit.lang);
  if (!meta) return "missing";

  const ext = extensionFromMimeOrUrl(meta.mime, meta.thumbUrl);
  const file = `${target.slug}.${ext}`;
  const dest = localImagePath(file);

  await downloadThumb(meta.thumbUrl, dest);

  const entry: ImageManifestEntry = {
    artist: meta.artist,
    caption: captionFor(target),
    commonsFile: hit.fileTitle.replace(/^File:/i, ""),
    fetchedAt: now,
    file,
    license: meta.license,
    licenseUrl: meta.licenseUrl,
    sourcePageUrl: meta.descriptionUrl,
    status: "ok",
    wikiLang: hit.lang,
    wikiTitle: hit.wikiTitle,
  };
  manifest[target.slug] = entry;
  return "ok";
}

async function main(): Promise<void> {
  const { force, limit, only, partOfSpeech } = parseArgs(process.argv.slice(2));
  const overrides = await loadOverrides();
  const manifest = await loadManifest();
  await ensureImagesDir();

  let targets = collectImageTargets({ only, partOfSpeech });
  if (limit !== undefined) targets = targets.slice(0, limit);

  console.log(
    `Targets: ${targets.length}${partOfSpeech ? ` (pos=${partOfSpeech})` : ""}`,
  );
  if (only) console.log(`Only: ${only}`);
  if (force) console.log("Force: regenerating existing ok entries");

  const now = new Date().toISOString();
  let skipped = 0;
  let rejected = 0;
  let ok = 0;
  let okCommons = 0;
  let missing = 0;
  let errors = 0;

  const needsWiki: ImageTarget[] = [];
  const overrideTargets: { target: ImageTarget; commonsFile: string }[] = [];

  for (const target of targets) {
    const override = overrides[target.slug];

    if (override?.reject) {
      manifest[target.slug] = rejectedEntry(now);
      rejected += 1;
      continue;
    }

    if (await shouldSkipWithDisk(target.slug, manifest, force)) {
      skipped += 1;
      continue;
    }

    if (override?.commonsFile) {
      overrideTargets.push({
        target,
        commonsFile: normalizeCommonsFile(override.commonsFile),
      });
      continue;
    }

    needsWiki.push(target);
  }

  // Override commons files
  for (const { target, commonsFile } of overrideTargets) {
    try {
      const result = await applyOk(
        target,
        {
          fileTitle: commonsFile,
          lang: "sk",
          wikiTitle: target.slovak,
        },
        now,
        manifest,
      );
      if (result === "ok") {
        ok += 1;
        console.log(`ok (override) ${target.slug}`);
      } else {
        manifest[target.slug] = missingEntry(now);
        missing += 1;
        console.log(`missing (override) ${target.slug}`);
      }
    } catch (error) {
      errors += 1;
      manifest[target.slug] = missingEntry(now);
      console.error(
        `error ${target.slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // SK Wikipedia pageimages
  const skTitles = [...new Set(needsWiki.map((t) => t.slovak))];
  console.log(`Querying sk.wikipedia pageimages (${skTitles.length} titles)…`);
  const skHits = await fetchPageImages("sk", skTitles);

  const stillNeedEn: ImageTarget[] = [];
  for (const target of needsWiki) {
    if (skHits.has(target.slovak)) continue;
    // Verbs use Commons search instead of EN pageimages.
    if (isVerbLikeCategory(target.category)) continue;
    stillNeedEn.push(target);
  }

  const enTitles = [
    ...new Set(
      stillNeedEn
        .map((t) => glossSearchTitle(t.gloss))
        .filter((title) => title.length > 0),
    ),
  ];
  console.log(`Querying en.wikipedia pageimages (${enTitles.length} titles)…`);
  const enHits = await fetchPageImages("en", enTitles);

  for (const target of needsWiki) {
    try {
      let hit = resolveHitForTarget(target, skHits, enHits);
      let fromCommons = false;

      if (!hit) {
        hit = await findCommonsHitForTarget(target);
        fromCommons = Boolean(hit);
      }

      // Verbs (and other non-auto lemmas): leave missing — stage + promote instead.
      if (!hit) {
        manifest[target.slug] = missingEntry(now);
        missing += 1;
        continue;
      }

      const result = await applyOk(target, hit, now, manifest);
      if (result === "ok") {
        ok += 1;
        if (fromCommons) {
          okCommons += 1;
          console.log(`ok (commons) ${target.slug} ← ${hit.fileTitle}`);
        }
        if (ok % 25 === 0) {
          console.log(`… ${ok} saved`);
          await saveManifest(manifest);
        }
      } else {
        manifest[target.slug] = missingEntry(now);
        missing += 1;
      }
    } catch (error) {
      errors += 1;
      manifest[target.slug] = missingEntry(now);
      console.error(
        `error ${target.slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Persist progress so a long 429 storm does not lose earlier oks.
      if (errors % 10 === 0) await saveManifest(manifest);
    }
  }

  await saveManifest(manifest);

  console.log(
    `Done. ok=${ok} (commons=${okCommons}) missing=${missing} rejected=${rejected} skipped=${skipped} errors=${errors}`,
  );
  console.log(
    `Manifest: ${path.relative(process.cwd(), path.join("content", "images", "manifest.json"))}`,
  );
  console.log(`Files: static/images/dictionary/`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
