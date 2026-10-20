<script lang="ts">
  import { moreLinkClass } from "$lib/components/ui/system-ui";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";

  import {
    grammarFormClass,
    grammarGlossClass,
  } from "$lib/components/reference/grammar-topic-ui";
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
</script>

<ol class="m-0 list-none border-t border-slate-200 p-0">
  {#each rows as { audioKey, example, practiceHref } (example.slovak)}
    <li class="border-b border-slate-200 py-3">
      <div
        class="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_auto] items-baseline gap-x-6 max-[560px]:grid-cols-1 max-[560px]:gap-y-1"
      >
        <p class={cx(grammarFormClass, "m-0 text-lg")} lang="sk">{example.slovak}</p>

        <p class={cx(grammarGlossClass, "m-0")}>{example.english}</p>

        {#if practiceHref || audioKey}
          <div class="flex items-center gap-3 max-[560px]:mt-1">
            {#if audioKey}
              <span data-audio-mount={audioKey}></span>
            {/if}

            {#if practiceHref}
              <a class={moreLinkClass} href={practiceHref}>
                Practice
                <ArrowRight />
              </a>
            {/if}
          </div>
        {/if}
      </div>

      {#if example.demonstrates}
        <p class="m-0 mt-1.5 max-w-[62ch] text-sm leading-relaxed text-slate-500">
          <GrammarRichText text={example.demonstrates} />
        </p>
      {/if}
    </li>
  {/each}
</ol>
