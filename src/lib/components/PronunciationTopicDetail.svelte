<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { entryBySlug } from "$lib/content/data";
  import type { ContentEntry, PronunciationTopic } from "$lib/content/types";

  let { topic }: { topic: PronunciationTopic } = $props();

  const relatedEntries = $derived(
    topic.related
      .map((slug) => entryBySlug.get(slug))
      .filter((entry): entry is ContentEntry => entry !== undefined),
  );
  const relatedWords = $derived(relatedEntries.filter((entry) => entry.kind === "word"));
  const relatedTopics = $derived(relatedEntries.filter((entry) => entry.kind !== "word"));

  const routeBase: Record<ContentEntry["kind"], string> = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };

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
          <Eyebrow>Pronunciation reference</Eyebrow>
          <h1>{topic.english}</h1>
          <p class="mt-2 font-serif text-lg text-blue-800" lang="sk">{topic.slovak}</p>
          <p class="mt-4 max-w-[66ch] font-serif text-lg text-slate-700">
            {topic.summary}
          </p>
        </header>

        <section class="scroll-mt-[72px] pt-8">
          <Eyebrow>Overview</Eyebrow>
          <h2 id="goal-heading" class="mb-3 text-2xl">{topic.goal}</h2>

          {#each topic.body as paragraph (paragraph)}
            <p class="max-w-[66ch] font-serif leading-7 text-slate-700">
              {paragraph}
            </p>
          {/each}
        </section>

        <section class="scroll-mt-[72px] border-t border-slate-200 pt-8">
          <Eyebrow>Listen for</Eyebrow>
          <h2 id="contrast-heading" class="mb-3 text-2xl">Sound contrasts</h2>

          <div class="mt-5 grid grid-cols-2 gap-2.5 max-[560px]:grid-cols-1">
            {#each topic.contrasts as contrast (contrast.left)}
              <div class="grid gap-1 rounded border border-slate-200 bg-slate-50 p-3.5">
                <strong class="font-serif text-blue-800" lang="sk">
                  {contrast.left} / {contrast.right}
                </strong>
                <span class="text-xs text-slate-500">{contrast.note}</span>
              </div>
            {/each}
          </div>
        </section>

        <section class="scroll-mt-[72px] border-t border-slate-200 pt-8">
          <div class="rounded border border-slate-300 bg-blue-50 p-5">
            <Eyebrow>Articulation</Eyebrow>
            <h2 id="cue-heading" class="mb-3 text-2xl">How it is formed</h2>
            <p class="mb-0 max-w-[66ch] font-serif leading-7 text-slate-700">
              {topic.mouthCue}
            </p>
          </div>
        </section>

        <section class="scroll-mt-[72px] border-t border-slate-200 pt-8">
          <Eyebrow>Examples</Eyebrow>
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
          </nav>
        </section>

        {#if relatedWords.length}
          <section>
            <Eyebrow compact tone="muted">Practice words</Eyebrow>
            {#each relatedWords as word (word.slug)}
              <a
                class="grid gap-0.5 py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
                href="/dictionary/{word.slug}"
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
                href="/{routeBase[entry.kind]}/{entry.slug}"
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
