/**
 * A dog's lines are real barks, cut from one recording of one dog, so Bobík
 * sounds like the same dog every time. ElevenLabs has no voice for a dog,
 * and a person saying "haf" is not a bark.
 *
 * The line's text directs the cut, the way punctuation directs a voice:
 * each "Haf!" is a full bark, a "Haf." a small, quiet one, and barks in one
 * line come from one run in the recording, with the dog's own rhythm.
 */

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { AudioConfig } from "../../src/lib/catalog/audio/core";
import { ROOT } from "../lib/paths";

const run = promisify(execFile);

/** The recording, from Wikimedia Commons, and its SHA-1 there. */
export const BARK_SOURCE = {
  author: "Dr. Nono YesMaybe",
  file: "File:Dog_barking.webm",
  license: "CC BY-SA 4.0",
  page: "https://commons.wikimedia.org/wiki/File:Dog_barking.webm",
  sha1: "9ef9ef826b9207feb5617e0a499ebf58829bfe75",
  url: "https://upload.wikimedia.org/wikipedia/commons/b/be/Dog_barking.webm",
};

const CACHE = path.join(ROOT, "tmp", "barks", "dog-barking.webm");

/**
 * Runs of one, two and three barks in the recording, start and end in
 * seconds, found by its loudness (each bark is about 260 ms, -6 dBFS at peak,
 * over a -44 dB room).
 */
const RUNS: Record<number, [number, number]> = {
  1: [9.0, 9.32],
  2: [1.59, 2.25],
  3: [4.06, 5.02],
};
/** Brings a full bark to about -19 LUFS, next to the voices at -18; a fixed gain, so a small bark stays small. */
const BARK_GAIN_DB = -5;
/** The single bark a quiet "Haf." is made from. */
const SMALL: [number, number] = [14.69, 15.02];

/**
 * How a line's leading direction changes the cut, so the same dog does not
 * bark the same "Haf! Haf!" for a warning, a hello and joy: glad and excited
 * barks come higher and closer together (a single glad bark is the first of
 * the two-bark run, another take), a sighed one lower, slower and duller.
 */
const MOODS: Record<string, { gap: number; shape: string; single?: [number, number] }> = {
  excited: {
    gap: 0.1,
    shape: "aresample=44100,asetrate=44100*1.1,aresample=44100,atempo=1.08",
  },
  happy: {
    gap: 0.16,
    shape: "aresample=44100,asetrate=44100*1.06,aresample=44100,atempo=1.04",
    single: [1.59, 1.92],
  },
  sighs: {
    gap: 0.4,
    shape:
      "aresample=44100,asetrate=44100*0.93,aresample=44100,atempo=0.9,lowpass=f=2800,volume=-3dB",
  },
};

/** The direction a dog's line opens with (`[excited] Haf! Haf!`), if any. */
export function barkMood(text: string): string | undefined {
  const tag = /^\s*\[(\w+)\]/.exec(text)?.[1];
  return tag && tag in MOODS ? tag : undefined;
}

export function isRecordedVoice(config: AudioConfig): boolean {
  return config.voiceId.startsWith("recording:");
}

/** The barks a line asks for, in order: true for a full one, false for a small one. */
export function barksIn(text: string): boolean[] {
  return [...text.matchAll(/haf\s*([!.?…]?)/giu)].map((match) => match[1] !== ".");
}

async function source(): Promise<string> {
  try {
    await access(CACHE);
  } catch {
    const response = await fetch(BARK_SOURCE.url, {
      headers: { "User-Agent": "SlovakWikiAudio/1.0 (https://slovak.wiki)" },
    });
    if (!response.ok) throw new Error(`bark source: ${response.status}`);
    await mkdir(path.dirname(CACHE), { recursive: true });
    await writeFile(CACHE, new Uint8Array(await response.arrayBuffer()));
  }
  const sha1 = createHash("sha1")
    .update(await readFile(CACHE))
    .digest("hex");
  if (sha1 !== BARK_SOURCE.sha1) {
    throw new Error(`bark source changed on Commons (sha1 ${sha1}); check it by ear`);
  }
  return CACHE;
}

/** One stretch of the line: a run of full barks, or one small one. */
function stretches(barks: boolean[]): Array<{ count: number; full: boolean }> {
  const out: Array<{ count: number; full: boolean }> = [];
  for (const full of barks) {
    const last = out.at(-1);
    if (last && last.full && full && last.count < 3) last.count += 1;
    else out.push({ count: 1, full });
  }
  return out;
}

/** The MP3 for a dog's line, in the clip format the voices use. */
export async function barkClip(text: string): Promise<Uint8Array> {
  const barks = barksIn(text);
  if (barks.length === 0) throw new Error(`no "haf" in a dog's line: ${text}`);

  const input = await source();
  const parts = stretches(barks);
  const mood = MOODS[barkMood(text) ?? ""];
  // A breath of room before and after, so the bark does not start on the cut.
  const filters = parts.map(({ count, full }, index) => {
    const [start, end] = full
      ? count === 1 && mood?.single
        ? mood.single
        : RUNS[count]
      : SMALL;
    const shape = full ? "volume=0dB" : "volume=-8dB,lowpass=f=2400,afade=t=in:d=0.04";
    const moodShape = mood ? `,${mood.shape}` : "";
    return `[0:a]atrim=${start}:${end},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st=${(end - start - 0.04).toFixed(3)}:d=0.04,${shape}${moodShape},apad=pad_dur=${mood?.gap ?? 0.25}[p${index}]`;
  });
  const joined = parts.map((_, index) => `[p${index}]`).join("");
  const graph = [
    ...filters,
    `${joined}concat=n=${parts.length}:v=0:a=1,adelay=150,afftdn=nf=-40,volume=${BARK_GAIN_DB}dB[out]`,
  ].join(";");

  const { stdout } = await run(
    "ffmpeg",
    [
      "-loglevel",
      "error",
      "-i",
      input,
      "-filter_complex",
      graph,
      "-map",
      "[out]",
      "-ac",
      "1",
      "-ar",
      "44100",
      "-b:a",
      "128k",
      "-f",
      "mp3",
      "-",
    ],
    { encoding: "buffer", maxBuffer: 16 * 1024 * 1024 },
  );
  return new Uint8Array(stdout);
}
