<script lang="ts">
  import GrammarPathStep from "$lib/components/reference/GrammarPathStep.svelte";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import SectionHead from "$lib/components/ui/SectionHead.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarCaseMap from "$lib/components/reference/GrammarCaseMap.svelte";
  import { grammarHeadingClass } from "$lib/components/reference/grammar-topic-ui";
  import { grammarEntries } from "$lib/catalog/reference/grammar";
  import { grammarExamples } from "$lib/catalog/reference/grammar-pattern";
  import type { GrammarTopic } from "$lib/catalog/types";

  let {
    anchor,
    title,
    purpose,
    topics,
  }: {
    anchor: string;
    title: string;
    purpose: string;
    topics: GrammarTopic[];
  } = $props();

  const caseLinks =
    grammarEntries.find((topic) => topic.slug === "cases-overview")?.caseOverview ?? [];

  const exampleCount = $derived(
    topics.reduce((total, topic) => total + grammarExamples(topic).length, 0),
  );
</script>

<section id={anchor} class="scroll-mt-24" aria-labelledby="{anchor}-heading">
  <SectionHead {title} id="{anchor}-heading" description={purpose}>
    {#snippet aside()}
      {#if title === "Numbers"}
        <TextLink
          class="inline-flex shrink-0 items-center gap-1 text-sm"
          href="/grammar/telling-time#clock-drill"
        >
          Practice the clock <ArrowRight />
        </TextLink>
      {/if}
    {/snippet}
  </SectionHead>

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
      <GrammarPathStep {topic} step={index + 1} />
    {/each}
  </ol>

  {#if title === "Nouns" && caseLinks.length > 0}
    <div class="mt-8">
      <h3 class={grammarHeadingClass}>Looking for a case?</h3>

      <p class="m-0 mt-1.5 text-sm text-slate-600">
        Each case has its own page with the endings, examples and exercises.
      </p>

      <div class="mt-3">
        <GrammarCaseMap cases={caseLinks} compact />
      </div>
    </div>
  {/if}
</section>
