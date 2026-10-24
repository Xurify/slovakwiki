<script lang="ts">
  import { moreLinkClass } from "$lib/components/ui/system-ui";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import {
    grammarEndingClass,
    grammarFormClass,
    grammarGlossClass,
  } from "$lib/components/reference/grammar-topic-ui";
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

  const parts = $derived(
    example.slovak
      .split(/(\p{L}+)/u)
      .filter((part) => part !== "")
      .map((text) => ({
        text,
        highlighted: forms.has(text.toLocaleLowerCase("sk")),
      })),
  );
</script>

<li class="flex items-start gap-2.5 border-t border-slate-200/70 py-3">
  {#if reserveAudioColumn}
    <span class="mt-0.5 inline-grid size-11 shrink-0 place-items-center">
      {#if audioKey}
        <span data-audio-mount={audioKey}></span>
      {/if}
    </span>
  {/if}

  <div class="min-w-0 flex-1">
    <p class={cx(grammarFormClass, "m-0 text-lg")} lang="sk">
      {#each parts as part, index (index)}
        {#if part.highlighted}
          <span class={grammarEndingClass}>{part.text}</span>
        {:else}
          {part.text}
        {/if}
      {/each}
    </p>

    <p class={cx(grammarGlossClass, "m-0 mt-0.5")}>{example.english}</p>

    {#if example.demonstrates}
      <p class="m-0 mt-1.5 text-sm leading-relaxed text-slate-500">
        <GrammarRichText text={example.demonstrates} />
      </p>
    {/if}

    {#if practiceHref}
      <a class={cx(moreLinkClass, "mt-1.5")} href={practiceHref}>
        Practice
        <ArrowRight />
      </a>
    {/if}
  </div>
</li>
