/** Part of speech for SNK frequency lists (verb / noun / adjective / adverb). */
export type FrequencyPartOfSpeech = "verb" | "noun" | "adjective" | "adverb";

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
};
