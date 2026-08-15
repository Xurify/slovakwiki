/**
 * Apply semantic related-cluster peers onto dictionary words.
 * Only fills empty `related` arrays — never overwrites curated / pattern related.
 *
 * Usage: bun scripts/dictionary/apply-related.ts
 * Run after apply-curated-examples.ts so CURATED_RELATED already owns pattern lemmas.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ContentEntry } from "../../src/lib/catalog/types";
import { words } from "../../src/lib/catalog/entries";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");
const CLUSTERS_PATH = path.join(ROOT, "content", "dictionary", "related-clusters.json");
const MAX_PEERS = 4;

function expandClusters(
  clusters: Record<string, string[]>,
  knownSlugs: Set<string>,
): Map<string, string[]> {
  const peers = new Map<string, Map<string, number>>();

  for (const [name, members] of Object.entries(clusters)) {
    const live = members.filter((slug) => knownSlugs.has(slug));
    if (live.length < 2) {
      console.warn(`Cluster "${name}" has fewer than 2 live slugs — skipped`);
      continue;
    }

    for (const slug of live) {
      const counts = peers.get(slug) ?? new Map<string, number>();
      for (const other of live) {
        if (other !== slug) {
          counts.set(other, (counts.get(other) ?? 0) + 1);
        }
      }
      peers.set(slug, counts);
    }
  }

  const result = new Map<string, string[]>();
  for (const [slug, counts] of peers) {
    result.set(
      slug,
      [...counts.entries()]
        .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
        .slice(0, MAX_PEERS)
        .map(([peer]) => peer),
    );
  }
  return result;
}

async function main(): Promise<void> {
  const dictionaryWords = JSON.parse(await readFile(WORDS_PATH, "utf8")) as WordSeed[];
  const clusters = JSON.parse(await readFile(CLUSTERS_PATH, "utf8")) as Record<
    string,
    string[]
  >;

  const known = new Set(
    words.filter((entry) => entry.kind === "word").map((entry) => entry.slug),
  );
  const peerMap = expandClusters(clusters, known);

  let filled = 0;
  let skippedHasRelated = 0;
  let missingFromWords = 0;

  for (const [slug, related] of peerMap) {
    const word = dictionaryWords.find((entry) => entry.slug === slug);
    if (!word) {
      missingFromWords += 1;
      continue;
    }
    if (word.related.length > 0) {
      skippedHasRelated += 1;
      continue;
    }
    word.related = related;
    filled += 1;
  }

  await writeFile(WORDS_PATH, `${JSON.stringify(dictionaryWords, null, 2)}\n`, "utf8");
  console.log(`Filled related from clusters: ${filled}`);
  console.log(`Skipped (already had related): ${skippedHasRelated}`);
  console.log(`Cluster slugs not in words.json: ${missingFromWords}`);
  console.log(`→ ${path.relative(ROOT, WORDS_PATH)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
