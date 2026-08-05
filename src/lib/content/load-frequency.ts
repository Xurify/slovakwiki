import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { FrequencyListFile, FrequencyPartOfSpeech } from "./frequency-types";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const PART_OF_SPEECH_FILES: Record<FrequencyPartOfSpeech, string> = {
  verb: "verbs.json",
  noun: "nouns.json",
  adjective: "adjectives.json",
  adverb: "adverbs.json",
};

export async function loadFrequencyList(
  partOfSpeech: FrequencyPartOfSpeech,
): Promise<FrequencyListFile> {
  const filePath = path.join(
    ROOT,
    "content",
    "frequency",
    PART_OF_SPEECH_FILES[partOfSpeech],
  );
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as FrequencyListFile;
}

export async function loadAllFrequencyLists(): Promise<
  Record<FrequencyPartOfSpeech, FrequencyListFile>
> {
  const [verb, noun, adjective, adverb] = await Promise.all([
    loadFrequencyList("verb"),
    loadFrequencyList("noun"),
    loadFrequencyList("adjective"),
    loadFrequencyList("adverb"),
  ]);

  return { verb, noun, adjective, adverb };
}
