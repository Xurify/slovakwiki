<script lang="ts">
  import type { Snippet } from "svelte";

  import DictionaryCommonRow from "$lib/components/DictionaryCommonRow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import {
    FREQUENCY_PART_OF_SPEECH_LABEL,
    type FrequencyPartOfSpeech,
  } from "$lib/content/frequency-types";

  interface CompactFrequencyEntry {
    count?: number;
    lemma: string;
    rank: number;
  }

  interface LiveLink {
    english: string;
    hash?: string;
    slug: string;
  }

  interface Tab {
    href: string;
    label: string;
    value: FrequencyPartOfSpeech;
  }

  interface Props {
    client?: Snippet;
    initialEntries: CompactFrequencyEntry[];
    liveByLemma: Record<string, LiveLink>;
    partOfSpeech: FrequencyPartOfSpeech;
    sourceUrl: string;
    tabs: Tab[];
    totalCount: number;
  }

  let {
    client,
    initialEntries,
    liveByLemma,
    partOfSpeech,
    sourceUrl,
    tabs,
    totalCount,
  }: Props = $props();

  const rowClass =
    "grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-slate-200 py-3 text-sm max-[560px]:grid-cols-[2.5rem_minmax(0,1fr)]";

  const tabClass = (value: FrequencyPartOfSpeech) =>
    [
      "border-b-2 px-1 pb-2 text-sm transition-colors",
      partOfSpeech === value
        ? "border-blue-800 font-medium text-blue-800"
        : "border-transparent text-slate-500 hover:text-slate-800",
    ].join(" ");
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/dictionary">Dictionary</TextLink>
      <span aria-hidden="true">/</span>
      <span>Most common</span>
    </nav>

    <header class="max-w-[640px]">
      <h1>Most common words</h1>
      <Lead>
        Top 1000 verbs, adjectives, and adverbs (nouns: top 2500) from the Slovak National
        Corpus. Open a word for its English meaning and examples.
      </Lead>
    </header>

    <div class="mt-10" data-common-filter></div>

    <div
      class="mt-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-slate-200"
    >
      <div class="flex gap-4 sm:gap-5" role="tablist" aria-label="Part of speech">
        {#each tabs as tab (tab.value)}
          <a
            class={tabClass(tab.value)}
            href={tab.href}
            role="tab"
            aria-selected={partOfSpeech === tab.value}
          >
            {tab.label}
          </a>
        {/each}
      </div>

      <p class="mb-2 w-full text-xs text-slate-500 sm:w-auto sm:text-right">
        Showing {initialEntries.length.toLocaleString("en")} of {totalCount.toLocaleString(
          "en",
        )}
        {FREQUENCY_PART_OF_SPEECH_LABEL[partOfSpeech].toLowerCase()}
      </p>
    </div>

    <ol class="mt-2" id="common-results">
      {#each initialEntries as entry (entry.rank + entry.lemma)}
        <DictionaryCommonRow {entry} live={liveByLemma[entry.lemma]} {rowClass} />
      {/each}
      <li id="common-results-append-anchor" class="sr-only" aria-hidden="true"></li>
    </ol>

    <div data-common-list-controls></div>

    {#if client}
      {@render client()}
    {/if}

    <footer class="mt-14 border-t border-slate-200 pt-8 text-sm text-slate-500">
      <p>
        Frequency data from the
        <a
          class="text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800"
          href={sourceUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Slovak National Corpus
        </a>
        (prim-8.0-public-all). See
        <TextLink href="/references">References</TextLink>
        for full attribution.
      </p>
    </footer>
  </PageShell>
</main>
