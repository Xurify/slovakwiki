/**
 * Every spoken clip plays at about the same loudness: ElevenLabs takes came
 * out anywhere from -12.7 to -24.4 LUFS, so a scene jumped by 9 dB from one
 * speaker to the next.
 *
 * The gain goes into the file, not the player: the clips are on another
 * origin without CORS headers, so Web Audio cannot boost them, and an audio
 * element's volume stops at 1, so a quiet clip could only be matched by
 * turning every other clip down.
 */

import { execFile } from "node:child_process";
import { readFile, rename, rm } from "node:fs/promises";
import { promisify } from "node:util";

const run = promisify(execFile);

/** Integrated loudness every clip is brought to (EBU R128). */
export const TARGET_LUFS = -18;
/** A clip this close to the target is left as it is: re-encoding costs a generation of MP3. */
export const LUFS_TOLERANCE = 1;
/** Sample-peak ceiling for the limiter after a boost. -1.5 dBFS = 0.84. */
const LIMIT = 0.84;

export interface Loudness {
  lufs: number;
  peak: number;
}

/**
 * Integrated loudness and true peak. Half a second of silence is padded on:
 * ebur128 needs 400 ms blocks, so a short "Áno." measured -70 without it, and
 * the gate drops the padding from the measurement.
 */
export async function measureLoudness(file: string): Promise<Loudness> {
  const { stderr } = await run(
    "ffmpeg",
    [
      "-nostats",
      "-hide_banner",
      "-i",
      file,
      "-af",
      "apad=pad_dur=0.5,ebur128=peak=true",
      "-f",
      "null",
      "-",
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  const summary = stderr.slice(stderr.lastIndexOf("Summary:"));
  const lufs = Number(/I:\s+(-?[\d.]+|-inf) LUFS/.exec(summary)?.[1]);
  const peak = Number(/Peak:\s+(-?[\d.]+|-inf) dBFS/.exec(summary)?.[1]);
  if (!Number.isFinite(lufs)) throw new Error(`no loudness measured for ${file}`);
  return { lufs, peak: Number.isFinite(peak) ? peak : -Infinity };
}

async function applyGain(input: string, output: string, gainDb: number): Promise<void> {
  await run("ffmpeg", [
    "-loglevel",
    "error",
    "-y",
    "-i",
    input,
    "-af",
    `volume=${gainDb.toFixed(2)}dB,alimiter=limit=${LIMIT}:level=false:attack=1:release=50`,
    "-c:a",
    "libmp3lame",
    "-b:a",
    "128k",
    "-ar",
    "44100",
    "-ac",
    "1",
    output,
  ]);
}

export interface Normalized {
  /** The file was rewritten. */
  changed: boolean;
  /** Loudness before. */
  from: number;
  /** Loudness now. */
  lufs: number;
}

/**
 * Brings a clip to TARGET_LUFS in place with a plain gain (and a limiter
 * where a boost would clip), so its timing and the mouth track measured on it
 * stay as they were: the track is scaled to the clip's own loudest frame.
 * A second pass corrects what the limiter took off.
 */
export async function normalizeClipFile(file: string): Promise<Normalized> {
  const before = await measureLoudness(file);
  if (Math.abs(before.lufs - TARGET_LUFS) <= LUFS_TOLERANCE) {
    return { changed: false, from: before.lufs, lufs: before.lufs };
  }

  const temp = `${file}.norm.mp3`;
  let gain = TARGET_LUFS - before.lufs;
  let after = before;
  try {
    for (let pass = 0; pass < 3; pass += 1) {
      await applyGain(file, temp, gain);
      after = await measureLoudness(temp);
      const off = TARGET_LUFS - after.lufs;
      if (Math.abs(off) <= 0.3) break;
      gain += off;
    }
    await rename(temp, file);
  } finally {
    await rm(temp, { force: true });
  }
  return { changed: true, from: before.lufs, lufs: after.lufs };
}

/** Normalizes a clip on disk and returns its new bytes with the loudness it now has. */
export async function normalizedClip(
  file: string,
): Promise<{ audio: Uint8Array; lufs: number }> {
  const { lufs } = await normalizeClipFile(file);
  return {
    audio: new Uint8Array(await readFile(file)),
    lufs: Math.round(lufs * 10) / 10,
  };
}
