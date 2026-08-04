/**
 * STT audit of on-disk dictionary audio vs expected text.
 *
 * Usage:
 *   bun run audio:verify -- --limit 50
 *   bun run audio:verify -- --only "príliš hrdý"
 *   bun run audio:verify -- --stt dual
 *   bun run audio:verify -- --stt elevenlabs
 *   bun run audio:verify -- --stt whisper --whisper-model small
 */

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";
import { judgeClip, judgeModeFromSttProvider } from "./judge";
import {
  AUDIO_DIR,
  audioRelativePath,
  collectAudioTargets,
  hashAudioText,
  loadConfig,
  loadManifest,
  parseArgs,
} from "./shared";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const { lemmasOnly, limit, only, sttModel, sttProvider, whisperModel } = parseArgs(
    process.argv.slice(2),
  );
  const config = await loadConfig();
  const manifest = await loadManifest();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const judgeMode = judgeModeFromSttProvider(sttProvider);

  if ((judgeMode === "dual" || judgeMode === "elevenlabs") && !apiKey) {
    throw new Error("ELEVENLABS_API_KEY missing (needed for Scribe STT)");
  }

  let targets = collectAudioTargets({ lemmasOnly });
  if (only) {
    const needle = only.toLocaleLowerCase("sk");
    targets = targets.filter((t) => t.text.toLocaleLowerCase("sk").includes(needle));
  }
  if (limit !== undefined) targets = targets.slice(0, limit);

  console.log(
    `Audio verify: ${targets.length} targets (judge=${judgeMode} scribe=${sttModel} whisper=${whisperModel}, tts=${config.modelId})`,
  );

  const rows: Array<{
    hash: string;
    kind: string;
    ok: boolean;
    score: number;
    text: string;
    reasons: string[];
    scribe?: string;
    whisper?: string;
  }> = [];

  let missing = 0;
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i += 1) {
    const target = targets[i]!;
    const hash = hashAudioText(target.text, config);
    const relative = audioRelativePath(target.text, target.kind, config);
    const filePath = path.join(AUDIO_DIR, relative);

    if (!(await fileExists(filePath))) {
      missing += 1;
      console.warn(`missing ${i + 1}/${targets.length} ${relative}`);
      continue;
    }

    try {
      const judged = await judgeClip(target.text, filePath, {
        apiKey,
        mode: judgeMode,
        scribeModel: sttModel,
        whisperModel,
      });
      rows.push({
        hash,
        kind: target.kind,
        text: target.text,
        score: judged.score,
        ok: judged.ok,
        reasons: judged.reasons,
        scribe: judged.scribe?.text,
        whisper: judged.whisper?.text,
      });

      if (judged.ok) {
        passed += 1;
        console.log(`ok ${i + 1}/${targets.length} score=${judged.score.toFixed(3)}`);
      } else {
        failed += 1;
        console.warn(
          `FAIL ${i + 1}/${targets.length} score=${judged.score.toFixed(3)} reasons=${judged.reasons.join(",")}`,
        );
        console.warn(`  exp: ${target.text}`);
        if (judged.scribe) console.warn(`  scribe: ${judged.scribe.text}`);
        if (judged.whisper) console.warn(`  whisper: ${judged.whisper.text}`);
      }
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`error ${i + 1}/${targets.length}: ${message}`);
    }
  }

  const reportDir = path.join(ROOT, "tmp");
  await mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, "audio-verify-report.json");
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        judgeMode,
        sttModel,
        whisperModel,
        totals: { targets: targets.length, passed, failed, missing },
        failRate: targets.length ? failed / (passed + failed || 1) : 0,
        failures: rows.filter((r) => !r.ok),
        rows,
        manifestSample: Object.keys(manifest).length,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(
    `Done. passed=${passed} failed=${failed} missing=${missing} report=${reportPath}`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
