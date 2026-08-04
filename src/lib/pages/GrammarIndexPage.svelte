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
    "group grid gap-2 border border-slate-200 bg-surface p-4 transition-colors hover:border-blue-400 hover:bg-blue-50/50";
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
      <nav class="mt-8" aria-label="Popular grammar topics">
        <Eyebrow>Popular</Eyebrow>
        <div class="mt-3 flex flex-wrap gap-2">
          {#each popularTopics as topic (topic.slug)}
            <a
              class="inline-flex items-center border border-slate-300 bg-surface px-3 py-1.5 font-serif text-sm text-blue-800 transition-colors hover:border-blue-600 hover:bg-blue-50"
              href="/grammar/{topic.slug}"
            >
              {sentenceCase(topic.english)}
            </a>
          {/each}
        </div>
      </nav>
    {/if}

    <nav class="mt-8 flex flex-wrap gap-x-4 gap-y-2" aria-label="Jump to area">
      {#each groups as group (group)}
        <a
          class="font-serif text-sm text-blue-800 underline-offset-2 hover:underline"
          href="#{groupAnchor[group]}"
        >
          {group}
        </a>
      {/each}
    </nav>

    <div class="mt-10 space-y-12" aria-label="Grammar topics">
      {#each groups as group (group)}
        {@const topics = topicsFor(group)}
        {#if topics.length}
          <section id={groupAnchor[group]} class="scroll-mt-[88px]">
            <div
              class="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3"
            >
              <div class="grid gap-1">
                <h2 class="m-0 text-xl">{group}</h2>
                <p class="m-0 font-serif text-sm text-slate-600">
                  {groupPurpose[group]}
                </p>
              </div>

              {#if group === "Numbers"}
                <TextLink class="text-sm" href="/grammar/telling-time#clock-drill">
                  Practice the clock <ArrowRight />
                </TextLink>
              {/if}
            </div>

            <div class="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
              {#each topics as topic (topic.slug)}
                <a class={topicCardClass} href="/grammar/{topic.slug}">
                  <div class="flex items-start justify-between gap-3">
                    <strong
                      class="font-serif text-lg text-blue-800 group-hover:underline"
                    >
                      {sentenceCase(topic.english)}
                    </strong>
                    <ArrowRight class="mt-1 shrink-0 text-blue-800 opacity-70" />
                  </div>
                  <span class="font-serif text-sm text-slate-500" lang="sk">
                    {topic.slovak}
                  </span>
                  <p class="m-0 font-serif text-sm leading-relaxed text-slate-600">
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
