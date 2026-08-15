import { words } from "./dictionary/words";
import { grammarEntries } from "./reference/grammar";
import { pronunciationEntries } from "./reference/pronunciation";
import type { ContentEntry } from "./types";

export { words } from "./dictionary/words";
export { grammarEntries } from "./reference/grammar";
export { caseTopics, caseTopicBySlug } from "./reference/cases";
export { pronunciationEntries } from "./reference/pronunciation";

export const allEntries: ContentEntry[] = [
  ...words,
  ...grammarEntries,
  ...pronunciationEntries,
];

export const entryBySlug = new Map(allEntries.map((entry) => [entry.slug, entry]));

export function validateContent(entries: ContentEntry[]): string[] {
  const issues: string[] = [];
  const slugs = new Set<string>();

  for (const entry of entries) {
    if (slugs.has(entry.slug)) {
      issues.push(`Duplicate slug: ${entry.slug}`);
    }
    slugs.add(entry.slug);

    if (!entry.source) {
      issues.push(`Missing source: ${entry.slug}`);
    }
    if (entry.examples.some((example) => !(example.english && example.slovak))) {
      issues.push(`Incomplete example: ${entry.slug}`);
    }
  }

  for (const entry of entries) {
    for (const relatedSlug of entry.related) {
      if (!slugs.has(relatedSlug)) {
        issues.push(`Broken relation: ${entry.slug} → ${relatedSlug}`);
      }
    }
  }

  return issues;
}
