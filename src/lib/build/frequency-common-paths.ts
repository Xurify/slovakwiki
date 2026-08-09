import { contentCacheKey } from "$lib/build/cache-key";
import { liveLinkForLemma } from "$lib/content/dictionary-common-links";
import { words } from "$lib/content/data";
import { loadAllFrequencyLists } from "$lib/content/load-frequency";
import { FREQUENCY_PARTS } from "$lib/content/frequency-types";

const INITIAL_LIMIT = 100;

export async function frequencyCommonStaticPaths() {
  const allLists = await loadAllFrequencyLists();
  const wordsKey = contentCacheKey(words);

  return FREQUENCY_PARTS.map((partOfSpeech) => {
    const sourceList = allLists[partOfSpeech];
    const entries = sourceList.entries
      .filter((entry) => entry.lemma.trim().length > 1)
      .map((entry) => ({
        rank: entry.rank,
        lemma: entry.lemma,
        ...(entry.count !== undefined ? { count: entry.count } : {}),
      }));

    const initialEntries = entries.slice(0, INITIAL_LIMIT);

    const liveByLemma: Record<string, { english: string; slug: string; hash?: string }> =
      {};

    for (const entry of initialEntries) {
      const link = liveLinkForLemma(entry.lemma, words, partOfSpeech);
      if (!link) continue;
      liveByLemma[entry.lemma] = link;
    }

    return {
      params: { partOfSpeech },
      props: {
        entries,
        initialEntries,
        liveByLemma,
        partOfSpeech,
        sourceUrl: sourceList.sourceUrl,
      },
      cacheKey: contentCacheKey({
        generatedAt: sourceList.generatedAt,
        partOfSpeech,
        entries,
        liveByLemma,
        wordsKey,
      }),
    };
  });
}
