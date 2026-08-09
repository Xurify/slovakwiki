<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import SlovakAlphabetIllustration from "$lib/components/SlovakAlphabetIllustration.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { sentenceCase } from "$lib/content/search-ui";
  import type { EntryKind, PronunciationTopic } from "$lib/content/types";

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

  const relatedWords = $derived(relatedEntries.filter((entry) => entry.kind === "word"));
  const relatedTopics = $derived(relatedEntries.filter((entry) => entry.kind !== "word"));

  const asideClass =
    "sticky top-(--header-height) h-fit border-l border-slate-200 pl-5 max-[900px]:static max-[900px]:mt-9 max-[900px]:grid max-[900px]:grid-cols-2 max-[900px]:gap-8 max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:pl-0 max-[900px]:pt-6 max-[560px]:grid-cols-1";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <div
      class="grid grid-cols-[minmax(0,1fr)_180px] justify-center gap-10 max-[900px]:block"
    >
      <article class="min-w-0">
        <nav class="mb-5 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
          <TextLink href="/pronunciation">Pronunciation</TextLink>
          <span aria-hidden="true">/</span>
          <span>{topic.pathGroup}</span>
        </nav>

        <header class="border-b border-slate-200 pb-7">
          <h1>{sentenceCase(topic.english)}</h1>
          <p class="mt-2 font-serif text-lg text-blue-800" lang="sk">{topic.slovak}</p>
          <p class="mt-4 max-w-[66ch] font-serif text-lg text-slate-700">
            {topic.summary}
          </p>
        </header>

        <section class="scroll-mt-[72px] pt-8">
          <h2 id="goal-heading" class="mb-3 text-2xl">{topic.goal}</h2>

          {#each topic.body as paragraph (paragraph)}
            <p class="max-w-[66ch] font-serif leading-7 text-slate-700">
              {paragraph}
            </p>
          {/each}
        </section>

        {#if topic.slug === "slovak-alphabet"}
          <section
            class="scroll-mt-[72px] border-t border-slate-200 pt-8"
            aria-labelledby="alphabet-heading"
          >
            <h2 id="alphabet-heading" class="mb-3 text-2xl">Letters</h2>
            <SlovakAlphabetIllustration class="mt-6" />
          </section>
        {/if}

        <section class="scroll-mt-[72px] border-t border-slate-200 pt-8">
          <h2 id="contrast-heading" class="mb-3 text-2xl">Sound contrasts</h2>

          <div
            class="mt-5 grid grid-cols-2 divide-x divide-slate-200 overflow-hidden rounded border border-slate-200 bg-slate-50 max-[560px]:grid-cols-1 max-[560px]:divide-x-0 max-[560px]:divide-y"
          >
            {#each topic.contrasts as contrast (contrast.left)}
              <div class="grid gap-1 p-3.5">
                <strong class="font-serif text-blue-800" lang="sk">
                  {contrast.left} / {contrast.right}
                </strong>
                <span class="text-xs text-slate-500">{contrast.note}</span>
              </div>
            {/each}
          </div>
        </section>

        <section class="scroll-mt-[72px] pt-8">
          <div class="rounded border border-slate-300 bg-blue-50 p-5">
            <h2 id="cue-heading" class="mb-3 text-2xl">How it is formed</h2>
            <p class="mb-0 max-w-[66ch] font-serif leading-7 text-slate-700">
              {topic.mouthCue}
            </p>
          </div>
        </section>

        <section class="scroll-mt-[72px] pt-8">
          <h2 id="practice-heading" class="mb-3 text-2xl">Words and phrase</h2>

          <div class="mt-4 flex flex-wrap gap-2">
            {#each topic.practiceWords as word (word)}
              <span
                class="rounded-full border border-slate-300 px-2.5 py-1.5 font-serif text-blue-800"
                lang="sk"
              >
                {word}
              </span>
            {/each}
          </div>

          <blockquote
            class="mt-4 grid gap-1 border-l-4 border-blue-600 bg-slate-50 px-4 py-3"
          >
            <strong class="font-serif" lang="sk">{topic.practicePhrase.slovak}</strong>
            <span class="text-sm text-slate-500">{topic.practicePhrase.english}</span>
          </blockquote>
        </section>

        <section
          id="source"
          class="scroll-mt-[72px] mt-10 border-t border-slate-200 pt-8"
          aria-labelledby="source-heading"
        >
          <h2 id="source-heading" class="mb-3 text-2xl">Reference</h2>
          <TextLink href={topic.source}>Jazykovedný ústav Ľudovíta Štúra SAV ↗</TextLink>
          <p class="mt-3 text-sm text-slate-500">
            Full attribution on
            <TextLink href="/references">References</TextLink>.
          </p>
        </section>
      </article>

      <aside class={asideClass}>
        <section>
          <Eyebrow compact tone="muted">In this sound</Eyebrow>
          <nav class="grid">
            <a
              class="py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
              href="#goal-heading"
            >
              Hear and say
            </a>
            <a
              class="py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
              href="#contrast-heading"
            >
              Contrasts
            </a>
            <a
              class="py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
              href="#cue-heading"
            >
              Mouth cue
            </a>
            <a
              class="py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
              href="#practice-heading"
            >
              Practice
            </a>
            <a
              class="py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
              href="#source"
            >
              Source
            </a>
          </nav>
        </section>

        {#if relatedWords.length}
          <section>
            <Eyebrow compact tone="muted">Practice words</Eyebrow>
            {#each relatedWords as word (word.slug)}
              <a
                class="grid gap-0.5 py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
                href={word.href}
                lang="sk"
              >
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
              <a
                class="grid gap-0.5 py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
                href={entry.href}
              >
                {entry.english}
                <small class="text-xs text-slate-500">{entry.slovak}</small>
              </a>
            {/each}
          </section>
        {/if}
      </aside>
    </div>
  </PageShell>
</main>
