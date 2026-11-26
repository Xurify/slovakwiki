import {
  buildLiveLinksFromIndex,
  type DictionaryLiveLink,
  resolveLiveLinkFromIndex,
} from "$lib/catalog/dictionary/live-links";
import type { DictionaryIndexSidecarEntry } from "$lib/catalog/dictionary/browse";
import {
  isDisplayableFrequencyLemma,
  type FrequencyPartOfSpeech,
} from "$lib/catalog/frequency/types";
import { fetchDictionaryIndex } from "$lib/catalog/dictionary/browse-query";

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

const FREQUENCY_FILE_BY_PART: Record<FrequencyPartOfSpeech, string> = {
  noun: "nouns",
  verb: "verbs",
  adjective: "adjectives",
  adverb: "adverbs",
  particle: "particles",
  conjunction: "conjunctions",
};

function frequencyUrl(partOfSpeech: FrequencyPartOfSpeech): string {
  return `/frequency/${FREQUENCY_FILE_BY_PART[partOfSpeech]}.json`;
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
    const [frequencyResponse, indexData] = await Promise.all([
      fetch(frequencyUrl(dictionaryCommonState.partOfSpeech)),
      fetchDictionaryIndex<DictionaryIndexSidecarEntry>().catch(() => null),
    ]);

    if (!frequencyResponse.ok) {
      throw new Error("Frequency list unavailable.");
    }

    const frequencyData = (await frequencyResponse.json()) as {
      entries: CompactFrequencyEntry[];
    };

    const entries = frequencyData.entries.filter((entry) =>
      isDisplayableFrequencyLemma(entry.lemma, dictionaryCommonState.partOfSpeech),
    );
    dictionaryCommonState.entries = entries;

    if (indexData) {
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
  if (dictionaryCommonState.partOfSpeech !== partOfSpeech) {
    dictionaryCommonState.partOfSpeech = partOfSpeech;
    dictionaryCommonState.entries = null;
    dictionaryCommonState.liveByLemma = {};
    dictionaryCommonState.query = "";
    dictionaryCommonState.visibleLimit = PAGE_SIZE;
    dictionaryCommonState.loadError = "";
  }
}
