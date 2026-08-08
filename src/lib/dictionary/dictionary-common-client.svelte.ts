import type { FrequencyPartOfSpeech } from "$lib/content/frequency-types";
import { DICTIONARY_BROWSE_INDEX_URL } from "$lib/content/dictionary-browse-utils";

export interface CompactFrequencyEntry {
  count?: number;
  lemma: string;
  rank: number;
}

export interface LiveLink {
  english: string;
  hash?: string;
  slug: string;
}

interface IndexEntry {
  english: string;
  slug: string;
  slovak: string;
}

export const PAGE_SIZE = 100;

export const dictionaryCommonState = $state({
  partOfSpeech: "verb" as FrequencyPartOfSpeech,
  query: "",
  visibleLimit: PAGE_SIZE,
  loading: false,
  loadError: "",
  entries: null as CompactFrequencyEntry[] | null,
  liveByLemma: {} as Record<string, LiveLink>,
});

function frequencyUrl(partOfSpeech: FrequencyPartOfSpeech): string {
  return `/frequency/${partOfSpeech === "noun" ? "nouns" : partOfSpeech === "verb" ? "verbs" : partOfSpeech === "adjective" ? "adjectives" : "adverbs"}.json`;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("sk")
    .trim();
}

export function filterDictionaryCommonEntries(
  entries: CompactFrequencyEntry[],
  query: string,
  liveByLemma: Record<string, LiveLink>,
): CompactFrequencyEntry[] {
  const needle = normalize(query);
  if (!needle) {
    return entries;
  }

  return entries.filter((entry) => {
    const lemma = normalize(entry.lemma);
    const english = normalize(liveByLemma[entry.lemma]?.english ?? "");
    return lemma.includes(needle) || english.includes(needle);
  });
}

export async function ensureDictionaryCommonLoaded(): Promise<void> {
  if (dictionaryCommonState.entries || dictionaryCommonState.loading) {
    return;
  }

  dictionaryCommonState.loading = true;
  dictionaryCommonState.loadError = "";

  try {
    const [frequencyResponse, indexResponse] = await Promise.all([
      fetch(frequencyUrl(dictionaryCommonState.partOfSpeech)),
      fetch(DICTIONARY_BROWSE_INDEX_URL),
    ]);

    if (!frequencyResponse.ok) {
      throw new Error("Frequency list unavailable.");
    }

    const frequencyData = (await frequencyResponse.json()) as {
      entries: CompactFrequencyEntry[];
    };

    dictionaryCommonState.entries = frequencyData.entries.filter(
      (entry) => entry.lemma.trim().length > 1,
    );

    if (indexResponse.ok) {
      const indexData = (await indexResponse.json()) as IndexEntry[];
      const nextLive: Record<string, LiveLink> = {};

      for (const item of indexData) {
        nextLive[item.slovak] = { slug: item.slug, english: item.english };
      }

      dictionaryCommonState.liveByLemma = nextLive;
    }
  } catch (error) {
    dictionaryCommonState.loadError =
      error instanceof Error ? error.message : "Failed to load list.";
  } finally {
    dictionaryCommonState.loading = false;
  }
}

export async function onDictionaryCommonSearchInput(value: string): Promise<void> {
  dictionaryCommonState.query = value;
  dictionaryCommonState.visibleLimit = PAGE_SIZE;

  if (value.trim()) {
    await ensureDictionaryCommonLoaded();
  }
}

export async function showMoreDictionaryCommonEntries(): Promise<void> {
  await ensureDictionaryCommonLoaded();
  dictionaryCommonState.visibleLimit += PAGE_SIZE;
}

export function clearDictionaryCommonFilter(): void {
  dictionaryCommonState.query = "";
  dictionaryCommonState.visibleLimit = PAGE_SIZE;
}

export function initDictionaryCommon(partOfSpeech: FrequencyPartOfSpeech): void {
  dictionaryCommonState.partOfSpeech = partOfSpeech;
}
