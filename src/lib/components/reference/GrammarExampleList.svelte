<script lang="ts">
  import GrammarExampleRow from "$lib/components/reference/GrammarExampleRow.svelte";
  import { practiceItemHref } from "$lib/catalog/practice";
  import type { Example } from "$lib/catalog/types";

  let {
    examples,
    audioKeys = [],
    audioKeyPrefix = "ex",
    highlight = [],
    label,
  }: {
    examples: Example[];
    audioKeys?: string[];
    audioKeyPrefix?: string;
    highlight?: readonly string[];
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

  const reserveAudioColumn = $derived(rows.some((row) => row.audioKey));
  const forms = $derived(new Set(highlight.map((form) => form.toLocaleLowerCase("sk"))));
</script>

<div>
  {#if label}
    <p class="m-0 mb-1 text-sm font-semibold text-slate-700">{label}</p>
  {/if}

  <ul class="m-0 grid list-none gap-x-8 p-0 md:grid-cols-2">
    {#each rows as { audioKey, example, practiceHref } (example.slovak)}
      <GrammarExampleRow
        {example}
        {audioKey}
        {practiceHref}
        {reserveAudioColumn}
        {forms}
      />
    {/each}
  </ul>
</div>
