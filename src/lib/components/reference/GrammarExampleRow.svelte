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

<!-- The note starts at the panel's midpoint, the same keyline as a three-column
     table's middle column, with its first line level with the Slovak's. -->
<li
  class={cx(
    "grid gap-x-6 gap-y-1 border-t border-slate-200/70 px-4 py-2.5 first:border-t-0 sm:px-5",
    "md:grid-cols-2",
  )}
>
  <GrammarSentence {audioKey} reserveAudio={reserveAudioColumn} english={example.english}>
    {#each parts as part, index (index)}
      {#if part.highlighted}
        <span class={grammarEndingClass}>{part.text}</span>
      {:else}
        {part.text}
      {/if}
    {/each}
  </GrammarSentence>

  {#if example.demonstrates || practiceHref}
    <div class={cx("flex min-w-0 flex-col", reserveAudioColumn && "pl-10 md:pl-0")}>
      {#if example.demonstrates}
        <p class="m-0 text-sm leading-snug text-pretty text-slate-500 md:pt-1.5">
          <GrammarRichText text={example.demonstrates} />
        </p>
      {/if}

      {#if practiceHref}
        <a class={cx(moreLinkClass, "mt-auto self-start pt-1")} href={practiceHref}>
          Practice
          <ArrowRight />
        </a>
      {/if}
    </div>
  {/if}
</li>
