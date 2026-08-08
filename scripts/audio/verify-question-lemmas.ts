/**
 * Verify production question-lemma MP3s (STT + duration).
 * Usage: bun scripts/audio/verify-question-lemmas.ts
 */

import { access } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { words } from "../../src/lib/content/data";
import { dictionaryLemmaSynthText } from "../../src/lib/content/audio-lemma-synthesis";
import { audioHash, audioObjectKey } from "../../src/lib/content/audio";
import { scoreTranscript } from "./verify-score";
import { transcribeAudio } from "./stt";
import { ROOT } from "../lib/paths";

const execFileAsync = promisify(execFile);

const FFPROBE =
  process.env.FFPROBE_PATH ??
  "C:\\Users\\Stream\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-7.0.1-full_build\\bin\\ffprobe.exe";

const QUESTION_SLUGS = [
  "kam",
  "ci",
  "ktory",
  "ako",
  "kde",
  "co",
  "kto",
  "kolko",
  "preco",
  "kedy",
  "aky",
  "odkial",
] as const;

const MIN_SCORE = 0.95;
const MAX_DURATION_SEC = 1.25;

async function probeDurationSec(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync(FFPROBE, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  return Number.parseFloat(stdout.trim());
}

async function main(): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  const failures: string[] = [];

  for (const slug of QUESTION_SLUGS) {
    const entry = words.find((w) => w.kind === "word" && w.slug === slug);
    if (!entry) {
      failures.push(`${slug}: missing dictionary entry`);
      continue;
    }

    const synthText = dictionaryLemmaSynthText(entry.slovak);

    const hash = audioHash(entry.slovak);
    const filePath = path.join(ROOT, "static", "audio", audioObjectKey("lemma", hash));

    try {
      await access(filePath);
    } catch {
      failures.push(`${slug}: missing ${filePath}`);
      continue;
    }

    const durationSec = await probeDurationSec(filePath);
    const stt = await transcribeAudio(filePath, { apiKey, provider: "elevenlabs" });
    const scored = scoreTranscript(entry.slovak, stt.text);

    const englishCome =
      slug === "kam" && /come/i.test(stt.text) && scored.score < MIN_SCORE;

    if (scored.score < MIN_SCORE || durationSec > MAX_DURATION_SEC || englishCome) {
      failures.push(
        `${slug}: score=${scored.score.toFixed(3)} dur=${durationSec.toFixed(2)}s stt=«${stt.text}»` +
          (synthText ? ` synth=${synthText}` : ""),
      );
    } else {
      console.log(
        `ok ${slug}: score=${scored.score.toFixed(3)} dur=${durationSec.toFixed(2)}s stt=«${stt.text}»`,
      );
    }
  }

  if (failures.length > 0) {
    console.error("\nFAILURES:");
    for (const line of failures) console.error(`  ${line}`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nAll ${QUESTION_SLUGS.length} question lemmas passed.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
