<script lang="ts">
  import type { Snippet } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarCaseMap from "$lib/components/reference/GrammarCaseMap.svelte";
  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import GrammarPatternList from "$lib/components/reference/GrammarPatternList.svelte";
  import {
    grammarHeadingClass,
    grammarProseClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { ClockGrid } from "$lib/learning/time";
  import { practiceItemHref } from "$lib/catalog/practice";
  import {
    grammarGroupAnchor,
    grammarNeighbors,
  } from "$lib/catalog/reference/grammar-path";
  import { parsePattern } from "$lib/catalog/reference/grammar-pattern";
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
  const neighbors = $derived(grammarNeighbors(topic.slug));
  const areaHref = $derived(`/grammar#${grammarGroupAnchor[topic.pathGroup]}`);

  const words = $derived(
    relatedEntries
      .filter((entry) => entry.kind === "word")
      .map((entry) => ({
        href: entry.href,
        primary: entry.slovak,
        secondary: entry.english.split(";")[0]!.trim(),
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

  /** Ending rows already show one example each; skip the list so they are not repeated. */
  const examplesInPattern = $derived.by(() => {
    if (topic.caseOverview || isTime) return false;
    const view = parsePattern(topic.pattern.lines, topic.examples);
    return view.kind === "tiles" && view.tiles.every((tile) => tile.example);
  });

  const practiceHref = $derived(
    topic.examples
      .map(
        (example) => example.practiceItemId && practiceItemHref(example.practiceItemId),
      )
      .find((href) => href),
  );

  const steps = $derived(
    [
      neighbors.previous && { label: "Previous", topic: neighbors.previous, rel: "prev" },
      neighbors.next && { label: "Next", topic: neighbors.next, rel: "next" },
    ].filter((step) => step !== undefined),
  );
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[800px]">
    <header>
      <nav
        class="mb-4 flex flex-wrap gap-2 text-xs text-slate-500"
        aria-label="Breadcrumb"
      >
        <TextLink href="/grammar">Grammar</TextLink>
        <span aria-hidden="true">/</span>
        <TextLink href={areaHref}>{topic.pathGroup}</TextLink>
      </nav>

      <h1 class="m-0 text-[1.85rem] leading-tight sm:text-[2.15rem]">
        {sentenceCase(topic.english)}
      </h1>

      <p class="m-0 mt-1 font-serif text-xl text-blue-800" lang="sk">{topic.slovak}</p>

      <p class="m-0 mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-slate-600">
        {topic.summary}
      </p>

      {#if topic.lessonLink || practiceHref}
        <p class="m-0 mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {#if topic.lessonLink}
            <TextLink
              href={topic.lessonLink.href}
              class="inline-flex items-center gap-1.5"
            >
              Lesson: {topic.lessonLink.label}
              <ArrowRight />
            </TextLink>
          {/if}

          {#if practiceHref}
            <TextLink href={practiceHref} class="inline-flex items-center gap-1.5">
              Practice these forms
              <ArrowRight />
            </TextLink>
          {/if}
        </p>
      {/if}
    </header>

    <div class="mt-8">
      {#if topic.caseOverview}
        <h2 id="cases" class={grammarHeadingClass}>The six cases</h2>

        <p class="m-0 mt-1.5 mb-4 max-w-[62ch] text-sm leading-relaxed text-slate-600">
          Learn the nominative first. The rest is a map of common roles — open a case for
          its examples.
        </p>

        <GrammarCaseMap cases={topic.caseOverview} />
      {:else}
        <h2 id="pattern" class={grammarHeadingClass}>{topic.pattern.label}</h2>

        {#if isTime}
          <p class="m-0 mt-1.5 text-sm text-slate-600">
            A note marks the rows that name the hour you are heading toward.
          </p>
        {/if}

        <div class="mt-3">
          <GrammarPatternList
            lines={topic.pattern.lines}
            examples={topic.examples}
            withClocks={isTime}
          />
        </div>
      {/if}
    </div>

    <section id="rule" class="mt-8" aria-labelledby="rule-heading">
      <h2 id="rule-heading" class={grammarHeadingClass}>How it works</h2>

      <div class="mt-3 flex flex-col gap-3">
        {#each topic.rule as paragraph (paragraph)}
          <p class={grammarProseClass}>{paragraph}</p>
        {/each}
      </div>

      <p class="m-0 mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-slate-600">
        <span class="font-semibold text-slate-800">When you read. </span>
        {topic.lookFor}
      </p>
    </section>

    <p
      id="watch-out"
      class="m-0 mt-6 max-w-[62ch] border-l-2 border-rose-400 pl-4 text-[1.02rem] leading-relaxed text-pretty text-rose-900"
    >
      <span class="font-semibold">Watch out. </span>
      {topic.watchOut}
    </p>

    {#if terms.length > 0}
      <section id="terms" class="mt-8" aria-labelledby="terms-heading">
        <h2 id="terms-heading" class={grammarHeadingClass}>Key labels</h2>

        <dl class="m-0 mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {#each terms as term (term.id)}
            <div id={term.id} class="scroll-mt-24 border-t border-slate-200 pt-2">
              <dt class="font-serif text-lg font-semibold text-slate-900">
                {term.title}
              </dt>
              <dd class="m-0 mt-1 text-sm leading-relaxed text-pretty text-slate-600">
                {term.body}
              </dd>
            </div>
          {/each}
        </dl>
      </section>
    {/if}

    {#if isTime}
      <section id="clock-faces" class="mt-8" aria-labelledby="clock-heading">
        <h2 id="clock-heading" class={grammarHeadingClass}>See the time</h2>

        <p class="m-0 mt-1.5 mb-4 max-w-[62ch] text-sm leading-relaxed text-slate-600">
          Match each face to the Slovak phrase. Quarters and halves name the hour ahead.
        </p>

        <ClockGrid />

        {#if clockDrill}
          <div class="mt-8">
            {@render clockDrill()}
          </div>
        {/if}
      </section>
    {/if}

    {#if topic.examples.length > 0 && !examplesInPattern}
      <section id="examples" class="mt-8" aria-labelledby="examples-heading">
        <h2 id="examples-heading" class={grammarHeadingClass}>In real sentences</h2>

        <div class="mt-3">
          <GrammarExampleList examples={topic.examples} {audioKeys} />
        </div>
      </section>
    {/if}

    {#if words.length > 0 || topics.length > 0}
      <div class="mt-10 grid gap-8 sm:grid-cols-2">
        {#each [{ title: "Words", links: words, sk: true }, { title: "Related", links: topics, sk: false }] as group (group.title)}
          {#if group.links.length > 0}
            <section aria-label={group.title}>
              <h2 class={grammarHeadingClass}>{group.title}</h2>

              <ul class="m-0 mt-2 list-none p-0">
                {#each group.links as link (link.slug)}
                  <li>
                    <a class="group block py-1 no-underline" href={link.href}>
                      <span
                        class="font-serif text-slate-900 group-hover:text-blue-800"
                        lang={group.sk ? "sk" : undefined}
                      >
                        {link.primary}
                      </span>
                      <span
                        class="ml-2 text-sm text-slate-500"
                        lang={group.sk ? undefined : "sk"}
                      >
                        {link.secondary}
                      </span>
                    </a>
                  </li>
                {/each}
              </ul>
            </section>
          {/if}
        {/each}
      </div>
    {/if}

    {#if steps.length > 0}
      <nav
        class="mt-10 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2"
        aria-label="More grammar topics"
      >
        {#each steps as step (step.label)}
          <a
            class="group text-sm no-underline {step.rel === 'next'
              ? 'sm:text-right'
              : ''}"
            href="/grammar/{step.topic.slug}"
            rel={step.rel}
          >
            <span class="text-slate-500">{step.label}</span>
            <span
              class="mt-0.5 block font-serif text-base text-blue-800 group-hover:underline"
            >
              {sentenceCase(step.topic.english)}
            </span>
          </a>
        {/each}
      </nav>
    {/if}

    <p class="m-0 mt-8 text-sm text-slate-500">
      Source:
      <TextLink href={topic.source} rel="noopener noreferrer" target="_blank">
        Jazykovedný ústav Ľudovíta Štúra SAV ↗
      </TextLink>
      <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
      Full attribution on <TextLink href="/references">References</TextLink>.
    </p>
  </PageShell>
</main>
