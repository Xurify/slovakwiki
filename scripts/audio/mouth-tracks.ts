/**
 * Mouth tracks for lesson clips (content/audio/mouth.json): loudness per
 * 50 ms plus the aligned vowel per frame, so the stick-figure cast moves its
 * mouth with the real recording. Used by `mouth.ts` and after `generate.ts`.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { MouthTracks } from "../../src/lib/catalog/audio/mouth";
import {
  encodeMouthTrack,
  encodeVowelTrack,
} from "../../src/lib/stick-figure/mouth-track";
import { alignSyllables } from "../../src/lib/stick-figure/syllable-align";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";
import { decodeMp3 } from "./decode-mp3";
import {
  AUDIO_DIR,
  audioObjectKey,
  loadManifest,
  mapPool,
  sortManifestKeys,
  toR2AudioKey,
} from "./shared";

const MOUTH_PATH = path.join(ROOT, "content", "audio", "mouth.json");

async function clipBytes(hash: string, baseUrl: string | undefined): Promise<Uint8Array> {
  try {
    return await readFile(path.join(AUDIO_DIR, "lesson", `${hash}.mp3`));
  } catch {
    if (!baseUrl)
      throw new Error(`no local ${hash}.mp3 and PUBLIC_AUDIO_BASE_URL is unset`);
  }

  const response = await fetch(
    `${baseUrl}/${toR2AudioKey(audioObjectKey("lesson", hash))}`,
  );
  if (!response.ok) throw new Error(`${response.status} for ${hash}.mp3`);
  return new Uint8Array(await response.arrayBuffer());
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
      const { sampleRate, samples } = await decodeMp3(await clipBytes(hash, baseUrl));
      const loudness = encodeMouthTrack(samples, sampleRate);
      const vowels = encodeVowelTrack(
        loudness,
        alignSyllables(text, samples, sampleRate),
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
