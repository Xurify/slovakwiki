<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { practiceItemHref } from "$lib/catalog/practice";
  import {
    grammarGroupAnchor,
    grammarGroupPurpose,
    type GrammarGroup,
  } from "$lib/catalog/reference/grammar-path";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { GrammarTopic } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    group,
    topics,
    startSlug,
  }: {
    group: GrammarGroup;
    topics: GrammarTopic[];
    /** Topic highlighted as the place to begin. */
    startSlug: string;
  } = $props();

  function drillCount(topic: GrammarTopic): number {
    return topic.examples.filter(
      (example) => example.practiceItemId && practiceItemHref(example.practiceItemId),
    ).length;
  }

  const railClass = "absolute left-[1.125rem] w-0.5 -translate-x-1/2 bg-slate-200";

  function nodeClass(isStart: boolean): string {
    return cx(
      "relative z-10 flex size-9 items-center justify-center self-center rounded-full border-2 font-serif text-sm font-semibold tabular-nums",
      isStart
        ? "border-blue-600 bg-blue-600 text-paper"
        : "border-slate-300 bg-surface text-slate-500",
    );
  }

  function cardClass(isStart: boolean): string {
    return cx(
      "group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-(--frame-radius) border-2 px-4 py-3.5 no-underline shadow-(--shadow-border)",
      "transition-[background-color,box-shadow,border-color] duration-150 hover:bg-surface hover:shadow-(--shadow-border-hover)",
      isStart ? "border-blue-600 bg-surface" : "border-transparent bg-surface/80",
    );
  }
</script>

<section
  id={grammarGroupAnchor(group)}
  class="scroll-mt-24"
  aria-labelledby="{grammarGroupAnchor(group)}-heading"
>
  <div class="flex items-baseline justify-between gap-4">
    <div class="min-w-0">
      <p class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
        Area
      </p>

      <h2
        id="{grammarGroupAnchor(group)}-heading"
        class="m-0 mt-1 font-serif text-xl tracking-tight text-balance text-slate-900 sm:text-2xl"
      >
        {group}
      </h2>
    </div>

    <span class="shrink-0 text-xs tabular-nums text-slate-500">
      {topics.length}
      {topics.length === 1 ? "topic" : "topics"}
    </span>
  </div>

  <p class="m-0 mt-2 max-w-xl text-sm leading-relaxed text-pretty text-slate-600">
    {grammarGroupPurpose[group]}
    {#if group === "Numbers"}
      <TextLink
        class="ml-1 inline-flex items-center gap-1"
        href="/grammar/telling-time#clock-drill"
      >
        Practice the clock <ArrowRight />
      </TextLink>
    {/if}
  </p>

  <ol class="m-0 mt-5 flex list-none flex-col gap-3 p-0">
    {#each topics as topic, index (topic.slug)}
      {@const isStart = topic.slug === startSlug}
      {@const example = topic.examples[0]}
      {@const drills = drillCount(topic)}

      <li class="group/step relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3.5">
        <span class="{railClass} top-0 h-1/2 group-first/step:hidden" aria-hidden="true"
        ></span>
        <span
          class="{railClass} top-1/2 -bottom-3 group-last/step:hidden"
          aria-hidden="true"
        ></span>

        <span class={nodeClass(isStart)} aria-hidden="true">{index + 1}</span>

        <a class={cardClass(isStart)} href="/grammar/{topic.slug}">
          <span class="min-w-0">
            <span class="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <strong
                class="font-serif text-base leading-snug tracking-tight text-balance text-blue-800 underline-offset-2 group-hover:underline sm:text-lg"
              >
                {sentenceCase(topic.english)}
              </strong>

              <span class="font-serif text-sm text-slate-500" lang="sk"
                >{topic.slovak}</span
              >
            </span>

            <span
              class="mt-0.5 line-clamp-2 block text-sm leading-snug text-pretty text-slate-600"
            >
              {topic.summary}
            </span>

            {#if example}
              <span
                class="mt-2.5 flex max-w-full items-baseline gap-2 rounded-(--control-radius) bg-slate-50 px-2.5 py-1.5 text-[0.82rem] leading-snug"
              >
                <span class="shrink-0 font-serif font-semibold text-slate-800" lang="sk">
                  {example.slovak}
                </span>
                <span class="min-w-0 truncate text-slate-500">{example.english}</span>
              </span>
            {/if}

            <span class="mt-2 block text-xs tabular-nums text-slate-500">
              {topic.examples.length}
              {topic.examples.length === 1 ? "example" : "examples"}
              {#if drills > 0}
                <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                {drills}
                {drills === 1 ? "drill" : "drills"}
              {/if}
              {#if topic.lessonLink}
                <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                Lesson
              {/if}
            </span>
          </span>

          {#if isStart}
            <span
              class="inline-flex min-h-8 items-center rounded-(--control-radius) bg-blue-600 px-3.5 text-xs font-bold text-paper max-[480px]:hidden"
            >
              Start
            </span>
          {:else}
            <ArrowRight
              class="shrink-0 text-blue-800 opacity-55 transition-opacity group-hover:opacity-100"
            />
          {/if}
        </a>
      </li>
    {/each}
  </ol>
</section>
