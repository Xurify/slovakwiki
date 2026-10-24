/**
 * Mouth tracks for lesson clips (content/audio/mouth.json): loudness per
 * 50 ms plus the aligned vowel per frame, so the stick-figure cast moves its
 * mouth with the real recording. Used by `mouth.ts` and after `generate.ts`.
 */

import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";

import type { MouthTracks } from "../../src/lib/catalog/audio/mouth";
import {
  encodeMouthTrack,
  encodeVowelTrack,
} from "../../src/lib/stick-figure/mouth-track";
import { alignSyllables } from "../../src/lib/stick-figure/syllable-align";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";
import {
  AUDIO_DIR,
  audioObjectKey,
  loadManifest,
  mapPool,
  sortManifestKeys,
  toR2AudioKey,
} from "./shared";

const MOUTH_PATH = path.join(ROOT, "content", "audio", "mouth.json");
const SAMPLE_RATE = 16_000;

export function decodePcm(input: string | Buffer): Promise<Int16Array> {
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

export interface MouthTrackReport {
  dropped: number;
  failed: number;
  kept: number;
  measured: number;
}

/** Measure lesson clips that are new, retaken, or missing a vowel track; drop orphans. */
export async function updateMouthTracks(options: {
  concurrency: number;
  force?: boolean;
}): Promise<MouthTrackReport> {
  const baseUrl = process.env.PUBLIC_AUDIO_BASE_URL?.replace(/\/$/, "");
  const manifest = await loadManifest();
  const previous = await readJsonFile<MouthTracks>(MOUTH_PATH, {});

  const lessonClips = Object.entries(manifest).filter(
    ([, entry]) => entry.kind === "lesson",
  );
  const tracks: MouthTracks = {};
  const todo: Array<[string, { generatedAt: string; text: string }]> = [];

  for (const [hash, entry] of lessonClips) {
    const kept = previous[hash];
    if (!options.force && kept?.g === entry.generatedAt && kept.v) tracks[hash] = kept;
    else todo.push([hash, entry]);
  }

  let failed = 0;
  await mapPool(todo, options.concurrency, async ([hash, { generatedAt, text }]) => {
    try {
      const samples = await decodePcm(await clipSource(hash, baseUrl));
      const loudness = encodeMouthTrack(samples, SAMPLE_RATE);
      const vowels = encodeVowelTrack(
        loudness,
        alignSyllables(text, samples, SAMPLE_RATE),
      );
      tracks[hash] = { g: generatedAt, m: loudness, v: vowels };
    } catch (error) {
      failed += 1;
      console.warn(`skip ${hash}: ${error instanceof Error ? error.message : error}`);
    }
  });

  await writeFileAtomic(MOUTH_PATH, `${JSON.stringify(sortManifestKeys(tracks))}\n`);

  return {
    dropped: Object.keys(previous).filter((hash) => !tracks[hash]).length,
    failed,
    kept: lessonClips.length - todo.length,
    measured: todo.length - failed,
  };
}

export function formatMouthTrackReport(report: MouthTrackReport): string {
  return `mouth tracks: ${report.measured} measured, ${report.kept} kept, ${report.dropped} dropped, ${report.failed} failed`;
}
