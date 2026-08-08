/**
 * Stage Commons image candidates for visual audit (does NOT update live manifest).
 *
 * Usage:
 *   bun scripts/images/stage-candidates.ts -- --pos verb --limit 20
 *   bun scripts/images/stage-candidates.ts -- --only robit
 *
 * Writes tmp/image-candidates/{slug}/meta.json + candidate-*.{ext}
 * Promote approved picks with: bun scripts/images/promote.ts -- --slug robit --pick 0
 */

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";
import {
  THUMB_WIDTH,
  USER_AGENT,
  collectImageTargets,
  ensureImagesDir,
  extensionFromMimeOrUrl,
  isBitmapMime,
  isVerbLikeCategory,
  loadManifest,
  normalizeCommonsFile,
  parseArgs,
  shouldSkipWithDisk,
  stripHtml,
  verbActionQueries,
} from "./shared";

const PAUSE_MS = 400;

// Reuse fetch helpers by inlining a minimal Commons search here to avoid promoting live.

const CANDIDATES_DIR = path.join(ROOT, "tmp", "image-candidates");
const FREE_LICENSE_HINT = /^(cc0|cc[-\s]?by|public domain|pd|pdm|gfdl|creativecommons)/i;

interface Candidate {
  artist?: string;
  commonsFile: string;
  descriptionUrl: string;
  file: string;
  license?: string;
  licenseUrl?: string;
  query: string;
  thumbUrl: string;
}

interface CandidateMeta {
  caption: string;
  category: string;
  english: string;
  query?: string;
  slovak: string;
  slug: string;
  stagedAt: string;
  candidates: Candidate[];
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function licenseLooksFree(license: string | undefined): boolean {
  if (!license) return false;
  const cleaned = stripHtml(license);
  if (/noncommercial|no derivatives|all rights reserved/i.test(cleaned)) return false;
  return FREE_LICENSE_HINT.test(cleaned) || /public domain/i.test(cleaned);
}

async function searchCommonsCandidates(
  query: string,
  limit = 5,
): Promise<
  Array<{
    artist?: string;
    commonsFile: string;
    descriptionUrl: string;
    license?: string;
    licenseUrl?: string;
    mime?: string;
    thumbUrl: string;
  }>
> {
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
            descriptionurl?: string;
            extmetadata?: Record<string, { value?: string }>;
            height?: number;
            mime?: string;
            thumburl?: string;
            url?: string;
            width?: number;
          }>;
        }>;
      };
    };

    const out: Array<{
      artist?: string;
      commonsFile: string;
      descriptionUrl: string;
      license?: string;
      licenseUrl?: string;
      mime?: string;
      thumbUrl: string;
    }> = [];

    for (const page of data.query?.pages ?? []) {
      if (!page.title || page.missing) continue;
      if (
        /\b(icon|logo|symbol|flag_of|coat_of_arms|nude|naked|nudes|porn|nsfw|sexual)\b/i.test(
          page.title,
        )
      ) {
        continue;
      }
      const info = page.imageinfo?.[0];
      if (!info || !isBitmapMime(info.mime)) continue;
      const thumbUrl = info.thumburl || info.url;
      if (!thumbUrl) continue;
      const meta = info.extmetadata ?? {};
      const licenseRaw = meta.LicenseShortName?.value ?? meta.License?.value;
      const license = licenseRaw ? stripHtml(licenseRaw) : undefined;
      if (license && !licenseLooksFree(license)) continue;
      out.push({
        artist: meta.Artist?.value ? stripHtml(meta.Artist.value) : undefined,
        commonsFile: normalizeCommonsFile(page.title).replace(/^File:/i, ""),
        descriptionUrl:
          info.descriptionurl ??
          `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        license,
        licenseUrl: meta.LicenseUrl?.value ? stripHtml(meta.LicenseUrl.value) : undefined,
        mime: info.mime,
        thumbUrl,
      });
      if (out.length >= limit) break;
    }
    await sleep(PAUSE_MS);
    return out;
  }
  return [];
}

async function main(): Promise<void> {
  const { force, limit, only, partOfSpeech } = parseArgs(process.argv.slice(2));
  const manifest = await loadManifest();
  await ensureImagesDir();
  await mkdir(CANDIDATES_DIR, { recursive: true });

  let targets = collectImageTargets({ only, partOfSpeech });
  // Default staging focus: verbs / conversation that are not already ok on disk.
  targets = targets.filter((t) => isVerbLikeCategory(t.category));
  if (limit !== undefined) targets = targets.slice(0, limit);

  console.log(`Staging candidates for ${targets.length} verb-like lemmas…`);

  let staged = 0;
  let skipped = 0;

  for (const target of targets) {
    if (!force && (await shouldSkipWithDisk(target.slug, manifest, false))) {
      skipped += 1;
      continue;
    }

    const queries = verbActionQueries(target.gloss);
    if (queries.length === 0) {
      console.log(`skip ${target.slug}: no action query for “${target.english}”`);
      continue;
    }

    const found: Array<{
      artist?: string;
      commonsFile: string;
      descriptionUrl: string;
      license?: string;
      licenseUrl?: string;
      mime?: string;
      thumbUrl: string;
      query: string;
    }> = [];
    const seenFiles = new Set<string>();

    for (const query of queries.slice(0, 4)) {
      if (found.length >= 4) break;
      const hits = await searchCommonsCandidates(query, 4);
      for (const hit of hits) {
        if (seenFiles.has(hit.commonsFile)) continue;
        seenFiles.add(hit.commonsFile);
        found.push({ ...hit, query });
        if (found.length >= 4) break;
      }
      if (hits.length > 0) {
        console.log(`  ${target.slug}: “${query}” → ${hits.length} hit(s)`);
      }
    }

    if (found.length === 0) {
      console.log(
        `skip ${target.slug}: no Commons hits for ${queries.slice(0, 2).join(" | ")}`,
      );
      continue;
    }

    const dir = path.join(CANDIDATES_DIR, target.slug);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });

    const candidates: Candidate[] = [];
    for (let i = 0; i < found.length; i += 1) {
      const hit = found[i]!;
      const ext = extensionFromMimeOrUrl(hit.mime, hit.thumbUrl);
      const file = `candidate-${i}.${ext}`;
      const dest = path.join(dir, file);
      const response = await fetch(hit.thumbUrl, {
        headers: { "User-Agent": USER_AGENT },
      });
      if (!response.ok) continue;
      await writeFile(dest, Buffer.from(await response.arrayBuffer()));
      candidates.push({
        artist: hit.artist,
        commonsFile: hit.commonsFile,
        descriptionUrl: hit.descriptionUrl,
        file,
        license: hit.license,
        licenseUrl: hit.licenseUrl,
        query: hit.query,
        thumbUrl: hit.thumbUrl,
      });
      await sleep(150);
    }

    if (candidates.length === 0) continue;

    const primaryQuery = candidates[0]?.query ?? queries[0]!;
    const meta: CandidateMeta = {
      caption: primaryQuery,
      category: target.category,
      english: target.english,
      query: primaryQuery,
      slovak: target.slovak,
      slug: target.slug,
      stagedAt: new Date().toISOString(),
      candidates,
    };
    await writeFile(path.join(dir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
    staged += 1;
    console.log(
      `staged ${target.slug} (${candidates.length} candidates, primary “${primaryQuery}”)`,
    );
  }

  console.log(`Done. staged=${staged} skippedOk=${skipped}`);
  console.log(`Review under tmp/image-candidates/{slug}/ then images:promote`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
