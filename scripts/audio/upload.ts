/**
 * Upload static/audio/{kind}/*.mp3 to Cloudflare R2 (S3-compatible).
 * Object keys: audio/{kind}/{hash}.mp3 on R2. Local disk: static/audio/{kind}/{hash}.mp3.
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
 *   bun scripts/audio/upload.ts
 *   bun scripts/audio/upload.ts -- --concurrency 256
 *   bun scripts/audio/upload.ts -- --lemmas-only
 *   bun scripts/audio/upload.ts -- --dry-run
 *   bun scripts/audio/upload.ts -- --limit 50
 *   bun scripts/audio/upload.ts -- --force   # re-PUT (refresh headers/metadata)
 *   bun scripts/audio/upload.ts -- --only "príliš hrdý" --force
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { AwsClient } from "aws4fetch";

import {
  AUDIO_CACHE_CONTROL,
  AUDIO_DIR,
  DEFAULT_UPLOAD_CONCURRENCY,
  buildAudioObjectMetadata,
  kindFromObjectKey,
  listAudioObjectKeys,
  loadConfig,
  loadManifest,
  mapPool,
  parseArgs,
  saveManifest,
  saveManifestFile,
  sortObjectKeysByKind,
  toR2AudioKey,
  type AudioKind,
} from "./shared";
import { compareRemoteClip, type RemoteClip } from "./remote-clip";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} missing (set in .env)`);
  return value;
}

async function main(): Promise<void> {
  const {
    concurrency,
    dryRun,
    examplesOnly,
    force,
    lemmasOnly,
    lessonsOnly,
    limit,
    only,
  } = parseArgs(process.argv.slice(2), { concurrency: DEFAULT_UPLOAD_CONCURRENCY });

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
  let keys = sortObjectKeysByKind(await listAudioObjectKeys());

  if (lemmasOnly) keys = keys.filter((k) => kindFromObjectKey(k) === "lemma");
  if (examplesOnly) keys = keys.filter((k) => kindFromObjectKey(k) === "example");
  if (lessonsOnly) keys = keys.filter((k) => kindFromObjectKey(k) === "lesson");

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

  const uploadConcurrency = concurrency;

  let uploaded = 0;
  let skipped = 0;
  let alreadyInR2 = 0;
  let remoteNewer = 0;
  let failed = 0;
  const startedAt = Date.now();

  // Workers stamp the manifest in memory; a timer persists it, so no upload ever
  // waits on a 15 MB JSON write.
  let manifestDirty = false;
  let addedEntries = false;
  let flushing: Promise<void> | undefined;

  function flushManifest(): Promise<void> {
    if (flushing) return flushing;
    if (!manifestDirty) return Promise.resolve();

    manifestDirty = false;
    flushing = saveManifestFile(manifest)
      .catch((error: unknown) => {
        manifestDirty = true;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`manifest save deferred (will retry): ${message}`);
      })
      .finally(() => {
        flushing = undefined;
      });
    return flushing;
  }

  const flushTimer = dryRun ? undefined : setInterval(() => void flushManifest(), 10_000);

  console.log(
    `Audio upload: ${keys.length} files → r2://${bucket}` +
      `${jurisdiction ? ` [${jurisdiction}]` : ""}` +
      `${publicBase ? ` (${publicBase})` : ""}` +
      ` concurrency=${uploadConcurrency}` +
      ` cache=${AUDIO_CACHE_CONTROL}` +
      `${dryRun ? " [dry-run]" : ""}` +
      `${force ? " [force]" : ""}` +
      `${lemmasOnly ? " [lemmas]" : ""}${examplesOnly ? " [examples]" : ""}${lessonsOnly ? " [lessons]" : ""}`,
  );

  /**
   * The manifest's `uploadedAt` goes stale across branches, so ask R2 before
   * sending bytes. A HEAD carries no body: it costs one round trip, not bandwidth.
   */
  async function headRemoteClip(url: string): Promise<RemoteClip | undefined> {
    const response = await aws.fetch(url, { method: "HEAD" });
    if (!response.ok) return undefined;
    return {
      bytes: Number(response.headers.get("content-length")),
      generatedAt: response.headers.get("x-amz-meta-generated-at"),
    };
  }

  function stampUploaded(
    hash: string,
    kind: AudioKind,
    size: number,
    generatedAt: string,
  ): void {
    const entry = manifest[hash];
    if (entry) {
      entry.bytes = size;
      entry.uploadedAt = new Date().toISOString();
    } else {
      manifest[hash] = {
        text: "",
        kind,
        bytes: size,
        generatedAt,
        uploadedAt: new Date().toISOString(),
      };
      addedEntries = true;
    }
    manifestDirty = true;
  }

  await mapPool(
    keys,
    dryRun ? Math.min(uploadConcurrency, 64) : uploadConcurrency,
    async (objectKey) => {
      const hash = path.basename(objectKey, ".mp3");
      const filePath = path.join(AUDIO_DIR, objectKey);
      const entry = manifest[hash];
      const kind: AudioKind = entry?.kind ?? kindFromObjectKey(objectKey);

      if (entry?.uploadedAt && !force) {
        skipped += 1;
        return;
      }

      if (dryRun) {
        console.log(`[dry-run] ${objectKey}`);
        uploaded += 1;
        return;
      }

      try {
        const info = await stat(filePath);
        const generatedAt = entry?.generatedAt ?? new Date().toISOString();
        const r2Key = toR2AudioKey(objectKey);
        const url = `https://${endpointHost}/${bucket}/${r2Key}`;

        if (!force) {
          const remoteClip = await headRemoteClip(url);
          const remote = compareRemoteClip(
            { bytes: info.size, generatedAt: entry?.generatedAt },
            remoteClip,
          );

          if (remote === "same") {
            stampUploaded(hash, kind, remoteClip?.bytes ?? info.size, generatedAt);
            alreadyInR2 += 1;
            return;
          }

          if (remote === "remote-newer") {
            remoteNewer += 1;
            console.warn(
              `skip ${r2Key}: R2 holds a newer take than this manifest ` +
                "(pull the manifest that uploaded it, or --force to overwrite)",
            );
            return;
          }
        }

        const body = await readFile(filePath);
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

        const response = await aws.fetch(url, {
          method: "PUT",
          headers,
          body,
        });

        if (!response.ok) {
          const detail = (await response.text()).slice(0, 500);
          throw new Error(`R2 ${response.status}: ${detail || response.statusText}`);
        }

        stampUploaded(hash, kind, info.size, generatedAt);
        uploaded += 1;
        console.log(`ok ${uploaded} ${r2Key} (${info.size} B)`);
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`fail ${objectKey}: ${message}`);
      }
    },
  );

  if (flushTimer) clearInterval(flushTimer);
  await flushing;

  if (!dryRun) {
    // A clip missing from the manifest is new to the runtime index too.
    if (addedEntries) await saveManifest(manifest);
    else await saveManifestFile(manifest);
  }

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  const rate =
    uploaded > 0 ? (uploaded / ((Date.now() - startedAt) / 1000)).toFixed(1) : "0";

  console.log(
    `Done. uploaded=${uploaded} already-in-r2=${alreadyInR2} remote-newer=${remoteNewer}` +
      ` skipped=${skipped} failed=${failed}` +
      ` rate=${rate}/s elapsed=${elapsedSec}s`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
