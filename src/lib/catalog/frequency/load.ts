import adjectives from "../../../../content/frequency/adjectives.json";
import adverbs from "../../../../content/frequency/adverbs.json";
import nouns from "../../../../content/frequency/nouns.json";
import verbs from "../../../../content/frequency/verbs.json";

import type { FrequencyListFile, FrequencyPartOfSpeech } from "./types";

const FREQUENCY_LISTS: Record<FrequencyPartOfSpeech, FrequencyListFile> = {
  verb: verbs as FrequencyListFile,
  noun: nouns as FrequencyListFile,
  adjective: adjectives as FrequencyListFile,
  adverb: adverbs as FrequencyListFile,
};

export async function loadFrequencyList(
  partOfSpeech: FrequencyPartOfSpeech,
): Promise<FrequencyListFile> {
  return FREQUENCY_LISTS[partOfSpeech];
}

export async function loadAllFrequencyLists(): Promise<
  Record<FrequencyPartOfSpeech, FrequencyListFile>
> {
  return FREQUENCY_LISTS;
}
