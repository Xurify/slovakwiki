<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import GrammarSentence from "$lib/components/reference/GrammarSentence.svelte";
  import { exampleParts } from "$lib/components/reference/grammar-example";
  import { grammarEndingClass } from "$lib/components/reference/grammar-topic-ui";
  import type { Example } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    example,
    audioKey,
    forms,
    practiceHref,
    reserveAudioColumn,
  }: {
    example: Example;
    audioKey?: string;
    forms: ReadonlySet<string>;
    practiceHref?: string;
    reserveAudioColumn: boolean;
  } = $props();

  const parts = $derived(exampleParts(example.slovak, forms, example.demonstrates));
</script>

<!-- One example per row, read down a single column: the Slovak, what it means,
     then the bit worth noticing. A second column would turn the list into a
     table, and the notes would line up with nothing. -->
<li>
  <div class="flex items-start justify-between gap-x-4">
    <GrammarSentence {audioKey} reserveAudio={reserveAudioColumn} english={example.english}>
      {#each parts as part, index (index)}
        {#if part.highlighted}
          <span class={grammarEndingClass}>{part.text}</span>
        {:else}
          {part.text}
        {/if}
      {/each}
    </GrammarSentence>

    {#if practiceHref}
      <a
        class="group inline-flex shrink-0 items-center gap-1 pt-1.5 text-sm font-semibold text-blue-800 no-underline hover:underline"
        href={practiceHref}
      >
        Practice
        <ArrowRight />
      </a>
    {/if}
  </div>

  {#if example.demonstrates}
    <p
      class={cx(
        "m-0 mt-1.5 max-w-[60ch] text-sm leading-relaxed text-pretty text-slate-600",
        reserveAudioColumn && "ml-10",
      )}
    >
      <GrammarRichText text={example.demonstrates} />
    </p>
  {/if}
</li>
