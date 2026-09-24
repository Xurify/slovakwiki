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
    grammarRowsClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { ClockGrid } from "$lib/learning/time";
  import {
    grammarGroupAnchor,
    grammarNeighbors,
  } from "$lib/catalog/reference/grammar-path";
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
    clockDrill,
  }: {
    topic: GrammarTopic;
    relatedEntries?: RelatedEntry[];
    /** Client island slot from Astro (`client:only` / `client:load`). */
    clockDrill?: Snippet;
  } = $props();

  const isTime = $derived(topic.slug === "telling-time");
  const terms = $derived(topic.termSections ?? []);

  const sections = $derived(
    [
      { id: "rule", label: "The rule", show: true },
      { id: "cases", label: "The six cases", show: Boolean(topic.caseOverview) },
      { id: "pattern", label: "Pattern", show: !topic.caseOverview },
      { id: "terms", label: "Key labels", show: terms.length > 0 },
      { id: "clock-faces", label: "Clock faces", show: isTime },
      { id: "clock-drill", label: "Clock practice", show: isTime && Boolean(clockDrill) },
      { id: "examples", label: "Examples", show: topic.examples.length > 0 },
      { id: "watch-out", label: "Common mistake", show: true },
    ].filter((section) => section.show),
  );

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

        <p class="m-0 mt-2 font-serif text-xl text-blue-800" lang="sk">{topic.slovak}</p>

        <Lead class="text-pretty">{topic.summary}</Lead>
      </header>

      <aside
        class="flex flex-col gap-4 max-lg:order-1 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        aria-label="About this topic"
      >
        <GrammarTopicRail {topic} {sections} {words} {topics} />
      </aside>

      <div class="min-w-0 space-y-12 lg:col-start-1">
        <GrammarTopicSection id="rule" title="The rule">
          <ol class={cx(grammarCardClass, grammarRowsClass)}>
            {#each topic.rule as paragraph, index (paragraph)}
              <li class="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 px-5 py-4">
                <span
                  class="flex size-7 items-center justify-center rounded-full border-2 border-slate-300 font-serif text-xs font-semibold text-slate-500 tabular-nums"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>

                <p
                  class="m-0 max-w-[62ch] self-center font-serif text-[1.05rem] leading-relaxed text-pretty text-slate-900"
                >
                  {paragraph}
                </p>
              </li>
            {/each}
          </ol>
        </GrammarTopicSection>

        {#if topic.caseOverview}
          <GrammarTopicSection
            id="cases"
            title="The six cases"
            intro="Learn the nominative first. Use the rest as a map of common roles, then open a case for its examples."
          >
            <GrammarCaseMap cases={topic.caseOverview} />
          </GrammarTopicSection>
        {:else}
          <GrammarTopicSection
            id="pattern"
            title={topic.pattern.label}
            intro={isTime
              ? "Green rows name the hour you are heading toward."
              : undefined}
          >
            <GrammarPatternList lines={topic.pattern.lines} withClocks={isTime} />
          </GrammarTopicSection>
        {/if}

        {#if terms.length > 0}
          <GrammarTopicSection id="terms" title="Key labels">
            <dl class={cx(grammarCardClass, "m-0 divide-y divide-slate-200/70")}>
              {#each terms as term (term.id)}
                <div id={term.id} class="scroll-mt-24 px-5 py-4 target:bg-blue-50/70">
                  <dt class="font-serif text-lg font-semibold text-slate-900">
                    {term.title}
                  </dt>

                  <dd
                    class="m-0 mt-1 max-w-[62ch] text-sm leading-relaxed text-slate-600"
                  >
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

        {#if topic.examples.length > 0}
          <GrammarTopicSection id="examples" title="Examples">
            <GrammarExampleList examples={topic.examples} lookFor={topic.lookFor} />
          </GrammarTopicSection>
        {/if}

        <section
          id="watch-out"
          class="scroll-mt-24 rounded-(--frame-radius) bg-rose-50/70 px-5 py-4 ring-1 ring-rose-200/70 ring-inset"
          aria-labelledby="watch-out-heading"
        >
          <h2
            id="watch-out-heading"
            class="m-0 font-sans text-[0.64rem] font-bold tracking-[0.14em] text-rose-800 uppercase"
          >
            Common mistake
          </h2>

          <p
            class="m-0 mt-1.5 max-w-[62ch] font-serif text-[1.05rem] leading-relaxed text-pretty text-slate-900"
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
