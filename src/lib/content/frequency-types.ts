export type FrequencyPos = "verb" | "noun" | "adjective";

export interface FrequencyEntry {
  count?: number;
  lemma: string;
  pos: FrequencyPos;
  rank: number;
  source: string;
  sourceUrl: string;
}

export interface FrequencyListFile {
  corpus: string;
  generatedAt?: string;
  entries: FrequencyEntry[];
  pos: FrequencyPos;
  source: string;
  sourceUrl: string;
}

export const FREQUENCY_POS_LABEL: Record<FrequencyPos, string> = {
  verb: "Verbs",
  noun: "Nouns",
  adjective: "Adjectives",
};
