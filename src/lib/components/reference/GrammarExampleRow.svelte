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

  let {
    example,
    audioKey,
    practiceHref,
    showAudio,
    showPractice,
  }: {
    example: Example;
    audioKey?: string;
    practiceHref?: string;
    showAudio: boolean;
    showPractice: boolean;
  } = $props();
</script>

<li
  class="grid grid-cols-1 items-center gap-y-1.5 border-b border-slate-200 py-3 min-[561px]:col-span-full min-[561px]:grid-cols-subgrid min-[561px]:gap-x-6"
>
  <p class={cx(grammarFormClass, "m-0 min-w-0 text-lg")} lang="sk">{example.slovak}</p>

  <p class={cx(grammarGlossClass, "m-0 min-w-0")}>{example.english}</p>

  {#if showAudio || showPractice}
    <div
      class={cx(
        "flex items-center gap-3 min-[561px]:contents",
        audioKey || practiceHref ? "max-[560px]:mt-1" : "max-[560px]:hidden",
      )}
    >
      {#if showPractice}
        {#if practiceHref}
          <a
            class={cx(
              moreLinkClass,
              "order-2 shrink-0 whitespace-nowrap min-[561px]:order-none min-[561px]:justify-self-end",
            )}
            href={practiceHref}
          >
            Practice
            <ArrowRight />
          </a>
        {:else}
          <span class="order-2 max-[560px]:hidden min-[561px]:order-none"></span>
        {/if}
      {/if}

      {#if showAudio}
        <span
          class={cx(
            "order-1 inline-grid size-7 shrink-0 place-items-center min-[561px]:order-none",
            !audioKey && "max-[560px]:hidden",
          )}
        >
          {#if audioKey}
            <span data-audio-mount={audioKey}></span>
          {/if}
        </span>
      {/if}
    </div>
  {/if}

  {#if example.demonstrates}
    <p class="col-span-full m-0 max-w-[62ch] text-sm leading-relaxed text-slate-500">
      <GrammarRichText text={example.demonstrates} />
    </p>
  {/if}
</li>
