<script lang="ts">
  import GrammarExampleRow from "$lib/components/reference/GrammarExampleRow.svelte";
  import { practiceItemHref } from "$lib/catalog/practice";
  import type { Example } from "$lib/catalog/types";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { cx } from "$lib/ui/classes";

  let {
    examples,
    audioKeys = [],
    audioKeyPrefix = "ex",
    framed = true,
    highlight = [],
    label,
  }: {
    examples: Example[];
    audioKeys?: string[];
    audioKeyPrefix?: string;
    /** Off when the rows sit inside another panel, such as the table they illustrate. */
    framed?: boolean;
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

<div class={cx(framed && dataPanelClass)}>
  {#if label}
    <p
      class={cx(
        eyebrowMutedClass,
        "border-b border-slate-200 bg-subtle/60 px-4 py-2 sm:px-5",
        !framed && "border-t",
      )}
    >
      {label}
    </p>
  {/if}

  <!-- One example per row, so the eye runs down a column instead of zig-zagging between two. -->
  <ul class="m-0 list-none p-0">
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
