/**
 * Upload static/audio/{kind}/*.mp3 to Cloudflare R2 (S3-compatible).
 * Object keys mirror local layout: lemma/{hash}.mp3, example/{hash}.mp3
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
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { S3Client } from "bun";

import {
  AUDIO_DIR,
  listAudioObjectKeys,
  loadManifest,
  parseArgs,
  saveManifest,
} from "./shared";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} missing (set in .env)`);
  return value;
}

async function main(): Promise<void> {
  const { dryRun, force, limit } = parseArgs(process.argv.slice(2));

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

  const client = new S3Client({
    accessKeyId,
    secretAccessKey,
    bucket,
    endpoint: `https://${endpointHost}`,
    // R2 is regionless; Bun/AWS SigV4 need an explicit region string.
    region: "auto",
  });

  const manifest = await loadManifest();
  let keys = await listAudioObjectKeys();
  if (limit !== undefined) keys = keys.slice(0, limit);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  console.log(
    `Audio upload: ${keys.length} files → r2://${bucket}` +
      `${jurisdiction ? ` [${jurisdiction}]` : ""}` +
      `${publicBase ? ` (${publicBase})` : ""}${dryRun ? " [dry-run]" : ""}`,
  );

  for (const objectKey of keys) {
    const hash = path.basename(objectKey, ".mp3");
    const filePath = path.join(AUDIO_DIR, objectKey);
    const entry = manifest[hash];

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
      await client.write(objectKey, body, {
        type: "audio/mpeg",
      });

      if (entry) {
        entry.bytes = info.size;
        entry.uploadedAt = new Date().toISOString();
      } else {
        const kind = objectKey.startsWith("example/") ? "example" : "lemma";
        manifest[hash] = {
          text: "",
          kind,
          bytes: info.size,
          generatedAt: new Date().toISOString(),
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
