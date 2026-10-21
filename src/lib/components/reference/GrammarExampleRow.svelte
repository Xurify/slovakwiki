<script lang="ts">
  import { moreLinkClass } from "$lib/components/ui/system-ui";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import {
    grammarFormClass,
    grammarGlossClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import type { Example } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  /**
   * Same shape as a contrast card row: listen, the Slovak with its English
   * under it, then a practice link if one exists. No wide empty columns.
   */
  let {
    example,
    audioKey,
    practiceHref,
    showAudio,
  }: {
    example: Example;
    audioKey?: string;
    practiceHref?: string;
    /** Keep the audio column when any row in the list has a clip, so text lines up. */
    showAudio: boolean;
  } = $props();
</script>

<li
  class="flex items-start gap-2.5 border-b border-slate-200/70 px-4 py-3 last:border-b-0 sm:px-5"
>
  {#if showAudio}
    <span class="mt-0.5 inline-grid size-7 shrink-0 place-items-center">
      {#if audioKey}
        <span data-audio-mount={audioKey}></span>
      {/if}
    </span>
  {/if}

  <div class="min-w-0 flex-1">
    <p class={cx(grammarFormClass, "m-0 text-lg")} lang="sk">{example.slovak}</p>

    <p class={cx(grammarGlossClass, "m-0 mt-0.5")}>{example.english}</p>

    {#if example.demonstrates}
      <p class="m-0 mt-1.5 max-w-[62ch] text-sm leading-relaxed text-slate-500">
        <GrammarRichText text={example.demonstrates} />
      </p>
    {/if}
  </div>

  {#if practiceHref}
    <a class={cx(moreLinkClass, "mt-1 shrink-0 whitespace-nowrap")} href={practiceHref}>
      Practice
      <ArrowRight />
    </a>
  {/if}
</li>
