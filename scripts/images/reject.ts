/**
 * Reject live dictionary images (override + manifest). Does not call Wikimedia.
 *
 * Usage:
 *   bun scripts/images/reject.ts -- --slugs chyba
 *   bun scripts/images/reject.ts -- --slugs chyba,dlzka,horuci
 */

import {
  loadManifest,
  loadOverrides,
  rejectedEntry,
  saveManifest,
  saveOverrides,
} from "./shared";

function parseSlugs(argv: string[]): string[] {
  const slugs: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--slugs" && argv[index + 1]) {
      slugs.push(
        ...argv[index + 1]!.split(",")
          .map((slug) => slug.trim())
          .filter(Boolean),
      );
      index += 1;
    }
  }
  return [...new Set(slugs)];
}

async function main(): Promise<void> {
  const slugs = parseSlugs(process.argv.slice(2));
  if (slugs.length === 0) {
    throw new Error("Required: --slugs slug1,slug2");
  }

  const overrides = await loadOverrides();
  const manifest = await loadManifest();
  const now = new Date().toISOString();

  for (const slug of slugs) {
    const next = { ...overrides[slug], reject: true as const };
    delete next.commonsFile;
    overrides[slug] = next;
    manifest[slug] = rejectedEntry(now);
    console.log(`rejected ${slug}`);
  }

  await saveOverrides(overrides);
  await saveManifest(manifest);
  console.log(`Done. rejected=${slugs.length}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
