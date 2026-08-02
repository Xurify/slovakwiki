<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import {
    FREQUENCY_POS_LABEL,
    type FrequencyPos,
  } from "$lib/content/frequency-types";

  interface CompactFrequencyEntry {
    count?: number;
    lemma: string;
    rank: number;
  }

  interface LiveLink {
    english: string;
    slug: string;
  }

  interface Props {
    lists: Record<FrequencyPos, CompactFrequencyEntry[]>;
    liveByLemma: Record<string, LiveLink>;
    sourceUrl: string;
  }

  let { lists, liveByLemma, sourceUrl }: Props = $props();

  const PAGE_SIZE = 100;
  const tabs: FrequencyPos[] = ["verb", "noun", "adjective"];

  let activePos = $state<FrequencyPos>("verb");
  let query = $state("");
  let visibleLimit = $state(PAGE_SIZE);

  const filteredEntries = $derived.by(() => {
    const needle = query
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase("sk")
      .trim();
    return lists[activePos].filter((entry) => {
      if (!needle) return true;
      const lemma = entry.lemma
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLocaleLowerCase("sk");
      const english = liveByLemma[entry.lemma]?.english
        ?.normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLocaleLowerCase("sk");
      return lemma.includes(needle) || Boolean(english?.includes(needle));
    });
  });

  const visibleEntries = $derived(filteredEntries.slice(0, visibleLimit));
  const hasMore = $derived(filteredEntries.length > visibleLimit);

  function setPos(pos: FrequencyPos): void {
    activePos = pos;
    visibleLimit = PAGE_SIZE;
  }

  function setQuery(value: string): void {
    query = value;
    visibleLimit = PAGE_SIZE;
  }

  const rowClass =
    "grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-slate-200 py-3 text-sm max-[560px]:grid-cols-[2.5rem_minmax(0,1fr)]";

  const tabClass = (pos: FrequencyPos) =>
    [
      "border-b-2 px-1 pb-2 text-sm transition-colors",
      activePos === pos
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
      <Eyebrow>Frequency</Eyebrow>
      <h1>Most common words</h1>
      <Lead>
        Top 1000 verbs, nouns, and adjectives from the Slovak National Corpus. Open a word
        for its English meaning and examples.
      </Lead>
    </header>

    <div class="mt-10" id="common-filter-section">
      <label class="sr-only" for="common-filter">Filter lemmas</label>
      <div
        class="flex min-h-[50px] items-stretch overflow-hidden rounded-(--control-radius) border border-slate-300 bg-white/90 shadow-(--shadow-border) transition-[box-shadow,border-color] focus-within:border-blue-600 focus-within:shadow-[0_0_0_4px_var(--accent-soft)]"
      >
        <svg
          class="ml-4 w-4 shrink-0 fill-none stroke-slate-400 stroke-[1.8]"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
        </svg>
        <input
          class="min-w-0 flex-1 border-0 bg-transparent px-3 text-[0.95rem] outline-none"
          id="common-filter"
          value={query}
          oninput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
          placeholder="Filter lemmas"
          type="search"
        />
        {#if query}
          <button
            class="mr-3 cursor-pointer border-0 bg-transparent text-xs font-semibold text-blue-800"
            type="button"
            aria-label="Clear filter"
            onclick={() => setQuery("")}
          >
            Clear
          </button>
        {/if}
      </div>
    </div>

    <div
      class="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200"
    >
      <div class="flex gap-5" role="tablist" aria-label="Part of speech">
        {#each tabs as pos (pos)}
          <button
            class={tabClass(pos)}
            type="button"
            role="tab"
            aria-selected={activePos === pos}
            onclick={() => setPos(pos)}
          >
            {FREQUENCY_POS_LABEL[pos]}
          </button>
        {/each}
      </div>

      <p class="mb-2 text-xs text-slate-500">
        Showing {visibleEntries.length.toLocaleString("en")} of {filteredEntries.length.toLocaleString(
          "en",
        )}
        {FREQUENCY_POS_LABEL[activePos].toLowerCase()}
        {#if filteredEntries.length !== lists[activePos].length}
          <span class="text-slate-400">
            · {lists[activePos].length.toLocaleString("en")} total
          </span>
        {/if}
      </p>
    </div>

    {#if filteredEntries.length === 0}
      <div class="py-16 text-center">
        <h2 class="text-xl">No matches</h2>
        <p class="mt-2 text-sm text-slate-500">Try a shorter filter or clear it.</p>
        <button
          class="mt-4 cursor-pointer border-0 bg-transparent text-sm font-semibold text-blue-800 underline underline-offset-2"
          type="button"
          onclick={() => setQuery("")}
        >
          Clear filter
        </button>
      </div>
    {:else}
      <ol class="mt-2" start="1">
        {#each visibleEntries as entry (entry.rank + entry.lemma)}
          {@const live = liveByLemma[entry.lemma]}
          <li class={rowClass}>
            <span class="tabular-nums text-slate-400">{entry.rank}</span>
            <div class="min-w-0">
              {#if live}
                <a
                  class="font-serif text-base text-blue-800 underline decoration-slate-200 underline-offset-2 hover:decoration-blue-800"
                  href="/dictionary/{live.slug}"
                  lang="sk"
                >
                  {entry.lemma}
                </a>
                <span class="mt-0.5 block text-sm text-slate-500">{live.english}</span>
              {:else}
                <span class="font-serif text-base text-slate-800" lang="sk"
                  >{entry.lemma}</span
                >
                <span class="mt-0.5 block text-xs text-slate-400"
                  >Not in dictionary yet</span
                >
              {/if}
            </div>
            {#if entry.count !== undefined}
              <span
                class="cursor-help tabular-nums text-xs text-slate-400 underline decoration-dotted decoration-slate-300 underline-offset-2 max-[560px]:hidden"
                title="How often this lemma appears in the Slovak National Corpus (prim-8.0-public-all)"
              >
                {entry.count.toLocaleString("en")}
              </span>
            {/if}
          </li>
        {/each}
      </ol>

      {#if hasMore}
        <div class="mt-6 flex justify-center">
          <Button type="button" onclick={() => (visibleLimit += PAGE_SIZE)}>
            Show more
          </Button>
        </div>
      {/if}
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
