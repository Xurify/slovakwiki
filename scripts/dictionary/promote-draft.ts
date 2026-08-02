/**
 * Promote approved drafts into the live dictionary promoted list.
 *
 * Only drafts with status "approved" and required fields are merged.
 * See docs/data-sources.md
 */

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { DraftEntry } from "../../src/lib/content/draft-types";
import type { ContentEntry } from "../../src/lib/content/types";
import { words } from "../../src/lib/content/data";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

const DRAFTS_DIR = path.join(ROOT, "content", "drafts");
const PROMOTED_PATH = path.join(ROOT, "content", "dictionary", "promoted.json");

async function loadPromoted(): Promise<WordSeed[]> {
  try {
    const raw = await readFile(PROMOTED_PATH, "utf8");
    return JSON.parse(raw) as WordSeed[];
  } catch {
    return [];
  }
}

function draftToSeed(draft: DraftEntry): WordSeed | undefined {
  if (!draft.slug || !draft.slovak || !draft.english?.trim()) {
    return undefined;
  }

  return {
    slug: draft.slug,
    slovak: draft.slovak,
    english: draft.english.trim(),
    category: draft.category?.trim() || "Essentials",
    examples: (draft.examples ?? []).map((example) => ({
      slovak: example.slovak,
      english: example.english,
    })),
    related: [],
  };
}

async function main(): Promise<void> {
  await mkdir(path.dirname(PROMOTED_PATH), { recursive: true });

  const promoted = await loadPromoted();
  const liveSlugs = new Set([
    ...words.map((word) => word.slug),
    ...promoted.map((word) => word.slug),
  ]);

  let names: string[] = [];
  try {
    names = (await readdir(DRAFTS_DIR)).filter((name) => name.endsWith(".json"));
  } catch {
    console.log("No drafts directory yet.");
    return;
  }

  let promotedCount = 0;
  let skipped = 0;

  for (const name of names) {
    const draftPath = path.join(DRAFTS_DIR, name);
    const draft = JSON.parse(await readFile(draftPath, "utf8")) as DraftEntry;

    if (draft.status !== "approved") {
      continue;
    }

    const seed = draftToSeed(draft);
    if (!seed) {
      console.warn(`Skip ${name}: approved but missing english/slug/slovak`);
      skipped += 1;
      continue;
    }

    if (liveSlugs.has(seed.slug)) {
      draft.status = "promoted";
      draft.promotedAt = draft.promotedAt ?? new Date().toISOString();
      await writeFile(draftPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
      skipped += 1;
      continue;
    }

    promoted.push(seed);
    liveSlugs.add(seed.slug);

    draft.status = "promoted";
    draft.promotedAt = new Date().toISOString();
    await writeFile(draftPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
    promotedCount += 1;
    console.log(`Promoted ${seed.slug}`);
  }

  await writeFile(PROMOTED_PATH, `${JSON.stringify(promoted, null, 2)}\n`, "utf8");
  console.log(`Promoted ${promotedCount}; skipped ${skipped}`);
  console.log(`Live promoted file: ${path.relative(ROOT, PROMOTED_PATH)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
