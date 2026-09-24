<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { grammarEntries } from "$lib/catalog/entries";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { GrammarTopic } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

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
    return topic.summary.trim() || topic.lookFor.trim();
  }

  const quickRowClass =
    "grid items-baseline gap-x-6 gap-y-2.5 sm:grid-cols-[4.5rem_minmax(0,1fr)]";

  const quickLabelClass =
    "m-0 text-[0.67rem] font-bold tracking-[0.1em] text-slate-500 uppercase";

  const popularLinkClass = cx(
    "inline-flex min-h-8 items-center rounded-full bg-surface px-3.5",
    "font-serif text-sm text-blue-800 no-underline shadow-(--shadow-border)",
    "transition-shadow hover:shadow-(--shadow-border-hover)",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
  );

  const areaLinkClass = cx(
    "inline-flex items-baseline gap-1.5 font-serif text-[0.95rem] text-blue-800",
    "underline decoration-blue-800/25 underline-offset-4 transition-colors hover:decoration-blue-800",
  );

  const topicCardClass = cx(
    "group flex h-full flex-col rounded-(--frame-radius) bg-surface px-5 pt-4 pb-5",
    "no-underline shadow-(--shadow-border) transition-shadow duration-150",
    "hover:shadow-(--shadow-border-hover)",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
  );

  const topicArrowClass = cx(
    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
    "bg-blue-50 text-blue-800 transition-colors",
    "group-hover:bg-blue-600 group-hover:text-paper",
  );
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[960px]">
    <header class="max-w-[640px]">
      <h1>Grammar</h1>

      <Lead class="text-pretty">
        Short explanations of the patterns you meet in the lessons. Pick an area, then
        open the one you need.
      </Lead>
    </header>

    <div class="mt-9 grid gap-4 border-y border-slate-200/80 py-5">
      {#if popularTopics.length}
        <nav class={quickRowClass} aria-label="Popular grammar topics">
          <p class={quickLabelClass}>Popular</p>

          <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
            {#each popularTopics as topic (topic.slug)}
              <li>
                <a class={popularLinkClass} href="/grammar/{topic.slug}">
                  {sentenceCase(topic.english)}
                </a>
              </li>
            {/each}
          </ul>
        </nav>
      {/if}

      <nav class={quickRowClass} aria-label="Jump to area">
        <p class={quickLabelClass}>Areas</p>

        <ul class="m-0 flex list-none flex-wrap items-baseline gap-x-5 gap-y-2 p-0">
          {#each groups as group (group)}
            <li>
              <a class={areaLinkClass} href="#{groupAnchor[group]}">
                {group}
                <span class="font-sans text-xs text-slate-500 tabular-nums no-underline">
                  {topicsFor(group).length}
                </span>
              </a>
            </li>
          {/each}

          <li class="max-sm:basis-full sm:ml-auto">
            <TextLink class="inline-flex items-center gap-1 text-sm" href="/glossary">
              Glossary <ArrowRight />
            </TextLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="mt-12 space-y-14" aria-label="Grammar topics">
      {#each groups as group (group)}
        {@const topics = topicsFor(group)}

        {#if topics.length}
          <section
            id={groupAnchor[group]}
            class="scroll-mt-24"
            aria-labelledby="{groupAnchor[group]}-heading"
          >
            <div class="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <h2 id="{groupAnchor[group]}-heading" class="m-0 text-2xl tracking-tight">
                  {group}
                </h2>

                <p
                  class="m-0 mt-1 max-w-xl text-sm leading-snug text-pretty text-slate-600"
                >
                  {groupPurpose[group]}
                </p>
              </div>

              {#if group === "Numbers"}
                <TextLink
                  class="inline-flex items-center gap-1 text-sm"
                  href="/grammar/telling-time#clock-drill"
                >
                  Practice the clock <ArrowRight />
                </TextLink>
              {/if}
            </div>

            <ul class="m-0 grid list-none grid-cols-2 gap-4 p-0 max-[700px]:grid-cols-1">
              {#each topics as topic (topic.slug)}
                <li>
                  <a class={topicCardClass} href="/grammar/{topic.slug}">
                    <span class="flex items-start justify-between gap-4">
                      <span class="min-w-0">
                        <span
                          class="block font-serif text-lg leading-snug font-semibold tracking-tight text-balance text-slate-900 group-hover:text-blue-800"
                        >
                          {sentenceCase(topic.english)}
                        </span>

                        <span
                          class="mt-0.5 block font-serif text-[0.95rem] text-blue-800"
                          lang="sk"
                        >
                          {topic.slovak}
                        </span>
                      </span>

                      <span class={topicArrowClass} aria-hidden="true">
                        <ArrowRight />
                      </span>
                    </span>

                    <span
                      class="mt-3 line-clamp-2 text-sm leading-relaxed text-pretty text-slate-600"
                    >
                      {blurb(topic)}
                    </span>
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      {/each}
    </div>
  </PageShell>
</main>
