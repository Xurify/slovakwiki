import { entryBySlug, words } from "$lib/catalog/entries";
import type { PracticeItem } from "$lib/learning/types";

import { dictionaryPathForSense } from "./lemma-senses";

/** Canonical dictionary path for a lemma slug; unknown ids fall back to `/dictionary/{id}`. */
export function dictionaryPathForLemmaId(lemmaId: string): string {
  const entry = entryBySlug.get(lemmaId);
  if (!entry) return `/dictionary/${lemmaId}`;
  return dictionaryPathForSense(entry, words);
}

/** `lemmaId → href` for cloze tasks. Server-only — do not import from client islands. */
export function dictionaryHrefsForItems(
  items: readonly PracticeItem[],
): Record<string, string> {
  const hrefs: Record<string, string> = {};

  for (const item of items) {
    if (item.task.type !== "cloze") continue;
    const lemmaId = item.task.lemmaId;
    if (!lemmaId || lemmaId in hrefs) continue;
    hrefs[lemmaId] = dictionaryPathForLemmaId(lemmaId);
  }

  return hrefs;
}
