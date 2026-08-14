/**
 * Re-encode local MP3s to 64 kbps CBR mono 44.1 kHz (speech). Does not change
 * content hashes / ElevenLabs `outputFormat` — only the bytes on disk.
 * Bumps manifest `generatedAt` so `?v=` cache-busts immutable CDN objects.
 *
 * Usage:
 *   bun scripts/audio/transcode-mp3.ts
 *   bun scripts/audio/transcode-mp3.ts -- --bitrate 64 --concurrency 8
 *   bun scripts/audio/transcode-mp3.ts -- --lemmas-only --dry-run
 */

import { spawn } from "node:child_process";
import { readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  AUDIO_DIR,
  kindFromObjectKey,
  listAudioObjectKeys,
  loadManifest,
  mapPool,
  parseArgs,
  saveManifest,
} from "./shared";

const DEFAULT_BITRATE_K = 64;
const DEFAULT_TRANSCODE_CONCURRENCY = 8;

function ffmpegEncode(input: string, output: string, bitrateK: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "ffmpeg",
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        input,
        "-ac",
        "1",
        "-ar",
        "44100",
        "-c:a",
        "libmp3lame",
        "-b:a",
        `${bitrateK}k`,
        output,
      ],
      { windowsHide: true },
    );
    let stderr = "";
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `ffmpeg exit ${code}`));
    });
  });
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2), {
    concurrency: DEFAULT_TRANSCODE_CONCURRENCY,
  });
  let bitrateK = DEFAULT_BITRATE_K;
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--bitrate") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 24 || value > 128) {
        throw new Error("--bitrate must be 24–128");
      }
      bitrateK = Math.floor(value);
      i += 1;
    }
  }

  let keys = await listAudioObjectKeys();
  if (parsed.lemmasOnly) keys = keys.filter((k) => kindFromObjectKey(k) === "lemma");
  if (parsed.examplesOnly) {
    keys = keys.filter((k) => kindFromObjectKey(k) === "example");
  }
  if (parsed.lessonsOnly) keys = keys.filter((k) => kindFromObjectKey(k) === "lesson");
  if (parsed.limit !== undefined) keys = keys.slice(0, parsed.limit);

  const manifest = await loadManifest();
  let manifestLock: Promise<void> = Promise.resolve();
  async function withManifestLock<T>(fn: () => Promise<T>): Promise<T> {
    const previous = manifestLock;
    let release!: () => void;
    manifestLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  }
  const startedAt = Date.now();
  let done = 0;
  let failed = 0;
  let bytesIn = 0;
  let bytesOut = 0;
  let sinceSave = 0;

  console.log(
    `Transcode MP3: ${keys.length} files → ${bitrateK} kbps mono 44.1 kHz` +
      ` concurrency=${parsed.concurrency}` +
      `${parsed.dryRun ? " [dry-run]" : ""}`,
  );

  await mapPool(keys, parsed.dryRun ? 4 : parsed.concurrency, async (objectKey) => {
    const filePath = path.join(AUDIO_DIR, objectKey);
    const before = await stat(filePath);
    bytesIn += before.size;

    if (parsed.dryRun) {
      done += 1;
      return;
    }

    const tmpPath = `${filePath}.${bitrateK}k.tmp.mp3`;
    try {
      await ffmpegEncode(filePath, tmpPath, bitrateK);
      const after = await stat(tmpPath);
      if (after.size < 400) {
        throw new Error(`output too small (${after.size} B)`);
      }
      const encoded = await readFile(tmpPath);
      await writeFile(filePath, encoded);
      await unlink(tmpPath);
      bytesOut += after.size;

      const hash = path.basename(objectKey, ".mp3");
      const generatedAt = new Date().toISOString();
      await withManifestLock(async () => {
        const entry = manifest[hash];
        if (entry) {
          entry.bytes = after.size;
          entry.generatedAt = generatedAt;
        }
        sinceSave += 1;
        if (sinceSave >= 100) {
          await saveManifest(manifest);
          sinceSave = 0;
        }
      });

      done += 1;
      sinceSave += 1;
      if (sinceSave >= 100) {
        await saveManifest(manifest);
        sinceSave = 0;
      }
      if (done % 500 === 0) {
        console.log(`… ${done}/${keys.length} failed=${failed}`);
      }
    } catch (error) {
      failed += 1;
      try {
        await unlink(tmpPath);
      } catch {
        // tmp may not exist
      }
      const message = error instanceof Error ? error.message : String(error);
      console.error(`fail ${objectKey}: ${message}`);
    }
  });

  if (!parsed.dryRun) await saveManifest(manifest);

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  const ratio = bytesIn > 0 ? (bytesOut / bytesIn).toFixed(3) : "n/a";
  console.log(
    `Done. ok=${done} failed=${failed} in=${Math.round(bytesIn / 1e6)}MB` +
      ` out=${Math.round(bytesOut / 1e6)}MB ratio=${ratio} elapsed=${elapsedSec}s`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
