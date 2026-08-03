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

const POS_TO_CATEGORY: Record<FrequencyPos, string> = {
  verb: "Verbs",
  noun: "Nouns",
  adjective: "Adjectives",
};

export function findLiveWordForLemma(
  lemma: string,
  words: readonly ContentEntry[],
  preferredPos?: FrequencyPos,
): ContentEntry | undefined {
  const preferredCategory = preferredPos ? POS_TO_CATEGORY[preferredPos] : undefined;

  const exact = words.filter((word) => word.slovak === lemma);
  if (preferredCategory) {
    const byPos = exact.find((word) => word.category === preferredCategory);
    if (byPos) return byPos;
  } else if (exact.length > 0) {
    return exact[0];
  }

  // Case-insensitive only — never strip diacritics (štát ≠ stať, brat ≠ brať).
  const lower = lemma.toLocaleLowerCase("sk");
  const caseMatches = words.filter(
    (word) => word.slovak.toLocaleLowerCase("sk") === lower,
  );
  if (preferredCategory) {
    return caseMatches.find((word) => word.category === preferredCategory);
  }
  return caseMatches.length === 1 ? caseMatches[0] : undefined;
}

export function frequencyEntriesMissingFromDictionary(
  entries: readonly FrequencyEntry[],
  words: readonly ContentEntry[],
): FrequencyEntry[] {
  return entries.filter((entry) => !findLiveWordForLemma(entry.lemma, words, entry.pos));
}

export function filterFrequencyByPos(
  entries: readonly FrequencyEntry[],
  pos: FrequencyPos,
): FrequencyEntry[] {
  return entries.filter((entry) => entry.pos === pos);
}
