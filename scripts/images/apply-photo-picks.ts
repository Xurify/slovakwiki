/**
 * Write hand-picked stock photos from photo-picks.json into the image manifest.
 *
 * Usage:
 *   bun scripts/images/apply-photo-picks.ts            # needs UNSPLASH_ACCESS_KEY + PIXABAY_API_KEY
 *   bun scripts/images/apply-photo-picks.ts -- --dry-run
 *   bun scripts/images/apply-photo-picks.ts -- --offline   # no API calls
 *
 * Unsplash picks are hotlinked (API terms forbid re-hosting), and each one
 * triggers the photo's download_location once, which the terms also require.
 * --offline writes picks from the data saved at audit time so they show up
 * while the hourly API limit is spent; the next normal run sends the download
 * events and fills in missing photographer links.
 *
 * Pixabay forbids hotlinking, so Pixabay picks are downloaded to
 * static/images/dictionary/ like Commons images. Run upload.ts afterwards: the
 * production site serves those files from R2, so a Pixabay manifest entry must
 * not reach master before its file is uploaded. Re-running skips picks already
 * applied and tracked, and re-downloads a Pixabay file only when it is missing.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";
import {
  USER_AGENT,
  collectImageTargets,
  glossSearchTitle,
  loadManifest,
  localImagePath,
  saveManifest,
  type ImageManifestEntry,
} from "./shared";

const PICKS_PATH = path.join(ROOT, "scripts", "images", "photo-picks.json");
const UNSPLASH_LICENSE_URL = "https://unsplash.com/license";
const PIXABAY_LICENSE_URL = "https://pixabay.com/service/license-summary/";

interface PhotoPick {
  artistUrl?: string;
  by?: string;
  desc?: string;
  downloadLocation?: string;
  id?: string;
  keep?: "live";
  originalUrl?: string;
  page?: string;
  query?: string;
  source: "unsplash" | "pixabay" | "wikimedia";
  why: string;
}

interface UnsplashPhoto {
  links: { download_location: string; html: string };
  urls: { regular: string };
  user: { links: { html: string }; name: string };
}

interface PixabayHit {
  pageURL: string;
  user: string;
  user_id: number;
  webformatURL: string;
}

class RateLimited extends Error {}

/** Pixabay image URLs expire after 24 hours, so look the photo up again by id. */
async function downloadPixabay(id: string, file: string): Promise<PixabayHit> {
  const key = process.env.PIXABAY_API_KEY?.trim();
  if (!key) throw new Error("PIXABAY_API_KEY missing");
  const url = new URL("https://pixabay.com/api/");
  url.searchParams.set("key", key);
  url.searchParams.set("id", id);
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Pixabay HTTP ${response.status} for ${id}`);
  const hit = ((await response.json()) as { hits?: PixabayHit[] }).hits?.[0];
  if (!hit) throw new Error(`Pixabay photo ${id} not found`);

  const image = await fetch(hit.webformatURL, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  if (!image.ok) throw new Error(`Pixabay image HTTP ${image.status} for ${id}`);
  const dest = localImagePath(file);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await image.arrayBuffer()));
  return hit;
}

async function unsplashGet<T>(url: string, key: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}`, "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 403 || response.status === 429) {
    throw new RateLimited(`Unsplash rate limit (${response.status})`);
  }
  if (!response.ok) throw new Error(`Unsplash HTTP ${response.status} for ${url}`);
  return (await response.json()) as T;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const offline = process.argv.includes("--offline");
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key && !dryRun && !offline) throw new Error("UNSPLASH_ACCESS_KEY missing");

  const picks = JSON.parse(await readFile(PICKS_PATH, "utf8")) as Record<
    string,
    PhotoPick
  >;
  const manifest = await loadManifest();
  const englishBySlug = new Map(
    collectImageTargets().map((target) => [target.slug, target.english]),
  );
  const now = new Date().toISOString();
  const counts = { applied: 0, already: 0, pixabay: 0, wikimedia: 0 };

  for (const entry of Object.values(manifest)) {
    if (entry.status === "ok" && !entry.source && entry.sourcePageUrl) {
      entry.source = "wikimedia";
    }
  }

  try {
    for (const [slug, pick] of Object.entries(picks)) {
      const previous = manifest[slug];

      if (pick.source === "wikimedia") {
        counts.wikimedia += 1;
        continue;
      }
      if (!pick.id) continue;
      if (pick.source === "pixabay") {
        const file = `${slug}.jpg`;
        const done =
          previous?.source === "pixabay" &&
          previous.sourceId === pick.id &&
          existsSync(localImagePath(file));
        if (done || offline) {
          counts.already += 1;
          continue;
        }
        if (dryRun) {
          console.log(`would apply ${slug} ← pixabay ${pick.id}`);
          counts.pixabay += 1;
          continue;
        }
        const hit = await downloadPixabay(pick.id, file);
        manifest[slug] = {
          artist: hit.user,
          artistUrl: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
          caption:
            previous?.caption || glossSearchTitle(englishBySlug.get(slug) ?? "") || slug,
          fetchedAt: now,
          file,
          license: "Pixabay Content License",
          licenseUrl: PIXABAY_LICENSE_URL,
          query: pick.query,
          source: "pixabay",
          sourceId: pick.id,
          sourcePageUrl: hit.pageURL,
          status: "ok",
        };
        counts.pixabay += 1;
        console.log(
          `${slug} ← pixabay ${pick.id} (${hit.user}); run upload.ts before merging`,
        );
        continue;
      }
      const sameId = previous?.source === "unsplash" && previous.sourceId === pick.id;
      if (sameId && (previous.downloadTrackedAt || offline)) {
        counts.already += 1;
        continue;
      }
      if (dryRun) {
        console.log(`would apply ${slug} ← unsplash ${pick.id}`);
        counts.applied += 1;
        continue;
      }

      if (offline && !(pick.originalUrl && pick.page)) continue;

      // Picks from the bulk audit already carry every field; older ones need a lookup.
      const saved =
        pick.originalUrl && pick.page && pick.downloadLocation
          ? {
              links: { download_location: pick.downloadLocation, html: pick.page },
              urls: { regular: pick.originalUrl },
              user: { links: { html: pick.artistUrl ?? "" }, name: pick.by ?? "" },
            }
          : undefined;
      const photo: UnsplashPhoto =
        saved && (offline || pick.artistUrl)
          ? saved
          : await unsplashGet<UnsplashPhoto>(
              `https://api.unsplash.com/photos/${encodeURIComponent(pick.id)}`,
              key!,
            );
      if (!offline) await unsplashGet(photo.links.download_location, key!);

      const english = englishBySlug.get(slug) ?? "";
      const next: ImageManifestEntry = {
        artist: photo.user.name,
        artistUrl: photo.user.links.html || undefined,
        caption: previous?.caption || glossSearchTitle(english) || slug,
        downloadTrackedAt: offline ? undefined : now,
        fetchedAt: now,
        license: "Unsplash License",
        licenseUrl: UNSPLASH_LICENSE_URL,
        originalUrl: photo.urls.regular,
        query: pick.query,
        source: "unsplash",
        sourceId: pick.id,
        sourcePageUrl: photo.links.html,
        status: "ok",
      };
      manifest[slug] = next;
      counts.applied += 1;
      console.log(`${slug} ← unsplash ${pick.id} (${photo.user.name})`);
    }
  } catch (error: unknown) {
    if (!(error instanceof RateLimited)) throw error;
    console.warn(`${error.message}; saved progress, re-run in an hour for the rest.`);
  }

  if (!dryRun) await saveManifest(manifest);
  console.log(
    `unsplash applied ${counts.applied}, pixabay downloaded ${counts.pixabay}, already ${counts.already}, kept wikimedia ${counts.wikimedia}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
