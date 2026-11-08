<script lang="ts">
  import type { Snippet } from "svelte";

  import MotifBanner from "$lib/components/lessons/MotifBanner.svelte";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarCaseMap from "$lib/components/reference/GrammarCaseMap.svelte";
  import GrammarContrastList from "$lib/components/reference/GrammarContrastList.svelte";
  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import GrammarPathNeighbors from "$lib/components/reference/GrammarPathNeighbors.svelte";
  import GrammarPatternList from "$lib/components/reference/GrammarPatternList.svelte";
  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import GrammarWatchOut from "$lib/components/reference/GrammarWatchOut.svelte";
  import { episodeForGrammarSlug, episodePath } from "$lib/catalog/listening";
  import { practiceItemHref } from "$lib/catalog/practice";
  import { grammarEntries } from "$lib/catalog/reference/grammar";
  import { grammarMotifId } from "$lib/catalog/reference/grammar-motifs";
  import {
    grammarGroupAnchor,
    grammarNeighbors,
  } from "$lib/catalog/reference/grammar-path";
  import { grammarExamples, patternAnchor } from "$lib/catalog/reference/grammar-pattern";
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
    weakSpots,
  }: {
    topic: GrammarTopic;
    relatedEntries?: RelatedEntry[];
    audioKeys?: string[];
    /** Client island slot from Astro (`client:only` / `client:load`). */
    clockDrill?: Snippet;
    weakSpots?: Snippet;
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

  const studyLinks = $derived(
    [
      topic.lessonLink && {
        href: topic.lessonLink.href,
        kind: "Lesson",
        title: topic.lessonLink.label,
        sk: false,
      },
      practiceHref && {
        href: practiceHref,
        kind: "Practice",
        title: "Exercises on these forms",
        sk: false,
      },
      episode && {
        href: episodePath(episode),
        kind: "Listen",
        title: episode.titleSk,
        sk: true,
      },
    ].filter(
      (link): link is { href: string; kind: string; title: string; sk: boolean } =>
        Boolean(link),
    ),
  );

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

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
      <header class="min-w-0 lg:col-start-1">
        <nav
          class="mb-5 flex flex-wrap gap-2 text-xs text-slate-500"
          aria-label="Breadcrumb"
        >
          <TextLink href="/grammar">Grammar</TextLink>
          <span aria-hidden="true">/</span>
          <TextLink href={areaHref}>{topic.pathGroup}</TextLink>
        </nav>

        <h1 class="text-balance">{sentenceCase(topic.english)}</h1>

        <p class="m-0 mt-2 font-serif text-2xl leading-snug text-blue-800" lang="sk">
          {topic.slovak}
        </p>

        <Lead class="max-w-[60ch] text-pretty">{topic.summary}</Lead>
      </header>

      <aside
        class="flex flex-col gap-8 lg:col-start-2 lg:row-span-3 lg:row-start-1"
        aria-label="Study this topic"
      >
        <div
          class="overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)"
        >
          <div class="relative h-32 overflow-hidden max-lg:h-28">
            <MotifBanner motif={grammarMotifId(topic.slug)} loading="eager" />
          </div>

          {#if studyLinks.length > 0}
            <ul
              class="m-0 list-none divide-y divide-slate-200/70 border-t border-slate-200/70 p-0"
            >
              {#each studyLinks as link (link.href)}
                <li>
                  <a
                    class="group flex items-center justify-between gap-3 px-5 py-3 no-underline transition-colors duration-150 ease-out hover:bg-subtle"
                    href={link.href}
                  >
                    <span class="min-w-0">
                      <span class="block text-xs text-slate-500">{link.kind}</span>

                      <span
                        class={[
                          "mt-0.5 block leading-snug text-slate-900 group-hover:text-blue-800",
                          link.sk ? "font-serif text-base font-semibold" : "text-sm",
                        ]}
                        lang={link.sk ? "sk" : undefined}
                      >
                        {link.title}
                      </span>
                    </span>

                    <ArrowRight class="shrink-0 text-slate-400 group-hover:text-blue-800" />
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        </div>

        <nav
          class="sticky top-24 border-l border-slate-200 pl-4 max-lg:hidden"
          aria-label="On this page"
        >
          <p class="m-0 mb-2 text-sm font-semibold text-slate-500">On this page</p>

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
      </aside>

      <div class="flex min-w-0 flex-col gap-14 sm:gap-20 lg:col-start-1">
        {#if topic.caseOverview}
          <section class="scroll-mt-24" aria-labelledby="cases">
            <h2
              id="cases"
              class="m-0 font-serif text-2xl tracking-tight text-balance text-slate-900 sm:text-[1.75rem]"
            >
              The six cases
            </h2>

            <p class="m-0 mt-2 mb-5 max-w-[65ch] text-base leading-relaxed text-slate-600">
              Learn the nominative first. The rest is a map of common roles — open a case
              for its examples.
            </p>

            <GrammarCaseMap cases={topic.caseOverview} />

            {#if topic.examples.length > 0}
              <div class="mt-10">
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
            <h2
              id="pattern"
              class="m-0 font-serif text-2xl tracking-tight text-balance text-slate-900 sm:text-[1.75rem]"
            >
              {topic.pattern.label}
            </h2>

            {#if topic.pattern.intro}
              <p class="m-0 mt-2 max-w-[65ch] text-base leading-relaxed text-slate-600">
                <GrammarRichText text={topic.pattern.intro} />
              </p>
            {/if}

            <div class="mt-6">
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
              <h2
                id={patternAnchor(extra.label)}
                class="m-0 font-serif text-2xl tracking-tight text-balance text-slate-900 sm:text-[1.75rem]"
              >
                {extra.label}
              </h2>

              {#if extra.intro}
                <p class="m-0 mt-2 max-w-[65ch] text-base leading-relaxed text-slate-600">
                  <GrammarRichText text={extra.intro} />
                </p>
              {/if}

              <div class="mt-6">
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
          <h2
            id="rule-heading"
            class="m-0 font-serif text-2xl tracking-tight text-balance text-slate-900 sm:text-[1.75rem]"
          >
            How it works
          </h2>

          <ol class="m-0 mt-6 flex list-none flex-col gap-4 p-0">
            {#each topic.rule as paragraph, index (paragraph)}
              <li class="grid grid-cols-[1.75rem_minmax(0,1fr)] items-baseline gap-x-3">
                <span
                  class="font-serif text-lg leading-none font-semibold text-slate-400 tabular-nums"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>

                <p
                  class="m-0 max-w-[65ch] text-[1.0625rem] leading-relaxed text-pretty text-slate-800"
                >
                  <GrammarRichText text={paragraph} />
                </p>
              </li>
            {/each}
          </ol>

          <div
            class="mt-8 rounded-(--frame-radius) bg-subtle px-5 py-4 sm:ml-[2.5rem] sm:px-6"
          >
            <p class="m-0 text-sm font-semibold text-slate-500">When you read</p>

            <p class="m-0 mt-1.5 max-w-[65ch] text-base leading-relaxed text-slate-800">
              <GrammarRichText text={topic.lookFor} />
            </p>
          </div>
        </section>

        {#if topic.contrasts}
          <section id="contrasts" class="scroll-mt-24" aria-labelledby="contrasts-heading">
            <h2
              id="contrasts-heading"
              class="m-0 font-serif text-2xl tracking-tight text-balance text-slate-900 sm:text-[1.75rem]"
            >
              {topic.contrasts.label}
            </h2>

            {#if topic.contrasts.intro}
              <p class="m-0 mt-2 max-w-[65ch] text-base leading-relaxed text-slate-600">
                <GrammarRichText text={topic.contrasts.intro} />
              </p>
            {/if}

            <div class="mt-6">
              <GrammarContrastList contrasts={topic.contrasts} {audioKeys} />
            </div>
          </section>
        {/if}

        {#if topic.watchOut.length > 0}
          <GrammarWatchOut items={topic.watchOut} />
        {/if}

        {#if terms.length > 0}
          <section id="terms" class="scroll-mt-24" aria-labelledby="terms-heading">
            <h2
              id="terms-heading"
              class="m-0 font-serif text-2xl tracking-tight text-balance text-slate-900 sm:text-[1.75rem]"
            >
              Key labels
            </h2>

            <!-- Subgrid lines the explanations up in one column, whatever each term's width. -->
            <dl
              class="m-0 mt-6 grid overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border) sm:grid-cols-[max-content_minmax(0,1fr)]"
            >
              {#each terms as term (term.id)}
                <div
                  id={term.id}
                  class="grid scroll-mt-24 gap-x-8 gap-y-2 border-b border-slate-200/70 px-4 py-4 last:border-b-0 sm:col-span-2 sm:grid-cols-subgrid sm:px-5"
                >
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
                      class="m-0 max-w-[65ch] text-base leading-relaxed text-pretty text-slate-700"
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

      <div
        class="flex min-w-0 flex-col gap-12 border-t border-slate-200 pt-10 sm:mt-4 sm:pt-12 lg:col-start-1"
      >
        {#if hasRelated}
          <section id="related" class="scroll-mt-24" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              class="m-0 font-serif text-xl tracking-tight text-slate-900"
            >
              Related
            </h2>

            <!-- Labelled rows like "Look it up elsewhere": the label column is the
                 edge, the links are blue, and nothing needs a box around it. -->
            <dl class="m-0 mt-4 grid gap-y-4">
              {#if words.length > 0}
                <div
                  id="words"
                  class="grid scroll-mt-24 grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-x-4 max-[560px]:grid-cols-1 max-[560px]:gap-y-1.5"
                >
                  <dt class="text-sm text-slate-500">Words</dt>

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
                <div
                  class="grid scroll-mt-24 grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-x-4 max-[560px]:grid-cols-1 max-[560px]:gap-y-1.5"
                >
                  <dt class="text-sm text-slate-500">Topics</dt>

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
