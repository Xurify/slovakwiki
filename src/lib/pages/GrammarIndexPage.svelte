<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { grammarEntries } from "$lib/content/data";
  import { sentenceCase } from "$lib/content/search-ui";
  import type { GrammarTopic } from "$lib/content/types";

  type GrammarGroup = (typeof groups)[number];

  const groups = ["Nouns", "Verbs", "Numbers", "Sentence building"] as const;

  const groupPurpose: Record<GrammarGroup, string> = {
    Nouns: "Gender and cases — how nouns change in a sentence",
    Verbs: "Present forms, byť / mať, and aspect pairs",
    Numbers: "Counting, quantity agreement, and clock time",
    "Sentence building": "Word order, formality, negation, and questions",
  };

  const groupAnchor: Record<GrammarGroup, string> = {
    Nouns: "group-nouns",
    Verbs: "group-verbs",
    Numbers: "group-numbers",
    "Sentence building": "group-sentence-building",
  };

  const popularSlugs = [
    "cases-overview",
    "numbers-and-numerals",
    "telling-time",
    "questions",
    "negation",
    "present-tense",
  ] as const;

  const popularTopics = popularSlugs
    .map((slug) => grammarEntries.find((topic) => topic.slug === slug))
    .filter((topic): topic is GrammarTopic => Boolean(topic));

  function topicsFor(group: GrammarGroup): GrammarTopic[] {
    return grammarEntries.filter((topic) => topic.pathGroup === group);
  }

  function blurb(topic: GrammarTopic): string {
    const line = topic.summary.trim() || topic.lookFor.trim();
    if (line.length <= 96) return line;
    return `${line.slice(0, 93).trimEnd()}…`;
  }

  const topicCardClass =
    "group flex h-full flex-col gap-1.5 rounded-(--frame-radius) border border-slate-200 bg-surface p-5 transition-colors hover:border-blue-400 hover:bg-blue-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

  const popularChipClass =
    "inline-flex items-center rounded-(--control-radius) border border-slate-300 bg-surface px-3 py-1.5 font-serif text-sm text-blue-800 transition-colors hover:border-blue-600 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[960px]">
    <header class="max-w-[640px]">
      <Eyebrow>Reference</Eyebrow>
      <h1>Grammar</h1>
      <Lead>
        Pick an area, then open the pattern you need.
        <TextLink class="ml-1 inline-flex items-center gap-1" href="/glossary">
          Glossary <ArrowRight />
        </TextLink>
      </Lead>
    </header>

    {#if popularTopics.length}
      <nav class="mt-9" aria-label="Popular grammar topics">
        <Eyebrow>Popular</Eyebrow>
        <div class="mt-3 flex flex-wrap gap-2">
          {#each popularTopics as topic (topic.slug)}
            <a class={popularChipClass} href="/grammar/{topic.slug}">
              {sentenceCase(topic.english)}
            </a>
          {/each}
        </div>
      </nav>
    {/if}

    <nav
      class="mt-7 flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-slate-200/80 pt-5"
      aria-label="Jump to area"
    >
      <span class="mr-2 text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
        Areas
      </span>

      {#each groups as group, index (group)}
        {#if index > 0}
          <span class="text-slate-300" aria-hidden="true">·</span>
        {/if}

        <a
          class="rounded-(--control-radius) px-1.5 py-0.5 font-serif text-sm text-blue-800 underline-offset-2 transition-colors hover:bg-blue-50 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          href="#{groupAnchor[group]}"
        >
          {group}
        </a>
      {/each}
    </nav>

    <div class="mt-12 space-y-14" aria-label="Grammar topics">
      {#each groups as group (group)}
        {@const topics = topicsFor(group)}
        {#if topics.length}
          <section id={groupAnchor[group]} class="scroll-mt-[88px]">
            <div
              class="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200/80 pb-3.5"
            >
              <div class="grid gap-1">
                <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 class="m-0 text-xl">{group}</h2>
                  <p class="m-0 text-xs tabular-nums text-slate-500">
                    {topics.length}
                    {topics.length === 1 ? "topic" : "topics"}
                  </p>
                </div>

                <p
                  class="m-0 max-w-[36rem] font-serif text-sm leading-snug text-slate-600"
                >
                  {groupPurpose[group]}
                </p>
              </div>

              {#if group === "Numbers"}
                <TextLink class="text-sm" href="/grammar/telling-time#clock-drill">
                  Practice the clock <ArrowRight />
                </TextLink>
              {/if}
            </div>

            <div class="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
              {#each topics as topic (topic.slug)}
                <a class={topicCardClass} href="/grammar/{topic.slug}">
                  <div class="flex items-start justify-between gap-3">
                    <strong
                      class="font-serif text-lg leading-snug tracking-tight text-blue-800"
                    >
                      {sentenceCase(topic.english)}
                    </strong>
                    <ArrowRight
                      class="mt-1 shrink-0 text-blue-800 opacity-55 transition-opacity group-hover:opacity-100"
                    />
                  </div>

                  <span class="font-serif text-sm text-slate-500" lang="sk">
                    {topic.slovak}
                  </span>

                  <p class="m-0 mt-1 font-serif text-sm leading-relaxed text-slate-600">
                    {blurb(topic)}
                  </p>
                </a>
              {/each}
            </div>
          </section>
        {/if}
      {/each}
    </div>
  </PageShell>
</main>
