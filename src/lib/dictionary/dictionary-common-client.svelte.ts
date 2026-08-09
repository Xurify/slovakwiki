import {
  buildLiveLinksFromIndex,
  type DictionaryLiveLink,
  resolveLiveLinkFromIndex,
} from "$lib/content/dictionary-common-links";
import type { DictionaryIndexSidecarEntry } from "$lib/content/dictionary-browse";
import type { FrequencyPartOfSpeech } from "$lib/content/frequency-types";
import { DICTIONARY_BROWSE_INDEX_URL } from "$lib/content/dictionary-browse-utils";

export interface CompactFrequencyEntry {
  count?: number;
  lemma: string;
  rank: number;
}

export type LiveLink = DictionaryLiveLink;

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

function buildLemmaLiveMap(
  entries: CompactFrequencyEntry[],
  partOfSpeech: FrequencyPartOfSpeech,
  index: readonly DictionaryIndexSidecarEntry[],
): Record<string, LiveLink> {
  const byLemmaCategory = buildLiveLinksFromIndex(index);
  const nextLive: Record<string, LiveLink> = {};

  for (const entry of entries) {
    const link = resolveLiveLinkFromIndex(entry.lemma, partOfSpeech, byLemmaCategory);
    if (link) {
      nextLive[entry.lemma] = link;
    }
  }

  return nextLive;
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

    const entries = frequencyData.entries.filter(
      (entry) => entry.lemma.trim().length > 1,
    );
    dictionaryCommonState.entries = entries;

    if (indexResponse.ok) {
      const indexData = (await indexResponse.json()) as DictionaryIndexSidecarEntry[];
      dictionaryCommonState.liveByLemma = buildLemmaLiveMap(
        entries,
        dictionaryCommonState.partOfSpeech,
        indexData,
      );
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
