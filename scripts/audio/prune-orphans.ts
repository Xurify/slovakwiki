/**
 * Remove orphan audio files (old model/settings hashes) from disk and optionally R2.
 *
 * Live keys = current config.json + dictionary/lesson targets.
 * Orphans = `lemma/` · `example/` · `lesson/` objects not in that set
 * (typical after switching multilingual_v2 → flash_v2_5 or voice settings).
 * Does not touch `images/` in the shared bucket.
 *
 * Default is dry-run. Pass --delete to remove.
 *
 * Usage:
 *   bun scripts/audio/prune-orphans.ts
 *   bun scripts/audio/prune-orphans.ts -- --r2
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
  type AudioKind,
  type AudioManifest,
} from "./shared";

const AUDIO_PREFIXES: AudioKind[] = ["lemma", "example", "lesson"];

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

  return {
    concurrency,
    deleteFiles,
    dryRun: !deleteFiles,
    limit,
    localOnly,
    r2,
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} missing (set in .env)`);
  return value;
}

function decodeXml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function r2Client(): { aws: AwsClient; bucket: string; endpointHost: string } {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const jurisdiction = (process.env.R2_JURISDICTION ?? "").trim().toLowerCase();
  const endpointHost = jurisdiction
    ? `${accountId}.${jurisdiction}.r2.cloudflarestorage.com`
    : `${accountId}.r2.cloudflarestorage.com`;

  return {
    aws: new AwsClient({
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
      service: "s3",
      region: "auto",
    }),
    bucket: requireEnv("R2_BUCKET"),
    endpointHost,
  };
}

async function listR2AudioObjectKeys(
  aws: AwsClient,
  endpointHost: string,
  bucket: string,
): Promise<string[]> {
  const keys: string[] = [];

  for (const kind of AUDIO_PREFIXES) {
    for (const prefix of [`${kind}/`, `audio/${kind}/`]) {
      let token = "";
      do {
        const url = new URL(`https://${endpointHost}/${bucket}`);
        url.searchParams.set("list-type", "2");
        url.searchParams.set("max-keys", "1000");
        url.searchParams.set("prefix", prefix);
        if (token) url.searchParams.set("continuation-token", token);

        const res = await aws.fetch(url, { method: "GET" });
        const xml = await res.text();
        if (!res.ok) {
          throw new Error(`R2 list ${prefix} failed ${res.status}: ${xml.slice(0, 400)}`);
        }

        for (const match of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) {
          const key = decodeXml(match[1] ?? "");
          if (key.endsWith(".mp3")) keys.push(key);
        }

        const truncated = xml.includes("<IsTruncated>true</IsTruncated>");
        const next = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/);
        token = truncated && next?.[1] ? decodeXml(next[1]) : "";
      } while (token);
    }
  }

  return keys;
}

async function main(): Promise<void> {
  const { concurrency, dryRun, limit, localOnly, r2 } = parsePruneArgs(
    process.argv.slice(2),
  );

  const config = await loadConfig();
  const expected = collectExpectedAudioObjectKeys(config);
  const onDisk = await listAudioObjectKeys();
  const onDiskSet = new Set(onDisk);

  let aws: AwsClient | undefined;
  let endpointHost = "";
  let bucket = "";
  let onR2: string[] = [];

  if (r2) {
    const client = r2Client();
    aws = client.aws;
    endpointHost = client.endpointHost;
    bucket = client.bucket;
    onR2 = await listR2AudioObjectKeys(aws, endpointHost, bucket);
  }

  const orphanSet = new Set<string>();
  for (const key of onDisk) {
    if (!expected.has(key)) orphanSet.add(key);
  }
  for (const key of onR2) {
    const diskKey = key.replace(/^audio\//, "");
    if (!expected.has(diskKey)) orphanSet.add(key);
  }

  let orphans = sortObjectKeysByKind([...orphanSet]);
  if (limit !== undefined) orphans = orphans.slice(0, limit);

  const onR2Set = new Set(onR2);
  const byKind = { lemma: 0, example: 0, lesson: 0 };
  let diskOrphans = 0;
  let r2Orphans = 0;
  for (const key of orphans) {
    byKind[kindFromObjectKey(key)] += 1;
    if (onDiskSet.has(key)) diskOrphans += 1;
    if (onR2Set.has(key)) r2Orphans += 1;
  }

  console.log(`Model: ${config.modelId}`);
  console.log(`Expected live keys: ${expected.size}`);
  console.log(`On disk: ${onDisk.length}`);
  if (r2) console.log(`On R2 (audio prefixes): ${onR2.length}`);
  console.log(
    `Orphans: ${orphans.length} (lemma=${byKind.lemma}, example=${byKind.example}, lesson=${byKind.lesson}` +
      `; disk=${diskOrphans}${r2 ? `, r2=${r2Orphans}` : ""})`,
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

  if (dryRun) {
    if (orphans.length > 0) {
      console.log("\nNext: bun scripts/audio/prune-orphans.ts -- --delete");
      console.log(
        "      bun scripts/audio/prune-orphans.ts -- --delete --r2   # also DELETE on R2",
      );
      console.log("      bun scripts/audio/prune-orphans.ts -- --delete --local-only");
    }
    return;
  }

  const manifest = await loadManifest();
  let removedLocal = 0;
  let removedR2 = 0;
  let removedManifest = 0;
  let failed = 0;

  await mapPool(orphans, concurrency, async (objectKey) => {
    const hash = path.basename(objectKey, ".mp3");
    const filePath = path.join(AUDIO_DIR, objectKey);

    if (onDiskSet.has(objectKey) || !r2) {
      try {
        await unlink(filePath);
        removedLocal += 1;
      } catch (error) {
        const code =
          error && typeof error === "object" && "code" in error ? String(error.code) : "";
        if (code !== "ENOENT") {
          failed += 1;
          const message = error instanceof Error ? error.message : String(error);
          console.error(`fail local ${objectKey}: ${message}`);
          return;
        }
      }
    }

    if (aws && !localOnly) {
      try {
        const url = `https://${endpointHost}/${bucket}/${objectKey}`;
        const response = await aws.fetch(url, { method: "DELETE" });
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

  let staleManifest = 0;
  for (const hash of Object.keys(manifest)) {
    const entry = manifest[hash];
    if (!entry) continue;
    const key = `${entry.kind}/${hash}.mp3`;
    if (expected.has(key)) continue;
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
