<script lang="ts">
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import SlovakAlphabetIllustration from "$lib/components/reference/SlovakAlphabetIllustration.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import {
    grammarFormClass,
    grammarGlossClass,
    grammarHeadingClass,
    grammarProseClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { pronunciationEntries } from "$lib/catalog/entries";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { EntryKind, PronunciationTopic } from "$lib/catalog/types";
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
  }: {
    topic: PronunciationTopic;
    relatedEntries?: RelatedEntry[];
  } = $props();

  const ordered = pronunciationEntries.toSorted((a, b) => a.order - b.order);
  const index = $derived(ordered.findIndex((entry) => entry.slug === topic.slug));
  const previous = $derived(ordered[index - 1]);
  const next = $derived(ordered[index + 1]);

  const relatedWords = $derived(relatedEntries.filter((entry) => entry.kind === "word"));
  const relatedTopics = $derived(relatedEntries.filter((entry) => entry.kind !== "word"));

  function wordHref(word: string): string | undefined {
    return relatedWords.find((entry) => entry.slovak.toLowerCase() === word.toLowerCase())
      ?.href;
  }

  const steps = $derived(
    [
      previous && { label: "Previous", topic: previous, rel: "prev" },
      next && { label: "Next", topic: next, rel: "next" },
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
        <TextLink href="/pronunciation">Pronunciation</TextLink>
        <span aria-hidden="true">/</span>
        <TextLink href="/pronunciation#{topic.pathGroup.toLowerCase()}">
          {topic.pathGroup}
        </TextLink>
      </nav>

      <h1 class="m-0 text-[1.85rem] leading-tight sm:text-[2.15rem]">
        {sentenceCase(topic.english)}
      </h1>

      <p class="m-0 mt-1 font-serif text-xl text-blue-800" lang="sk">{topic.slovak}</p>

      <p class="m-0 mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-slate-600">
        {topic.summary}
      </p>
    </header>

    {#if topic.slug === "slovak-alphabet"}
      <section class="mt-8" aria-labelledby="letters-heading">
        <h2 id="letters-heading" class={grammarHeadingClass}>Letters</h2>

        <div class="mt-4">
          <SlovakAlphabetIllustration />
        </div>
      </section>
    {/if}

    <section class="mt-8" aria-labelledby="contrast-heading">
      <h2 id="contrast-heading" class={grammarHeadingClass}>Sound pairs</h2>

      <p class="m-0 mt-1.5 text-sm text-slate-600">{topic.goal}</p>

      <ul class="m-0 mt-3 list-none border-t border-slate-200 p-0">
        {#each topic.contrasts as contrast (contrast.left)}
          <li
            class="grid grid-cols-1 items-baseline gap-x-6 gap-y-0.5 border-b border-slate-200 py-2.5 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
          >
            <span class={cx(grammarFormClass, "text-lg")} lang="sk">
              {contrast.left}
              <span
                class="mx-2 font-sans text-base font-normal text-slate-400"
                aria-hidden="true"
              >
                /
              </span>
              <span class="font-normal text-slate-500">{contrast.right}</span>
            </span>

            <span class={grammarGlossClass}>{contrast.note}</span>
          </li>
        {/each}
      </ul>
    </section>

    <section class="mt-8" aria-labelledby="works-heading">
      <h2 id="works-heading" class={grammarHeadingClass}>How it works</h2>

      <div class="mt-3 flex flex-col gap-3">
        {#each topic.body as paragraph (paragraph)}
          <p class={grammarProseClass}>{paragraph}</p>
        {/each}
      </div>

      <p class="m-0 mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-slate-600">
        <span class="font-semibold text-slate-800">When you say it. </span>
        {topic.mouthCue}
      </p>
    </section>

    <section class="mt-8" aria-labelledby="try-heading">
      <h2 id="try-heading" class={grammarHeadingClass}>Try these</h2>

      <p class="m-0 mt-3 font-serif text-xl leading-snug text-slate-900">
        {#each topic.practiceWords as word, index (word)}
          {#if index > 0}
            <span class="mx-2 text-slate-300" aria-hidden="true">·</span>
          {/if}

          {#if wordHref(word)}
            <a
              class="text-blue-800 no-underline hover:underline"
              href={wordHref(word)}
              lang="sk"
            >
              {word}
            </a>
          {:else}
            <span lang="sk">{word}</span>
          {/if}
        {/each}
      </p>

      <div
        class="mt-4 grid grid-cols-1 items-baseline gap-x-6 gap-y-0.5 border-y border-slate-200 py-3 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
      >
        <p class={cx(grammarFormClass, "m-0 text-lg")} lang="sk">
          {topic.practicePhrase.slovak}
        </p>
        <p class={cx(grammarGlossClass, "m-0")}>{topic.practicePhrase.english}</p>
      </div>
    </section>

    {#if relatedWords.length > 0 || relatedTopics.length > 0}
      <div class="mt-10 grid gap-8 sm:grid-cols-2">
        {#if relatedWords.length > 0}
          <section aria-label="Words">
            <h2 class={grammarHeadingClass}>Words</h2>

            <ul class="m-0 mt-2 list-none p-0">
              {#each relatedWords as word (word.slug)}
                <li>
                  <a class="group block py-1 no-underline" href={word.href}>
                    <span
                      class="font-serif text-slate-900 group-hover:text-blue-800"
                      lang="sk"
                    >
                      {word.slovak}
                    </span>
                    <span class="ml-2 text-sm text-slate-500">{word.english}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/if}

        {#if relatedTopics.length > 0}
          <section aria-label="Related">
            <h2 class={grammarHeadingClass}>Related</h2>

            <ul class="m-0 mt-2 list-none p-0">
              {#each relatedTopics as entry (entry.slug)}
                <li>
                  <a class="group block py-1 no-underline" href={entry.href}>
                    <span class="font-serif text-slate-900 group-hover:text-blue-800">
                      {sentenceCase(entry.english)}
                    </span>
                    <span class="ml-2 text-sm text-slate-500" lang="sk"
                      >{entry.slovak}</span
                    >
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      </div>
    {/if}

    {#if steps.length > 0}
      <nav
        class="mt-10 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2"
        aria-label="More pronunciation topics"
      >
        {#each steps as step (step.label)}
          <a
            class="group text-sm no-underline {step.rel === 'next'
              ? 'sm:text-right'
              : ''}"
            href="/pronunciation/{step.topic.slug}"
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
