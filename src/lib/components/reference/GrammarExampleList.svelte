<script lang="ts">
  import GrammarExampleRow from "$lib/components/reference/GrammarExampleRow.svelte";
  import { practiceItemHref } from "$lib/catalog/practice";
  import type { Example } from "$lib/catalog/types";

  /**
   * Example sentences as a light list, apart from any table: no box of their
   * own, two columns on wide screens. Forms the table shows light up in blue,
   * which ties the two together without merging them.
   */
  let {
    examples,
    audioKeys = [],
    audioKeyPrefix = "ex",
    highlight = [],
    label,
  }: {
    examples: Example[];
    /** `{audioKeyPrefix}-{index}` keys that have a recorded clip; buttons mount there after hydration. */
    audioKeys?: string[];
    /** Unique per list when one page shows several example lists. */
    audioKeyPrefix?: string;
    /** Lowercase Slovak words to mark in each sentence (the table's forms). */
    highlight?: readonly string[];
    /** Small heading above the list when no section heading names it. */
    label?: string;
  } = $props();

  const rows = $derived(
    examples.map((example, index) => ({
      audioKey: audioKeys.includes(`${audioKeyPrefix}-${index}`)
        ? `${audioKeyPrefix}-${index}`
        : undefined,
      example,
      practiceHref: example.practiceItemId
        ? practiceItemHref(example.practiceItemId)
        : undefined,
    })),
  );

  const showAudio = $derived(rows.some((row) => row.audioKey));
  const marked = $derived(new Set(highlight));
</script>

<div>
  {#if label}
    <p class="m-0 mb-1 text-sm font-semibold text-slate-700">{label}</p>
  {/if}

  <ul class="m-0 grid list-none gap-x-8 p-0 md:grid-cols-2">
    {#each rows as { audioKey, example, practiceHref } (example.slovak)}
      <GrammarExampleRow {example} {audioKey} {practiceHref} {showAudio} {marked} />
    {/each}
  </ul>
</div>
