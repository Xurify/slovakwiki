<script lang="ts">
  import type { Snippet } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";

  import GrammarCaseMap from "$lib/components/reference/GrammarCaseMap.svelte";
  import GrammarContrastList from "$lib/components/reference/GrammarContrastList.svelte";
  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import GrammarPathNeighbors from "$lib/components/reference/GrammarPathNeighbors.svelte";
  import GrammarPatternList from "$lib/components/reference/GrammarPatternList.svelte";
  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import GrammarWatchOut from "$lib/components/reference/GrammarWatchOut.svelte";
  import {
    grammarHeadingClass,
    grammarIntroClass,
    grammarProseClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { ClockGrid } from "$lib/learning/time";
  import { episodeForGrammarSlug, episodePath } from "$lib/catalog/listening";
  import { practiceItemHref } from "$lib/catalog/practice";
  import { grammarEntries } from "$lib/catalog/reference/grammar";
  import {
    grammarGroupAnchor,
    grammarNeighbors,
  } from "$lib/catalog/reference/grammar-path";
  import { grammarExamples, patternAnchor } from "$lib/catalog/reference/grammar-pattern";
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
    weakSpots,
  }: {
    topic: GrammarTopic;
    relatedEntries?: RelatedEntry[];
    audioKeys?: string[];
    /** Client island slot from Astro (`client:only` / `client:load`). */
    clockDrill?: Snippet;
    weakSpots?: Snippet;
  } = $props();

  // Subgrid lines the explanations up in one column, whatever each term's width.
  const termListClass = "m-0 mt-3 grid sm:grid-cols-[max-content_minmax(0,1fr)]";

  const termRowClass = cx(
    "grid scroll-mt-24 gap-x-8 gap-y-2 border-b border-slate-200/70 px-4 py-4 last:border-b-0",
    "sm:col-span-2 sm:grid-cols-subgrid sm:px-5",
  );

  const relatedRowClass =
    "grid scroll-mt-24 grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-x-4 max-[560px]:grid-cols-1 max-[560px]:gap-y-1.5";

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

  /** Topics the path below already shows are left out, so nothing is listed twice. */
  const relatedTopics = $derived.by(() => {
    const onPath = new Set([neighbors.previous?.slug, neighbors.next?.slug]);
    return topic.related
      .filter((slug) => !onPath.has(slug))
      .map((slug) => grammarEntries.find((entry) => entry.slug === slug))
      .filter((entry) => entry !== undefined);
  });

  const practiceHref = $derived(
    grammarExamples(topic)
      .map(
        (example) => example.practiceItemId && practiceItemHref(example.practiceItemId),
      )
      .find((href) => href),
  );

  const episode = $derived(episodeForGrammarSlug(topic.slug));
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[680px]">
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

      <p class="m-0 mt-3 max-w-[75ch] text-[1.02rem] leading-relaxed text-slate-600">
        {topic.summary}
      </p>

      {#if topic.lessonLink || practiceHref || episode}
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

          {#if episode}
            <TextLink
              href={episodePath(episode)}
              class="inline-flex items-center gap-1.5"
            >
              <span>Listen: <span lang="sk">{episode.titleSk}</span></span>
              <ArrowRight />
            </TextLink>
          {/if}
        </p>
      {/if}
    </header>

    <div class="mt-8">
      {#if topic.caseOverview}
        <h2 id="cases" class={grammarHeadingClass}>The six cases</h2>

        <p class="{grammarIntroClass} mt-1.5 mb-4">
          Learn the nominative first. The rest is a map of common roles — open a case for
          its examples.
        </p>

        <GrammarCaseMap cases={topic.caseOverview} />

        {#if topic.examples.length > 0}
          <div class="mt-4">
            <GrammarExampleList examples={topic.examples} {audioKeys} label="Examples" />
          </div>
        {/if}
      {:else}
        <h2 id="pattern" class={grammarHeadingClass}>{topic.pattern.label}</h2>

        {#if topic.pattern.intro}
          <p class="{grammarIntroClass} mt-1.5">
            <GrammarRichText text={topic.pattern.intro} />
          </p>
        {/if}

        {#if isTime}
          <p class="m-0 mt-1.5 text-sm text-slate-600">
            A note marks the rows that name the hour you are heading toward.
          </p>
        {/if}

        <div class="mt-3">
          <GrammarPatternList
            pattern={topic.pattern}
            examples={topic.examples}
            {audioKeys}
            withClocks={isTime}
          />
        </div>

        {#each topic.morePatterns ?? [] as extra, index (extra.label)}
          <div class="mt-8">
            <h2 id={patternAnchor(extra.label)} class={grammarHeadingClass}>
              {extra.label}
            </h2>

            {#if extra.intro}
              <p class="{grammarIntroClass} mt-1.5">
                <GrammarRichText text={extra.intro} />
              </p>
            {/if}

            <div class="mt-3">
              <GrammarPatternList
                pattern={extra}
                examples={extra.examples}
                {audioKeys}
                audioKeyPrefix="more-{index}-ex"
              />
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <section id="rule" class="mt-8" aria-labelledby="rule-heading">
      <h2 id="rule-heading" class={grammarHeadingClass}>How it works</h2>

      <div class="mt-3 flex flex-col gap-3">
        {#each topic.rule as paragraph (paragraph)}
          <p class={grammarProseClass}><GrammarRichText text={paragraph} /></p>
        {/each}
      </div>

      <p class="{grammarProseClass} mt-3">
        <span class="font-semibold">When you read. </span>
        <GrammarRichText text={topic.lookFor} />
      </p>
    </section>

    {#if topic.contrasts}
      <section id="contrasts" class="mt-8" aria-labelledby="contrasts-heading">
        <h2 id="contrasts-heading" class={grammarHeadingClass}>
          {topic.contrasts.label}
        </h2>

        {#if topic.contrasts.intro}
          <p class="{grammarIntroClass} mt-1.5">
            <GrammarRichText text={topic.contrasts.intro} />
          </p>
        {/if}

        <div class="mt-4">
          <GrammarContrastList contrasts={topic.contrasts} {audioKeys} />
        </div>
      </section>
    {/if}

    <GrammarWatchOut items={topic.watchOut} />

    {#if terms.length > 0}
      <section id="terms" class="mt-8" aria-labelledby="terms-heading">
        <h2 id="terms-heading" class={grammarHeadingClass}>Key labels</h2>

        <dl class={cx(dataPanelClass, termListClass)}>
          {#each terms as term (term.id)}
            <div id={term.id} class={termRowClass}>
              <dt class="flex flex-col gap-0.5">
                <span
                  class="font-serif text-lg leading-snug font-semibold text-slate-900"
                  lang={term.gloss ? "sk" : undefined}
                >
                  {term.term}
                </span>

                {#if term.gloss}
                  <span class="text-sm text-slate-500">{term.gloss}</span>
                {/if}
              </dt>

              <dd class="m-0 flex flex-col gap-2">
                <p class="m-0 text-[0.95rem] leading-relaxed text-pretty text-slate-700">
                  <GrammarRichText text={term.body} />
                </p>

                {#if term.examples?.length}
                  <ul
                    class="m-0 flex list-none flex-wrap gap-x-1.5 gap-y-1 p-0"
                    lang="sk"
                  >
                    {#each term.examples as example (example)}
                      <li
                        class="rounded-sm bg-subtle px-2 py-0.5 font-serif text-[0.95rem] text-slate-900"
                      >
                        {example}
                      </li>
                    {/each}
                  </ul>
                {/if}
              </dd>
            </div>
          {/each}
        </dl>
      </section>
    {/if}

    {#if isTime}
      <section id="clock-faces" class="mt-8" aria-labelledby="clock-heading">
        <h2 id="clock-heading" class={grammarHeadingClass}>See the time</h2>

        <p class="{grammarIntroClass} mt-1.5 mb-4">
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

    {#if weakSpots}
      {@render weakSpots()}
    {/if}

    {#if words.length > 0 || relatedTopics.length > 0}
      <section id="related" class="mt-8" aria-labelledby="related-heading">
        <h2 id="related-heading" class={grammarHeadingClass}>Related</h2>

        <!-- Labelled rows like "Look it up elsewhere": the label column is the
             edge, the links are blue, and nothing needs a box around it. -->
        <dl class="m-0 mt-3 grid gap-y-4">
          {#if words.length > 0}
            <div id="words" class={relatedRowClass}>
              <dt class="text-[0.8rem] font-medium text-slate-600">Words</dt>

              <dd class="m-0">
                <ul class="m-0 flex list-none flex-wrap gap-x-6 gap-y-1.5 p-0">
                  {#each words as link (link.slug)}
                    <li>
                      <a class="group no-underline" href={link.href}>
                        <span
                          class="font-serif text-lg leading-snug font-semibold text-blue-800 underline-offset-2 group-hover:underline"
                          lang="sk"
                        >
                          {link.primary}
                        </span>

                        <span class="ml-1 text-sm text-slate-500">{link.secondary}</span>
                      </a>
                    </li>
                  {/each}
                </ul>
              </dd>
            </div>
          {/if}

          {#if relatedTopics.length > 0}
            <div class={relatedRowClass}>
              <dt class="text-[0.8rem] font-medium text-slate-600">Topics</dt>

              <dd class="m-0">
                <ul class="m-0 grid list-none gap-y-2.5 p-0">
                  {#each relatedTopics as related (related.slug)}
                    <li>
                      <a class="group no-underline" href="/grammar/{related.slug}">
                        <span
                          class="font-serif text-lg leading-snug font-semibold text-blue-800 underline-offset-2 group-hover:underline"
                        >
                          {sentenceCase(related.english)}
                        </span>

                        <span class="ml-1.5 font-serif text-sm text-slate-500" lang="sk">
                          {related.slovak}
                        </span>
                      </a>

                      <p
                        class="m-0 mt-0.5 text-sm leading-snug text-pretty text-slate-600"
                      >
                        {related.summary}
                      </p>
                    </li>
                  {/each}
                </ul>
              </dd>
            </div>
          {/if}
        </dl>
      </section>
    {/if}

    <GrammarPathNeighbors {topic} />

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
