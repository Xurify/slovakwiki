/**
 * Export audio targets for Genblaze / B2 soft try.
 * Hashes must match scripts/audio/shared.ts so R2 dual-write can reconcile later.
 *
 * Usage:
 *   bun genblaze/export-targets.ts
 *   bun genblaze/export-targets.ts -- --limit 100 --lemmas-only
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  collectAudioTargets,
  hashAudioText,
  loadConfig,
  parseArgs,
} from "../scripts/audio/shared";
import { ROOT } from "../scripts/lib/paths";

const OUT_DIR = path.join(ROOT, "genblaze");
const OUT_PATH = path.join(OUT_DIR, "targets.json");

async function main(): Promise<void> {
  const { lemmasOnly, limit } = parseArgs(process.argv.slice(2));
  const config = await loadConfig();
  let targets = collectAudioTargets({ lemmasOnly });
  if (limit !== undefined) targets = targets.slice(0, limit);

  const rows = targets.map((target) => {
    const hash = hashAudioText(target.text, config);
    return {
      kind: target.kind,
      text: target.text,
      hash,
      objectKey: `sk/dictionary/${target.kind}/${hash}.mp3`,
      sidecarKey: `sk/dictionary/${target.kind}/${hash}.json`,
      localKey: `${target.kind}/${hash}.mp3`,
    };
  });

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    OUT_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        provider: config.provider,
        voiceId: config.voiceId,
        modelId: config.modelId,
        count: rows.length,
        targets: rows,
      },
      null,
      2,
    )}\n`,
  );

  console.log(`Wrote ${rows.length} targets → ${path.relative(ROOT, OUT_PATH)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
