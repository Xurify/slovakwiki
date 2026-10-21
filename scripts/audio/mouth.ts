/**
 * Loudness tracks for lesson clips, so the stick-figure cast opens its mouth
 * with the real recording → content/audio/mouth.json (hash → take + track).
 *
 * Usage:
 *   bun scripts/audio/mouth.ts               # new or retaken lesson clips
 *   bun scripts/audio/mouth.ts -- --force    # every lesson clip
 *
 * Reads static/audio/lesson/{hash}.mp3, else PUBLIC_AUDIO_BASE_URL. Needs ffmpeg.
 */

import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";

import { encodeMouthTrack } from "../../src/lib/stick-figure/mouth-track";
import type { MouthTracks } from "../../src/lib/catalog/audio/mouth";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";
import {
  AUDIO_DIR,
  audioObjectKey,
  loadManifest,
  mapPool,
  parseArgs,
  sortManifestKeys,
  toR2AudioKey,
} from "./shared";

const MOUTH_PATH = path.join(ROOT, "content", "audio", "mouth.json");
const SAMPLE_RATE = 16_000;

function decodePcm(input: string | Buffer): Promise<Int16Array> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        typeof input === "string" ? input : "pipe:0",
        "-ac",
        "1",
        "-ar",
        String(SAMPLE_RATE),
        "-f",
        "s16le",
        "pipe:1",
      ],
      { windowsHide: true },
    );
    const chunks: Buffer[] = [];
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `ffmpeg exit ${code}`));
        return;
      }

      const pcm = Buffer.concat(chunks);
      resolve(
        Int16Array.from({ length: pcm.length >> 1 }, (_, i) => pcm.readInt16LE(i * 2)),
      );
    });

    if (typeof input === "string") child.stdin.end();
    else child.stdin.end(input);
  });
}

async function clipSource(
  hash: string,
  baseUrl: string | undefined,
): Promise<string | Buffer> {
  const local = path.join(AUDIO_DIR, "lesson", `${hash}.mp3`);

  try {
    await access(local);
    return local;
  } catch {
    if (!baseUrl)
      throw new Error(`no local ${hash}.mp3 and PUBLIC_AUDIO_BASE_URL is unset`);
  }

  const response = await fetch(
    `${baseUrl}/${toR2AudioKey(audioObjectKey("lesson", hash))}`,
  );
  if (!response.ok) throw new Error(`${response.status} for ${hash}.mp3`);
  return Buffer.from(await response.arrayBuffer());
}

async function main(): Promise<void> {
  const { concurrency, force } = parseArgs(process.argv.slice(2));
  const baseUrl = process.env.PUBLIC_AUDIO_BASE_URL?.replace(/\/$/, "");
  const manifest = await loadManifest();
  const previous = await readJsonFile<MouthTracks>(MOUTH_PATH, {});

  const lessonClips = Object.entries(manifest).filter(
    ([, entry]) => entry.kind === "lesson",
  );
  const tracks: MouthTracks = {};
  const todo: Array<[string, string]> = [];

  for (const [hash, entry] of lessonClips) {
    const kept = previous[hash];
    if (!force && kept?.g === entry.generatedAt) tracks[hash] = kept;
    else todo.push([hash, entry.generatedAt]);
  }

  let failed = 0;
  await mapPool(todo, concurrency, async ([hash, generatedAt]) => {
    try {
      const samples = await decodePcm(await clipSource(hash, baseUrl));
      tracks[hash] = { g: generatedAt, m: encodeMouthTrack(samples, SAMPLE_RATE) };
    } catch (error) {
      failed += 1;
      console.warn(`skip ${hash}: ${error instanceof Error ? error.message : error}`);
    }
  });

  await writeFileAtomic(MOUTH_PATH, `${JSON.stringify(sortManifestKeys(tracks))}\n`);

  const dropped = Object.keys(previous).filter((hash) => !tracks[hash]).length;
  console.log(
    `mouth tracks: ${todo.length - failed} measured, ${lessonClips.length - todo.length} kept, ${dropped} dropped, ${failed} failed`,
  );
  if (failed > 0) process.exitCode = 1;
}

await main();
