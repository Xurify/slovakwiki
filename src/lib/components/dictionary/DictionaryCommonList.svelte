<script lang="ts">
  import { mount, onDestroy, unmount } from "svelte";

  import Button from "$lib/components/ui/Button.svelte";
  import DictionaryCommonRow from "$lib/components/dictionary/DictionaryCommonRow.svelte";
  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import {
    dictionaryCommonState,
    filterDictionaryCommonEntries,
    PAGE_SIZE,
    showMoreDictionaryCommonEntries,
  } from "$lib/components/dictionary/common-client.svelte";

  let { totalCount }: { totalCount: number } = $props();

  const rowClass =
    "grid grid-cols-[2.25rem_minmax(0,1fr)_4.75rem] items-center gap-3 border-b border-slate-200 px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-blue-50/50 max-[560px]:grid-cols-[2rem_minmax(0,1fr)]";

  const filterMetaClass =
    "m-0 border-b border-slate-200 bg-slate-50/70 px-4 py-2 text-xs text-slate-500";

  const isFiltering = $derived(dictionaryCommonState.query.trim().length > 0);
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

  const appendedEntries = $derived(isFiltering ? [] : visibleEntries.slice(PAGE_SIZE));

  const hasMore = $derived(filteredEntries.length > dictionaryCommonState.visibleLimit);

  const appendInstances: Array<ReturnType<typeof mount>> = [];

  function clearAppendedRows(): void {
    for (const instance of appendInstances) {
      unmount(instance);
    }
    appendInstances.length = 0;
  }

  $effect(() => {
    const ssrList = document.getElementById("common-results");
    if (!ssrList) {
      return;
    }

    ssrList.hidden = isFiltering && expanded;
  });

  $effect(() => {
    if (isFiltering || appendedEntries.length === 0) {
      clearAppendedRows();
      return;
    }

    const list = document.getElementById("common-results");
    const anchor = document.getElementById("common-results-append-anchor");
    if (!list || !anchor) {
      return;
    }

    clearAppendedRows();

    for (const entry of appendedEntries) {
      appendInstances.push(
        mount(DictionaryCommonRow, {
          target: list,
          anchor,
          props: {
            entry,
            live: dictionaryCommonState.liveByLemma[entry.lemma],
            rowClass,
          },
        }),
      );
    }

    return () => {
      clearAppendedRows();
    };
  });

  onDestroy(() => {
    clearAppendedRows();
  });
</script>

{#if dictionaryCommonState.loadError}
  <p class="m-0 px-4 py-3 text-sm text-rose-700" role="alert">
    {dictionaryCommonState.loadError}
  </p>
{/if}

{#if dictionaryCommonState.loading}
  <div class="flex min-h-16 items-center px-4 py-6">
    <DotLoader label="Loading frequency list…" />
  </div>
{/if}

{#if isFiltering && expanded && !dictionaryCommonState.loading}
  <p class={filterMetaClass}>
    <strong class="tabular-nums text-slate-900">
      {visibleEntries.length === 0
        ? "0 results"
        : `1–${visibleEntries.length.toLocaleString("en")} of ${filteredEntries.length.toLocaleString("en")}`}
    </strong>
    {#if filteredEntries.length !== totalCount}
      <span class="text-slate-400">· {totalCount.toLocaleString("en")} total</span>
    {/if}
  </p>

  {#if filteredEntries.length === 0}
    <div class="px-4 py-16 text-center">
      <h2 class="text-xl">No matches</h2>
      <p class="mt-2 text-sm text-slate-500">Try a shorter filter or clear it.</p>
    </div>
  {:else}
    <ol class="m-0 list-none p-0" start="1" id="common-results-expanded">
      {#each visibleEntries as entry (entry.rank + entry.lemma)}
        <DictionaryCommonRow
          {entry}
          live={dictionaryCommonState.liveByLemma[entry.lemma]}
          {rowClass}
        />
      {/each}
    </ol>
  {/if}
{/if}

{#if hasMore || (!expanded && totalCount > PAGE_SIZE)}
  <div class="flex justify-center border-t border-slate-200 px-4 py-5">
    <Button type="button" onclick={() => void showMoreDictionaryCommonEntries()}
      >Show more</Button
    >
  </div>
{/if}
