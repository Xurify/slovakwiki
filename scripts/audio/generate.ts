/**
 * Generate ElevenLabs MP3s into static/audio/{kind}/{hash}.mp3 (gitignored).
 * Kind = lemma | example | lesson (how the clip is used). Text lives in manifest.
 *
 * Usage:
 *   bun scripts/audio/generate.ts
 *   bun scripts/audio/generate.ts -- --lemmas-only --force
 *   bun scripts/audio/generate.ts -- --concurrency 16 --lemmas-only --force
 *   bun scripts/audio/generate.ts -- --examples-only --missing-only --offset 0 --limit 1000
 *   bun scripts/audio/generate.ts -- --force --verify --stt elevenlabs --concurrency 4
 */

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";
import { judgeClip, judgeModeFromSttProvider } from "./judge";
import {
  AUDIO_DIR,
  audioRelativePath,
  collectAudioTargets,
  ensureAudioDir,
  hashAudioText,
  loadConfig,
  loadManifest,
  mapPool,
  parseArgs,
  saveManifest,
  sleep,
  synthesizeElevenLabs,
  type AudioTarget,
  type ManifestEntry,
} from "./shared";

const MANIFEST_SAVE_EVERY = 50;

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY as string;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY missing (set in .env)");
  }

  const {
    concurrency,
    dryRun,
    examplesOnly,
    force,
    lemmasOnly,
    lessonsOnly,
    limit,
    missingOnly,
    offset,
    only,
    slugs,
    retries,
    sttModel,
    sttProvider,
    verify,
    whisperModel,
  } = parseArgs(process.argv.slice(2));
  const config = await loadConfig();
  const manifest = await loadManifest();
  await ensureAudioDir();

  let targets = collectAudioTargets({ lemmasOnly, lessonsOnly, slugs }, config);
  if (examplesOnly) {
    targets = targets.filter((target) => target.kind === "example");
  }
  if (only) {
    const needle = only.toLocaleLowerCase("sk");
    targets = targets.filter((t) => t.text.toLocaleLowerCase("sk").includes(needle));
    if (targets.length === 0) {
      throw new Error(`--only ${JSON.stringify(only)} matched 0 targets`);
    }
  }
  if (missingOnly && !force) {
    const pending = [];
    for (const target of targets) {
      const voiceConfig = target.voiceConfig ?? config;
      const relative = audioRelativePath(target.text, target.kind, voiceConfig);
      if (!(await fileExists(path.join(AUDIO_DIR, relative)))) {
        pending.push(target);
      }
    }
    targets = pending;
  }
  if (offset > 0) targets = targets.slice(offset);
  if (limit !== undefined) targets = targets.slice(0, limit);

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let verified = 0;
  let rescued = 0;
  let sinceSave = 0;
  let rateLimitHits = 0;
  const startedAt = Date.now();
  const verifyFailures: Array<{
    reasons: string[];
    score: number;
    text: string;
    scribe?: string;
    whisper?: string;
  }> = [];

  let manifestLock: Promise<void> = Promise.resolve();

  async function withManifestLock<T>(fn: () => Promise<T>): Promise<T> {
    const previous = manifestLock;
    let release!: () => void;
    manifestLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  async function persistManifest(): Promise<void> {
    await withManifestLock(async () => {
      await saveManifest(manifest);
      sinceSave = 0;
    });
  }

  const judgeMode = judgeModeFromSttProvider(sttProvider);
  const scope = lessonsOnly
    ? "lessons"
    : lemmasOnly
      ? "lemmas"
      : examplesOnly
        ? "examples"
        : "dictionary+lessons";

  // Verify adds STT per take — cap concurrency so we don't burn Scribe quota.
  const effectiveConcurrency = verify ? Math.min(concurrency, 4) : concurrency;

  console.log(
    `Audio generate: ${targets.length} targets (${scope})` +
      ` order=lemma→example→lesson` +
      ` concurrency=${effectiveConcurrency}` +
      ` offset=${offset}` +
      ` (default voice=${config.voiceName}, model=${config.modelId}` +
      `${verify ? `, judge=${judgeMode} scribe=${sttModel} whisper=${whisperModel}, retries=${retries}` : ""}` +
      `${dryRun ? ", dry-run" : ""}${force ? ", force" : ""}` +
      `${missingOnly ? ", missing-only" : ""})`,
  );

  async function processTarget(target: AudioTarget): Promise<void> {
    const voiceConfig = target.voiceConfig ?? config;
    const hash = hashAudioText(target.text, voiceConfig);
    const relative = audioRelativePath(target.text, target.kind, voiceConfig);
    const filePath = path.join(AUDIO_DIR, relative);
    const exists = await fileExists(filePath);

    if (exists && !force) {
      skipped += 1;
      await withManifestLock(async () => {
        if (!manifest[hash]) {
          manifest[hash] = {
            text: target.text,
            kind: target.kind,
            bytes: 0,
            generatedAt: new Date().toISOString(),
            characterId: target.characterId,
            voiceId: voiceConfig.voiceId,
          };
        }
      });
      return;
    }

    if (dryRun) {
      const who = target.characterId ? ` ${target.characterId}` : "";
      console.log(
        `[dry-run] ${target.kind}${who}: ${target.text.slice(0, 60)} → ${relative}`,
      );
      generated += 1;
      return;
    }

    try {
      await ensureAudioDir(target.kind);

      let audio: Uint8Array | undefined;
      let usedRescue = false;
      let lastJudge: Awaited<ReturnType<typeof judgeClip>> | undefined;

      const attempts: Array<{ modelId?: string; seed?: number; label: string }> = [];
      attempts.push({ label: "primary" });
      if (verify && config.rescueModelId && config.rescueModelId !== config.modelId) {
        attempts.push({
          modelId: config.rescueModelId,
          seed: 1,
          label: `rescue:${config.rescueModelId}`,
        });
      }
      for (let r = 1; r <= retries; r += 1) {
        attempts.push({
          seed: 1000 + r,
          label: `retry-${r}`,
        });
        if (verify && config.rescueModelId && config.rescueModelId !== config.modelId) {
          attempts.push({
            modelId: config.rescueModelId,
            seed: 40 + r,
            label: `rescue-retry-${r}`,
          });
        }
      }

      for (const attempt of attempts) {
        audio = await synthesizeElevenLabs(target.synthText ?? target.text, voiceConfig, apiKey, {
          modelId: attempt.modelId,
          seed: attempt.seed,
          languageCode: voiceConfig.languageCode,
        });
        await writeFile(filePath, audio);

        if (!verify) break;

        const judged = await judgeClip(target.text, filePath, {
          apiKey,
          mode: judgeMode,
          scribeModel: sttModel,
          whisperModel,
        });
        lastJudge = judged;

        if (judged.ok) {
          if (attempt.modelId && attempt.modelId !== config.modelId) {
            usedRescue = true;
            rescued += 1;
          }
          verified += 1;
          console.log(
            `verify ok [${attempt.label}] score=${judged.score.toFixed(3)}` +
              ` scribe=«${judged.scribe?.text.slice(0, 40) ?? "—"}»` +
              ` whisper=«${judged.whisper?.text.slice(0, 40) ?? "—"}»`,
          );
          break;
        }

        console.warn(
          `verify fail [${attempt.label}] score=${judged.score.toFixed(3)} reasons=${judged.reasons.join(",")}` +
            ` scribe=«${judged.scribe?.text.slice(0, 50) ?? "—"}»` +
            ` whisper=«${judged.whisper?.text.slice(0, 50) ?? "—"}»`,
        );
        audio = undefined;
      }

      if (!audio) {
        failed += 1;
        verifyFailures.push({
          text: target.text,
          score: lastJudge?.score ?? 0,
          reasons: lastJudge?.reasons ?? ["no-passing-take"],
          scribe: lastJudge?.scribe?.text,
          whisper: lastJudge?.whisper?.text,
        });
        console.error(`fail [verify] ${target.text.slice(0, 50)}`);
        return;
      }

      const entry: ManifestEntry = {
        text: target.text,
        kind: target.kind,
        bytes: audio.byteLength,
        generatedAt: new Date().toISOString(),
        uploadedAt: manifest[hash]?.uploadedAt,
        characterId: target.characterId,
        voiceId: voiceConfig.voiceId,
      };

      await withManifestLock(async () => {
        manifest[hash] = entry;
        generated += 1;
        sinceSave += 1;
        const who = target.characterId ? `/${target.characterId}` : "";
        console.log(
          `ok ${generated}/${targets.length} [${target.kind}${who}] ${target.text.slice(0, 40)} → ${relative} (${audio.byteLength} B)` +
            (usedRescue ? " [rescue]" : ""),
        );
        if (sinceSave >= MANIFEST_SAVE_EVERY) {
          await saveManifest(manifest);
          sinceSave = 0;
        }
      });
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`fail [${target.kind}] ${target.text.slice(0, 50)}: ${message}`);

      if (/429|rate|too_many_concurrent/i.test(message)) {
        rateLimitHits += 1;
        const waitMs = Math.min(15_000, 2_000 * rateLimitHits);
        console.error(`Rate limited — waiting ${waitMs}ms…`);
        await sleep(waitMs);
      }
    }
  }

  await mapPool(targets, dryRun ? Math.min(effectiveConcurrency, 32) : effectiveConcurrency, processTarget);

  if (!dryRun) {
    await persistManifest();
  }

  if (verifyFailures.length > 0) {
    const reportDir = path.join(ROOT, "tmp");
    await mkdir(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, "audio-verify-failures.json");
    await writeFile(reportPath, `${JSON.stringify(verifyFailures, null, 2)}\n`, "utf8");
    console.error(`Verify failures written: ${reportPath}`);
  }

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  const rate =
    generated > 0 ? (generated / ((Date.now() - startedAt) / 1000)).toFixed(1) : "0";

  console.log(
    `Done. generated=${generated} skipped=${skipped} failed=${failed}` +
      (verify ? ` verified=${verified} rescued=${rescued}` : "") +
      ` rate=${rate}/s elapsed=${elapsedSec}s` +
      (rateLimitHits > 0 ? ` rateLimitHits=${rateLimitHits}` : "") +
      ` dir=${AUDIO_DIR}`,
  );

  if (!dryRun && generated > 0) {
    console.log(
      "Prod play needs R2 upload: bun scripts/audio/upload.ts (or upload new keys before deploy).",
    );
  }

  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
