import type { ContentEntry } from "./types";
import type { FrequencyEntry, FrequencyPos } from "./frequency-types";

/** Strip diacritics for loose lemma matching. */
export function normalizeLemma(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("sk")
    .trim();
}

/** Build a URL-safe slug from a Slovak lemma. */
export function lemmaToSlug(lemma: string): string {
  return normalizeLemma(lemma)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findLiveWordForLemma(
  lemma: string,
  words: readonly ContentEntry[],
): ContentEntry | undefined {
  const exact = words.find((word) => word.slovak === lemma);
  if (exact) return exact;

  const normalized = normalizeLemma(lemma);
  return words.find((word) => normalizeLemma(word.slovak) === normalized);
}

export function frequencyEntriesMissingFromDictionary(
  entries: readonly FrequencyEntry[],
  words: readonly ContentEntry[],
): FrequencyEntry[] {
  return entries.filter((entry) => !findLiveWordForLemma(entry.lemma, words));
}

export function filterFrequencyByPos(
  entries: readonly FrequencyEntry[],
  pos: FrequencyPos,
): FrequencyEntry[] {
  return entries.filter((entry) => entry.pos === pos);
}
