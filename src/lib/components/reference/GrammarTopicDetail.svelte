<script lang="ts">
  import type { Snippet } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";

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
    grammarSectionHeadingClass,
  } from "$lib/components/reference/grammar-topic-ui";
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
  const termListClass = "m-0 mt-4 grid sm:grid-cols-[max-content_minmax(0,1fr)]";

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

  const hasRelated = $derived(words.length > 0 || relatedTopics.length > 0);

  const contents = $derived(
    [
      topic.caseOverview
        ? { href: "#cases", label: "The six cases" }
        : { href: "#pattern", label: topic.pattern.label },
      ...(topic.caseOverview ? [] : (topic.morePatterns ?? [])).map((extra) => ({
        href: `#${patternAnchor(extra.label)}`,
        label: extra.label,
      })),
      { href: "#rule", label: "How it works" },
      topic.contrasts && { href: "#contrasts", label: topic.contrasts.label },
      topic.watchOut.length > 0 && { href: "#watch-out", label: "Watch out" },
      terms.length > 0 && { href: "#terms", label: "Key labels" },
      // Astro hands over the drill's slot on every topic, so ask the data.
      isTime && { href: "#clock-drill", label: "Clock drill" },
      hasRelated && { href: "#related", label: "Related" },
      { href: "#path", label: "Grammar path" },
    ].filter((item): item is { href: string; label: string } => Boolean(item)),
  );
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[680px] min-[1180px]:max-w-none">
    <!-- From 1180px the margin has room for the page's contents. The text
         column stays 680px and centred, so nothing under it moves. -->
    <div
      class={cx(
        "min-[1180px]:grid min-[1180px]:gap-x-10",
        "min-[1180px]:grid-cols-[minmax(0,1fr)_minmax(0,680px)_minmax(0,1fr)]",
      )}
    >
      <header class="min-[1180px]:col-start-2">
        <nav
          class="mb-4 flex flex-wrap gap-2 text-xs text-slate-500"
          aria-label="Breadcrumb"
        >
          <TextLink href="/grammar">Grammar</TextLink>
          <span aria-hidden="true">/</span>
          <TextLink href={areaHref}>{topic.pathGroup}</TextLink>
        </nav>

        <h1 class="m-0 text-[1.85rem] leading-tight text-balance sm:text-[2.15rem]">
          {sentenceCase(topic.english)}
        </h1>

        <p class="m-0 mt-1 font-serif text-xl text-blue-800" lang="sk">{topic.slovak}</p>

        <p
          class="m-0 mt-4 max-w-[60ch] text-lg leading-relaxed text-pretty text-slate-700"
        >
          {topic.summary}
        </p>

        {#if topic.lessonLink || practiceHref || episode}
          <p class="m-0 mt-5 flex flex-wrap gap-x-6 gap-y-2">
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

      <nav
        class={cx(
          "sticky top-[calc(var(--header-height)+2rem)] hidden w-full max-w-44 self-start justify-self-end",
          "min-[1180px]:col-start-1 min-[1180px]:row-span-2 min-[1180px]:row-start-2 min-[1180px]:mt-14 min-[1180px]:block",
        )}
        aria-label="On this page"
      >
        <Eyebrow compact tone="muted">On this page</Eyebrow>

        <ol class="m-0 flex list-none flex-col p-0">
          {#each contents as item (item.href)}
            <li>
              <a
                class="block py-1.5 font-serif text-sm leading-snug text-pretty text-slate-700 no-underline transition-colors duration-150 ease-out hover:text-blue-800 hover:underline"
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          {/each}
        </ol>
      </nav>

      <!-- Sections sit twice as far apart as the parts inside one, so each
           reads as its own block before its heading is read. -->
      <div
        class="mt-12 flex flex-col gap-12 sm:mt-14 sm:gap-16 min-[1180px]:col-start-2 min-[1180px]:row-start-2"
      >
        {#if topic.caseOverview}
          <section class="scroll-mt-24" aria-labelledby="cases">
            <h2 id="cases" class={grammarSectionHeadingClass}>The six cases</h2>

            <p class="{grammarIntroClass} mt-1.5 mb-4">
              Learn the nominative first. The rest is a map of common roles — open a case
              for its examples.
            </p>

            <GrammarCaseMap cases={topic.caseOverview} />

            {#if topic.examples.length > 0}
              <div class="mt-8">
                <GrammarExampleList
                  examples={topic.examples}
                  {audioKeys}
                  label="Examples"
                />
              </div>
            {/if}
          </section>
        {:else}
          <section class="scroll-mt-24" aria-labelledby="pattern">
            <h2 id="pattern" class={grammarSectionHeadingClass}>{topic.pattern.label}</h2>

            {#if topic.pattern.intro}
              <p class="{grammarIntroClass} mt-1.5">
                <GrammarRichText text={topic.pattern.intro} />
              </p>
            {/if}

            <div class="mt-4">
              <GrammarPatternList
                pattern={topic.pattern}
                examples={topic.examples}
                {audioKeys}
                withClocks={isTime}
              />
            </div>
          </section>

          {#each topic.morePatterns ?? [] as extra, index (extra.label)}
            <section class="scroll-mt-24" aria-labelledby={patternAnchor(extra.label)}>
              <h2 id={patternAnchor(extra.label)} class={grammarSectionHeadingClass}>
                {extra.label}
              </h2>

              {#if extra.intro}
                <p class="{grammarIntroClass} mt-1.5">
                  <GrammarRichText text={extra.intro} />
                </p>
              {/if}

              <div class="mt-4">
                <GrammarPatternList
                  pattern={extra}
                  examples={extra.examples}
                  {audioKeys}
                  audioKeyPrefix="more-{index}-ex"
                />
              </div>
            </section>
          {/each}
        {/if}

        <section id="rule" class="scroll-mt-24" aria-labelledby="rule-heading">
          <h2 id="rule-heading" class={grammarSectionHeadingClass}>How it works</h2>

          <div class="mt-4 flex flex-col gap-3">
            {#each topic.rule as paragraph (paragraph)}
              <p class={grammarProseClass}><GrammarRichText text={paragraph} /></p>
            {/each}
          </div>

          <!-- A tip for reading, not one more rule: its own tint keeps it from
               reading as a fifth paragraph of the rules above. -->
          <div class="mt-6 rounded-(--frame-radius) bg-subtle px-4 py-3.5 sm:px-5">
            <p class={eyebrowMutedClass}>When you read</p>

            <p class="{grammarProseClass} mt-1">
              <GrammarRichText text={topic.lookFor} />
            </p>
          </div>
        </section>

        {#if topic.contrasts}
          <section id="contrasts" class="scroll-mt-24" aria-labelledby="contrasts-heading">
            <h2 id="contrasts-heading" class={grammarSectionHeadingClass}>
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

        {#if topic.watchOut.length > 0}
          <GrammarWatchOut items={topic.watchOut} />
        {/if}

        {#if terms.length > 0}
          <section id="terms" class="scroll-mt-24" aria-labelledby="terms-heading">
            <h2 id="terms-heading" class={grammarSectionHeadingClass}>Key labels</h2>

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
                    <p
                      class="m-0 text-[0.95rem] leading-relaxed text-pretty text-slate-700"
                    >
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

        {#if clockDrill}
          {@render clockDrill()}
        {/if}

        {#if weakSpots}
          {@render weakSpots()}
        {/if}
      </div>

      <!-- Where to go next. One rule ends the topic, and these headings sit a
           step below the sections above it. -->
      <div
        class="mt-12 flex flex-col gap-12 border-t border-slate-200 pt-10 sm:mt-16 sm:pt-12 min-[1180px]:col-start-2 min-[1180px]:row-start-3"
      >
        {#if hasRelated}
          <section id="related" class="scroll-mt-24" aria-labelledby="related-heading">
            <h2 id="related-heading" class={grammarHeadingClass}>Related</h2>

            <!-- Labelled rows like "Look it up elsewhere": the label column is the
                 edge, the links are blue, and nothing needs a box around it. -->
            <dl class="m-0 mt-4 grid gap-y-4">
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

                            <span
                              class="ml-1.5 font-serif text-sm text-slate-500"
                              lang="sk"
                            >
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

        <p class="m-0 text-sm text-slate-500">
          Source:
          <TextLink href={topic.source} rel="noopener noreferrer" target="_blank">
            Jazykovedný ústav Ľudovíta Štúra SAV ↗
          </TextLink>
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          Full attribution on <TextLink href="/references">References</TextLink>.
        </p>
      </div>
    </div>
  </PageShell>
</main>
