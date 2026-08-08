<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import DotLoader from "$lib/components/ui/DotLoader.svelte";

  import type { FrequencyPartOfSpeech } from "$lib/content/frequency-types";

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

  interface IndexEntry {
    english: string;
    slug: string;
    slovak: string;
  }

  const PAGE_SIZE = 100;

  let {
    partOfSpeech,
    totalCount,
  }: {
    partOfSpeech: FrequencyPartOfSpeech;
    totalCount: number;
  } = $props();

  let query = $state("");
  let visibleLimit = $state(PAGE_SIZE);
  let loading = $state(false);
  let loadError = $state("");
  let entries = $state<CompactFrequencyEntry[] | null>(null);
  let liveByLemma = $state<Record<string, LiveLink>>({});

  const frequencyUrl = `/frequency/${partOfSpeech === "noun" ? "nouns" : partOfSpeech === "verb" ? "verbs" : partOfSpeech === "adjective" ? "adjectives" : "adverbs"}.json`;

  const filteredEntries = $derived.by(() => {
    if (!entries) {
      return [];
    }

    const needle = normalize(query);
    return entries.filter((entry) => {
      if (!needle) {
        return true;
      }

      const lemma = normalize(entry.lemma);
      const english = normalize(liveByLemma[entry.lemma]?.english ?? "");
      return lemma.includes(needle) || english.includes(needle);
    });
  });

  const visibleEntries = $derived(filteredEntries.slice(0, visibleLimit));
  const hasMore = $derived(filteredEntries.length > visibleLimit);
  const expanded = $derived(entries !== null);

  $effect(() => {
    const ssrList = document.getElementById("common-results");
    if (!ssrList) {
      return;
    }

    ssrList.hidden = expanded;
  });

  const rowClass =
    "grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-slate-200 py-3 text-sm max-[560px]:grid-cols-[2.5rem_minmax(0,1fr)]";

  function normalize(value: string): string {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase("sk")
      .trim();
  }

  async function ensureLoaded(): Promise<void> {
    if (entries || loading) {
      return;
    }

    loading = true;
    loadError = "";

    try {
      const [frequencyResponse, indexResponse] = await Promise.all([
        fetch(frequencyUrl),
        fetch("/dictionary/index.json"),
      ]);

      if (!frequencyResponse.ok) {
        throw new Error("Frequency list unavailable.");
      }

      const frequencyData = (await frequencyResponse.json()) as {
        entries: CompactFrequencyEntry[];
      };

      entries = frequencyData.entries.filter((entry) => entry.lemma.trim().length > 1);

      if (indexResponse.ok) {
        const indexData = (await indexResponse.json()) as IndexEntry[];
        const nextLive: Record<string, LiveLink> = {};

        for (const item of indexData) {
          nextLive[item.slovak] = { slug: item.slug, english: item.english };
        }

        liveByLemma = nextLive;
      }
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Failed to load list.";
    } finally {
      loading = false;
    }
  }

  async function onSearchInput(event: Event): Promise<void> {
    const value = (event.currentTarget as HTMLInputElement).value;
    query = value;
    visibleLimit = PAGE_SIZE;

    if (value.trim()) {
      await ensureLoaded();
    }
  }

  async function showMore(): Promise<void> {
    await ensureLoaded();
    visibleLimit += PAGE_SIZE;
  }
</script>

<div id="common-filter-section">
  <label class="sr-only" for="common-filter">Filter lemmas</label>
  <div
    class="flex min-h-[50px] items-stretch overflow-hidden rounded-(--control-radius) border border-slate-300 bg-surface/90 shadow-(--shadow-border) transition-[box-shadow,border-color] focus-within:border-blue-600 focus-within:shadow-[0_0_0_4px_var(--accent-soft)]"
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
      oninput={(event) => void onSearchInput(event)}
      placeholder="Filter lemmas"
      type="search"
    />
    {#if query}
      <button
        class="mr-3 cursor-pointer border-0 bg-transparent text-xs font-semibold text-blue-800"
        type="button"
        aria-label="Clear filter"
        onclick={() => {
          query = "";
          visibleLimit = PAGE_SIZE;
        }}
      >
        Clear
      </button>
    {/if}
  </div>
</div>

{#if loadError}
  <p class="mt-4 text-sm text-rose-700" role="alert">{loadError}</p>
{/if}

{#if loading}
  <div class="mt-6 flex min-h-16 items-center">
    <DotLoader label="Loading frequency list…" />
  </div>
{/if}

{#if expanded && !loading}
  <p class="mb-2 mt-6 w-full text-xs text-slate-500 sm:text-right">
    Showing {visibleEntries.length.toLocaleString("en")} of {filteredEntries.length.toLocaleString(
      "en",
    )}
    {#if filteredEntries.length !== totalCount}
      <span class="text-slate-400">· {totalCount.toLocaleString("en")} total</span>
    {/if}
  </p>

  {#if filteredEntries.length === 0}
    <div class="py-16 text-center">
      <h2 class="text-xl">No matches</h2>
      <p class="mt-2 text-sm text-slate-500">Try a shorter filter or clear it.</p>
    </div>
  {:else}
    <ol class="mt-2" start="1" id="common-results-expanded">
      {#each visibleEntries as entry (entry.rank + entry.lemma)}
        {@const live = liveByLemma[entry.lemma]}
        <li class={rowClass}>
          <span class="tabular-nums text-slate-400">{entry.rank}</span>
          <div class="min-w-0">
            {#if live}
              <a
                class="font-serif text-base text-blue-800 underline decoration-slate-200 underline-offset-2 hover:decoration-blue-800"
                href={`/dictionary/${live.slug}${live.hash ? `#${live.hash}` : ""}`}
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
        <Button type="button" onclick={() => void showMore()}>Show more</Button>
      </div>
    {/if}
  {/if}
{:else if !expanded && totalCount > PAGE_SIZE}
  <div class="mt-6 flex justify-center">
    <Button type="button" onclick={() => void showMore()}>Show more</Button>
  </div>
{/if}
