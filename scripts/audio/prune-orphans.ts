/**
 * Remove orphan audio files (old model/settings hashes) from disk and optionally R2.
 *
 * Live keys = current config.json + dictionary/lesson targets.
 * Orphans = files under static/audio/{lemma|example|lesson}/ not in that set
 * (typical after switching multilingual_v2 → flash_v2_5 or voice settings).
 *
 * Default is dry-run. Pass --delete to remove.
 *
 * Usage:
 *   bun scripts/audio/prune-orphans.ts
 *   bun scripts/audio/prune-orphans.ts -- --delete
 *   bun scripts/audio/prune-orphans.ts -- --delete --r2
 *   bun scripts/audio/prune-orphans.ts -- --delete --local-only
 *   bun scripts/audio/prune-orphans.ts -- --limit 20
 */

import { unlink } from "node:fs/promises";
import path from "node:path";

import { AwsClient } from "aws4fetch";

import {
  AUDIO_DIR,
  DEFAULT_UPLOAD_CONCURRENCY,
  collectExpectedAudioObjectKeys,
  kindFromObjectKey,
  listAudioObjectKeys,
  loadConfig,
  loadManifest,
  mapPool,
  saveManifest,
  sortObjectKeysByKind,
  type AudioManifest,
} from "./shared";

function parsePruneArgs(argv: string[]): {
  concurrency: number;
  deleteFiles: boolean;
  dryRun: boolean;
  limit: number | undefined;
  localOnly: boolean;
  r2: boolean;
} {
  let concurrency = DEFAULT_UPLOAD_CONCURRENCY;
  let deleteFiles = false;
  let limit: number | undefined;
  let localOnly = false;
  let r2 = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--delete") deleteFiles = true;
    else if (arg === "--local-only") localOnly = true;
    else if (arg === "--r2") r2 = true;
    else if (arg === "--dry-run") {
      // explicit; default is already dry-run unless --delete
    } else if (arg === "--concurrency") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error("--concurrency requires a positive number");
      }
      concurrency = Math.min(64, Math.floor(value));
      i += 1;
    } else if (arg === "--limit") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error("--limit requires a positive number");
      }
      limit = Math.floor(value);
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        `Usage: bun scripts/audio/prune-orphans.ts [--delete] [--r2] [--local-only] [--limit N]`,
      );
      process.exit(0);
    }
  }

  if (localOnly && r2) {
    throw new Error("Use either --local-only or --r2, not both");
  }

  // --delete alone = local disk + manifest. Pass --r2 to also DELETE objects in R2.
  return {
    concurrency,
    deleteFiles,
    dryRun: !deleteFiles,
    limit,
    localOnly: localOnly || (deleteFiles && !r2),
    r2: deleteFiles && r2 && !localOnly,
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} missing (set in .env)`);
  return value;
}

async function main(): Promise<void> {
  const { concurrency, deleteFiles, dryRun, limit, r2 } = parsePruneArgs(
    process.argv.slice(2),
  );

  const config = await loadConfig();
  const expected = collectExpectedAudioObjectKeys(config);
  const onDisk = await listAudioObjectKeys();
  let orphans = sortObjectKeysByKind(onDisk.filter((key) => !expected.has(key)));

  if (limit !== undefined) orphans = orphans.slice(0, limit);

  const byKind = { lemma: 0, example: 0, lesson: 0 };
  for (const key of orphans) {
    byKind[kindFromObjectKey(key)] += 1;
  }

  console.log(`Model: ${config.modelId}`);
  console.log(`Expected live keys: ${expected.size}`);
  console.log(`On disk: ${onDisk.length}`);
  console.log(
    `Orphans: ${orphans.length} (lemma=${byKind.lemma}, example=${byKind.example}, lesson=${byKind.lesson})`,
  );
  console.log(
    dryRun
      ? "Dry-run (pass --delete to remove). Sample:"
      : `Deleting local${r2 ? " + R2" : " only"}…`,
  );

  for (const key of orphans.slice(0, 12)) {
    console.log(`  ${key}`);
  }
  if (orphans.length > 12) console.log(`  … +${orphans.length - 12} more`);

  if (dryRun || orphans.length === 0) {
    if (dryRun && orphans.length > 0) {
      console.log("\nNext: bun scripts/audio/prune-orphans.ts -- --delete");
      console.log(
        "      bun scripts/audio/prune-orphans.ts -- --delete --r2   # also DELETE on R2",
      );
      console.log("      bun scripts/audio/prune-orphans.ts -- --delete --local-only");
    }
    return;
  }

  let aws: AwsClient | undefined;
  let endpointHost = "";
  let bucket = "";

  if (r2) {
    const accountId = requireEnv("R2_ACCOUNT_ID");
    const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
    const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
    bucket = requireEnv("R2_BUCKET");
    const jurisdiction = (process.env.R2_JURISDICTION ?? "").trim().toLowerCase();
    endpointHost = jurisdiction
      ? `${accountId}.${jurisdiction}.r2.cloudflarestorage.com`
      : `${accountId}.r2.cloudflarestorage.com`;
    aws = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: "s3",
      region: "auto",
    });
  }

  const manifest = await loadManifest();
  let removedLocal = 0;
  let removedR2 = 0;
  let removedManifest = 0;
  let failed = 0;

  await mapPool(orphans, concurrency, async (objectKey) => {
    const hash = path.basename(objectKey, ".mp3");
    const filePath = path.join(AUDIO_DIR, objectKey);

    try {
      await unlink(filePath);
      removedLocal += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`fail local ${objectKey}: ${message}`);
      return;
    }

    if (aws) {
      try {
        const url = `https://${endpointHost}/${bucket}/${objectKey}`;
        const response = await aws.fetch(url, { method: "DELETE" });
        // 404 = already gone — treat as success
        if (!response.ok && response.status !== 404) {
          const detail = (await response.text()).slice(0, 300);
          throw new Error(`R2 ${response.status}: ${detail || response.statusText}`);
        }
        removedR2 += 1;
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`fail r2 ${objectKey}: ${message}`);
      }
    }

    if (manifest[hash]) {
      delete manifest[hash];
      removedManifest += 1;
    }

    if ((removedLocal + removedR2) % 100 === 0) {
      console.log(`… removed local=${removedLocal} r2=${removedR2}`);
    }
  });

  await saveManifest(manifest as AudioManifest);

  // Also drop manifest entries that point at expected-missing hashes with no file
  // (already handled above for orphans). Prune stale manifest rows for hashes not expected
  // and not on disk:
  let staleManifest = 0;
  for (const hash of Object.keys(manifest)) {
    const entry = manifest[hash];
    if (!entry) continue;
    const key = `${entry.kind}/${hash}.mp3`;
    if (expected.has(key)) continue;
    // still on disk? then it would be in orphans — already deleted
    delete manifest[hash];
    staleManifest += 1;
  }
  if (staleManifest > 0) {
    await saveManifest(manifest);
  }

  console.log(
    `Done. removedLocal=${removedLocal} removedR2=${removedR2}` +
      ` removedManifest=${removedManifest + staleManifest} failed=${failed}`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
