<script lang="ts">
  import type { Snippet } from "svelte";

  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import SlovakAlphabetIllustration from "$lib/components/reference/SlovakAlphabetIllustration.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import {
    grammarHeadingClass,
    grammarProseClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";

  import { practiceSetById } from "$lib/catalog/practice";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { EntryKind, PronunciationTopic } from "$lib/catalog/types";

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
    audioMount,
  }: {
    topic: PronunciationTopic;
    relatedEntries?: RelatedEntry[];
    audioKeys?: string[];
    audioMount?: Snippet;
  } = $props();

  const practiceSet = $derived(practiceSetById.get(topic.slug));

  const relatedWords = $derived(relatedEntries.filter((entry) => entry.kind === "word"));
  const relatedTopics = $derived(relatedEntries.filter((entry) => entry.kind !== "word"));

  const asideClass =
    "sticky top-(--header-height) h-fit border-l border-slate-200 pl-5 max-[900px]:static max-[900px]:mt-9 max-[900px]:grid max-[900px]:grid-cols-2 max-[900px]:gap-8 max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:pl-0 max-[900px]:pt-6 max-[560px]:grid-cols-1";

  const railLinkClass =
    "py-1.5 font-serif text-sm text-slate-700 no-underline hover:text-blue-800 hover:underline";
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <div
      class="grid grid-cols-[minmax(0,1fr)_180px] justify-center gap-10 max-[900px]:block"
    >
      <article class="min-w-0">
        <header>
          <nav
            class="mb-4 flex flex-wrap gap-2 text-xs text-slate-500"
            aria-label="Breadcrumb"
          >
            <TextLink href="/pronunciation">Pronunciation</TextLink>
            <span aria-hidden="true">/</span>
            <span>{topic.pathGroup}</span>
          </nav>

          <h1 class="m-0 text-[1.85rem] leading-tight sm:text-[2.15rem]">
            {sentenceCase(topic.english)}
          </h1>

          <p class="m-0 mt-1 font-serif text-xl text-blue-800" lang="sk">
            {topic.slovak}
          </p>

          <p class="m-0 mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-slate-600">
            {topic.summary}
          </p>
        </header>

        <section class="mt-8 scroll-mt-[88px]" aria-labelledby="goal-heading">
          <h2 id="goal-heading" class={grammarHeadingClass}>{topic.goal}</h2>

          <div class="mt-3 flex flex-col gap-3">
            {#each topic.body as paragraph (paragraph)}
              <p class={grammarProseClass}>{paragraph}</p>
            {/each}
          </div>
        </section>

        {#if topic.slug === "slovak-alphabet"}
          <section class="mt-8 scroll-mt-[88px]" aria-labelledby="alphabet-heading">
            <h2 id="alphabet-heading" class={grammarHeadingClass}>Letters</h2>
            <SlovakAlphabetIllustration class="mt-4" />
          </section>
        {/if}

        <section class="mt-8 scroll-mt-[88px]" aria-labelledby="contrast-heading">
          <h2 id="contrast-heading" class={grammarHeadingClass}>Sound contrasts</h2>

          <ul
            class="{dataPanelClass} mt-3 grid list-none grid-cols-2 divide-x divide-slate-200 p-0 max-[560px]:grid-cols-1 max-[560px]:divide-x-0 max-[560px]:divide-y"
          >
            {#each topic.contrasts as contrast, index (contrast.left)}
              <li class="flex items-start gap-2 px-4 py-3.5 sm:px-5">
                {#if audioKeys.includes(`contrast-${index}`)}
                  <span
                    class="inline-grid size-11 shrink-0 place-items-center"
                    data-audio-mount={`contrast-${index}`}
                  ></span>
                {/if}

                <span class="grid min-w-0 gap-1">
                  <strong
                    class="font-serif text-lg font-semibold text-slate-900"
                    lang="sk"
                  >
                    {contrast.left} / {contrast.right}
                  </strong>
                  <span class="text-sm text-slate-600">{contrast.note}</span>
                </span>
              </li>
            {/each}
          </ul>
        </section>

        <section
          class="mt-8 scroll-mt-[88px] rounded-(--frame-radius) bg-blue-50 p-5 ring-1 ring-blue-200 ring-inset"
          aria-labelledby="cue-heading"
        >
          <h2 id="cue-heading" class={grammarHeadingClass}>How it is formed</h2>

          <p class="{grammarProseClass} mt-2">{topic.mouthCue}</p>
        </section>

        <section class="mt-8 scroll-mt-[88px]" aria-labelledby="practice-heading">
          <h2 id="practice-heading" class={grammarHeadingClass}>Words and phrase</h2>

          <ul class="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
            {#each topic.practiceWords as word, index (word)}
              <li
                class="inline-flex min-h-11 items-center gap-1 rounded-full border border-slate-300 bg-surface py-1 pr-3 pl-1.5 font-serif text-base text-slate-900 shadow-(--shadow-border)"
                lang="sk"
              >
                {#if audioKeys.includes(`word-${index}`)}
                  <span
                    class="inline-grid size-11 shrink-0 place-items-center"
                    data-audio-mount={`word-${index}`}
                  ></span>
                {/if}
                {word}
              </li>
            {/each}
          </ul>

          <blockquote
            class="mt-4 grid gap-1 rounded-r-(--control-radius) border-l-4 border-blue-600 bg-subtle px-4 py-3"
          >
            <span class="flex items-center gap-2">
              {#if audioKeys.includes("phrase")}
                <span
                  class="inline-grid size-11 shrink-0 place-items-center"
                  data-audio-mount="phrase"
                ></span>
              {/if}
              <strong class="font-serif text-lg text-slate-900" lang="sk">
                {topic.practicePhrase.slovak}
              </strong>
            </span>
            <span class="text-sm text-slate-500">{topic.practicePhrase.english}</span>
          </blockquote>
        </section>

        <p id="source" class="m-0 mt-8 scroll-mt-[88px] text-sm text-slate-500">
          Source:
          <TextLink href={topic.source} rel="noopener noreferrer" target="_blank">
            Jazykovedný ústav Ľudovíta Štúra SAV ↗
          </TextLink>
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          Full attribution on <TextLink href="/references">References</TextLink>.
        </p>
      </article>

      <aside class={asideClass}>
        <section>
          <Eyebrow compact tone="muted">In this sound</Eyebrow>

          <nav class="grid">
            <a class={railLinkClass} href="#goal-heading">Hear and say</a>
            <a class={railLinkClass} href="#contrast-heading">Contrasts</a>
            <a class={railLinkClass} href="#cue-heading">Mouth cue</a>
            <a class={railLinkClass} href="#practice-heading">Words and phrase</a>
            {#if practiceSet}
              <a class={railLinkClass} href="/practice/{topic.slug}"
                >Practice this sound</a
              >
            {/if}
            <a class={railLinkClass} href="#source">Source</a>
          </nav>
        </section>

        {#if relatedWords.length}
          <section>
            <Eyebrow compact tone="muted">Practice words</Eyebrow>

            {#each relatedWords as word (word.slug)}
              <a class="grid gap-0.5 {railLinkClass}" href={word.href} lang="sk">
                {word.slovak}
                <small class="text-xs text-slate-500">{word.english}</small>
              </a>
            {/each}
          </section>
        {/if}

        {#if relatedTopics.length}
          <section>
            <Eyebrow compact tone="muted">Related topics</Eyebrow>

            {#each relatedTopics as entry (entry.slug)}
              <a class="grid gap-0.5 {railLinkClass}" href={entry.href}>
                {entry.english}
                <small class="text-xs text-slate-500">{entry.slovak}</small>
              </a>
            {/each}
          </section>
        {/if}
      </aside>
    </div>
  </PageShell>

  {#if audioMount}
    {@render audioMount()}
  {/if}
</main>
