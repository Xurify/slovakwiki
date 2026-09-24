<script lang="ts">
  import type { Snippet } from "svelte";

  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarCaseMap from "$lib/components/reference/GrammarCaseMap.svelte";
  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import GrammarPatternList from "$lib/components/reference/GrammarPatternList.svelte";
  import GrammarTopicNeighbors from "$lib/components/reference/GrammarTopicNeighbors.svelte";
  import GrammarTopicRail from "$lib/components/reference/GrammarTopicRail.svelte";
  import GrammarTopicSection from "$lib/components/reference/GrammarTopicSection.svelte";
  import {
    grammarCardClass,
    grammarEyebrowClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { ClockGrid } from "$lib/learning/time";
  import {
    grammarGroupAnchor,
    grammarNeighbors,
  } from "$lib/catalog/reference/grammar-path";
  import { parsePattern } from "$lib/catalog/reference/grammar-pattern";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { EntryKind, GrammarTopic } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  interface RelatedEntry {
    english: string;
    href: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  let {
    topic,
    relatedEntries = [],
    audioKeys = [],
    clockDrill,
  }: {
    topic: GrammarTopic;
    relatedEntries?: RelatedEntry[];
    audioKeys?: string[];
    /** Client island slot from Astro (`client:only` / `client:load`). */
    clockDrill?: Snippet;
  } = $props();

  const isTime = $derived(topic.slug === "telling-time");
  const terms = $derived(topic.termSections ?? []);

  const words = $derived(
    relatedEntries
      .filter((entry) => entry.kind === "word")
      .map((entry) => ({
        href: entry.href,
        primary: entry.slovak,
        secondary: entry.english,
        slug: entry.slug,
      })),
  );

  const topics = $derived(
    relatedEntries
      .filter((entry) => entry.kind !== "word")
      .map((entry) => ({
        href: entry.href,
        primary: sentenceCase(entry.english),
        secondary: entry.slovak,
        slug: entry.slug,
      })),
  );

  const neighbors = $derived(grammarNeighbors(topic.slug));

  /** Ending tiles already show one example each; skip the list so they are not repeated. */
  const examplesInPattern = $derived.by(() => {
    if (topic.caseOverview || isTime) return false;
    const view = parsePattern(topic.pattern.lines, topic.examples);
    return view.kind === "tiles" && view.tiles.every((tile) => tile.example);
  });
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-x-12 lg:gap-y-12">
      <header class="max-w-2xl lg:col-start-1">
        <nav
          class="mb-5 flex flex-wrap gap-2 text-xs text-slate-500"
          aria-label="Breadcrumb"
        >
          <TextLink href="/grammar">Grammar</TextLink>
          <span aria-hidden="true">/</span>
          <TextLink href="/grammar#{grammarGroupAnchor[topic.pathGroup]}">
            {topic.pathGroup}
          </TextLink>
        </nav>

        <h1 class="text-balance">{sentenceCase(topic.english)}</h1>

        <p class="m-0 mt-2 font-serif text-2xl text-blue-800 sm:text-[1.75rem]" lang="sk">
          {topic.slovak}
        </p>

        <Lead class="text-pretty">{topic.summary}</Lead>
      </header>

      <aside
        class="flex flex-col gap-4 max-lg:order-1 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        aria-label="About this topic"
      >
        <GrammarTopicRail {topic} {words} {topics} />
      </aside>

      <div class="min-w-0 space-y-12 lg:col-start-1">
        {#if topic.caseOverview}
          <GrammarTopicSection
            id="cases"
            title="The six cases"
            intro="Learn the nominative first. Use the rest as a map of common roles, then open a case for its examples."
          >
            <GrammarCaseMap cases={topic.caseOverview} />
          </GrammarTopicSection>
        {:else}
          <section id="pattern" class={cx(grammarCardClass, "scroll-mt-24")}>
            <div class="border-b border-slate-200/70 px-6 pt-5 pb-4 max-[480px]:px-4">
              <p class={grammarEyebrowClass}>The pattern</p>

              <h2
                class="m-0 mt-1.5 font-serif text-xl tracking-tight text-balance text-slate-900 sm:text-2xl"
              >
                {topic.pattern.label}
              </h2>

              {#if isTime}
                <p class="m-0 mt-1.5 text-sm text-slate-600">
                  Green rows name the hour you are heading toward.
                </p>
              {/if}
            </div>

            <GrammarPatternList
              lines={topic.pattern.lines}
              examples={topic.examples}
              withClocks={isTime}
            />
          </section>
        {/if}

        <GrammarTopicSection id="rule" title="How it works">
          <div class="flex max-w-[62ch] flex-col gap-3">
            {#each topic.rule as paragraph (paragraph)}
              <p
                class="m-0 font-serif text-lg leading-relaxed text-pretty text-slate-900"
              >
                {paragraph}
              </p>
            {/each}
          </div>

          <div
            class="mt-5 rounded-(--frame-radius) bg-blue-50/70 px-5 py-4 ring-1 ring-blue-100 ring-inset"
          >
            <p class={grammarEyebrowClass}>When you read</p>

            <p class="m-0 mt-1.5 max-w-[62ch] leading-relaxed text-pretty text-slate-700">
              {topic.lookFor}
            </p>
          </div>
        </GrammarTopicSection>

        {#if terms.length > 0}
          <GrammarTopicSection id="terms" title="Key labels">
            <dl class="m-0 grid gap-3 sm:grid-cols-2">
              {#each terms as term (term.id)}
                <div
                  id={term.id}
                  class={cx(
                    grammarCardClass,
                    "scroll-mt-24 px-5 py-4 target:ring-2 target:ring-blue-600/40",
                  )}
                >
                  <dt class="font-serif text-lg font-semibold text-slate-900">
                    {term.title}
                  </dt>

                  <dd class="m-0 mt-1 text-sm leading-relaxed text-pretty text-slate-600">
                    {term.body}
                  </dd>
                </div>
              {/each}
            </dl>
          </GrammarTopicSection>
        {/if}

        {#if isTime}
          <GrammarTopicSection
            id="clock-faces"
            title="See the time"
            intro="Match each face to the Slovak phrase. Quarters and halves name the hour ahead."
          >
            <ClockGrid />
          </GrammarTopicSection>

          {#if clockDrill}
            {@render clockDrill()}
          {/if}
        {/if}

        {#if topic.examples.length > 0 && !examplesInPattern}
          <GrammarTopicSection id="examples" title="In real sentences">
            <GrammarExampleList examples={topic.examples} {audioKeys} />
          </GrammarTopicSection>
        {/if}

        <section
          id="watch-out"
          class="scroll-mt-24 rounded-(--frame-radius) bg-rose-50 px-5 py-4 shadow-(--shadow-border) sm:px-6"
          aria-labelledby="watch-out-heading"
        >
          <h2
            id="watch-out-heading"
            class="m-0 font-sans text-[0.64rem] font-bold tracking-[0.14em] text-rose-800 uppercase"
          >
            Common mistake
          </h2>

          <p
            class="m-0 mt-1.5 max-w-[62ch] font-serif text-lg leading-relaxed text-pretty text-rose-900"
          >
            {topic.watchOut}
          </p>
        </section>

        <p id="source" class="m-0 text-sm text-slate-500">
          Source:
          <TextLink href={topic.source} rel="noopener noreferrer" target="_blank">
            Jazykovedný ústav Ľudovíta Štúra SAV ↗
          </TextLink>
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          Full attribution on <TextLink href="/references">References</TextLink>.
        </p>
      </div>

      <div class="min-w-0 max-lg:order-last lg:col-start-1">
        <GrammarTopicNeighbors {neighbors} />
      </div>
    </div>
  </PageShell>
</main>
