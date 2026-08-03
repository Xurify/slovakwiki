/**
 * Generate ElevenLabs MP3s into static/audio/{kind}/{hash}.mp3 (gitignored).
 * Kind = lemma | example (how the clip is used). Text lives in manifest.
 *
 * Usage:
 *   bun run audio:generate
 *   bun run audio:generate -- --limit 20
 *   bun run audio:generate -- --lemmas-only --dry-run
 *   bun run audio:generate -- --force
 */

import { access, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  AUDIO_DIR,
  audioRelativePath,
  collectAudioTargets,
  ensureAudioDir,
  hashAudioText,
  loadConfig,
  loadManifest,
  parseArgs,
  saveManifest,
  sleep,
  synthesizeElevenLabs,
  type ManifestEntry,
} from "./shared";

const MANIFEST_SAVE_EVERY = 25;

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY missing (set in .env)");
  }

  const { dryRun, force, lemmasOnly, limit } = parseArgs(process.argv.slice(2));
  const config = await loadConfig();
  const manifest = await loadManifest();
  await ensureAudioDir();

  let targets = collectAudioTargets({ lemmasOnly });
  if (limit !== undefined) targets = targets.slice(0, limit);

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let sinceSave = 0;

  console.log(
    `Audio generate: ${targets.length} targets` +
      ` (voice=${config.voiceName}, model=${config.modelId}` +
      `${dryRun ? ", dry-run" : ""}${force ? ", force" : ""})`,
  );

  for (const target of targets) {
    const hash = hashAudioText(target.text, config);
    const relative = audioRelativePath(target.text, target.kind, config);
    const filePath = path.join(AUDIO_DIR, relative);
    const exists = await fileExists(filePath);

    if (exists && !force) {
      skipped += 1;
      if (!manifest[hash]) {
        manifest[hash] = {
          text: target.text,
          kind: target.kind,
          bytes: 0,
          generatedAt: new Date().toISOString(),
        };
      }
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${target.kind}: ${target.text.slice(0, 60)} → ${relative}`);
      generated += 1;
      continue;
    }

    try {
      await ensureAudioDir(target.kind);
      const audio = await synthesizeElevenLabs(target.text, config, apiKey);
      await writeFile(filePath, audio);

      const entry: ManifestEntry = {
        text: target.text,
        kind: target.kind,
        bytes: audio.byteLength,
        generatedAt: new Date().toISOString(),
        uploadedAt: manifest[hash]?.uploadedAt,
      };
      manifest[hash] = entry;
      generated += 1;
      sinceSave += 1;
      console.log(
        `ok ${generated}/${targets.length} [${target.kind}] ${target.text.slice(0, 40)} → ${relative} (${audio.byteLength} B)`,
      );

      if (sinceSave >= MANIFEST_SAVE_EVERY) {
        await saveManifest(manifest);
        sinceSave = 0;
      }

      await sleep(120);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`fail [${target.kind}] ${target.text.slice(0, 50)}: ${message}`);

      if (/429|rate/i.test(message)) {
        console.error("Rate limited — waiting 10s…");
        await sleep(10_000);
      }
    }
  }

  if (!dryRun) {
    await saveManifest(manifest);
  }

  console.log(
    `Done. generated=${generated} skipped=${skipped} failed=${failed} dir=${AUDIO_DIR}`,
  );

  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
