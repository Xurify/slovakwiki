<script lang="ts">
  import { moreLinkClass as sharedMoreLinkClass } from "$lib/components/ui/system-ui";
  import type { Snippet } from "svelte";

  import EntryMeta from "$lib/components/dictionary/EntryMeta.svelte";
  import ExampleRow from "$lib/components/dictionary/ExampleRow.svelte";
  import ExternalLookups from "$lib/components/dictionary/ExternalLookups.svelte";
  import FormsTable from "$lib/components/dictionary/FormsTable.svelte";
  import SenseList from "$lib/components/dictionary/SenseList.svelte";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import {
    grammarHeadingClass,
    grammarProseClass,
  } from "$lib/components/reference/grammar-topic-ui";

  import { FREQUENCY_PART_OF_SPEECH_LABEL } from "$lib/catalog/frequency/types";
  import { declensionRows } from "$lib/catalog/dictionary/declension";
  import type { NearbyEntry } from "$lib/catalog/dictionary/entries-near";
  import { groupExamplesByPattern } from "$lib/catalog/dictionary/example-groups";
  import { EXAMPLE_DISPLAY_LIMIT } from "$lib/catalog/dictionary/example-limits";
  import type { FrequencyNeighbor } from "$lib/catalog/dictionary/frequency-neighbors";
  import type { DictionaryImageView } from "$lib/catalog/dictionary/images";
  import { senseSectionId } from "$lib/catalog/dictionary/lemma-senses";
  import { cx } from "$lib/ui/classes";
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
    entriesNear = [],
    exampleAudioSrcs = [],
    frequencyNeighbors = [],
    image,
    lemmaAudioSrc,
    relatedEntries = [],
    senses,
  }: {
    /** Client island that mounts AudioButtons into `[data-audio-mount]` hosts. */
    audioMount?: Snippet;
    entry: ContentEntry;
    entriesNear?: NearbyEntry[];
    exampleAudioSrcs?: string[];
    frequencyNeighbors?: FrequencyNeighbor[];
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

  /** First N examples for the page; extras stay in data for later picking. */
  const exampleItemsBySense = $derived.by(() => {
    const shown = new Set<string>();
    return senseViews.map((sense) => {
      const examples = sense.entry.examples;
      const limit = Math.min(EXAMPLE_DISPLAY_LIMIT, examples.length);
      const items: { example: Example; index: number }[] = [];
      for (let index = 0; index < limit; index += 1) {
        const example = examples[index]!;
        if (shown.has(example.slovak)) continue;
        items.push({ example, index });
      }
      for (const item of items) shown.add(item.example.slovak);
      return items;
    });
  });

  const forms = $derived(
    entry.declension
      ? declensionRows(entry.slovak, entry.declension, entry.gender)
      : undefined,
  );
  const plural = $derived(entry.declension?.plural[0]);
  const hasExamples = $derived(exampleItemsBySense.some((items) => items.length > 0));
  const hasUsage = $derived(senseViews.some((sense) => sense.entry.body.length > 0));

  type ContentsLink = { href: string; label: string };
  const isLink = (item: ContentsLink | false | undefined): item is ContentsLink =>
    Boolean(item);

  // Main-column sections on the left of the strip, rail sections on the right.
  const mainContents = $derived(
    [
      { href: "#meaning", label: "Meaning" },
      hasExamples && { href: "#examples", label: "Examples" },
      forms && { href: "#forms", label: "Forms" },
      !multiSense && hasUsage && { href: "#usage", label: "Usage" },
      { href: "#lookups", label: "Elsewhere" },
    ].filter(isLink),
  );
  const railContents = $derived(
    [
      entriesNear.length > 0 && { href: "#nearby", label: "Browse" },
      frequencyNeighbors.length > 0 && { href: "#frequency", label: "Frequency" },
      relatedEntries.length > 0 && { href: "#related", label: "Related" },
      { href: "#source", label: "Sources" },
    ].filter(isLink),
  );
  const hasTatoeba = $derived(
    senseViews.some((sense) =>
      sense.entry.examples.some((example) => example.note === "Tatoeba"),
    ),
  );

  const firstLetter = $derived(entry.slovak.at(0) ?? "");

  // Sticky contents strip sits under the header; anchors clear both.
  const sectionClass = "scroll-mt-[calc(var(--header-height)+4rem)]";
  const contentsLinkClass =
    "shrink-0 py-3 text-xs font-bold text-slate-600 no-underline transition-colors hover:text-blue-800";
  const railRowClass =
    "grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] items-baseline gap-x-3 py-1.5";
  const railWordClass = "font-serif text-sm leading-snug break-words text-slate-900";
  const railGlossClass = "text-xs leading-snug text-slate-500";
  const moreLinkClass = `${sharedMoreLinkClass} mt-2`;

  function categoryLabel(category: string): string {
    return (category === "Nouns" ? "noun" : category.replace(/s$/, "")).toLowerCase();
  }

  function glossesFor(senseEntry: ContentEntry): string[] {
    return senseEntry.english
      .split(";")
      .map((part) => part.trim())
      .filter(
        (part) =>
          part &&
          part.toLocaleLowerCase("sk") !== senseEntry.slovak.toLocaleLowerCase("sk"),
      );
  }
</script>

{#snippet exampleList(
  items: { example: Example; index: number }[],
  audioSrcs: string[],
  senseIndex: number,
)}
  <ol class="m-0 list-none p-0">
    {#each items as item (`${item.example.slovak}-${item.index}`)}
      <ExampleRow
        example={item.example}
        lemma={entry.slovak}
        category={entry.category}
        gender={entry.gender}
        audioKey={audioSrcs[item.index] ? `s${senseIndex}-e${item.index}` : undefined}
      />
    {/each}
  </ol>
{/snippet}

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <nav class="mb-4 flex flex-wrap gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/dictionary">Dictionary</TextLink>
      <span aria-hidden="true">/</span>
      <span class="font-serif" lang="sk">{entry.slovak}</span>
    </nav>

    <header class="max-w-2xl">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 id="lemma-heading" class="m-0 text-balance" lang="sk">{entry.slovak}</h1>

        {#if lemmaAudioSrc}
          <span
            class="inline-grid size-11 shrink-0 place-items-center"
            data-audio-mount="lemma"
          ></span>
        {/if}
      </div>

      {#if multiSense}
        <p class="m-0 mt-2 text-sm text-slate-700">
          <span class="font-semibold text-slate-900 italic">
            {senseViews.map((sense) => categoryLabel(sense.entry.category)).join(", ")}
          </span>
        </p>
      {:else}
        <EntryMeta class="mt-2" {entry} {plural} />
      {/if}
    </header>

    <nav
      class="sticky top-(--header-height) z-10 mt-6 flex gap-5 overflow-x-auto border-y border-slate-200 bg-canvas/95 backdrop-blur-sm scrollbar-none"
      aria-label="On this page"
    >
      {#if multiSense}
        {#each senseViews as sense (sense.entry.slug)}
          <a class={contentsLinkClass} href="#{senseSectionId(sense.entry.category)}">
            {sense.entry.category}
          </a>
        {/each}
      {/if}

      {#each mainContents as item (item.href)}
        {#if !(multiSense && item.href === "#meaning")}
          <a class={contentsLinkClass} href={item.href}>{item.label}</a>
        {/if}
      {/each}

      <span class="ml-auto" aria-hidden="true"></span>

      {#each railContents as item (item.href)}
        <a class={contentsLinkClass} href={item.href}>{item.label}</a>
      {/each}
    </nav>

    <div
      class="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start lg:gap-12"
    >
      <article class="min-w-0 space-y-10">
        {#each senseViews as sense, senseIndex (sense.entry.slug)}
          {@const senseEntry = sense.entry}
          {@const glosses = glossesFor(senseEntry)}
          {@const summary =
            senseEntry.summary &&
            senseEntry.summary !== `${senseEntry.slovak} means “${senseEntry.english}.”`
              ? senseEntry.summary
              : undefined}
          {@const examplesId =
            multiSense && senseIndex > 0
              ? `${senseSectionId(senseEntry.category)}-examples`
              : "examples"}
          {@const visibleItems = exampleItemsBySense[senseIndex] ?? []}
          {@const grouped = visibleItems.some((item) => item.example.demonstrates)}

          <section
            id={multiSense ? senseSectionId(senseEntry.category) : "meaning"}
            class={cx(sectionClass, "space-y-8")}
            aria-label={`${senseEntry.slovak}, ${categoryLabel(senseEntry.category)}`}
          >
            <div>
              {#if multiSense}
                <h2 class={grammarHeadingClass}>
                  <span lang="sk">{senseEntry.slovak}</span>
                  <span class="font-sans text-base font-normal text-slate-600 italic">
                    {categoryLabel(senseEntry.category)}
                  </span>
                </h2>

                <EntryMeta class="mt-2" entry={senseEntry} showCategory={false} />
              {:else}
                <h2 class={grammarHeadingClass}>Meanings</h2>
              {/if}

              {#if glosses.length === 0}
                <p class="{grammarProseClass} mt-3">
                  {senseEntry.category === "Places" ? "Place name, written" : "Written"} the
                  same in English.
                </p>
              {:else}
                <SenseList class="mt-3" {glosses} />
              {/if}

              {#if summary}
                <p class="{grammarProseClass} mt-3">{summary}</p>
              {/if}
            </div>

            {#if visibleItems.length > 0}
              <div id={examplesId} class={sectionClass}>
                <h2 class={grammarHeadingClass}>Examples</h2>

                {#if grouped}
                  <div class="mt-3 grid gap-6">
                    {#each groupExamplesByPattern(visibleItems, senseEntry.slovak, senseEntry.category, senseEntry.gender) as group (group.label)}
                      <div>
                        <Eyebrow tone="muted" class="mb-1">{group.label}</Eyebrow>
                        {@render exampleList(
                          group.items,
                          sense.exampleAudioSrcs,
                          senseIndex,
                        )}
                      </div>
                    {/each}
                  </div>
                {:else}
                  <div class="mt-2">
                    {@render exampleList(
                      visibleItems,
                      sense.exampleAudioSrcs,
                      senseIndex,
                    )}
                  </div>
                {/if}

                {#if visibleItems.some((item) => item.example.note === "Tatoeba")}
                  <p class="m-0 mt-3 text-xs text-slate-500">
                    Sentences from
                    <a
                      class="text-blue-800 hover:underline"
                      href="https://tatoeba.org/"
                      rel="noopener noreferrer"
                      target="_blank"
                      >Tatoeba<span class="sr-only"> (opens in a new tab)</span></a
                    >
                    (CC BY 2.0 FR).
                  </p>
                {/if}
              </div>
            {/if}

            {#if senseEntry.body.length > 0}
              <div id={multiSense ? undefined : "usage"} class={sectionClass}>
                <h2 class={grammarHeadingClass}>How to use it</h2>

                <div class="mt-3 flex flex-col gap-3">
                  {#each senseEntry.body as paragraph, index (index)}
                    <p class={grammarProseClass}>{paragraph}</p>
                  {/each}
                </div>
              </div>
            {/if}
          </section>
        {/each}

        {#if forms}
          <section id="forms" class={sectionClass} aria-labelledby="forms-heading">
            <h2 id="forms-heading" class={grammarHeadingClass}>Forms</h2>

            <p class="m-0 mt-1.5 text-sm text-slate-600">
              Six cases, singular and plural. Endings are highlighted; open a case for
              what it does.
            </p>

            <div class="mt-4">
              <FormsTable lemma={entry.slovak} rows={forms} />
            </div>
          </section>
        {/if}

        <ExternalLookups
          lemma={entry.slovak}
          category={entry.category}
          dialect={senseViews.some((sense) => sense.entry.dialect === true)}
        />
      </article>

      <aside class="grid min-w-0 content-start gap-8" aria-label="Word details">
        {#if image}
          <figure class="m-0">
            <img
              alt={image.caption}
              class="block aspect-[5/4] h-auto w-full rounded-(--control-radius) object-cover"
              decoding="async"
              height="280"
              loading="lazy"
              src={image.src}
              width="352"
            />

            <figcaption class="mt-2 text-xs leading-snug text-slate-500">
              <span class="text-slate-700">{image.caption}</span>

              {#if image.artist}
                <span aria-hidden="true"> · </span>
                {#if image.artistUrl}
                  <a
                    class="underline decoration-slate-300 hover:text-blue-800"
                    href={image.artistUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {image.artist}
                    <span class="sr-only"> (opens in a new tab)</span>
                  </a>
                {:else}
                  <span>{image.artist}</span>
                {/if}
              {/if}

              {#if image.license}
                <span aria-hidden="true"> · </span>
                {#if image.licenseUrl}
                  <a
                    class="underline decoration-slate-300 hover:text-blue-800"
                    href={image.licenseUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {image.license}
                    <span class="sr-only"> (opens in a new tab)</span>
                  </a>
                {:else}
                  <span>{image.license}</span>
                {/if}
              {/if}

              {#if image.sourcePageUrl}
                <span aria-hidden="true"> · </span>
                <a
                  class="underline decoration-slate-300 hover:text-blue-800"
                  href={image.sourcePageUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {image.sourceLabel}
                  <span class="sr-only"> (opens in a new tab)</span>
                </a>
              {/if}
            </figcaption>
          </figure>
        {/if}

        {#if entriesNear.length > 0}
          <section id="nearby" class={sectionClass} aria-labelledby="nearby-heading">
            <Eyebrow compact tone="muted">
              <span id="nearby-heading">Browse</span>
            </Eyebrow>

            <ul class="m-0 list-none p-0">
              {#each entriesNear as nearby (nearby.slovak)}
                <li>
                  {#if nearby.current}
                    <span class={railRowClass} aria-current="true">
                      <span class={cx(railWordClass, "justify-self-start")} lang="sk">
                        <span class="rounded-sm bg-mark font-semibold">
                          {nearby.slovak}
                        </span>
                      </span>
                      <span class={cx(railGlossClass, "text-slate-700")}>
                        {nearby.english}
                      </span>
                    </span>
                  {:else}
                    <a class={cx(railRowClass, "group no-underline")} href={nearby.href}>
                      <span
                        class={cx(
                          railWordClass,
                          "group-hover:text-blue-800 group-hover:underline",
                        )}
                        lang="sk"
                      >
                        {nearby.slovak}
                      </span>
                      <span class={railGlossClass}>{nearby.english}</span>
                    </a>
                  {/if}
                </li>
              {/each}
            </ul>

            <a
              class={moreLinkClass}
              href={`/dictionary?letter=${encodeURIComponent(firstLetter.toLocaleLowerCase("sk"))}`}
            >
              More words in {firstLetter.toLocaleUpperCase("sk")}
              <ArrowRight />
            </a>
          </section>
        {/if}

        {#if frequencyNeighbors.length > 0 && entry.frequency}
          <section
            id="frequency"
            class={sectionClass}
            aria-labelledby="frequency-heading"
          >
            <Eyebrow compact tone="muted">
              <span id="frequency-heading">Word frequency</span>
            </Eyebrow>

            <p class="m-0 mb-2 text-xs leading-snug text-slate-500">
              Rank among {FREQUENCY_PART_OF_SPEECH_LABEL[
                entry.frequency.partOfSpeech
              ].toLowerCase()} in the Slovak National Corpus.
            </p>

            <ol class="m-0 list-none p-0">
              {#each frequencyNeighbors as row (row.rank)}
                <li
                  class="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-baseline gap-x-2 py-1.5"
                  aria-current={row.current ? "true" : undefined}
                >
                  <span class="text-xs tabular-nums text-slate-700">#{row.rank}</span>

                  {#if row.href && !row.current}
                    <a
                      class={cx(
                        railWordClass,
                        "no-underline hover:text-blue-800 hover:underline",
                      )}
                      href={row.href}
                      lang="sk"
                    >
                      {row.lemma}
                    </a>
                  {:else}
                    <span class={railWordClass} lang="sk">
                      <span
                        class={row.current
                          ? "rounded-sm bg-mark font-semibold"
                          : undefined}
                      >
                        {row.lemma}
                      </span>
                    </span>
                  {/if}

                  <span class="text-xs tabular-nums text-slate-500">
                    {#if row.count}
                      {row.count.toLocaleString("en")}
                    {/if}
                  </span>
                </li>
              {/each}
            </ol>

            <a
              class={moreLinkClass}
              href={`/dictionary/common/${entry.frequency.partOfSpeech}`}
            >
              Most common {FREQUENCY_PART_OF_SPEECH_LABEL[
                entry.frequency.partOfSpeech
              ].toLowerCase()}
              <ArrowRight />
            </a>
          </section>
        {/if}

        {#if relatedEntries.length}
          <section id="related" class={sectionClass} aria-labelledby="related-heading">
            <Eyebrow compact tone="muted">
              <span id="related-heading">Related words</span>
            </Eyebrow>

            <ul class="m-0 list-none p-0">
              {#each relatedEntries as relatedEntry (relatedEntry.slug)}
                <li>
                  <a
                    class={cx(railRowClass, "group no-underline")}
                    href={relatedEntry.href}
                  >
                    <span
                      class={cx(
                        railWordClass,
                        "group-hover:text-blue-800 group-hover:underline",
                      )}
                      lang="sk"
                    >
                      {relatedEntry.slovak}
                    </span>
                    <span class={railGlossClass}>{relatedEntry.english}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/if}

        <section id="source" class={sectionClass} aria-labelledby="source-heading">
          <Eyebrow compact tone="muted">
            <span id="source-heading">Sources</span>
          </Eyebrow>

          <dl class="m-0 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-y-2 text-sm">
            <dt class="text-slate-500">Meaning</dt>
            <dd class="m-0">
              <a class="text-blue-800 no-underline hover:underline" href={entry.source}>
                {sourceLabel}
              </a>
            </dd>

            {#if entry.frequency}
              <dt class="text-slate-500">Frequency</dt>
              <dd class="m-0 text-slate-700">Slovak National Corpus</dd>
            {/if}

            {#if hasTatoeba}
              <dt class="text-slate-500">Sentences</dt>
              <dd class="m-0 text-slate-700">
                <a
                  class="text-blue-800 no-underline hover:underline"
                  href="https://tatoeba.org/"
                >
                  Tatoeba
                </a>
                (CC BY 2.0 FR)
              </dd>
            {/if}
          </dl>

          {#if entry.sourceNote}
            <p class="m-0 mt-3 text-xs leading-relaxed text-pretty text-slate-500">
              {entry.sourceNote}
            </p>
          {/if}

          <a class={moreLinkClass} href="/references">
            All references
            <ArrowRight />
          </a>
        </section>
      </aside>
    </div>
  </PageShell>

  {#if audioMount}
    {@render audioMount()}
  {/if}
</main>
