/**
 * Coverage report for dictionary audio.
 *
 * Usage: bun run audio:status
 */

import { access } from "node:fs/promises";
import path from "node:path";

import {
  AUDIO_DIR,
  audioRelativePath,
  collectAudioTargets,
  hashAudioText,
  listAudioObjectKeys,
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
  const { lemmasOnly } = parseArgs(process.argv.slice(2));
  const config = await loadConfig();
  const manifest = await loadManifest();
  const targets = collectAudioTargets({ lemmasOnly });

  let onDisk = 0;
  let inManifest = 0;
  let uploaded = 0;
  let missing = 0;
  let lemmaOnDisk = 0;
  let exampleOnDisk = 0;

  const missingSamples: string[] = [];

  for (const target of targets) {
    const hash = hashAudioText(target.text, config);
    const relative = audioRelativePath(target.text, target.kind, config);
    const disk = await fileExists(path.join(AUDIO_DIR, relative));
    const entry = manifest[hash];

    if (disk) {
      onDisk += 1;
      if (target.kind === "lemma") lemmaOnDisk += 1;
      else exampleOnDisk += 1;
    }
    if (entry) inManifest += 1;
    if (entry?.uploadedAt) uploaded += 1;
    if (!disk) {
      missing += 1;
      if (missingSamples.length < 8) {
        missingSamples.push(`${target.kind}: ${target.text} → ${relative}`);
      }
    }
  }

  const fileCount = (await listAudioObjectKeys()).length;

  console.log(`Voice: ${config.voiceName} (${config.voiceId})`);
  console.log(`Model: ${config.modelId}`);
  console.log(`Layout: static/audio/{lemma|example}/{hash}.mp3`);
  console.log(`Targets: ${targets.length}${lemmasOnly ? " (lemmas only)" : ""}`);
  console.log(
    `On disk (matched): ${onDisk} (lemma=${lemmaOnDisk}, example=${exampleOnDisk})`,
  );
  console.log(`Missing: ${missing}`);
  console.log(
    `Manifest entries: ${Object.keys(manifest).length} (matched ${inManifest})`,
  );
  console.log(`Uploaded (manifest): ${uploaded}`);
  console.log(`Files in static/audio/{lemma,example}: ${fileCount}`);

  if (missingSamples.length > 0) {
    console.log("Missing samples:");
    for (const sample of missingSamples) console.log(`  - ${sample}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
