<script lang="ts">
  import type { Snippet } from "svelte";

  import DictionaryExampleList from "$lib/components/dictionary/DictionaryExampleList.svelte";
  import DictionaryWordFacts from "$lib/components/dictionary/DictionaryWordFacts.svelte";
  import ExternalLookups from "$lib/components/dictionary/ExternalLookups.svelte";
  import GlossWithTerms from "$lib/components/dictionary/GlossWithTerms.svelte";
  import GrammarCallout from "$lib/components/reference/GrammarCallout.svelte";
  import ReferenceRailCard from "$lib/components/reference/ReferenceRailCard.svelte";
  import ReferenceRailList from "$lib/components/reference/ReferenceRailList.svelte";
  import {
    referenceEyebrowClass,
    referenceH2Class,
    referencePageGridClass,
    referenceRailClass,
    referenceSectionClass,
    referenceSectionLeadClass,
  } from "$lib/components/reference/reference-ui";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import {
    buildBrowseQueryHref,
    isBrowseTopicSlug,
  } from "$lib/catalog/dictionary/browse-query";
  import { EXAMPLE_DISPLAY_LIMIT } from "$lib/catalog/dictionary/example-limits";
  import type { DictionaryImageView } from "$lib/catalog/dictionary/images";
  import { senseSectionId } from "$lib/catalog/dictionary/lemma-senses";
  import { partOfSpeechLabel } from "$lib/catalog/dictionary/part-of-speech";
  import { grammarTopicsForWord } from "$lib/catalog/reference/grammar-path";
  import type { ContentEntry, EntryKind, Example } from "$lib/catalog/types";

  interface RelatedEntry {
    english: string;
    href: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  interface SenseView {
    entry: ContentEntry;
    exampleAudioSrcs: string[];
  }

  let {
    audioMount,
    entry,
    exampleAudioSrcs = [],
    image,
    lemmaAudioSrc,
    relatedEntries = [],
    senses,
  }: {
    /** Client island that mounts AudioButtons into `[data-audio-mount]` hosts. */
    audioMount?: Snippet;
    entry: ContentEntry;
    exampleAudioSrcs?: string[];
    image?: DictionaryImageView;
    lemmaAudioSrc?: string;
    relatedEntries?: RelatedEntry[];
    senses?: SenseView[];
  } = $props();

  const senseViews = $derived(
    senses && senses.length > 0 ? senses : [{ entry, exampleAudioSrcs }],
  );
  const multiSense = $derived(senseViews.length > 1);
  const sourceLabel = $derived(
    entry.sourceLabel ?? "Jazykovedný ústav Ľudovíta Štúra SAV",
  );
  const heroGloss = $derived(senseViews.map((sense) => sense.entry.english).join(" · "));
  const categoryTopic = $derived(entry.category.toLocaleLowerCase("en"));
  const categoryHref = $derived(
    isBrowseTopicSlug(categoryTopic)
      ? buildBrowseQueryHref(categoryTopic, "all", 1)
      : null,
  );

  const relatedWords = $derived(
    relatedEntries
      .filter((related) => related.kind === "word")
      .map((related) => ({
        href: related.href,
        primary: related.slovak,
        primaryLang: "sk" as const,
        secondary:
          related.english.toLocaleLowerCase("sk") ===
          related.slovak.toLocaleLowerCase("sk")
            ? undefined
            : related.english,
      })),
  );
  const grammarLinks = $derived(
    grammarTopicsForWord(
      senseViews.map((sense) => sense.entry.slug),
      entry.slovak,
    ).map((topic) => ({
      href: topic.href,
      primary: topic.title,
      secondary: topic.slovak,
      secondaryLang: "sk" as const,
    })),
  );

  function hasOwnSummary(sense: ContentEntry): boolean {
    return (
      Boolean(sense.summary) &&
      sense.summary !== `${sense.slovak} means “${sense.english}.”`
    );
  }

  function onlyPracticeFrames(examples: Example[]): boolean {
    return examples.length > 0 && examples.every((example) => example.isPracticeFrame);
  }

  function visibleExampleItems(
    examples: Example[],
  ): { example: Example; index: number }[] {
    return examples
      .slice(0, EXAMPLE_DISPLAY_LIMIT)
      .map((example, index) => ({ example, index }));
  }
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class={referencePageGridClass}>
      <article class="min-w-0 max-w-[700px]">
        <nav
          class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500"
          aria-label="Breadcrumb"
        >
          <a
            class="font-semibold text-blue-800 underline underline-offset-2"
            href="/dictionary">Dictionary</a
          >

          {#if !multiSense && categoryHref}
            <span aria-hidden="true">/</span>
            <a
              class="font-semibold text-blue-800 underline underline-offset-2"
              href={categoryHref}>{entry.category}</a
            >
          {/if}
        </nav>

        <header class="mt-5">
          <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
            <h1
              id="lemma-heading"
              class="m-0 font-serif text-[clamp(2.75rem,7vw,4.25rem)] leading-[0.95] text-balance"
              lang="sk"
            >
              {entry.slovak}
            </h1>

            {#if lemmaAudioSrc}
              <span class="inline-grid size-12 shrink-0" data-audio-mount="lemma"></span>
            {/if}
          </div>

          <p class="m-0 mt-4 max-w-[46ch] font-serif text-xl leading-snug text-blue-800">
            <GlossWithTerms text={heroGloss} />
          </p>

          {#if multiSense}
            <nav
              class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500"
              aria-label="Meanings"
            >
              <span>{senseViews.length} meanings:</span>
              {#each senseViews as sense, index (sense.entry.slug)}
                <a
                  class="font-semibold text-blue-800 underline underline-offset-2"
                  href="#{senseSectionId(sense.entry.category)}"
                >
                  {index + 1}. {partOfSpeechLabel(sense.entry.category)}
                </a>
              {/each}
            </nav>
          {:else if hasOwnSummary(entry)}
            <Lead class="text-pretty">{entry.summary}</Lead>
          {/if}
        </header>

        {#each senseViews as sense, senseIndex (sense.entry.slug)}
          {@const senseEntry = sense.entry}
          {@const examplesId = multiSense
            ? `${senseSectionId(senseEntry.category)}-examples`
            : "examples"}
          {@const practiceOnly = onlyPracticeFrames(senseEntry.examples)}

          <section
            id={multiSense ? senseSectionId(senseEntry.category) : undefined}
            class={multiSense ? referenceSectionClass : ""}
            aria-labelledby={multiSense
              ? `${senseSectionId(senseEntry.category)}-heading`
              : undefined}
          >
            {#if multiSense}
              <p class={referenceEyebrowClass}>
                Meaning {senseIndex + 1} of {senseViews.length}
              </p>

              <h2
                id={`${senseSectionId(senseEntry.category)}-heading`}
                class="{referenceH2Class} mt-1.5"
              >
                {partOfSpeechLabel(senseEntry.category)}
                <span class="text-blue-800"
                  >— <GlossWithTerms text={senseEntry.english} /></span
                >
              </h2>

              {#if hasOwnSummary(senseEntry)}
                <p class={referenceSectionLeadClass}>{senseEntry.summary}</p>
              {/if}
            {/if}

            {#if senseEntry.body.length > 0}
              <div id={multiSense ? undefined : "usage"} class="mt-8 scroll-mt-24">
                <GrammarCallout
                  tone="look"
                  label="How to use it"
                  text={senseEntry.body}
                />
              </div>
            {/if}

            {#if senseEntry.examples.length > 0}
              <div
                id={examplesId}
                class={multiSense ? "mt-8 scroll-mt-24" : referenceSectionClass}
              >
                {#if multiSense}
                  <h3
                    id={`${examplesId}-heading`}
                    class="m-0 font-serif text-lg tracking-tight text-slate-900"
                  >
                    {practiceOnly ? "Try this pattern" : "In a sentence"}
                  </h3>
                {:else}
                  <h2 id={`${examplesId}-heading`} class={referenceH2Class}>
                    {practiceOnly ? "Try this pattern" : "In a sentence"}
                  </h2>
                {/if}

                {#if practiceOnly}
                  <p class={referenceSectionLeadClass}>
                    A simple practice frame while a corpus example is unavailable.
                  </p>
                {/if}

                <DictionaryExampleList
                  audioKeyPrefix={`s${senseIndex}`}
                  audioSrcs={sense.exampleAudioSrcs}
                  category={entry.category}
                  items={visibleExampleItems(senseEntry.examples)}
                  lemma={entry.slovak}
                />
              </div>
            {/if}
          </section>
        {/each}

        <ExternalLookups
          lemma={entry.slovak}
          dialect={senseViews.some((sense) => sense.entry.dialect === true)}
        />

        <p
          id="source"
          class="m-0 mt-10 scroll-mt-24 text-xs leading-relaxed text-slate-500"
        >
          Source:
          <a
            class="text-blue-800 underline underline-offset-2"
            href={entry.source}
            rel="noopener noreferrer"
            target="_blank"
          >
            {sourceLabel} ↗
          </a>
          {#if entry.sourceNote}
            <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
            {entry.sourceNote}
          {/if}
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          Full attribution on
          <a class="text-blue-800 underline underline-offset-2" href="/references"
            >References</a
          >.
        </p>
      </article>

      <aside class={referenceRailClass} aria-label="About this word">
        {#if image}
          <figure
            id="image"
            class="m-0 scroll-mt-24 overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)"
          >
            <img
              alt={image.caption}
              class="block aspect-[4/3] h-auto w-full bg-slate-50 object-cover"
              decoding="async"
              height="210"
              loading="lazy"
              src={image.src}
              width="280"
            />

            <figcaption class="border-t border-slate-200/70 px-5 py-3">
              <span class="block font-serif text-sm font-semibold text-slate-900">
                {image.caption}
              </span>

              {#if image.artist || image.license || image.sourcePageUrl}
                <span class="mt-1 block text-xs leading-snug text-slate-500">
                  {#if image.artist}
                    {image.artist}
                  {/if}

                  {#if image.license}
                    {#if image.artist}
                      <span aria-hidden="true"> · </span>
                    {/if}
                    {#if image.licenseUrl}
                      <a
                        class="underline decoration-slate-300 hover:text-slate-800"
                        href={image.licenseUrl}
                        rel="noopener noreferrer"
                        target="_blank">{image.license}</a
                      >
                    {:else}
                      {image.license}
                    {/if}
                  {/if}

                  {#if image.sourcePageUrl}
                    <span aria-hidden="true"> · </span>
                    <a
                      class="underline decoration-slate-300 hover:text-slate-800"
                      href={image.sourcePageUrl}
                      rel="noopener noreferrer"
                      target="_blank">Wikimedia</a
                    >
                  {/if}
                </span>
              {/if}
            </figcaption>
          </figure>
        {/if}

        <DictionaryWordFacts senses={senseViews.map((sense) => sense.entry)} />

        {#if grammarLinks.length}
          <ReferenceRailCard
            title="In the grammar"
            headingId="entry-grammar-heading"
            description="Topics that explain how this word behaves."
          >
            <ReferenceRailList items={grammarLinks} />
          </ReferenceRailCard>
        {/if}

        {#if relatedWords.length}
          <ReferenceRailCard
            title="Related words"
            headingId="entry-related-heading"
            description="Learn these alongside it."
          >
            <ReferenceRailList items={relatedWords} />
          </ReferenceRailCard>
        {/if}
      </aside>
    </div>
  </PageShell>

  {#if audioMount}
    {@render audioMount()}
  {/if}
</main>
