<script lang="ts">
  import GrammarPathStep from "$lib/components/reference/GrammarPathStep.svelte";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import type { GrammarTopic } from "$lib/catalog/types";

  let {
    anchor,
    title,
    purpose,
    topics,
    startSlug,
  }: {
    anchor: string;
    title: string;
    purpose: string;
    topics: GrammarTopic[];
    startSlug: string;
  } = $props();

  const exampleCount = $derived(
    topics.reduce((total, topic) => total + topic.examples.length, 0),
  );
</script>

<section id={anchor} class="scroll-mt-24" aria-labelledby="{anchor}-heading">
  <div class="flex items-baseline justify-between gap-4">
    <div class="min-w-0">
      <p class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
        Area
      </p>

      <h2
        id="{anchor}-heading"
        class="m-0 mt-1 font-serif text-xl tracking-tight text-balance text-slate-900 sm:text-2xl"
      >
        {title}
      </h2>
    </div>

    {#if title === "Numbers"}
      <TextLink
        class="inline-flex shrink-0 items-center gap-1 text-sm"
        href="/grammar/telling-time#clock-drill"
      >
        Practice the clock <ArrowRight />
      </TextLink>
    {/if}
  </div>

  <p class="m-0 mt-2 max-w-xl text-sm leading-relaxed text-pretty text-slate-600">
    {purpose}
  </p>

  <p class="m-0 mt-2 text-xs text-slate-500 tabular-nums">
    {topics.length}
    {topics.length === 1 ? "topic" : "topics"}
    <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
    {exampleCount}
    {exampleCount === 1 ? "example" : "examples"}
  </p>

  <span class="mt-4 mb-5 block h-px bg-slate-200" aria-hidden="true"></span>

  <ol class="m-0 flex list-none flex-col gap-3 p-0">
    {#each topics as topic, index (topic.slug)}
      <GrammarPathStep {topic} step={index + 1} start={topic.slug === startSlug} />
    {/each}
  </ol>
</section>
