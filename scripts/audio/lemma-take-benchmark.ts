/**
 * Benchmark lemma TTS takes vs production files.
 * Usage: bun scripts/audio/lemma-take-benchmark.ts
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { words } from "../../src/lib/content/data";
import { dictionaryLemmaSynthText } from "../../src/lib/content/audio-lemma-synthesis";
import { audioHash, audioObjectKey } from "../../src/lib/content/audio";
import { scoreTranscript } from "./verify-score";
import { transcribeAudio } from "./stt";
import { loadConfig, synthesizeElevenLabs } from "./shared";
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

type VariantId = "config" | "production";

interface Variant {
  id: VariantId;
  synthesize?: boolean;
}

interface TakeMetrics {
  variant: VariantId;
  slug: string;
  slovak: string;
  durationSec: number;
  stt: string;
  score: number;
  bytes: number;
  path: string;
}

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

  const config = await loadConfig();
  const outDir = path.join(ROOT, "tmp", "lemma-benchmark");
  await mkdir(outDir, { recursive: true });

  const variants: Variant[] = [{ id: "config", synthesize: true }, { id: "production" }];

  const metrics: TakeMetrics[] = [];

  for (const slug of QUESTION_SLUGS) {
    const entry = words.find((w) => w.kind === "word" && w.slug === slug);
    if (!entry) throw new Error(`missing ${slug}`);

    for (const variant of variants) {
      const fileName = `${slug}-${variant.id}.mp3`;
      const filePath = path.join(outDir, fileName);

      if (variant.id === "production") {
        const hash = audioHash(entry.slovak);
        const prodPath = path.join(
          ROOT,
          "static",
          "audio",
          audioObjectKey("lemma", hash),
        );
        const { copyFile } = await import("node:fs/promises");
        await copyFile(prodPath, filePath).catch(() => {
          throw new Error(`missing production file for ${slug}`);
        });
      } else {
        const synthText = dictionaryLemmaSynthText(entry.slovak) ?? entry.slovak;
        const audio = await synthesizeElevenLabs(synthText, config, apiKey, {
          languageCode: config.languageCode,
        });
        await writeFile(filePath, audio);
        await new Promise((r) => setTimeout(r, 150));
      }

      const durationSec = await probeDurationSec(filePath);
      const stt = await transcribeAudio(filePath, { apiKey, provider: "elevenlabs" });
      const scored = scoreTranscript(entry.slovak, stt.text);
      const { stat } = await import("node:fs/promises");

      metrics.push({
        variant: variant.id,
        slug,
        slovak: entry.slovak,
        durationSec,
        stt: stt.text,
        score: scored.score,
        bytes: (await stat(filePath)).size,
        path: filePath,
      });

      await new Promise((r) => setTimeout(r, 100));
    }
  }

  const reportPath = path.join(outDir, "report.json");
  await writeFile(reportPath, `${JSON.stringify(metrics, null, 2)}\n`);

  const byVariant = new Map<VariantId, TakeMetrics[]>();
  for (const m of metrics) {
    const list = byVariant.get(m.variant) ?? [];
    list.push(m);
    byVariant.set(m.variant, list);
  }

  function summarize(id: VariantId) {
    const list = byVariant.get(id) ?? [];
    const avgDur = list.reduce((s, m) => s + m.durationSec, 0) / list.length;
    const avgScore = list.reduce((s, m) => s + m.score, 0) / list.length;
    const fails = list.filter((m) => m.score < 0.95).map((m) => m.slug);
    return { id, avgDur, avgScore, fails };
  }

  const summary = variants.map((v) => summarize(v.id));
  console.log(JSON.stringify(summary, null, 2));

  const prod = summarize("production");
  const prodOk = prod.fails.length === 0 && prod.avgScore >= 0.98;

  console.log("\nproduction ok:", prodOk);
  console.log("report:", reportPath);

  process.exitCode = prodOk ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
