<script lang="ts">
  import GrammarExampleRow from "$lib/components/reference/GrammarExampleRow.svelte";
  import { practiceItemHref } from "$lib/catalog/practice";
  import type { Example } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    examples,
    audioKeys = [],
    audioKeyPrefix = "ex",
  }: {
    examples: Example[];
    /** `{audioKeyPrefix}-{index}` keys that have a recorded clip; buttons mount there after hydration. */
    audioKeys?: string[];
    /** Unique per list when one page shows several example lists. */
    audioKeyPrefix?: string;
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
  const showPractice = $derived(rows.some((row) => row.practiceHref));
</script>

<ol
  class={cx(
    "m-0 grid list-none border-t border-slate-200 p-0",
    showAudio && showPractice
      ? "min-[561px]:grid-cols-[minmax(0,max-content)_minmax(0,1fr)_auto_auto]"
      : showAudio || showPractice
        ? "min-[561px]:grid-cols-[minmax(0,max-content)_minmax(0,1fr)_auto]"
        : "min-[561px]:grid-cols-[minmax(0,max-content)_minmax(0,1fr)]",
  )}
>
  {#each rows as { audioKey, example, practiceHref } (example.slovak)}
    <GrammarExampleRow {example} {audioKey} {practiceHref} {showAudio} {showPractice} />
  {/each}
</ol>
