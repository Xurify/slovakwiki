<script lang="ts">
  import { mount, onDestroy, unmount } from "svelte";

  import DictionaryCommonRow from "$lib/components/dictionary/DictionaryCommonRow.svelte";
  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import {
    dictionaryCommonState,
    filterDictionaryCommonEntries,
    PAGE_SIZE,
    showMoreDictionaryCommonEntries,
  } from "$lib/components/dictionary/common-client.svelte";
  import { dataEmptyClass, dataMoreRowClass } from "$lib/components/ui/data-list-ui";

  let { totalCount }: { totalCount: number } = $props();

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

  // The first hundred rows are server-rendered; hide them while a filter is active.
  $effect(() => {
    const ssrList = document.getElementById("common-results");
    if (!ssrList) {
      return;
    }

    ssrList.hidden = isFiltering;
  });

  // "Show more" appends rows after the server-rendered ones instead of re-rendering.
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
  <p class="m-0 px-4 py-3 text-sm text-rose-700 sm:px-5" role="alert">
    {dictionaryCommonState.loadError}
  </p>
{/if}

{#if dictionaryCommonState.loading}
  <div class="flex min-h-16 items-center px-4 py-6 sm:px-5">
    <DotLoader label="Loading the full list…" />
  </div>
{/if}

{#if isFiltering && expanded && !dictionaryCommonState.loading}
  {#if filteredEntries.length === 0}
    <div class={dataEmptyClass}>
      <p class="m-0 font-serif text-lg text-slate-900">No matches</p>
      <p class="m-0 mt-1 text-sm text-slate-500">Try a shorter filter, or clear it.</p>
    </div>
  {:else}
    <ol class="m-0 list-none p-0" id="common-results-expanded">
      {#each visibleEntries as entry (entry.rank + entry.lemma)}
        <DictionaryCommonRow
          {entry}
          live={dictionaryCommonState.liveByLemma[entry.lemma]}
        />
      {/each}
    </ol>
  {/if}
{/if}

{#if hasMore || (!expanded && totalCount > PAGE_SIZE)}
  <button
    class={dataMoreRowClass}
    type="button"
    onclick={() => void showMoreDictionaryCommonEntries()}
  >
    Show {PAGE_SIZE} more
    <svg
      class="size-3.5 fill-none stroke-current stroke-2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
{/if}
