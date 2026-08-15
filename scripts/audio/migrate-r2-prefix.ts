/**
 * Copy R2 audio objects from bucket-root `{kind}/` into `audio/{kind}/`.
 * Leaves source keys in place so prod URLs keep working until deploy.
 *
 * Usage:
 *   bun scripts/audio/migrate-r2-prefix.ts
 *   bun scripts/audio/migrate-r2-prefix.ts -- --dry-run
 *   bun scripts/audio/migrate-r2-prefix.ts -- --delete-source
 */

import { AwsClient } from "aws4fetch";

import {
  DEFAULT_UPLOAD_CONCURRENCY,
  kindFromObjectKey,
  mapPool,
  type AudioKind,
} from "./shared";
import { toR2AudioKey } from "../../src/lib/catalog/audio/core";

const AUDIO_PREFIXES: AudioKind[] = ["lemma", "example", "lesson"];

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

function parseArgs(argv: string[]): {
  concurrency: number;
  deleteSource: boolean;
  dryRun: boolean;
} {
  let concurrency = DEFAULT_UPLOAD_CONCURRENCY;
  let deleteSource = false;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--delete-source") deleteSource = true;
    else if (arg === "--concurrency") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error("--concurrency requires a positive number");
      }
      concurrency = Math.min(64, Math.floor(value));
      i += 1;
    }
  }

  return { concurrency, deleteSource, dryRun };
}

async function listPrefix(
  aws: AwsClient,
  endpointHost: string,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const keys: string[] = [];
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

  return keys;
}

async function main(): Promise<void> {
  const { concurrency, deleteSource, dryRun } = parseArgs(process.argv.slice(2));
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const jurisdiction = (process.env.R2_JURISDICTION ?? "").trim().toLowerCase();
  const endpointHost = jurisdiction
    ? `${accountId}.${jurisdiction}.r2.cloudflarestorage.com`
    : `${accountId}.r2.cloudflarestorage.com`;
  const bucket = requireEnv("R2_BUCKET");
  const aws = new AwsClient({
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    region: "auto",
  });

  const sources: string[] = [];
  for (const kind of AUDIO_PREFIXES) {
    const listed = await listPrefix(aws, endpointHost, bucket, `${kind}/`);
    sources.push(...listed.filter((key) => !key.startsWith("audio/")));
  }

  const byKind = { lemma: 0, example: 0, lesson: 0 };
  for (const key of sources) {
    byKind[kindFromObjectKey(key)] += 1;
  }

  console.log(
    `R2 prefix migrate: ${sources.length} objects → audio/{kind}/` +
      ` (lemma=${byKind.lemma}, example=${byKind.example}, lesson=${byKind.lesson})` +
      `${dryRun ? " [dry-run]" : ""}${deleteSource ? " [delete-source]" : ""}`,
  );

  if (sources.length === 0) {
    console.log("Nothing at bucket-root lemma|example|lesson. Already moved?");
    return;
  }

  let copied = 0;
  let deleted = 0;
  let failed = 0;

  await mapPool(sources, dryRun ? 8 : concurrency, async (sourceKey) => {
    const destKey = toR2AudioKey(sourceKey);
    if (dryRun) {
      copied += 1;
      if (copied <= 8) console.log(`[dry-run] ${sourceKey} → ${destKey}`);
      return;
    }

    try {
      const destUrl = `https://${endpointHost}/${bucket}/${destKey}`;
      const copySource = `/${bucket}/${sourceKey}`;
      const copy = await aws.fetch(destUrl, {
        method: "PUT",
        headers: {
          "x-amz-copy-source": copySource,
          "x-amz-metadata-directive": "COPY",
        },
      });
      if (!copy.ok && copy.status !== 404) {
        const detail = (await copy.text()).slice(0, 300);
        throw new Error(`copy ${copy.status}: ${detail || copy.statusText}`);
      }
      if (!copy.ok) {
        throw new Error(`copy ${copy.status}`);
      }
      copied += 1;

      if (deleteSource) {
        const srcUrl = `https://${endpointHost}/${bucket}/${sourceKey}`;
        const del = await aws.fetch(srcUrl, { method: "DELETE" });
        if (!del.ok && del.status !== 404) {
          throw new Error(`delete source ${del.status}`);
        }
        deleted += 1;
      }

      if (copied % 500 === 0) {
        console.log(`… copied=${copied} deleted=${deleted} failed=${failed}`);
      }
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`fail ${sourceKey}: ${message}`);
    }
  });

  console.log(`Done. copied=${copied} deleted=${deleted} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
