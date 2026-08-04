/**
 * Upload static/audio/{kind}/*.mp3 to Cloudflare R2 (S3-compatible).
 * Object keys mirror local layout: lemma/{hash}.mp3, example/{hash}.mp3, lesson/{hash}.mp3
 *
 * Sets Cache-Control (immutable, 1y) + custom metadata (kind/hash/voice/text…).
 * Bun.S3Client lacks Cache-Control / x-amz-meta on this Bun version → aws4fetch PUT.
 *
 * Env:
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET
 *   R2_JURISDICTION (optional: `eu` | `fedramp` — required for jurisdiction buckets)
 *   PUBLIC_AUDIO_BASE_URL (optional, logged for sanity)
 *
 * Usage:
 *   bun run audio:upload
 *   bun run audio:upload -- --dry-run
 *   bun run audio:upload -- --limit 50
 *   bun run audio:upload -- --force   # re-PUT (refresh headers/metadata)
 *   bun run audio:upload -- --only "príliš hrdý" --force
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { AwsClient } from "aws4fetch";

import {
  AUDIO_CACHE_CONTROL,
  AUDIO_DIR,
  buildAudioObjectMetadata,
  listAudioObjectKeys,
  loadConfig,
  loadManifest,
  parseArgs,
  saveManifest,
  type AudioKind,
} from "./shared";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} missing (set in .env)`);
  return value;
}

function kindFromObjectKey(objectKey: string): AudioKind {
  if (objectKey.startsWith("lesson/")) return "lesson";
  if (objectKey.startsWith("example/")) return "example";
  return "lemma";
}

async function main(): Promise<void> {
  const { dryRun, force, limit, only } = parseArgs(process.argv.slice(2));

  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requireEnv("R2_BUCKET");
  const jurisdiction = (process.env.R2_JURISDICTION ?? "").trim().toLowerCase();
  const publicBase = process.env.PUBLIC_AUDIO_BASE_URL;

  // Jurisdiction buckets (e.g. EU badge) need `.<jurisdiction>` in the host.
  // https://developers.cloudflare.com/r2/reference/data-location/
  const endpointHost = jurisdiction
    ? `${accountId}.${jurisdiction}.r2.cloudflarestorage.com`
    : `${accountId}.r2.cloudflarestorage.com`;

  const aws = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  });

  const config = await loadConfig();
  const manifest = await loadManifest();
  let keys = await listAudioObjectKeys();

  if (only) {
    const needle = only.toLocaleLowerCase("sk");
    keys = keys.filter((objectKey) => {
      const hash = path.basename(objectKey, ".mp3");
      if (hash.toLowerCase().includes(needle)) return true;
      const text = manifest[hash]?.text ?? "";
      return text.toLocaleLowerCase("sk").includes(needle);
    });
    if (keys.length === 0) {
      throw new Error(`--only ${JSON.stringify(only)} matched 0 on-disk audio keys`);
    }
  }

  if (limit !== undefined) keys = keys.slice(0, limit);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  console.log(
    `Audio upload: ${keys.length} files → r2://${bucket}` +
      `${jurisdiction ? ` [${jurisdiction}]` : ""}` +
      `${publicBase ? ` (${publicBase})` : ""}` +
      ` cache=${AUDIO_CACHE_CONTROL}` +
      `${dryRun ? " [dry-run]" : ""}` +
      `${force ? " [force]" : ""}`,
  );

  for (const objectKey of keys) {
    const hash = path.basename(objectKey, ".mp3");
    const filePath = path.join(AUDIO_DIR, objectKey);
    const entry = manifest[hash];
    const kind = entry?.kind ?? kindFromObjectKey(objectKey);

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
      const body = await readFile(filePath);
      const info = await stat(filePath);
      const generatedAt = entry?.generatedAt ?? new Date().toISOString();
      const metadata = buildAudioObjectMetadata({
        config,
        generatedAt,
        hash,
        kind,
        text: entry?.text ?? "",
      });

      const headers: Record<string, string> = {
        "Content-Type": "audio/mpeg",
        "Cache-Control": AUDIO_CACHE_CONTROL,
        "Content-Disposition": "inline",
      };

      for (const [key, value] of Object.entries(metadata)) {
        headers[`x-amz-meta-${key}`] = value;
      }

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

      if (entry) {
        entry.bytes = info.size;
        entry.uploadedAt = new Date().toISOString();
      } else {
        manifest[hash] = {
          text: "",
          kind,
          bytes: info.size,
          generatedAt,
          uploadedAt: new Date().toISOString(),
        };
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
