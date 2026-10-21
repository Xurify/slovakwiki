<script lang="ts">
  import GrammarExampleRow from "$lib/components/reference/GrammarExampleRow.svelte";
  import { practiceItemHref } from "$lib/catalog/practice";
  import type { Example } from "$lib/catalog/types";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";

  let {
    examples,
    audioKeys = [],
    audioKeyPrefix = "ex",
    framed = true,
  }: {
    examples: Example[];
    /** `{audioKeyPrefix}-{index}` keys that have a recorded clip; buttons mount there after hydration. */
    audioKeys?: string[];
    /** Unique per list when one page shows several example lists. */
    audioKeyPrefix?: string;
    /** False when the list sits inside another panel, under its table. */
    framed?: boolean;
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
</script>

<ol class="m-0 list-none p-0 {framed ? dataPanelClass : ''}">
  {#each rows as { audioKey, example, practiceHref } (example.slovak)}
    <GrammarExampleRow {example} {audioKey} {practiceHref} {showAudio} />
  {/each}
</ol>
