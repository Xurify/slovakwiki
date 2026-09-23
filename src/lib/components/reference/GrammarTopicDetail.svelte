<script lang="ts">
  import type { Snippet } from "svelte";

  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarCallout from "$lib/components/reference/GrammarCallout.svelte";
  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import GrammarLearnCard, {
    type GrammarPracticeLink,
  } from "$lib/components/reference/GrammarLearnCard.svelte";
  import GrammarPatternList from "$lib/components/reference/GrammarPatternList.svelte";
  import ReferenceRailCard from "$lib/components/reference/ReferenceRailCard.svelte";
  import ReferenceRailList from "$lib/components/reference/ReferenceRailList.svelte";
  import ReferenceTopicNav from "$lib/components/reference/ReferenceTopicNav.svelte";
  import {
    referenceCardClass,
    referenceH2Class,
    referencePageGridClass,
    referenceRailClass,
    referenceSectionClass,
    referenceSectionLeadClass,
  } from "$lib/components/reference/reference-ui";
  import { ClockGrid } from "$lib/learning/time";
  import { practiceSetForItem } from "$lib/catalog/practice";
  import {
    grammarGroupAnchor,
    grammarNeighbors,
    grammarTopicPosition,
  } from "$lib/catalog/reference/grammar-path";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { EntryKind, GrammarTopic } from "$lib/catalog/types";

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
  const position = $derived(grammarTopicPosition(topic));
  const neighbors = $derived(grammarNeighbors(topic));

  const relatedWords = $derived(
    relatedEntries
      .filter((entry) => entry.kind === "word")
      .map((entry) => ({
        href: entry.href,
        primary: entry.slovak,
        primaryLang: "sk" as const,
        secondary: entry.english,
      })),
  );
  const relatedTopics = $derived(
    relatedEntries
      .filter((entry) => entry.kind !== "word")
      .map((entry) => ({
        href: entry.href,
        primary: sentenceCase(entry.english),
        secondary: entry.slovak,
        secondaryLang: "sk" as const,
      })),
  );

  const practice = $derived.by((): GrammarPracticeLink | undefined => {
    const bySet = new Map<string, { title: string; count: number }>();
    for (const example of topic.examples) {
      if (!example.practiceItemId) continue;
      const set = practiceSetForItem(example.practiceItemId);
      if (!set) continue;
      const current = bySet.get(set.id) ?? { title: set.title, count: 0 };
      bySet.set(set.id, { ...current, count: current.count + 1 });
    }

    const [best] = [...bySet.entries()].sort((a, b) => b[1].count - a[1].count);
    if (!best) return undefined;
    return { href: `/practice/${best[0]}`, title: best[1].title };
  });

  const examples = $derived(
    topic.examples.map((example) => ({
      english: example.english,
      note: example.demonstrates,
      practiceItemId: example.practiceItemId,
      slovak: example.slovak,
    })),
  );

  const toc = $derived.by(() => {
    const items: { href: string; label: string }[] = [
      { href: "#rule-heading", label: "What changes" },
    ];
    if (isTime) {
      items.push({ href: "#clock-grid-heading", label: "Clock faces" });
      items.push({ href: "#clock-drill", label: "Clock practice" });
    }
    if (topic.termSections?.length)
      items.push({ href: "#terms-heading", label: "Key labels" });
    if (topic.caseOverview) {
      items.push({ href: "#case-map", label: "The six cases" });
    } else {
      items.push({ href: "#pattern-heading", label: "Pattern" });
      items.push({ href: "#examples-heading", label: "Examples" });
    }
    items.push({ href: "#watch-out", label: "Watch out" });
    return items;
  });
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class={referencePageGridClass}>
      <article class="min-w-0 max-w-[700px]">
        <nav
          class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500"
          aria-label="Breadcrumb"
        >
          <TextLink class="text-xs" href="/grammar">Grammar</TextLink>
          <span aria-hidden="true">/</span>
          <TextLink class="text-xs" href="/grammar#{grammarGroupAnchor(topic.pathGroup)}">
            {topic.pathGroup}
          </TextLink>

          {#if position.step > 0}
            <span class="text-slate-400" aria-hidden="true">·</span>
            <span class="tabular-nums">Topic {position.step} of {position.total}</span>
          {/if}
        </nav>

        <header class="mt-5">
          <h1 class="text-balance">{sentenceCase(topic.english)}</h1>
          <p class="m-0 mt-2 font-serif text-lg text-blue-800" lang="sk">
            {topic.slovak}
          </p>
          <Lead class="text-pretty">{topic.summary}</Lead>
        </header>

        <GrammarCallout class="mt-7" tone="look" label="Look for" text={topic.lookFor} />

        <section class={referenceSectionClass} aria-labelledby="rule-heading">
          <h2 id="rule-heading" class={referenceH2Class}>What changes</h2>

          <ol class="m-0 mt-5 grid list-none gap-4 p-0">
            {#each topic.rule as paragraph, index (paragraph)}
              <li class="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3.5">
                <span
                  class="flex size-7 items-center justify-center rounded-full bg-blue-50 font-serif text-sm font-semibold tabular-nums text-blue-800"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>

                <p
                  class="m-0 max-w-[62ch] pt-0.5 font-serif leading-relaxed text-pretty text-slate-700"
                >
                  {paragraph}
                </p>
              </li>
            {/each}
          </ol>
        </section>

        {#if isTime}
          <section class={referenceSectionClass} aria-labelledby="clock-grid-heading">
            <h2 id="clock-grid-heading" class={referenceH2Class}>See the time</h2>
            <p class={referenceSectionLeadClass}>
              Match each face to the Slovak phrase. Quarters and halves name the hour
              ahead.
            </p>

            <div class="mt-5">
              <ClockGrid />
            </div>
          </section>

          {#if clockDrill}
            <div class="mt-11">
              {@render clockDrill()}
            </div>
          {/if}
        {/if}

        {#if topic.termSections && topic.termSections.length > 0}
          <section class={referenceSectionClass} aria-labelledby="terms-heading">
            <h2 id="terms-heading" class={referenceH2Class}>Key labels</h2>

            <dl class="{referenceCardClass} m-0 mt-5 divide-y divide-slate-200/70">
              {#each topic.termSections as section (section.id)}
                <div
                  id={section.id}
                  class="grid scroll-mt-24 gap-x-5 gap-y-1 px-5 py-3.5 transition-colors duration-300 target:bg-blue-50 sm:grid-cols-[9.5rem_minmax(0,1fr)]"
                >
                  <dt
                    class="font-serif text-[1.05rem] leading-snug font-semibold text-blue-800"
                  >
                    {section.title}
                  </dt>

                  <dd
                    class="m-0 max-w-[60ch] text-sm leading-relaxed text-pretty text-slate-700"
                  >
                    {section.body}
                  </dd>
                </div>
              {/each}
            </dl>
          </section>
        {/if}

        {#if topic.caseOverview}
          <section
            id="case-map"
            class={referenceSectionClass}
            aria-labelledby="case-map-heading"
          >
            <h2 id="case-map-heading" class={referenceH2Class}>The six cases</h2>
            <p class={referenceSectionLeadClass}>
              Learn the nominative first. Use the rest as a map of common roles, then open
              each case for examples.
            </p>

            <ol class="m-0 mt-5 flex list-none flex-col gap-3 p-0">
              {#each topic.caseOverview as item, index (item.slug)}
                <li
                  class="group/step relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3.5"
                >
                  <span
                    class="absolute top-0 left-[1.125rem] h-1/2 w-0.5 -translate-x-1/2 bg-slate-200 group-first/step:hidden"
                    aria-hidden="true"
                  ></span>
                  <span
                    class="absolute top-1/2 -bottom-3 left-[1.125rem] w-0.5 -translate-x-1/2 bg-slate-200 group-last/step:hidden"
                    aria-hidden="true"
                  ></span>

                  <span
                    class="relative z-10 flex size-9 items-center justify-center self-center rounded-full border-2 font-serif text-sm font-semibold tabular-nums {index ===
                    0
                      ? 'border-blue-600 bg-blue-600 text-paper'
                      : 'border-slate-300 bg-surface text-slate-500'}"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>

                  <a
                    class="group grid min-w-0 gap-1 rounded-(--frame-radius) bg-surface/80 px-4 py-3.5 no-underline shadow-(--shadow-border) transition-[background-color,box-shadow] duration-150 hover:bg-surface hover:shadow-(--shadow-border-hover)"
                    href="/grammar/cases/{item.slug}"
                  >
                    <span
                      class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
                    >
                      <strong
                        class="font-serif text-lg leading-snug tracking-tight text-blue-800 underline-offset-2 group-hover:underline"
                      >
                        {item.name}
                      </strong>

                      {#if item.role}
                        <span
                          class="text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
                        >
                          {item.role}
                        </span>
                      {/if}
                    </span>

                    {#if item.question}
                      <span class="text-xs text-slate-500">{item.question}</span>
                    {/if}

                    {#if item.explanation}
                      <span
                        class="mt-0.5 text-sm leading-snug text-pretty text-slate-700"
                      >
                        {item.explanation}
                      </span>
                    {/if}

                    {#if item.researchPrompt}
                      <span class="text-xs text-slate-500 italic">
                        Research: {item.researchPrompt}
                      </span>
                    {/if}
                  </a>
                </li>
              {/each}
            </ol>
          </section>
        {:else}
          <section class={referenceSectionClass} aria-labelledby="pattern-heading">
            <h2 id="pattern-heading" class={referenceH2Class}>{topic.pattern.label}</h2>

            <div class="mt-5">
              <GrammarPatternList lines={topic.pattern.lines} withClocks={isTime} />
            </div>
          </section>

          <section class={referenceSectionClass} aria-labelledby="examples-heading">
            <h2 id="examples-heading" class={referenceH2Class}>Examples</h2>

            <div class="mt-5">
              <GrammarExampleList {examples} />
            </div>
          </section>
        {/if}

        <div id="watch-out" class="scroll-mt-24 pt-10">
          <GrammarCallout tone="watch" label="Watch out" text={topic.watchOut} />
        </div>

        <ReferenceTopicNav {neighbors} />

        <p
          id="source"
          class="m-0 mt-10 scroll-mt-24 text-xs leading-relaxed text-slate-500"
        >
          Source:
          <a
            class="text-blue-800 underline underline-offset-2"
            href={topic.source}
            rel="noopener noreferrer"
            target="_blank"
          >
            Jazykovedný ústav Ľudovíta Štúra SAV ↗
          </a>
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          Full attribution on
          <a class="text-blue-800 underline underline-offset-2" href="/references"
            >References</a
          >.
        </p>
      </article>

      <aside class={referenceRailClass} aria-label="About this topic">
        <GrammarLearnCard lessonLink={topic.lessonLink} {practice} />

        <nav
          class="{referenceCardClass} px-5 py-4 max-lg:hidden"
          aria-labelledby="grammar-toc-heading"
        >
          <h2
            id="grammar-toc-heading"
            class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
          >
            On this page
          </h2>

          <ol class="m-0 mt-2 list-none space-y-0.5 p-0">
            {#each toc as item (item.href)}
              <li>
                <a
                  class="block rounded-(--control-radius) py-1 text-sm text-slate-700 no-underline hover:text-blue-800 hover:underline"
                  href={item.href}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ol>
        </nav>

        {#if relatedWords.length}
          <ReferenceRailCard
            title="Words to know"
            headingId="grammar-words-heading"
            description="Dictionary entries used on this page."
          >
            <ReferenceRailList items={relatedWords} />
          </ReferenceRailCard>
        {/if}

        {#if relatedTopics.length}
          <ReferenceRailCard title="Related topics" headingId="grammar-related-heading">
            <ReferenceRailList items={relatedTopics} />
          </ReferenceRailCard>
        {/if}
      </aside>
    </div>
  </PageShell>
</main>
