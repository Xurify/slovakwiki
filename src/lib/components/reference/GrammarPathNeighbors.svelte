<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { panelClass, panelHoverClass } from "$lib/components/ui/system-ui";

  import { grammarHeadingClass } from "$lib/components/reference/grammar-topic-ui";
  import {
    grammarGroupAnchor,
    grammarNeighbors,
    grammarStep,
  } from "$lib/catalog/reference/grammar-path";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { GrammarTopic } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  /**
   * The stretch of the grammar index path around this page: the topic before,
   * this one, and the next one as the way on. Numbers and the rail match the
   * index, so the page reads as one stop on the same path.
   */
  let { topic }: { topic: GrammarTopic } = $props();

  const neighbors = $derived(grammarNeighbors(topic.slug));
  const here = $derived(grammarStep(topic));
  const previous = $derived(
    neighbors.previous && {
      topic: neighbors.previous,
      ...grammarStep(neighbors.previous),
    },
  );
  const next = $derived(
    neighbors.next && { topic: neighbors.next, ...grammarStep(neighbors.next) },
  );
</script>

<nav id="path" class="mt-10 scroll-mt-24" aria-labelledby="path-heading">
  <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
    <h2 id="path-heading" class={grammarHeadingClass}>Grammar path</h2>

    <TextLink
      href="/grammar#{grammarGroupAnchor[here.group]}"
      class="inline-flex items-center gap-1.5 text-sm"
    >
      All {here.total} topics in {here.group}
      <ArrowRight />
    </TextLink>
  </div>

  <ol class="m-0 mt-4 flex list-none flex-col gap-3 p-0">
    {#if previous}
      <li class="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3.5">
        <span
          class="absolute top-1/2 -bottom-3 left-[1.125rem] w-0.5 -translate-x-1/2 bg-slate-200"
          aria-hidden="true"
        ></span>

        <span
          class={cx(
            "relative z-10 flex size-9 items-center justify-center self-center rounded-full border-2",
            "border-slate-300 bg-surface font-serif text-sm font-semibold text-slate-500 tabular-nums",
          )}
          aria-hidden="true"
        >
          {previous.step}
        </span>

        <a
          class="group flex min-w-0 flex-wrap items-baseline gap-x-2.5 self-center py-1 no-underline"
          href="/grammar/{previous.topic.slug}"
          rel="prev"
        >
          <span class="sr-only">Previous:</span>

          <span
            class="font-serif text-base leading-snug text-slate-600 group-hover:text-blue-800 group-hover:underline"
          >
            {sentenceCase(previous.topic.english)}
          </span>

          <span class="font-serif text-sm text-slate-500" lang="sk">
            {previous.topic.slovak}
          </span>

          {#if previous.group !== here.group}
            <span class="text-sm text-slate-500">in {previous.group}</span>
          {/if}
        </a>
      </li>
    {/if}

    <li
      class="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3.5"
      aria-current="step"
    >
      {#if previous}
        <span
          class="absolute top-0 h-1/2 left-[1.125rem] w-0.5 -translate-x-1/2 bg-slate-200"
          aria-hidden="true"
        ></span>
      {/if}

      {#if next}
        <span
          class="absolute top-1/2 -bottom-3 left-[1.125rem] w-0.5 -translate-x-1/2 bg-slate-200"
          aria-hidden="true"
        ></span>
      {/if}

      <span
        class={cx(
          "relative z-10 flex size-9 items-center justify-center self-center rounded-full border-2",
          "border-blue-700 bg-blue-50 font-serif text-sm font-semibold text-blue-800 tabular-nums",
        )}
        aria-hidden="true"
      >
        {here.step}
      </span>

      <p class="m-0 flex min-w-0 flex-wrap items-baseline gap-x-2.5 self-center py-1">
        <span class="font-serif text-base leading-snug font-semibold text-slate-900">
          {sentenceCase(topic.english)}
        </span>

        <span class="text-xs font-semibold text-blue-800">You are here</span>
      </p>
    </li>

    {#if next}
      <li class="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3.5">
        <span
          class="absolute top-0 h-1/2 left-[1.125rem] w-0.5 -translate-x-1/2 bg-slate-200"
          aria-hidden="true"
        ></span>

        <span
          class={cx(
            "relative z-10 flex size-9 items-center justify-center self-center rounded-full border-2",
            "border-slate-300 bg-surface font-serif text-sm font-semibold text-slate-500 tabular-nums",
          )}
          aria-hidden="true"
        >
          {next.step}
        </span>

        <a
          class={cx(
            panelClass,
            panelHoverClass,
            "group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-3.5 no-underline sm:px-5",
          )}
          href="/grammar/{next.topic.slug}"
          rel="next"
        >
          <span class="min-w-0">
            <span class="block text-sm text-slate-500">
              {next.group === here.group ? "Next" : `Next area: ${next.group}`}
            </span>

            <span class="mt-0.5 flex flex-wrap items-baseline gap-x-2.5">
              <span
                class="font-serif text-xl leading-snug font-semibold text-balance text-blue-800 group-hover:underline"
              >
                {sentenceCase(next.topic.english)}
              </span>

              <span class="font-serif text-sm text-slate-500" lang="sk">
                {next.topic.slovak}
              </span>
            </span>

            <span
              class="mt-1 line-clamp-2 block text-sm leading-snug text-pretty text-slate-600"
            >
              {next.topic.summary}
            </span>
          </span>

          <ArrowRight class="size-5 text-slate-400 group-hover:text-blue-800" />
        </a>
      </li>
    {:else}
      <li class="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3.5">
        <p class="col-start-2 m-0 text-sm leading-relaxed text-slate-600">
          This is the last topic on the path. Review what you have read in
          <TextLink href="/practice">Practice</TextLink>.
        </p>
      </li>
    {/if}
  </ol>
</nav>
