<script lang="ts">
  import type { FrequencyPartOfSpeech } from "$lib/catalog/frequency/types";
  import {
    clearDictionaryCommonFilter,
    dictionaryCommonState,
    filterDictionaryCommonEntries,
    initDictionaryCommon,
    onDictionaryCommonSearchInput,
  } from "$lib/components/dictionary/common-client.svelte";
  import { dataRangeClass } from "$lib/components/ui/data-list-ui";

  /**
   * The panel header of the most-common list: range label on the left, filter
   * on the right. Both roots sit in the header's flex row (islands render with
   * `display: contents`).
   */
  let {
    partOfSpeech,
    label,
    initialCount,
    totalCount,
  }: {
    partOfSpeech: FrequencyPartOfSpeech;
    /** Lower-case word class, e.g. "nouns". */
    label: string;
    /** Rows rendered on the server. */
    initialCount: number;
    totalCount: number;
  } = $props();

  $effect(() => {
    initDictionaryCommon(partOfSpeech);
  });

  const query = $derived(dictionaryCommonState.query);
  const isFiltering = $derived(query.trim().length > 0);

  const filteredCount = $derived(
    isFiltering && dictionaryCommonState.entries
      ? filterDictionaryCommonEntries(
          dictionaryCommonState.entries,
          query,
          dictionaryCommonState.liveByLemma,
        ).length
      : null,
  );

  const total = $derived(filteredCount ?? totalCount);

  const shown = $derived(
    filteredCount !== null
      ? Math.min(filteredCount, dictionaryCommonState.visibleLimit)
      : dictionaryCommonState.entries
        ? Math.min(
            dictionaryCommonState.entries.length,
            dictionaryCommonState.visibleLimit,
          )
        : initialCount,
  );

  const range = $derived(
    shown === 0
      ? "0 results"
      : `1–${shown.toLocaleString("en")} of ${total.toLocaleString("en")}`,
  );
</script>

<p class={dataRangeClass}>
  <strong class="font-semibold tabular-nums text-slate-900">{range}</strong>
  <span class="text-slate-400">
    {#if isFiltering}
      matching “{query.trim()}”
    {:else}
      {label}
    {/if}
  </span>
</p>

<div
  class="flex h-9 min-w-0 items-center gap-2 rounded-(--control-radius) border border-slate-300 bg-surface px-2.5 shadow-(--shadow-border) transition-[box-shadow,border-color] focus-within:border-blue-600 focus-within:shadow-[0_0_0_3px_var(--accent-soft)] max-sm:w-full sm:w-64"
>
  <svg
    class="w-3.5 shrink-0 fill-none stroke-slate-400 stroke-[1.8]"
    aria-hidden="true"
    viewBox="0 0 24 24"
  >
    <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
  </svg>

  <label class="sr-only" for="common-filter">Filter {label}</label>
  <input
    class="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden"
    id="common-filter"
    value={query}
    oninput={(event) =>
      void onDictionaryCommonSearchInput((event.currentTarget as HTMLInputElement).value)}
    placeholder="Filter by word or meaning"
    type="search"
  />

  {#if query}
    <button
      class="cursor-pointer border-0 bg-transparent p-0 text-xs font-bold text-blue-800 hover:underline"
      type="button"
      aria-label="Clear filter"
      onclick={() => clearDictionaryCommonFilter()}
    >
      Clear
    </button>
  {/if}
</div>
