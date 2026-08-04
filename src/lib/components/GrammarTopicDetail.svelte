<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";

  import FocusedPracticeAction from "$lib/components/FocusedPracticeAction.svelte";
  import { sentenceCase } from "$lib/content/search-ui";
  import type { EntryKind, GrammarTopic } from "$lib/content/types";

  interface RelatedEntry {
    english: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  let {
    topic,
    relatedEntries = [],
  }: {
    topic: GrammarTopic;
    relatedEntries?: RelatedEntry[];
  } = $props();

  const relatedWords = $derived(relatedEntries.filter((entry) => entry.kind === "word"));
  const relatedTopics = $derived(relatedEntries.filter((entry) => entry.kind !== "word"));

  const routeBase: Record<EntryKind, string> = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };
</script>

<main
  class="mx-auto grid max-w-6xl grid-cols-[minmax(0,760px)_210px] justify-center gap-14 px-[30px] py-10 pb-[74px] max-[900px]:block max-[900px]:px-4 max-[900px]:py-8 max-[560px]:px-3 max-[560px]:py-7"
>
  <article class="min-w-0">
    <nav class="mb-5 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <a class="text-blue-800 underline underline-offset-2" href="/grammar">Grammar</a>
      <span>/</span>
      <span>{topic.pathGroup}</span>
    </nav>

    <header class="border-b border-slate-200 pb-7">
      <Eyebrow>Grammar reference</Eyebrow>
      <h1>{sentenceCase(topic.english)}</h1>
      <p class="mt-2 font-serif text-lg text-blue-800" lang="sk">{topic.slovak}</p>
      <p class="mt-4 max-w-[66ch] font-serif text-lg text-slate-700">{topic.summary}</p>
    </header>

    <aside class="mt-6 border-l-4 border-blue-600 bg-blue-50 px-4 py-3">
      <Eyebrow>Look for</Eyebrow>
      <p class="mb-0 max-w-[66ch] font-serif leading-6 text-slate-700">{topic.lookFor}</p>
    </aside>

    {#if topic.lessonLink}
      <aside class="mt-3 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3">
        <Eyebrow>Lesson</Eyebrow>
        <p class="mb-0 font-serif leading-6 text-slate-700">
          See this form used in a short scene, then correct it yourself.
        </p>
        <a
          class="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 underline underline-offset-2"
          href={topic.lessonLink.href}
        >
          {topic.lessonLink.label}
          <ArrowRight />
        </a>
      </aside>
    {/if}

    <section class="scroll-mt-[72px] pt-8">
      <Eyebrow>Core rule</Eyebrow>
      <h2 id="rule-heading" class="mb-3 text-2xl">What changes</h2>

      {#each topic.rule as paragraph (paragraph)}
        <p class="max-w-[66ch] font-serif leading-7 text-slate-700">
          {paragraph}
        </p>
      {/each}
    </section>

    {#if topic.termSections && topic.termSections.length > 0}
      <section class="scroll-mt-[72px] border-t border-slate-200 pt-8">
        <Eyebrow>Terms</Eyebrow>
        <h2 id="terms-heading" class="mb-3 text-2xl">Key labels</h2>

        <dl class="m-0 grid gap-4">
          {#each topic.termSections as section (section.id)}
            <div
              id={section.id}
              class="scroll-mt-[88px] border-l-4 border-blue-600 bg-slate-50 px-4 py-3"
            >
              <dt class="font-serif text-lg font-semibold text-blue-800">
                {section.title}
              </dt>
              <dd class="m-0 mt-1 max-w-[66ch] font-serif leading-6 text-slate-700">
                {section.body}
              </dd>
            </div>
          {/each}
        </dl>
      </section>
    {/if}

    {#if !topic.caseOverview}
      <section class="scroll-mt-[72px] border-t border-slate-200 pt-8">
        <Eyebrow>Pattern</Eyebrow>
        <h2 id="pattern-heading" class="mb-3 text-2xl">{topic.pattern.label}</h2>

        <ul class="mt-5 m-0 list-none rounded border border-slate-200 p-0">
          {#each topic.pattern.lines as line (line)}
            <li
              class="border-b border-slate-200 px-4 py-3 font-serif font-semibold text-blue-800 last:border-b-0"
            >
              {line}
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if topic.caseOverview}
      <section id="case-map" class="scroll-mt-[72px] border-t border-slate-200 pt-8">
        <Eyebrow>Case map</Eyebrow>
        <h2 id="case-map-heading" class="mb-3 text-2xl">The six cases</h2>
        <p class="mb-4 font-serif text-slate-500">
          Learn the nominative first. Use the remaining rows as a map of common roles,
          then open each case for examples.
        </p>

        <ol class="m-0 grid list-none grid-cols-2 gap-2 p-0 max-[560px]:grid-cols-1">
          {#each topic.caseOverview as item (item.name)}
            <li
              class:col-span-full={Boolean(item.explanation)}
              class="min-h-[104px] border border-slate-200 bg-slate-50 hover:bg-blue-50"
            >
              <a class="grid min-h-[102px] gap-1 p-3" href="/grammar/cases/{item.slug}">
                <div class="flex justify-between gap-2">
                  <strong class="font-serif text-blue-800 hover:underline"
                    >{item.name}</strong
                  >
                  {#if item.role}
                    <span class="text-xs text-slate-500">{item.role}</span>
                  {/if}
                </div>

                {#if item.question}
                  <p class="m-0 text-xs text-slate-500">
                    {item.question}
                  </p>
                {/if}
                {#if item.explanation}
                  <small class="font-serif text-sm leading-5 text-slate-700">
                    {item.explanation}
                  </small>
                {/if}
                {#if item.researchPrompt}
                  <small class="text-xs italic text-slate-500">
                    Research: {item.researchPrompt}
                  </small>
                {/if}
              </a>
            </li>
          {/each}
        </ol>
      </section>
    {/if}

    {#if !topic.caseOverview}
      <section class="scroll-mt-[72px] border-t border-slate-200 pt-8">
        <Eyebrow>See it in use</Eyebrow>
        <h2 id="examples-heading" class="mb-3 text-2xl">Examples</h2>

        <ol class="mt-5 grid list-none gap-2 p-0">
          {#each topic.examples as example (example.slovak)}
            <li class="grid gap-1 border-l-4 border-blue-600 bg-slate-50 px-4 py-3">
              <strong class="font-serif" lang="sk">{example.slovak}</strong>
              <span class="text-sm text-slate-500">{example.english}</span>
              {#if example.demonstrates}
                <small class="max-w-[60ch] font-serif text-sm leading-5 text-slate-700">
                  What this shows: {example.demonstrates}
                </small>
              {/if}
              {#if example.practiceItemId}
                <FocusedPracticeAction itemId={example.practiceItemId} />
              {/if}
            </li>
          {/each}
        </ol>
      </section>
    {/if}

    <aside class="mt-7 border border-slate-300 bg-blue-50 p-4">
      <Eyebrow>Note</Eyebrow>
      <p class="mb-0 max-w-[66ch] font-serif leading-7 text-slate-700">
        {topic.watchOut}
      </p>
    </aside>

    <section
      id="source"
      class="scroll-mt-[72px] mt-10 border-t border-slate-200 pt-8"
      aria-labelledby="source-heading"
    >
      <Eyebrow>Source</Eyebrow>
      <h2 id="source-heading" class="mb-3 text-2xl">Reference</h2>
      <a
        class="text-blue-800 underline underline-offset-2"
        href={topic.source}
        rel="noopener noreferrer"
        target="_blank"
      >
        Jazykovedný ústav Ľudovíta Štúra SAV ↗
      </a>
      <p class="mt-3 text-sm text-slate-500">
        Full attribution on
        <a class="text-blue-800 underline underline-offset-2" href="/references"
          >References</a
        >.
      </p>
    </section>
  </article>

  <aside
    class="sticky top-(--header-height) h-fit border-l border-slate-200 pl-5 max-[900px]:static max-[900px]:mt-9 max-[900px]:grid max-[900px]:grid-cols-2 max-[900px]:gap-8 max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:pl-0 max-[900px]:pt-6 max-[560px]:grid-cols-1"
  >
    <section>
      <Eyebrow compact tone="muted">In this topic</Eyebrow>
      <a
        class="block py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
        href="#rule-heading"
      >
        Core rule
      </a>
      {#if topic.termSections && topic.termSections.length > 0}
        <a
          class="block py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
          href="#terms-heading"
        >
          Key labels
        </a>
      {/if}
      {#if topic.caseOverview}
        <a
          class="block py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
          href="#case-map"
        >
          Case map
        </a>
      {:else}
        <a
          class="block py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
          href="#pattern-heading"
        >
          Pattern
        </a>
        <a
          class="block py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
          href="#examples-heading"
        >
          Examples
        </a>
      {/if}
      <a
        class="block py-1.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline"
        href="#source"
      >
        Source
      </a>
    </section>

    {#if relatedWords.length}
      <section>
        <Eyebrow compact tone="muted">Words to know</Eyebrow>
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
</main>
