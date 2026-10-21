<script lang="ts">
  import type { Snippet } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";

  import GrammarCaseMap from "$lib/components/reference/GrammarCaseMap.svelte";
  import GrammarContrastList from "$lib/components/reference/GrammarContrastList.svelte";
  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import GrammarPatternList from "$lib/components/reference/GrammarPatternList.svelte";
  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import GrammarWatchOut from "$lib/components/reference/GrammarWatchOut.svelte";
  import {
    grammarHeadingClass,
    grammarProseClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { ClockGrid } from "$lib/learning/time";
  import {
    episodeForGrammarSlug,
    episodePath,
    grammarListenForSlug,
  } from "$lib/catalog/listening";
  import { practiceItemHref } from "$lib/catalog/practice";
  import {
    grammarGroupAnchor,
    grammarNeighbors,
  } from "$lib/catalog/reference/grammar-path";
  import { patternView } from "$lib/catalog/reference/grammar-pattern";
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
    listen,
    weakSpots,
  }: {
    topic: GrammarTopic;
    relatedEntries?: RelatedEntry[];
    audioKeys?: string[];
    /** Client island slot from Astro (`client:only` / `client:load`). */
    clockDrill?: Snippet;
    listen?: Snippet;
    weakSpots?: Snippet;
  } = $props();

  // Subgrid lines the explanations up in one column, whatever each term's width.
  const termListClass = "m-0 mt-3 grid sm:grid-cols-[max-content_minmax(0,1fr)]";

  const termRowClass = cx(
    "grid scroll-mt-24 gap-x-8 gap-y-2 border-b border-slate-200/70 px-4 py-4 last:border-b-0",
    "sm:col-span-2 sm:grid-cols-subgrid sm:px-5",
  );

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
    const view = patternView(topic.pattern, topic.examples);
    return view.kind === "tiles" && view.tiles.every((tile) => tile.example);
  });

  const practiceHref = $derived(
    topic.examples
      .map(
        (example) => example.practiceItemId && practiceItemHref(example.practiceItemId),
      )
      .find((href) => href),
  );

  const episode = $derived(episodeForGrammarSlug(topic.slug));

  // Astro hands over a named slot even when its condition is false, so the
  // snippet alone does not say whether this topic has a dialogue.
  const hasListen = $derived(Boolean(grammarListenForSlug(topic.slug)));

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
              Listen: {episode.title}
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
            pattern={topic.pattern}
            examples={topic.examples}
            withClocks={isTime}
          >
            {#if topic.pattern.examples?.length}
              <GrammarExampleList
                examples={topic.pattern.examples}
                {audioKeys}
                audioKeyPrefix="pattern-ex"
                framed={false}
              />
            {/if}
          </GrammarPatternList>
        </div>

        {#each topic.morePatterns ?? [] as extra, index (extra.label)}
          <div class="mt-8">
            <h2 class={grammarHeadingClass}>{extra.label}</h2>

            <div class="mt-3">
              <GrammarPatternList pattern={extra}>
                {#if extra.examples?.length}
                  <GrammarExampleList
                    examples={extra.examples}
                    {audioKeys}
                    audioKeyPrefix="more-{index}-ex"
                    framed={false}
                  />
                {/if}
              </GrammarPatternList>
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

      <p class="m-0 mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-slate-800">
        <span class="font-semibold">When you read. </span>
        <GrammarRichText text={topic.lookFor} />
      </p>
    </section>

    {#if listen && hasListen}
      <section id="listen" class="mt-8" aria-labelledby="listen-heading">
        <h2 id="listen-heading" class={grammarHeadingClass}>Hear it</h2>

        <p class="m-0 mt-1.5 mb-4 max-w-[62ch] text-sm leading-relaxed text-slate-600">
          A short conversation that uses the forms above.
        </p>

        {@render listen()}
      </section>
    {/if}

    {#if topic.contrasts}
      <section id="contrasts" class="mt-8" aria-labelledby="contrasts-heading">
        <h2 id="contrasts-heading" class={grammarHeadingClass}>
          {topic.contrasts.label}
        </h2>

        {#if topic.contrasts.intro}
          <p class="m-0 mt-1.5 max-w-[62ch] text-sm leading-relaxed text-slate-600">
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

    {#if weakSpots}
      {@render weakSpots()}
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
                    <a class="group block py-1.5 no-underline" href={link.href}>
                      <span
                        class="block font-serif leading-snug text-slate-900 group-hover:text-blue-800"
                        lang={group.sk ? "sk" : undefined}
                      >
                        {link.primary}
                      </span>
                      <span
                        class="block text-sm leading-snug text-slate-500"
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
