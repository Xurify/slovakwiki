<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarAreaSection from "$lib/components/reference/GrammarAreaSection.svelte";
  import ReferenceRailCard from "$lib/components/reference/ReferenceRailCard.svelte";
  import ReferenceRailList from "$lib/components/reference/ReferenceRailList.svelte";
  import {
    referenceCardClass,
    referencePageGridClass,
  } from "$lib/components/reference/reference-ui";
  import { grammarEntries } from "$lib/catalog/entries";
  import {
    grammarGroups,
    grammarTopicsInGroup,
  } from "$lib/catalog/reference/grammar-path";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { GrammarTopic } from "$lib/catalog/types";

  const areas = grammarGroups
    .map((group) => ({ group, topics: grammarTopicsInGroup(group) }))
    .filter((area) => area.topics.length > 0);

  const start = areas[0]?.topics[0];

  const popularSlugs = [
    "cases-overview",
    "telling-time",
    "numbers-and-numerals",
    "questions",
    "negation",
    "aspect",
  ] as const;

  const popular = popularSlugs
    .map((slug) => grammarEntries.find((topic) => topic.slug === slug))
    .filter((topic): topic is GrammarTopic => Boolean(topic))
    .map((topic) => ({
      href: `/grammar/${topic.slug}`,
      primary: sentenceCase(topic.english),
      secondary: topic.slovak,
      secondaryLang: "sk" as const,
    }));
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class={referencePageGridClass}>
      <header class="max-w-xl lg:col-start-1">
        <h1 class="text-balance">Grammar</h1>

        <Lead class="text-pretty">
          Short, practical explanations of the patterns you meet in the lessons. Read them
          in order, or jump straight to the one that's tripping you up.
        </Lead>
      </header>

      <aside
        class="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        aria-label="Where to begin"
      >
        {#if start}
          <article
            class="{referenceCardClass} max-lg:hidden"
            aria-labelledby="grammar-start-heading"
          >
            <div class="border-b border-slate-200/70 px-5 pt-4 pb-4">
              <p
                class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
              >
                Start here
                <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                {start.pathGroup}
              </p>

              <h2
                id="grammar-start-heading"
                class="m-0 mt-2 font-serif text-xl leading-snug tracking-tight text-balance text-slate-900"
              >
                {sentenceCase(start.english)}
              </h2>

              <p class="m-0 mt-2 text-sm leading-relaxed text-pretty text-slate-600">
                {start.summary}
              </p>
            </div>

            <ul class="m-0 list-none divide-y divide-slate-200/70 bg-slate-50/60 p-0">
              {#each start.examples.slice(0, 3) as example (example.slovak)}
                <li class="flex items-baseline justify-between gap-3 px-5 py-2">
                  <span class="font-serif font-semibold text-slate-900" lang="sk">
                    {example.slovak}
                  </span>
                  <span class="text-right text-xs text-slate-500">{example.english}</span>
                </li>
              {/each}
            </ul>

            <div class="px-5 pt-4 pb-5">
              <Button href="/grammar/{start.slug}" variant="accent" class="w-full px-4">
                Read the topic
                <ArrowRight />
              </Button>
            </div>
          </article>
        {/if}

        <ReferenceRailCard
          title="Quick reference"
          headingId="grammar-popular-heading"
          description="Jump straight to a common sticking point."
          class="max-lg:hidden"
        >
          <ReferenceRailList items={popular} />
        </ReferenceRailCard>

        <p class="m-0 px-1 text-sm text-slate-600">
          New to the terms?
          <TextLink class="inline-flex items-center gap-1" href="/glossary">
            Open the glossary <ArrowRight />
          </TextLink>
        </p>
      </aside>

      <div class="min-w-0 space-y-14 lg:col-start-1">
        {#each areas as area (area.group)}
          <GrammarAreaSection
            group={area.group}
            topics={area.topics}
            startSlug={start?.slug ?? ""}
          />
        {/each}
      </div>
    </div>
  </PageShell>
</main>
