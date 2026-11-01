/**
 * Record the model and speed on manifest entries made before generate.ts
 * wrote them.
 *
 * A clip's hash already commits to its settings (model, speed, stability,
 * style, voice), so nothing is guessed: for each entry without a `speed`,
 * rebuild the hash from the global config and from each character's config
 * and keep the settings of the one that reproduces the manifest key. An
 * entry no candidate reproduces (its settings changed since) is left alone
 * and reported.
 *
 * Writes the manifest only (never R2). To put the speed into the metadata
 * of objects already on R2, run `bun scripts/audio/upload.ts -- --force`.
 *
 * Usage:
 *   bun scripts/audio/backfill-settings.ts
 *   bun scripts/audio/backfill-settings.ts -- --dry-run
 */

import {
  candidateConfigs,
  generationSettings,
  hashAudioText,
  loadConfig,
  loadManifest,
  saveManifest,
} from "./shared";

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const base = await loadConfig();
  const manifest = await loadManifest();

  let filled = 0;
  let already = 0;
  const unmatched: string[] = [];
  const bySpeed = new Map<number, number>();

  for (const [hash, entry] of Object.entries(manifest)) {
    if (entry.speed !== undefined) {
      already += 1;
      continue;
    }
    const match = candidateConfigs(base, entry.characterId).find(
      (config) => hashAudioText(entry.text, config) === hash,
    );
    if (!match) {
      unmatched.push(hash);
      continue;
    }
    const settings = generationSettings(match);
    entry.modelId = settings.modelId;
    entry.speed = settings.speed;
    bySpeed.set(settings.speed ?? 0, (bySpeed.get(settings.speed ?? 0) ?? 0) + 1);
    filled += 1;
  }

  console.log(
    `filled ${filled}, already had ${already}, no candidate reproduces ${unmatched.length}`,
  );
  for (const [speed, count] of [...bySpeed].sort((a, b) => b[1] - a[1])) {
    console.log(`  speed ${speed}: ${count}`);
  }
  for (const hash of unmatched.slice(0, 10)) {
    const entry = manifest[hash]!;
    console.log(
      `  unmatched ${entry.kind} ${entry.characterId ?? "-"} ${hash} ${JSON.stringify(entry.text.slice(0, 40))}`,
    );
  }

  if (dryRun) {
    console.log("dry run: manifest not written");
    return;
  }
  await saveManifest(manifest);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
