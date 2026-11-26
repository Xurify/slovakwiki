/** Part of speech for SNK frequency lists (verb / noun / adjective / adverb / particle / conjunction). */
export type FrequencyPartOfSpeech =
  "verb" | "noun" | "adjective" | "adverb" | "particle" | "conjunction";

export interface FrequencyEntry {
  count?: number;
  lemma: string;
  partOfSpeech: FrequencyPartOfSpeech;
  rank: number;
  source: string;
  sourceUrl: string;
}

export interface FrequencyListFile {
  corpus: string;
  generatedAt?: string;
  entries: FrequencyEntry[];
  partOfSpeech: FrequencyPartOfSpeech;
  source: string;
  sourceUrl: string;
}

export const FREQUENCY_PART_OF_SPEECH_LABEL: Record<FrequencyPartOfSpeech, string> = {
  verb: "Verbs",
  noun: "Nouns",
  adjective: "Adjectives",
  adverb: "Adverbs",
  particle: "Particles",
  conjunction: "Conjunctions",
};

export const FREQUENCY_PARTS = [
  "verb",
  "noun",
  "adjective",
  "adverb",
  "particle",
  "conjunction",
] as const;

/** Open-class dumps have 1-letter tagger noise; conjunctions and particles include real 1-letter words (a, i). */
export function isDisplayableFrequencyLemma(
  lemma: string,
  partOfSpeech: FrequencyPartOfSpeech,
): boolean {
  const trimmed = lemma.trim();
  return (
    trimmed.length > 1 || partOfSpeech === "conjunction" || partOfSpeech === "particle"
  );
}
