/**
 * Listens to every Short or Long clip with speech-to-text and records whether
 * it heard the word exactly, vowel length included, and how long the speech
 * lasts. A voice that says "mala" for "malá" would make the task unfair, so
 * build-bank.ts drops a pair whose long clip is barely longer than its short
 * one. Needs ffmpeg.
 *
 *   bun scripts/level-test/check-length.ts
 *
 * Loop until it reports no new unclear clips:
 *   build-bank → audio/generate.ts --level-test-only --missing-only → check-length
 */

import { execFile } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  audioHash,
  audioObjectKey,
  toR2AudioKey,
} from "../../src/lib/catalog/audio/core";
import { transcribeAudio } from "../audio/stt";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";

import {
  LENGTH_CHECK_PATH,
  MIN_LENGTH_GAP_MS,
  lengthAudible,
  loadLengthChecks,
} from "./spoken-check";

interface Items {
  listenLength?: { word: string; short: string; long: string }[];
}

/** Clips start and end with a little silence; -40 dB keeps soft final vowels. */
function speechMs(clip: string): Promise<number> {
  return new Promise((resolve, reject) => {
    execFile(
      "ffmpeg",
      [
        "-hide_banner",
        "-i",
        clip,
        "-af",
        "silencedetect=n=-40dB:d=0.05",
        "-f",
        "null",
        "-",
      ],
      (error, _stdout, stderr) => {
        if (error) return reject(error);
        const duration = /Duration: (\d+):(\d+):([\d.]+)/u.exec(stderr);
        if (!duration) return reject(new Error(`no duration for ${clip}`));
        const total =
          Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]);
        const starts = [...stderr.matchAll(/silence_start: ([\d.]+)/gu)].map((m) =>
          Number(m[1]),
        );
        const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/gu)].map((m) =>
          Number(m[1]),
        );
        const from = starts[0] !== undefined && starts[0] < 0.02 ? (ends[0] ?? 0) : 0;
        const lastStart = starts.at(-1);
        const to = lastStart !== undefined && lastStart > from ? lastStart : total;
        resolve(Math.round((to - from) * 1000));
      },
    );
  });
}

/** Dictionary clips may live only on R2; fetch those into the local audio folder. */
async function localClip(word: string): Promise<string> {
  const hash = audioHash(word);
  const local = path.join(ROOT, "static", "audio", "lemma", `${hash}.mp3`);
  try {
    await access(local);
    return local;
  } catch {
    const baseUrl = process.env.PUBLIC_AUDIO_BASE_URL?.replace(/\/$/u, "");
    if (!baseUrl)
      throw new Error(`no local clip for ${word} and PUBLIC_AUDIO_BASE_URL is unset`);
    const response = await fetch(
      `${baseUrl}/${toR2AudioKey(audioObjectKey("lemma", hash))}`,
    );
    if (!response.ok) throw new Error(`${response.status} for the ${word} clip`);
    await mkdir(path.dirname(local), { recursive: true });
    await writeFile(local, Buffer.from(await response.arrayBuffer()));
    return local;
  }
}

async function main(): Promise<void> {
  const items = await readJsonFile<Items>(
    path.join(ROOT, "content", "level-test", "items.json"),
    {},
  );
  const checks = await loadLengthChecks();
  const clips = items.listenLength ?? [];
  const queue = clips.map((item) => item.word).filter((word) => !checks[word]);
  const pending = queue.length;

  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let word = queue.shift(); word; word = queue.shift()) {
        const result = await transcribeAudio(await localClip(word), {
          provider: "elevenlabs",
        });
        const heard = result.text
          .normalize("NFC")
          .toLocaleLowerCase("sk")
          .replace(/[^\p{L}\s]/gu, "")
          .trim()
          .replace(/\s+/gu, " ");
        checks[word] = { heard, clear: heard === word };
      }
    }),
  );

  for (const { word } of clips) {
    const check = checks[word];
    if (check && check.speechMs === undefined) {
      check.speechMs = await speechMs(await localClip(word));
    }
  }

  const unclear = clips
    .filter((item) => item.word === item.short)
    .filter((item) => !lengthAudible(item.short, item.long, checks))
    .map(
      (item) =>
        `${item.short}/${item.long}: ${checks[item.short]?.speechMs} vs ${checks[item.long]?.speechMs} ms`,
    );
  const sorted = Object.fromEntries(
    Object.entries(checks).sort(([a], [b]) => a.localeCompare(b, "sk")),
  );
  await writeFileAtomic(LENGTH_CHECK_PATH, `${JSON.stringify(sorted, null, 1)}\n`);

  console.log(
    `Transcribed ${pending}; pairs under ${MIN_LENGTH_GAP_MS} ms apart: ${unclear.length}`,
  );
  for (const line of unclear.sort()) console.log(`  ${line}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
