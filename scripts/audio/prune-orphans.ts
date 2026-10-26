/**
 * Remove orphan audio files (old model/settings hashes) from disk and optionally R2.
 *
 * Live keys = current config.json + dictionary/lesson targets.
 * Orphans = `lemma/` · `example/` · `lesson/` objects not in that set
 * (typical after switching multilingual_v2 → flash_v2_5 or voice settings).
 * Does not touch `images/` in the shared bucket.
 *
 * R2 also holds clips that open branches uploaded for lines this branch does not
 * have yet, so `--r2` keeps orphans uploaded in the last 30 days (`--keep-days N`;
 * `--keep-days 0` deletes them too). A branch open longer than that can still lose
 * clips: raise the window or check open branches first. Local orphans are deleted
 * whatever their age.
 *
 * Default is dry-run. Pass --delete to remove.
 *
 * Usage:
 *   bun scripts/audio/prune-orphans.ts
 *   bun scripts/audio/prune-orphans.ts -- --r2
 *   bun scripts/audio/prune-orphans.ts -- --delete
 *   bun scripts/audio/prune-orphans.ts -- --delete --r2                 # keeps R2 uploads from the last 30 days
 *   bun scripts/audio/prune-orphans.ts -- --delete --r2 --keep-days 90
 *   bun scripts/audio/prune-orphans.ts -- --delete --r2 --keep-days 0   # deletes recent R2 uploads too
 *   bun scripts/audio/prune-orphans.ts -- --delete --local-only
 *   bun scripts/audio/prune-orphans.ts -- --limit 20
 */

import { unlink } from "node:fs/promises";
import path from "node:path";

import { AwsClient } from "aws4fetch";

import {
  DEFAULT_KEEP_DAYS,
  parseListObjectsPage,
  planPrune,
  type R2Object,
} from "./orphans";
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
  keepDays: number;
  limit: number | undefined;
  localOnly: boolean;
  r2: boolean;
} {
  let concurrency = DEFAULT_UPLOAD_CONCURRENCY;
  let deleteFiles = false;
  let keepDays = DEFAULT_KEEP_DAYS;
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
    } else if (arg === "--keep-days") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--keep-days requires a number of days (0 keeps none)");
      }
      keepDays = value;
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
        `Usage: bun scripts/audio/prune-orphans.ts [--delete] [--r2] [--local-only] [--keep-days N] [--limit N]`,
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
    keepDays,
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

async function listR2AudioObjects(
  aws: AwsClient,
  endpointHost: string,
  bucket: string,
): Promise<R2Object[]> {
  const objects: R2Object[] = [];

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

        const page = parseListObjectsPage(xml);
        for (const object of page.objects) {
          if (object.key.endsWith(".mp3")) objects.push(object);
        }
        token = page.nextToken;
      } while (token);
    }
  }

  return objects;
}

async function main(): Promise<void> {
  const { concurrency, dryRun, keepDays, limit, r2 } = parsePruneArgs(
    process.argv.slice(2),
  );

  const config = await loadConfig();
  const expected = collectExpectedAudioObjectKeys(config);
  const onDisk = await listAudioObjectKeys();

  let aws: AwsClient | undefined;
  let endpointHost = "";
  let bucket = "";
  let onR2: R2Object[] = [];

  if (r2) {
    const client = r2Client();
    aws = client.aws;
    endpointHost = client.endpointHost;
    bucket = client.bucket;
    onR2 = await listR2AudioObjects(aws, endpointHost, bucket);
  }

  const plan = planPrune({ expected, keepDays, now: Date.now(), onDisk, onR2 });
  const toUnlink = new Set(plan.local);
  const toDeleteOnR2 = new Set(plan.r2);

  let orphans = sortObjectKeysByKind([...new Set([...plan.local, ...plan.r2])]);
  if (limit !== undefined) orphans = orphans.slice(0, limit);

  const byKind = { lemma: 0, example: 0, lesson: 0 };
  let diskOrphans = 0;
  let r2Orphans = 0;
  for (const key of orphans) {
    byKind[kindFromObjectKey(key)] += 1;
    if (toUnlink.has(key)) diskOrphans += 1;
    if (toDeleteOnR2.has(key)) r2Orphans += 1;
  }

  console.log(`Model: ${config.modelId}`);
  console.log(`Expected live keys: ${expected.size}`);
  console.log(`On disk: ${onDisk.length}`);
  if (r2) console.log(`On R2 (audio prefixes): ${onR2.length}`);
  console.log(
    `Orphans: ${orphans.length} (lemma=${byKind.lemma}, example=${byKind.example}, lesson=${byKind.lesson}` +
      `; disk=${diskOrphans}${r2 ? `, r2=${r2Orphans}` : ""})`,
  );
  if (plan.recentOnR2.length > 0) {
    console.log(
      `Keeping ${plan.recentOnR2.length} more on R2, uploaded in the last ${keepDays} days: ` +
        "an open branch may need them (--keep-days 0 deletes them too)",
    );
  }
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
  // An uploaded clip this branch has no line for may be another branch's: its entry
  // stays until the object itself is deleted from R2.
  const stillOnR2 = (entry: { uploadedAt?: string }, objectKey: string) =>
    Boolean(entry.uploadedAt) && !goneFromR2.has(objectKey);
  let removedLocal = 0;
  let removedR2 = 0;
  let removedManifest = 0;
  let failed = 0;
  const goneFromR2 = new Set<string>();

  await mapPool(orphans, concurrency, async (objectKey) => {
    const hash = path.basename(objectKey, ".mp3");
    const filePath = path.join(AUDIO_DIR, objectKey);

    if (toUnlink.has(objectKey)) {
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

    if (aws && toDeleteOnR2.has(objectKey)) {
      try {
        const url = `https://${endpointHost}/${bucket}/${objectKey}`;
        const response = await aws.fetch(url, { method: "DELETE" });
        if (!response.ok && response.status !== 404) {
          const detail = (await response.text()).slice(0, 300);
          throw new Error(`R2 ${response.status}: ${detail || response.statusText}`);
        }
        removedR2 += 1;
        goneFromR2.add(objectKey);
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`fail r2 ${objectKey}: ${message}`);
      }
    }

    if (manifest[hash] && !stillOnR2(manifest[hash], objectKey)) {
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
    if (expected.has(key) || stillOnR2(entry, key)) continue;
    delete manifest[hash];
    staleManifest += 1;
  }
  if (staleManifest > 0) {
    await saveManifest(manifest);
  }

  console.log(
    `Done. removedLocal=${removedLocal} removedR2=${removedR2}` +
      ` keptRecentR2=${plan.recentOnR2.length}` +
      ` removedManifest=${removedManifest + staleManifest} failed=${failed}`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
