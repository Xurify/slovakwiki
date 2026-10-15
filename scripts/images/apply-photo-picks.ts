/**
 * Write hand-picked stock photos from photo-picks.json into the image manifest.
 *
 * Usage:
 *   bun scripts/images/apply-photo-picks.ts            # needs UNSPLASH_ACCESS_KEY
 *   bun scripts/images/apply-photo-picks.ts -- --dry-run
 *
 * Unsplash picks are hotlinked (API terms forbid re-hosting), and each one
 * triggers the photo's download_location once, which the terms also require.
 * Pixabay picks are skipped for now: Pixabay forbids hotlinking, so they need
 * a download plus R2 upload first. Re-running skips picks already applied.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";
import {
  USER_AGENT,
  collectImageTargets,
  glossSearchTitle,
  loadManifest,
  saveManifest,
  type ImageManifestEntry,
} from "./shared";

const PICKS_PATH = path.join(ROOT, "scripts", "images", "photo-picks.json");
const UNSPLASH_LICENSE_URL = "https://unsplash.com/license";

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

class RateLimited extends Error {}

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
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key && !dryRun) throw new Error("UNSPLASH_ACCESS_KEY missing");

  const picks = JSON.parse(await readFile(PICKS_PATH, "utf8")) as Record<
    string,
    PhotoPick
  >;
  const manifest = await loadManifest();
  const englishBySlug = new Map(
    collectImageTargets().map((target) => [target.slug, target.english]),
  );
  const now = new Date().toISOString();
  const counts = { applied: 0, already: 0, pixabayPending: 0, wikimedia: 0 };

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
      if (pick.source === "pixabay") {
        counts.pixabayPending += 1;
        continue;
      }
      if (!pick.id) continue;
      if (previous?.source === "unsplash" && previous.sourceId === pick.id) {
        counts.already += 1;
        continue;
      }
      if (dryRun) {
        console.log(`would apply ${slug} ← unsplash ${pick.id}`);
        counts.applied += 1;
        continue;
      }

      // Picks from the bulk audit already carry every field; older ones need a lookup.
      const photo: UnsplashPhoto =
        pick.originalUrl && pick.artistUrl && pick.page && pick.downloadLocation
          ? {
              links: { download_location: pick.downloadLocation, html: pick.page },
              urls: { regular: pick.originalUrl },
              user: { links: { html: pick.artistUrl }, name: pick.by ?? "" },
            }
          : await unsplashGet<UnsplashPhoto>(
              `https://api.unsplash.com/photos/${encodeURIComponent(pick.id)}`,
              key!,
            );
      await unsplashGet(photo.links.download_location, key!);

      const english = englishBySlug.get(slug) ?? "";
      const next: ImageManifestEntry = {
        artist: photo.user.name,
        artistUrl: photo.user.links.html,
        caption: previous?.caption || glossSearchTitle(english) || slug,
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
    `applied ${counts.applied}, already ${counts.already}, kept wikimedia ${counts.wikimedia}, pixabay pending upload ${counts.pixabayPending}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
