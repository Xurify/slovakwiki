/**
 * Upload static/images/dictionary/* to Cloudflare R2 (S3-compatible).
 * Object keys mirror public paths: images/dictionary/{file}
 *
 * Sets Cache-Control (immutable, 1y) + Content-Type from extension.
 * Bun.S3Client lacks Cache-Control on this Bun version → aws4fetch PUT.
 *
 * Env:
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET
 *   R2_JURISDICTION (optional: `eu` | `fedramp`)
 *   PUBLIC_IMAGE_BASE_URL (optional, logged for sanity)
 *
 * Usage:
 *   bun scripts/images/upload.ts
 *   bun scripts/images/upload.ts -- --dry-run
 *   bun scripts/images/upload.ts -- --limit 50
 *   bun scripts/images/upload.ts -- --force
 *   bun scripts/images/upload.ts -- --only kolac --force
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { AwsClient } from "aws4fetch";

import {
  contentTypeForImageFile,
  IMAGE_CACHE_CONTROL,
  imageObjectKey,
  listLocalImageFiles,
  loadManifest,
  localImagePath,
  parseArgs,
  saveManifest,
} from "./shared";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} missing (set in .env)`);
  return value;
}

async function main(): Promise<void> {
  const { dryRun, force, limit, only } = parseArgs(process.argv.slice(2));

  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requireEnv("R2_BUCKET");
  const jurisdiction = (process.env.R2_JURISDICTION ?? "").trim().toLowerCase();
  const publicBase = process.env.PUBLIC_IMAGE_BASE_URL;

  const endpointHost = jurisdiction
    ? `${accountId}.${jurisdiction}.r2.cloudflarestorage.com`
    : `${accountId}.r2.cloudflarestorage.com`;

  const aws = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  });

  const manifest = await loadManifest();
  let files = await listLocalImageFiles();

  if (only) {
    const needle = only.toLocaleLowerCase("sk");
    files = files.filter((file) => {
      const stem = path.parse(file).name.toLocaleLowerCase("sk");
      if (stem.includes(needle) || file.toLocaleLowerCase("sk").includes(needle)) {
        return true;
      }
      return Object.entries(manifest).some(([slug, entry]) => {
        if (entry.file !== file) return false;
        return slug.toLocaleLowerCase("sk").includes(needle);
      });
    });
    if (files.length === 0) {
      throw new Error(`--only ${JSON.stringify(only)} matched 0 on-disk image files`);
    }
  }

  if (limit !== undefined) files = files.slice(0, limit);

  // Prefer uploading files that are in the manifest as ok; still allow orphans on disk.
  const slugByFile = new Map<string, string>();
  for (const [slug, entry] of Object.entries(manifest)) {
    if (entry.file) slugByFile.set(entry.file, slug);
  }

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  console.log(
    `Image upload: ${files.length} files → r2://${bucket}` +
      `${jurisdiction ? ` [${jurisdiction}]` : ""}` +
      `${publicBase ? ` (${publicBase})` : ""}` +
      ` cache=${IMAGE_CACHE_CONTROL}` +
      `${dryRun ? " [dry-run]" : ""}` +
      `${force ? " [force]" : ""}`,
  );

  for (const file of files) {
    const objectKey = imageObjectKey(file);
    const slug = slugByFile.get(file);
    const entry = slug ? manifest[slug] : undefined;

    if (entry?.uploadedAt && !force) {
      skipped += 1;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${objectKey}`);
      uploaded += 1;
      continue;
    }

    try {
      const filePath = localImagePath(file);
      const body = await readFile(filePath);
      const info = await stat(filePath);

      const headers: Record<string, string> = {
        "Content-Type": contentTypeForImageFile(file),
        "Cache-Control": IMAGE_CACHE_CONTROL,
        "Content-Disposition": "inline",
      };

      if (slug) headers["x-amz-meta-slug"] = slug;
      headers["x-amz-meta-file"] = file;

      const url = `https://${endpointHost}/${bucket}/${objectKey}`;
      const response = await aws.fetch(url, {
        method: "PUT",
        headers,
        body,
      });

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        throw new Error(`R2 ${response.status}: ${detail || response.statusText}`);
      }

      if (entry && slug) {
        entry.uploadedAt = new Date().toISOString();
      }

      uploaded += 1;
      console.log(`ok ${uploaded} ${objectKey} (${info.size} B)`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`fail ${objectKey}: ${message}`);
    }
  }

  if (!dryRun) {
    await saveManifest(manifest);
  }

  console.log(`Done. uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
