<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import {
    dictionaryCommonState,
    filterDictionaryCommonEntries,
    PAGE_SIZE,
    showMoreDictionaryCommonEntries,
  } from "$lib/dictionary/dictionary-common-client.svelte";

  let { totalCount }: { totalCount: number } = $props();

  const expanded = $derived(dictionaryCommonState.entries !== null);

  const filteredEntries = $derived(
    dictionaryCommonState.entries
      ? filterDictionaryCommonEntries(
          dictionaryCommonState.entries,
          dictionaryCommonState.query,
          dictionaryCommonState.liveByLemma,
        )
      : [],
  );

  const visibleEntries = $derived(
    filteredEntries.slice(0, dictionaryCommonState.visibleLimit),
  );

  const hasMore = $derived(filteredEntries.length > dictionaryCommonState.visibleLimit);

  const rowClass =
    "grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-slate-200 py-3 text-sm max-[560px]:grid-cols-[2.5rem_minmax(0,1fr)]";

  $effect(() => {
    const ssrList = document.getElementById("common-results");
    if (!ssrList) {
      return;
    }

    ssrList.hidden = expanded;
  });
</script>

{#if dictionaryCommonState.loadError}
  <p class="mt-4 text-sm text-rose-700" role="alert">{dictionaryCommonState.loadError}</p>
{/if}

{#if dictionaryCommonState.loading}
  <div class="mt-6 flex min-h-16 items-center">
    <DotLoader label="Loading frequency list…" />
  </div>
{/if}

{#if expanded && !dictionaryCommonState.loading}
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
        {@const live = dictionaryCommonState.liveByLemma[entry.lemma]}
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
  {/if}
{/if}

{#if hasMore || (!expanded && totalCount > PAGE_SIZE)}
  <div class="mt-6 flex justify-center">
    <Button type="button" onclick={() => void showMoreDictionaryCommonEntries()}
      >Show more</Button
    >
  </div>
{/if}
