/**
 * Coverage report for dictionary lemma images.
 *
 * Usage: bun scripts/images/status.ts
 *        bun scripts/images/status.ts -- --pos noun
 */

import path from "node:path";

import {
  IMAGES_DIR,
  collectImageTargets,
  fileExists,
  loadManifest,
  localImagePath,
  parseArgs,
} from "./shared";

async function main(): Promise<void> {
  const { only, partOfSpeech } = parseArgs(process.argv.slice(2));
  const manifest = await loadManifest();
  const targets = collectImageTargets({ only, partOfSpeech });

  let ok = 0;
  let onDisk = 0;
  let missing = 0;
  let rejected = 0;
  let noEntry = 0;

  const byCategory = new Map<
    string,
    { ok: number; missing: number; rejected: number; total: number }
  >();

  const missingSamples: string[] = [];
  const okSamples: string[] = [];

  for (const target of targets) {
    const bucket = byCategory.get(target.category) ?? {
      ok: 0,
      missing: 0,
      rejected: 0,
      total: 0,
    };
    bucket.total += 1;

    const entry = manifest[target.slug];
    if (!entry) {
      noEntry += 1;
      missing += 1;
      bucket.missing += 1;
      if (missingSamples.length < 8) missingSamples.push(target.slug);
    } else if (entry.status === "ok") {
      ok += 1;
      bucket.ok += 1;
      if (entry.file && (await fileExists(localImagePath(entry.file)))) {
        onDisk += 1;
      }
      if (okSamples.length < 5) {
        okSamples.push(
          `${target.slug} → ${entry.file ?? "?"} (${entry.wikiLang ?? "?"})`,
        );
      }
    } else if (entry.status === "rejected") {
      rejected += 1;
      bucket.rejected += 1;
    } else {
      missing += 1;
      bucket.missing += 1;
      if (missingSamples.length < 8) missingSamples.push(target.slug);
    }

    byCategory.set(target.category, bucket);
  }

  console.log(`Layout: ${path.relative(process.cwd(), IMAGES_DIR)}/{slug}.{ext}`);
  console.log(
    `Targets: ${targets.length}${partOfSpeech ? ` (pos=${partOfSpeech})` : ""}`,
  );
  console.log(`Manifest ok: ${ok} (on disk: ${onDisk})`);
  console.log(`Missing / no entry: ${missing} (no manifest row: ${noEntry})`);
  console.log(`Rejected: ${rejected}`);
  console.log(`Manifest rows: ${Object.keys(manifest).length}`);
  console.log("");
  console.log("By category:");

  const categories = [...byCategory.keys()].sort((a, b) => a.localeCompare(b));
  for (const category of categories) {
    const bucket = byCategory.get(category)!;
    const rate = bucket.total > 0 ? ((bucket.ok / bucket.total) * 100).toFixed(0) : "0";
    console.log(
      `  ${category}: ${bucket.ok}/${bucket.total} ok (${rate}%), missing=${bucket.missing}, rejected=${bucket.rejected}`,
    );
  }

  if (okSamples.length > 0) {
    console.log("");
    console.log("Ok samples:");
    for (const sample of okSamples) console.log(`  - ${sample}`);
  }

  if (missingSamples.length > 0) {
    console.log("");
    console.log("Missing samples:");
    for (const sample of missingSamples) console.log(`  - ${sample}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
