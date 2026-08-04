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

/** Frequency POS buckets — curated topical categories are not these. */
const FREQUENCY_POS_CATEGORIES = new Set<string>(["Verbs", "Nouns", "Adjectives"]);

/**
 * Prefer the frequency POS category, then fall back to a curated topical entry
 * for the same lemma (People / Places / Conversation / …) so common lists do
 * not show “Not in dictionary yet” when the page already exists.
 */
function pickForPreferredPos(
  matches: readonly ContentEntry[],
  preferredCategory: string,
): ContentEntry | undefined {
  const byPos = matches.find((word) => word.category === preferredCategory);
  if (byPos) return byPos;

  const rivalCategories = new Set(FREQUENCY_POS_CATEGORIES);
  rivalCategories.delete(preferredCategory);

  return matches.find((word) => !rivalCategories.has(word.category));
}

export function findLiveWordForLemma(
  lemma: string,
  words: readonly ContentEntry[],
  preferredPos?: FrequencyPos,
): ContentEntry | undefined {
  const preferredCategory = preferredPos ? POS_TO_CATEGORY[preferredPos] : undefined;

  const exact = words.filter((word) => word.slovak === lemma);
  if (preferredCategory) {
    const picked = pickForPreferredPos(exact, preferredCategory);
    if (picked) return picked;
  } else if (exact.length > 0) {
    return exact[0];
  }

  // Case-insensitive only — never strip diacritics (štát ≠ stať, brat ≠ brať).
  const lower = lemma.toLocaleLowerCase("sk");
  const caseMatches = words.filter(
    (word) => word.slovak.toLocaleLowerCase("sk") === lower,
  );
  if (preferredCategory) {
    return pickForPreferredPos(caseMatches, preferredCategory);
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
