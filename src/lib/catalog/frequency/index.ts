import type { ContentEntry } from "../types";
import type { FrequencyEntry, FrequencyPartOfSpeech } from "./types";

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

const PART_OF_SPEECH_TO_CATEGORY: Record<FrequencyPartOfSpeech, string> = {
  verb: "Verbs",
  noun: "Nouns",
  adjective: "Adjectives",
  adverb: "Adverbs",
};

/**
 * Prefer the frequency part-of-speech category.
 * Nouns may fall back to curated Places (mesto, Bratislava).
 * Do not fall back to Phrases — that mis-links adverbs like slovensky.
 */
function pickForPreferredPartOfSpeech(
  matches: readonly ContentEntry[],
  preferredCategory: string,
): ContentEntry | undefined {
  const byPartOfSpeech = matches.find((word) => word.category === preferredCategory);
  if (byPartOfSpeech) return byPartOfSpeech;

  if (preferredCategory === "Nouns") {
    return matches.find((word) => word.category === "Places");
  }

  return undefined;
}

export function findLiveWordForLemma(
  lemma: string,
  words: readonly ContentEntry[],
  preferredPartOfSpeech?: FrequencyPartOfSpeech,
): ContentEntry | undefined {
  const preferredCategory = preferredPartOfSpeech
    ? PART_OF_SPEECH_TO_CATEGORY[preferredPartOfSpeech]
    : undefined;

  const exact = words.filter((word) => word.slovak === lemma);
  if (preferredCategory) {
    const picked = pickForPreferredPartOfSpeech(exact, preferredCategory);
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
    return pickForPreferredPartOfSpeech(caseMatches, preferredCategory);
  }
  return caseMatches.length === 1 ? caseMatches[0] : undefined;
}

export function frequencyEntriesMissingFromDictionary(
  entries: readonly FrequencyEntry[],
  words: readonly ContentEntry[],
): FrequencyEntry[] {
  return entries.filter(
    (entry) => !findLiveWordForLemma(entry.lemma, words, entry.partOfSpeech),
  );
}

export function filterFrequencyByPartOfSpeech(
  entries: readonly FrequencyEntry[],
  partOfSpeech: FrequencyPartOfSpeech,
): FrequencyEntry[] {
  return entries.filter((entry) => entry.partOfSpeech === partOfSpeech);
}
