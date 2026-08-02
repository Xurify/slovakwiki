/**
 * Apply semantic related-cluster peers onto promoted words.
 * Only fills empty `related` arrays — never overwrites curated / pattern related.
 *
 * Usage: bun run related:apply
 * Run after examples:curate so CURATED_RELATED already owns pattern lemmas.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ContentEntry } from "../../src/lib/content/types";
import { words } from "../../src/lib/content/data";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

const PROMOTED_PATH = path.join(ROOT, "content", "dictionary", "promoted.json");
const CLUSTERS_PATH = path.join(ROOT, "content", "dictionary", "related-clusters.json");
const MAX_PEERS = 4;

function expandClusters(
  clusters: Record<string, string[]>,
  knownSlugs: Set<string>,
): Map<string, string[]> {
  const peers = new Map<string, Set<string>>();

  for (const [name, members] of Object.entries(clusters)) {
    const live = members.filter((slug) => knownSlugs.has(slug));
    if (live.length < 2) {
      console.warn(`Cluster "${name}" has fewer than 2 live slugs — skipped`);
      continue;
    }

    for (const slug of live) {
      const set = peers.get(slug) ?? new Set<string>();
      for (const other of live) {
        if (other !== slug) set.add(other);
      }
      peers.set(slug, set);
    }
  }

  const result = new Map<string, string[]>();
  for (const [slug, set] of peers) {
    result.set(slug, [...set].slice(0, MAX_PEERS));
  }
  return result;
}

async function main(): Promise<void> {
  const promoted = JSON.parse(await readFile(PROMOTED_PATH, "utf8")) as WordSeed[];
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
  let missingFromPromoted = 0;

  for (const [slug, related] of peerMap) {
    const word = promoted.find((entry) => entry.slug === slug);
    if (!word) {
      missingFromPromoted += 1;
      continue;
    }
    if (word.related.length > 0) {
      skippedHasRelated += 1;
      continue;
    }
    word.related = related;
    filled += 1;
  }

  await writeFile(PROMOTED_PATH, `${JSON.stringify(promoted, null, 2)}\n`, "utf8");
  console.log(`Filled related from clusters: ${filled}`);
  console.log(`Skipped (already had related): ${skippedHasRelated}`);
  console.log(`Cluster slugs not in promoted: ${missingFromPromoted}`);
  console.log(`→ ${path.relative(ROOT, PROMOTED_PATH)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
