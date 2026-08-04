import { lemmaToSlug } from "./frequency";
import type { ContentEntry } from "./types";

const CATEGORY_ORDER = ["Verbs", "Nouns", "Adjectives"] as const;

const CATEGORY_SECTION_ID: Record<string, string> = {
  Verbs: "verb",
  Nouns: "noun",
  Adjectives: "adjective",
};

/** Anchor id for a part-of-speech section on a multi-sense lemma page. */
export function senseSectionId(category: string): string {
  return (
    CATEGORY_SECTION_ID[category] ?? category.toLocaleLowerCase("en").replace(/\s+/g, "-")
  );
}

/** All live word rows that share the same lemma string (part-of-speech siblings). */
export function lemmaSenseGroup(
  entry: ContentEntry,
  words: readonly ContentEntry[],
): ContentEntry[] {
  if (entry.kind !== "word") return [entry];

  const matches = words.filter(
    (word) => word.kind === "word" && word.slovak === entry.slovak,
  );

  return [...matches].sort((left, right) => {
    const leftOrder = CATEGORY_ORDER.indexOf(
      left.category as (typeof CATEGORY_ORDER)[number],
    );
    const rightOrder = CATEGORY_ORDER.indexOf(
      right.category as (typeof CATEGORY_ORDER)[number],
    );
    const leftRank = leftOrder === -1 ? 99 : leftOrder;
    const rightRank = rightOrder === -1 ? 99 : rightOrder;
    if (leftRank !== rightRank) return leftRank - rightRank;
    return left.slug.localeCompare(right.slug);
  });
}

/**
 * Prefer bare lemma slug among part-of-speech siblings (`domaci` over `domaci-n`).
 * Falls back to an unsuffixed slug, then first in part-of-speech order.
 */
export function canonicalWordSlug(
  entry: ContentEntry,
  words: readonly ContentEntry[],
): string {
  const group = lemmaSenseGroup(entry, words);
  if (group.length <= 1) return entry.slug;

  const bare = lemmaToSlug(entry.slovak);
  const bareHit = group.find((word) => word.slug === bare);
  if (bareHit) return bareHit.slug;

  const unsuffixed = group.find((word) => !/-[vna]$/.test(word.slug));
  return unsuffixed?.slug ?? group[0]!.slug;
}

/** Dictionary href for a sense — canonical slug, with `#verb`/`#noun`/… when lemma has siblings. */
export function dictionaryHrefForSense(
  entry: ContentEntry,
  words: readonly ContentEntry[],
): { slug: string; hash?: string } {
  const canonical = canonicalWordSlug(entry, words);
  const group = lemmaSenseGroup(entry, words);
  if (group.length <= 1) return { slug: canonical };
  return { slug: canonical, hash: senseSectionId(entry.category) };
}

/** Related slugs across senses, excluding part-of-speech sibling entries. */
export function relatedSlugsForLemmaPage(senses: readonly ContentEntry[]): string[] {
  const siblingSlugs = new Set(senses.map((sense) => sense.slug));
  const seen = new Set<string>();
  const related: string[] = [];

  for (const sense of senses) {
    for (const slug of sense.related) {
      if (siblingSlugs.has(slug) || seen.has(slug)) continue;
      seen.add(slug);
      related.push(slug);
    }
  }

  return related;
}
