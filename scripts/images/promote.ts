/**
 * Promote a staged Commons candidate into the live dictionary image set.
 *
 * Usage:
 *   bun scripts/images/promote.ts -- --slug robit --pick 0
 *   bun scripts/images/promote.ts -- --slug hrat --pick 2
 *
 * Only run after visual audit of tmp/image-candidates/{slug}/candidate-*.*
 */

import { copyFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

import type { ImageManifestEntry } from "../../src/lib/content/images";
import { ROOT } from "../lib/paths";
import {
  extensionFromMimeOrUrl,
  loadManifest,
  localImagePath,
  saveManifest,
} from "./shared";

interface StagedCandidate {
  artist?: string;
  commonsFile: string;
  descriptionUrl: string;
  file: string;
  license?: string;
  licenseUrl?: string;
  query: string;
}

interface StagedMeta {
  caption: string;
  english: string;
  slovak: string;
  slug: string;
  candidates: StagedCandidate[];
}

function parsePromoteArgs(argv: string[]): { pick: number; slug: string } {
  let slug: string | undefined;
  let pick = 0;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--slug") {
      slug = argv[i + 1];
      i += 1;
    } else if (arg === "--pick") {
      pick = Number(argv[i + 1]);
      i += 1;
    }
  }

  if (!slug) throw new Error("--slug is required");
  if (!Number.isFinite(pick) || pick < 0) throw new Error("--pick must be >= 0");
  return { slug, pick: Math.floor(pick) };
}

async function main(): Promise<void> {
  const { slug, pick } = parsePromoteArgs(process.argv.slice(2));
  const metaPath = path.join(ROOT, "tmp", "image-candidates", slug, "meta.json");
  const meta = JSON.parse(await readFile(metaPath, "utf8")) as StagedMeta;
  const candidate = meta.candidates[pick];
  if (!candidate) {
    throw new Error(
      `No candidate #${pick} for ${slug} (have 0..${Math.max(0, meta.candidates.length - 1)})`,
    );
  }

  const src = path.join(ROOT, "tmp", "image-candidates", slug, candidate.file);
  const ext =
    extensionFromMimeOrUrl(undefined, candidate.file) ||
    candidate.file.split(".").pop() ||
    "jpg";
  const file = `${slug}.${ext}`;
  const dest = localImagePath(file);

  // Drop previous live file if extension changed.
  const manifest = await loadManifest();
  const previous = manifest[slug];
  if (previous?.file && previous.file !== file) {
    try {
      await unlink(localImagePath(previous.file));
    } catch {
      // ignore
    }
  }

  await copyFile(src, dest);

  const entry: ImageManifestEntry = {
    artist: candidate.artist,
    caption: meta.english || meta.caption,
    commonsFile: candidate.commonsFile,
    fetchedAt: new Date().toISOString(),
    file,
    license: candidate.license,
    licenseUrl: candidate.licenseUrl,
    sourcePageUrl: candidate.descriptionUrl,
    status: "ok",
    wikiLang: "en",
    wikiTitle: `Commons:${candidate.query} (audited)`,
  };
  manifest[slug] = entry;
  await saveManifest(manifest);

  console.log(`Promoted ${slug} ← candidate #${pick} (${candidate.commonsFile})`);
  console.log(`→ static/images/dictionary/${file}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
