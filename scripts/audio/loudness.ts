/**
 * Bring every spoken lesson, podcast and scene clip to TARGET_LUFS (-18 LUFS).
 * Measures each clip with ffmpeg's ebur128, writes the result to the
 * manifest as `lufs`, and rewrites a clip more than LUFS_TOLERANCE off with
 * a plain gain. A rewritten clip gets a new `generatedAt`, which busts the
 * `?v=` cache key and makes upload.ts send it; its mouth track is measured
 * again. generate.ts normalizes new clips itself; run this after a merge
 * brings in clips made without it.
 *
 * Usage:
 *   bun scripts/audio/loudness.ts                   # measure + fix, then upload.ts
 *   bun scripts/audio/loudness.ts -- --dry-run      # measure only, report the spread
 *   bun scripts/audio/loudness.ts -- --only "Ahoj"  # clips whose text contains it
 *   bun scripts/audio/loudness.ts -- --remeasure    # ignore stored `lufs`
 *
 * Reads static/audio/lesson/{hash}.mp3, else downloads it from PUBLIC_AUDIO_BASE_URL.
 */

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { audioConfigData } from "../../src/lib/catalog/audio/core";
import {
  LUFS_TOLERANCE,
  TARGET_LUFS,
  measureLoudness,
  normalizeClipFile,
} from "./loudness-norm";
import { formatMouthTrackReport, updateMouthTracks } from "./mouth-tracks";
import {
  AUDIO_DIR,
  audioObjectKey,
  loadManifest,
  mapPool,
  saveManifest,
  toR2AudioKey,
  type ManifestEntry,
} from "./shared";

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const remeasure = argv.includes("--remeasure");
const onlyIndex = argv.indexOf("--only");
const only = onlyIndex >= 0 ? argv[onlyIndex + 1] : undefined;

const baseUrl = process.env.PUBLIC_AUDIO_BASE_URL?.replace(/\/$/, "");
const manifest = await loadManifest();
const characters = audioConfigData.characters ?? {};

/** Barks keep their fixed gain in barks.ts and sounds.ts: a small "Haf." must stay small. */
function isSpoken(entry: ManifestEntry): boolean {
  const character = entry.characterId ? characters[entry.characterId] : undefined;
  if (!character) return true;
  return !character.sounds && !character.voiceId.startsWith("recording:");
}

const clips = Object.entries(manifest).filter(
  ([, entry]) =>
    entry.kind === "lesson" &&
    isSpoken(entry) &&
    (!only || entry.text.includes(only)) &&
    (remeasure ||
      entry.lufs === undefined ||
      Math.abs(entry.lufs - TARGET_LUFS) > LUFS_TOLERANCE),
);

await mkdir(path.join(AUDIO_DIR, "lesson"), { recursive: true });

async function localClip(hash: string): Promise<string> {
  const file = path.join(AUDIO_DIR, "lesson", `${hash}.mp3`);
  try {
    await stat(file);
    return file;
  } catch {
    if (!baseUrl)
      throw new Error(`no local ${hash}.mp3 and PUBLIC_AUDIO_BASE_URL is unset`);
  }
  const response = await fetch(
    `${baseUrl}/${toR2AudioKey(audioObjectKey("lesson", hash))}`,
  );
  if (!response.ok) throw new Error(`${response.status} for ${hash}.mp3`);
  await writeFile(file, new Uint8Array(await response.arrayBuffer()));
  return file;
}

const before: number[] = [];
const after: number[] = [];
let changed = 0;
let failed = 0;

await mapPool(clips, 6, async ([hash, entry]) => {
  try {
    const file = await localClip(hash);
    if (dryRun) {
      const { lufs } = await measureLoudness(file);
      before.push(lufs);
      entry.lufs = Math.round(lufs * 10) / 10;
      return;
    }
    const result = await normalizeClipFile(file);
    before.push(result.from);
    after.push(result.lufs);
    entry.lufs = Math.round(result.lufs * 10) / 10;
    if (result.changed) {
      changed += 1;
      entry.bytes = (await readFile(file)).byteLength;
      entry.generatedAt = new Date().toISOString();
      console.log(
        `${result.from.toFixed(1)} → ${result.lufs.toFixed(1)}  ${entry.text.slice(0, 60)}`,
      );
    }
  } catch (error) {
    failed += 1;
    console.warn(`skip ${hash}: ${error instanceof Error ? error.message : error}`);
  }
});

await saveManifest(manifest);

function spread(values: number[]): string {
  if (values.length === 0) return "none";
  const sorted = [...values].sort((a, b) => a - b);
  return `${sorted[0].toFixed(1)} .. ${sorted.at(-1)!.toFixed(1)} LUFS (median ${sorted[Math.floor(sorted.length / 2)].toFixed(1)})`;
}

console.log(`${clips.length} clips: before ${spread(before)}`);
if (!dryRun) {
  console.log(`after ${spread(after)}; ${changed} rewritten, ${failed} failed`);
  if (changed > 0) {
    console.log(formatMouthTrackReport(await updateMouthTracks({ concurrency: 8 })));
    console.log("Next: bun scripts/audio/upload.ts");
  }
}
if (failed > 0) process.exitCode = 1;
