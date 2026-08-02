import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { FrequencyListFile, FrequencyPos } from "./frequency-types";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const POS_FILES: Record<FrequencyPos, string> = {
  verb: "verbs.json",
  noun: "nouns.json",
  adjective: "adjectives.json",
};

export async function loadFrequencyList(pos: FrequencyPos): Promise<FrequencyListFile> {
  const filePath = path.join(ROOT, "content", "frequency", POS_FILES[pos]);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as FrequencyListFile;
}

export async function loadAllFrequencyLists(): Promise<
  Record<FrequencyPos, FrequencyListFile>
> {
  const [verb, noun, adjective] = await Promise.all([
    loadFrequencyList("verb"),
    loadFrequencyList("noun"),
    loadFrequencyList("adjective"),
  ]);

  return { verb, noun, adjective };
}
