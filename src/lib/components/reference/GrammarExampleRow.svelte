<script lang="ts">
  import { moreLinkClass } from "$lib/components/ui/system-ui";
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
  <GrammarSentence {audioKey} reserveAudio={reserveAudioColumn} english={example.english}>
    {#each parts as part, index (index)}
      {#if part.highlighted}
        <span class={grammarEndingClass}>{part.text}</span>
      {:else}
        {part.text}
      {/if}
    {/each}
  </GrammarSentence>

  {#if example.demonstrates}
    <!-- The rule sits on the sentence's own left edge, so the note reads as a
         remark about the line above rather than a third translation of it. -->
    <p
      class={cx(
        "m-0 mt-2 max-w-[65ch] border-l-2 border-slate-200 pl-3 text-[0.8125rem] leading-relaxed text-pretty text-slate-500",
        reserveAudioColumn && "ml-10",
      )}
    >
      <GrammarRichText text={example.demonstrates} />
    </p>
  {/if}

  {#if practiceHref}
    <a
      class={cx(moreLinkClass, "mt-1.5", reserveAudioColumn && "ml-10")}
      href={practiceHref}
    >
      Practice
      <ArrowRight />
    </a>
  {/if}
</li>
