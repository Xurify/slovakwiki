<script lang="ts">
  import type { FrequencyPartOfSpeech } from "$lib/content/frequency-types";
  import {
    clearDictionaryCommonFilter,
    dictionaryCommonState,
    initDictionaryCommon,
    onDictionaryCommonSearchInput,
  } from "$lib/dictionary/dictionary-common-client.svelte";

  let { partOfSpeech }: { partOfSpeech: FrequencyPartOfSpeech } = $props();

  $effect(() => {
    initDictionaryCommon(partOfSpeech);
  });
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
      value={dictionaryCommonState.query}
      oninput={(event) =>
        void onDictionaryCommonSearchInput(
          (event.currentTarget as HTMLInputElement).value,
        )}
      placeholder="Filter lemmas"
      type="search"
    />
    {#if dictionaryCommonState.query}
      <button
        class="mr-3 cursor-pointer border-0 bg-transparent text-xs font-semibold text-blue-800"
        type="button"
        aria-label="Clear filter"
        onclick={() => clearDictionaryCommonFilter()}
      >
        Clear
      </button>
    {/if}
  </div>
</div>
