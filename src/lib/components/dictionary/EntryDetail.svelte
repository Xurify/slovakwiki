<script lang="ts">
  import type { Snippet } from "svelte";

  import ExternalLookups from "$lib/components/dictionary/ExternalLookups.svelte";
  import GlossWithTerms from "$lib/components/dictionary/GlossWithTerms.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { FREQUENCY_PART_OF_SPEECH_LABEL } from "$lib/catalog/frequency/types";
  import { declensionRows } from "$lib/catalog/dictionary/declension";
  import type { NearbyEntry } from "$lib/catalog/dictionary/entries-near";
  import { EXAMPLE_DISPLAY_LIMIT } from "$lib/catalog/dictionary/example-limits";
  import type { FrequencyNeighbor } from "$lib/catalog/dictionary/frequency-neighbors";
  import { highlightLemmaInText } from "$lib/catalog/dictionary/highlight-lemma";
  import type { DictionaryImageView } from "$lib/catalog/dictionary/images";
  import { senseSectionId } from "$lib/catalog/dictionary/lemma-senses";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import { cx } from "$lib/ui/classes";
  import {
    REGISTER_CHIP_LABEL,
    DIALECT_CHIP_LABEL,
    nounGenderLabel,
    type ContentEntry,
    type EntryKind,
    type Example,
    type NounGender,
    type PluralOnlyGender,
  } from "$lib/catalog/types";

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
  const heroGloss = $derived(
    multiSense
      ? senseViews.map((sense) => sense.entry.english).join(" · ")
      : entry.english,
  );
  const glossSenses = $derived(
    multiSense
      ? []
      : entry.english
          .split(";")
          .map((part) => part.trim())
          .filter(Boolean),
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

  // Main-column sections on the left of the strip, data-column ones on the right.
  const mainContents = $derived(
    [
      hasExamples && { href: "#examples", label: "Examples" },
      forms && { href: "#forms", label: "Forms" },
      !multiSense && hasUsage && { href: "#usage", label: "Usage" },
      { href: "#lookups", label: "Elsewhere" },
    ].filter(isLink),
  );
  const dataContents = $derived(
    [
      frequencyNeighbors.length > 0 && { href: "#frequency", label: "Frequency" },
      relatedEntries.length > 0 && { href: "#related", label: "Related" },
      entriesNear.length > 0 && { href: "#nearby", label: "Nearby" },
      { href: "#source", label: "Sources" },
    ].filter(isLink),
  );
  const hasTatoeba = $derived(
    senseViews.some((sense) =>
      sense.entry.examples.some((example) => example.note === "Tatoeba"),
    ),
  );

  // Longman-style frequency dots: three for the top 500 of a word class.
  const frequencyDots = $derived(
    entry.frequency
      ? entry.frequency.rank <= 500
        ? 3
        : entry.frequency.rank <= 2000
          ? 2
          : 1
      : 0,
  );

  const genderLinkClass = cx(
    "text-slate-700",
    "underline decoration-slate-300 decoration-dotted underline-offset-4",
    "hover:text-slate-900 hover:decoration-slate-500",
  );

  /** Section title in the main column (Cambridge / SpanishDict weight). */
  const headingClass = "m-0 text-[1.35rem] font-bold tracking-[-0.015em]";
  const subheadingClass = "m-0 text-[1rem] font-bold tracking-normal";
  const railHeadingClass =
    "m-0 border-b-2 border-slate-900 pb-1.5 text-[0.95rem] font-bold tracking-normal";
  const proseClass =
    "m-0 max-w-[66ch] text-[1rem] leading-relaxed text-pretty text-slate-700";
  const sectionClass = "scroll-mt-[124px]";
  const railRowClass =
    "group grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-baseline gap-x-3 border-b border-slate-200 py-1.5";
  const railLinkClass = "font-serif text-[1rem] text-blue-800 group-hover:underline";
  const markClass = "rounded-[2px] bg-mark px-px font-semibold";
  const contentsLinkClass =
    "shrink-0 border-b-2 border-transparent py-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-slate-600 hover:border-slate-900 hover:text-slate-900";

  function onlyPracticeFrames(examples: Example[]): boolean {
    return examples.length > 0 && examples.every((example) => example.isPracticeFrame);
  }

  function groupExamplesByPattern(
    items: { example: Example; index: number }[],
  ): { label: string; items: { example: Example; index: number }[] }[] {
    const groups: {
      label: string;
      items: { example: Example; index: number }[];
    }[] = [];
    const indexByLabel = new Map<string, number>();

    for (const item of items) {
      const label = item.example.demonstrates?.trim() || "Other";
      const existing = indexByLabel.get(label);
      if (existing === undefined) {
        indexByLabel.set(label, groups.length);
        groups.push({ label, items: [item] });
      } else {
        groups[existing]!.items.push(item);
      }
    }

    return groups;
  }

  function highlightLemma(slovakLine: string, lemma: string) {
    return highlightLemmaInText(slovakLine, lemma, entry.category);
  }

  function categoryLabel(category: string): string {
    return (category === "Nouns" ? "noun" : category.replace(/s$/, "")).toLowerCase();
  }
</script>

{#snippet genderLabel(gender: NounGender, pluralOnlyGender: PluralOnlyGender | undefined)}
  {@const label = nounGenderLabel(gender, pluralOnlyGender)}

  <a
    class={genderLinkClass}
    href="/grammar/grammatical-gender"
    title={`In Slovak: ${label.slovak}`}
  >
    {label.english}
  </a>
{/snippet}

{#snippet exampleRow(
  item: { example: Example; index: number },
  audioSrcs: string[],
  senseIndex: number,
)}
  <li
    class="group/row grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-x-3 border-b border-slate-200 py-3 last:border-b-0 max-[560px]:grid-cols-[2rem_minmax(0,1fr)]"
  >
    <span class="grid h-7 place-items-center">
      {#if audioSrcs[item.index]}
        <span
          class="inline-grid size-7 place-items-center"
          data-audio-mount={`s${senseIndex}-e${item.index}`}
        ></span>
      {:else}
        <span class="text-[0.8rem] text-slate-400" aria-hidden="true">•</span>
      {/if}
    </span>

    <div class="min-w-0">
      <p
        class="m-0 font-serif text-[1.125rem] leading-snug text-slate-900 text-pretty"
        lang="sk"
      >
        {#each highlightLemma(item.example.slovak, entry.slovak) as part, partIndex (`${partIndex}-${part.text}`)}
          {#if part.hit}
            <span class={markClass}>{part.text}</span>
          {:else}
            {part.text}
          {/if}
        {/each}
      </p>

      <p class="m-0 mt-0.5 text-[0.9rem] leading-snug text-slate-600">
        {item.example.english}
      </p>
    </div>

    {#if item.example.isPracticeFrame}
      <span
        class="pt-1 text-xs text-slate-500 max-[560px]:col-start-2 max-[560px]:pt-1.5"
      >
        Practice frame
      </span>
    {:else if item.example.note === "Tatoeba" && item.example.tatoebaId}
      <a
        class="pt-1 text-xs tabular-nums text-slate-500 no-underline opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-blue-800 focus-visible:opacity-100 max-[560px]:col-start-2 max-[560px]:pt-1.5 max-[560px]:opacity-100"
        href={`https://tatoeba.org/sentences/show/${item.example.tatoebaId}`}
        rel="noopener noreferrer"
        target="_blank"
        title="View on Tatoeba"
      >
        Tatoeba #{item.example.tatoebaId}
      </a>
    {/if}
  </li>
{/snippet}

{#snippet formCell(stem: string, ending: string)}
  <span class="font-serif text-[1.1rem] text-slate-900" lang="sk">
    {stem}{#if ending}<span class={markClass}>{ending}</span>{/if}
  </span>
{/snippet}

<main class="pb-20">
  <PageShell class="pt-5 max-[760px]:pt-4">
    <nav
      class="flex items-baseline gap-2 text-[0.8125rem] text-slate-600"
      aria-label="Breadcrumb"
    >
      <a class="text-blue-800 hover:underline" href="/dictionary">Dictionary</a>
      <span aria-hidden="true">›</span>
      <span class="font-serif" lang="sk">{entry.slovak}</span>
    </nav>

    <header class="pt-5 pb-6 max-[760px]:pt-4">
      <p class="m-0 text-[0.8rem] text-slate-600">
        Meaning of <span class="font-serif italic" lang="sk">{entry.slovak}</span> in English
      </p>

      <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1
          id="lemma-heading"
          class="m-0 font-serif text-[clamp(2.25rem,4.5vw,3rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-slate-900"
          lang="sk"
        >
          {entry.slovak}
        </h1>

        {#if lemmaAudioSrc}
          <span
            class="inline-grid size-10 shrink-0 place-items-center"
            data-audio-mount="lemma"
          ></span>
        {/if}
      </div>

      <p
        class="m-0 mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1.5 text-[0.95rem] text-slate-700"
      >
        {#if multiSense}
          <span class="italic">
            {senseViews.map((sense) => categoryLabel(sense.entry.category)).join(", ")}
          </span>
        {:else}
          <span class="font-semibold italic text-slate-900">
            {categoryLabel(entry.category)}
          </span>

          {#if entry.gender}
            {@render genderLabel(entry.gender, entry.pluralOnlyGender)}
          {/if}

          {#if plural}
            <span>
              plural
              <span
                class="font-serif text-[1.05rem] font-semibold text-slate-900"
                lang="sk"
              >
                {plural}
              </span>
            </span>
          {/if}
        {/if}

        {#if entry.frequency}
          <a
            class="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
            href={`/dictionary/common/${entry.frequency.partOfSpeech}`}
            title="Frequency in the Slovak National Corpus: ●●● top 500, ●●○ top 2,000, ●○○ less common"
          >
            <span class="inline-flex gap-0.5" aria-hidden="true">
              {#each [1, 2, 3] as dot (dot)}
                <span
                  class={cx(
                    "size-2 rounded-full",
                    dot <= frequencyDots ? "bg-saffron" : "border border-slate-300",
                  )}
                ></span>
              {/each}
            </span>
            <span
              class="underline decoration-slate-300 decoration-dotted underline-offset-4"
            >
              #{entry.frequency.rank} among {FREQUENCY_PART_OF_SPEECH_LABEL[
                entry.frequency.partOfSpeech
              ].toLowerCase()}
            </span>
          </a>
        {/if}

        {#if entry.register}
          <span
            class="rounded-[3px] border border-slate-300 px-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-slate-700"
          >
            {REGISTER_CHIP_LABEL[entry.register]}
          </span>
        {/if}

        {#if entry.dialect}
          <span
            class="rounded-[3px] border border-slate-300 px-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-slate-700"
          >
            {DIALECT_CHIP_LABEL}
          </span>
        {/if}
      </p>
    </header>
  </PageShell>

  <nav
    class="border-y border-slate-200 bg-canvas/95 min-[801px]:sticky min-[801px]:top-(--header-height) min-[801px]:z-10 min-[801px]:backdrop-blur-sm"
    aria-label="On this page"
  >
    <PageShell class="flex gap-6 overflow-x-auto scrollbar-none">
      <a class={contentsLinkClass} href="#lemma-heading">Meaning</a>

      {#each mainContents as item (item.href)}
        <a class={contentsLinkClass} href={item.href}>{item.label}</a>
      {/each}

      <span class="ml-auto" aria-hidden="true"></span>

      {#each dataContents as item (item.href)}
        <a class={contentsLinkClass} href={item.href}>{item.label}</a>
      {/each}
    </PageShell>
  </nav>

  <PageShell
    class="grid grid-cols-[minmax(0,1fr)_18.5rem] gap-x-14 gap-y-12 pt-8 max-[900px]:grid-cols-1 max-[760px]:pt-6"
  >
    <article class="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-y-12">
      {#each senseViews as sense, senseIndex (sense.entry.slug)}
        {@const senseEntry = sense.entry}
        {@const senseHasUsage = senseEntry.body.length > 0}
        {@const senseGlosses = senseEntry.english
          .split(";")
          .map((part) => part.trim())
          .filter(Boolean)}
        {@const summary =
          senseEntry.summary &&
          senseEntry.summary !== `${senseEntry.slovak} means “${senseEntry.english}.”`
            ? senseEntry.summary
            : undefined}
        {@const examplesId =
          multiSense && senseIndex > 0
            ? `${senseSectionId(senseEntry.category)}-examples`
            : "examples"}
        {@const practiceOnly = onlyPracticeFrames(senseEntry.examples)}
        {@const visibleItems = exampleItemsBySense[senseIndex] ?? []}
        {@const grouped = visibleItems.some((item) => item.example.demonstrates)}

        <section
          id={multiSense ? senseSectionId(senseEntry.category) : undefined}
          class={cx(sectionClass, "grid gap-y-8")}
          aria-label={`${senseEntry.slovak}, ${categoryLabel(senseEntry.category)}`}
        >
          <div>
            <div
              class="flex flex-wrap items-baseline gap-x-2.5 border-b-2 border-blue-800 pb-1.5"
            >
              {#if multiSense}
                <h2 class="m-0 font-serif text-[1.15rem] font-semibold" lang="sk">
                  {senseEntry.slovak}
                </h2>

                <span class="font-semibold italic text-slate-700">
                  {categoryLabel(senseEntry.category)}
                </span>

                {#if senseEntry.gender}
                  <span class="text-[0.85rem] text-slate-600">
                    [{nounGenderLabel(senseEntry.gender, senseEntry.pluralOnlyGender)
                      .english}]
                  </span>
                {/if}

                {#if senseEntry.frequency}
                  <span class="ml-auto text-[0.8rem] text-slate-600">
                    #{senseEntry.frequency.rank} among {FREQUENCY_PART_OF_SPEECH_LABEL[
                      senseEntry.frequency.partOfSpeech
                    ].toLowerCase()}
                  </span>
                {/if}
              {:else}
                <h2 class={subheadingClass}>Meanings</h2>
              {/if}
            </div>

            <ol class="m-0 mt-3 list-none p-0">
              {#each senseGlosses as gloss, glossIndex (gloss)}
                <li
                  class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-x-2 py-1.5"
                >
                  <span class="text-[0.95rem] font-bold tabular-nums text-slate-900">
                    {glossIndex + 1}
                  </span>
                  <span class="text-[1.2rem] font-semibold leading-snug text-slate-900">
                    <GlossWithTerms text={gloss} />
                  </span>
                </li>
              {/each}
            </ol>

            {#if summary}
              <p class={cx(proseClass, "mt-3")}>{summary}</p>
            {/if}
          </div>

          {#if visibleItems.length > 0}
            <div id={examplesId} class={sectionClass}>
              <h2 class={subheadingClass}>
                {practiceOnly ? "Try this pattern" : "Examples"}
              </h2>

              {#if practiceOnly}
                <p class="m-0 mt-1.5 max-w-[60ch] text-sm text-slate-600">
                  A simple practice frame while a corpus example is unavailable.
                </p>
              {/if}

              {#if grouped}
                <div class="mt-3 grid gap-6">
                  {#each groupExamplesByPattern(visibleItems) as group (group.label)}
                    <div>
                      <h3
                        class="m-0 mb-1 text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-slate-600"
                      >
                        {group.label}
                      </h3>

                      <ol class="m-0 list-none p-0">
                        {#each group.items as item (`${item.example.slovak}-${item.index}`)}
                          {@render exampleRow(item, sense.exampleAudioSrcs, senseIndex)}
                        {/each}
                      </ol>
                    </div>
                  {/each}
                </div>
              {:else}
                <ol class="m-0 mt-2 list-none border-t border-slate-200 p-0">
                  {#each visibleItems as item (`${item.example.slovak}-${item.index}`)}
                    {@render exampleRow(item, sense.exampleAudioSrcs, senseIndex)}
                  {/each}
                </ol>
              {/if}

              {#if visibleItems.some((item) => item.example.note === "Tatoeba")}
                <p class="m-0 mt-3 text-xs text-slate-600">
                  Sentences from
                  <a
                    class="text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800"
                    href="https://tatoeba.org/"
                    rel="noopener noreferrer"
                    target="_blank">Tatoeba</a
                  >
                  (CC BY 2.0 FR).
                </p>
              {/if}
            </div>
          {/if}

          {#if senseHasUsage}
            <div id={multiSense ? undefined : "usage"} class={sectionClass}>
              <h2 class={subheadingClass}>How to use it</h2>

              <div class="mt-2 grid gap-3">
                {#each senseEntry.body as paragraph, index (index)}
                  <p class={proseClass}>{paragraph}</p>
                {/each}
              </div>
            </div>
          {/if}
        </section>
      {/each}

      {#if forms}
        <section id="forms" class={sectionClass} aria-labelledby="forms-heading">
          <h2 id="forms-heading" class={headingClass}>
            Forms of <span class="font-serif" lang="sk">{entry.slovak}</span>
          </h2>

          <p class="m-0 mt-1.5 text-[0.9rem] text-slate-600">
            Six cases, singular and plural. Endings are highlighted.
          </p>

          <div class="mt-4 overflow-x-auto">
            <table class="w-full border-collapse border border-slate-200 text-left">
              <thead>
                <tr class="bg-subtle text-[0.8rem] text-slate-700">
                  <th
                    class="border border-slate-200 px-3 py-2 max-[560px]:px-2 font-semibold"
                    scope="col"
                  >
                    Case
                  </th>
                  <th
                    class="border border-slate-200 px-3 py-2 max-[560px]:px-2 font-semibold"
                    scope="col"
                  >
                    Singular
                  </th>
                  <th
                    class="border border-slate-200 px-3 py-2 max-[560px]:px-2 font-semibold"
                    scope="col"
                  >
                    Plural
                  </th>
                </tr>
              </thead>

              <tbody>
                {#each forms as row (row.caseSlug)}
                  <tr>
                    <th
                      class="border border-slate-200 px-3 py-2 max-[560px]:px-2 align-baseline font-normal"
                      scope="row"
                    >
                      <a
                        class="text-[0.9rem] font-semibold text-blue-800 hover:underline"
                        href="/grammar/cases/{row.caseSlug}"
                      >
                        {sentenceCase(row.caseName)}
                      </a>
                      <span
                        class="ml-1.5 font-serif text-[0.85rem] text-slate-600 max-[560px]:ml-0 max-[560px]:block"
                        lang="sk"
                      >
                        {row.question}
                      </span>
                    </th>
                    <td class="border border-slate-200 px-3 py-2 max-[560px]:px-2">
                      {@render formCell(row.singular.stem, row.singular.ending)}
                    </td>
                    <td class="border border-slate-200 px-3 py-2 max-[560px]:px-2">
                      {@render formCell(row.plural.stem, row.plural.ending)}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          {#if entry.slovak.endsWith("ľ") && plural && !plural.includes("ľ")}
            <p class="m-0 mt-3 text-[0.85rem] leading-relaxed text-slate-600">
              Before <span class="font-serif" lang="sk">i</span> and
              <span class="font-serif" lang="sk">e</span>,
              <span class="font-serif" lang="sk">ľ</span> is written plain
              <span class="font-serif" lang="sk">l</span> and still sounds soft:
              <span class="font-serif text-slate-900" lang="sk">{plural}</span>.
            </p>
          {/if}
        </section>
      {/if}

      <ExternalLookups
        lemma={entry.slovak}
        dialect={senseViews.some((sense) => sense.entry.dialect === true)}
      />
    </article>

    <aside class="grid min-w-0 content-start gap-y-10" aria-label="Word details">
      {#if image}
        <figure id="image" class="m-0 {sectionClass}">
          <img
            alt={image.caption}
            class="block aspect-[5/4] h-auto w-full rounded-[3px] object-cover"
            decoding="async"
            height="280"
            loading="lazy"
            src={image.src}
            width="352"
          />

          <figcaption class="mt-2 text-xs leading-snug text-slate-600">
            <span class="text-slate-800">{image.caption}</span>

            {#if image.artist}
              <span aria-hidden="true"> · </span>
              <span>{image.artist}</span>
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
                Wikimedia
              </a>
            {/if}
          </figcaption>
        </figure>
      {/if}

      {#if entriesNear.length > 0}
        <section id="nearby" class={sectionClass} aria-labelledby="nearby-heading">
          <h2 id="nearby-heading" class={railHeadingClass}>Browse</h2>

          <ul class="m-0 list-none p-0">
            {#each entriesNear as nearby (nearby.slovak)}
              <li>
                {#if nearby.current}
                  <span
                    class={cx(railRowClass, "-mx-2 bg-mark px-2")}
                    aria-current="true"
                  >
                    <span class="truncate font-serif text-[1rem] font-semibold" lang="sk">
                      {nearby.slovak}
                    </span>
                    <span class="truncate text-[0.85rem] text-slate-700">
                      {nearby.english}
                    </span>
                  </span>
                {:else}
                  <a class={railRowClass} href={nearby.href}>
                    <span class={cx(railLinkClass, "truncate")} lang="sk">
                      {nearby.slovak}
                    </span>
                    <span class="truncate text-[0.85rem] text-slate-600">
                      {nearby.english}
                    </span>
                  </a>
                {/if}
              </li>
            {/each}
          </ul>

          <p class="m-0 mt-2.5 text-[0.85rem]">
            <a
              class="text-blue-800 hover:underline"
              href={`/dictionary?letter=${encodeURIComponent(entry.slovak.at(0)?.toLocaleLowerCase("sk") ?? "")}`}
            >
              More words in {entry.slovak.at(0)?.toLocaleUpperCase("sk")}
            </a>
          </p>
        </section>
      {/if}

      {#if frequencyNeighbors.length > 0 && entry.frequency}
        <section id="frequency" class={sectionClass} aria-labelledby="frequency-heading">
          <h2 id="frequency-heading" class={railHeadingClass}>Word frequency</h2>

          <table class="w-full border-collapse text-left">
            <caption
              class="pt-2 pb-1.5 text-left text-[0.8rem] leading-snug text-slate-600"
            >
              Rank among {FREQUENCY_PART_OF_SPEECH_LABEL[
                entry.frequency.partOfSpeech
              ].toLowerCase()} in the Slovak National Corpus.
            </caption>

            <tbody>
              {#each frequencyNeighbors as row (row.rank)}
                <tr
                  class={cx("border-b border-slate-200", row.current && "bg-mark")}
                  aria-current={row.current ? "true" : undefined}
                >
                  <td class="w-14 py-1.5 pl-1 text-[0.8rem] tabular-nums text-slate-600">
                    #{row.rank}
                  </td>
                  <td class="py-1.5">
                    {#if row.href && !row.current}
                      <a
                        class="font-serif text-[1rem] text-blue-800 hover:underline"
                        href={row.href}
                        lang="sk"
                      >
                        {row.lemma}
                      </a>
                    {:else}
                      <span
                        class={cx(
                          "font-serif text-[1rem] text-slate-900",
                          row.current && "font-semibold",
                        )}
                        lang="sk"
                      >
                        {row.lemma}
                      </span>
                    {/if}
                  </td>
                  <td
                    class="py-1.5 pr-1 text-right text-[0.8rem] tabular-nums text-slate-600"
                  >
                    {#if row.count}
                      {row.count.toLocaleString("en")}
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>

          <p class="m-0 mt-2.5 text-[0.85rem]">
            <a
              class="text-blue-800 hover:underline"
              href={`/dictionary/common/${entry.frequency.partOfSpeech}`}
            >
              Most common {FREQUENCY_PART_OF_SPEECH_LABEL[
                entry.frequency.partOfSpeech
              ].toLowerCase()}
            </a>
          </p>
        </section>
      {/if}

      {#if relatedEntries.length}
        <section id="related" class={sectionClass} aria-labelledby="related-heading">
          <h2 id="related-heading" class={railHeadingClass}>Related words</h2>

          <ul class="m-0 list-none p-0">
            {#each relatedEntries as relatedEntry (relatedEntry.slug)}
              <li>
                <a class={railRowClass} href={relatedEntry.href}>
                  <span class={cx(railLinkClass, "truncate")} lang="sk">
                    {relatedEntry.slovak}
                  </span>
                  <span class="text-[0.85rem] leading-snug text-slate-600">
                    {relatedEntry.english}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <section id="source" class={sectionClass} aria-labelledby="source-heading">
        <h2 id="source-heading" class={railHeadingClass}>Sources</h2>

        <dl class="m-0 grid grid-cols-[5.5rem_minmax(0,1fr)] text-[0.85rem]">
          <dt class="border-b border-slate-200 py-2 text-slate-600">Meaning</dt>
          <dd class="m-0 border-b border-slate-200 py-2">
            <a class="text-blue-800 hover:underline" href={entry.source}>{sourceLabel}</a>
          </dd>

          {#if entry.frequency}
            <dt class="border-b border-slate-200 py-2 text-slate-600">Frequency</dt>
            <dd class="m-0 border-b border-slate-200 py-2">Slovak National Corpus</dd>
          {/if}

          {#if hasTatoeba}
            <dt class="border-b border-slate-200 py-2 text-slate-600">Sentences</dt>
            <dd class="m-0 border-b border-slate-200 py-2">
              <a class="text-blue-800 hover:underline" href="https://tatoeba.org/"
                >Tatoeba</a
              >
              (CC BY 2.0 FR)
            </dd>
          {/if}
        </dl>

        {#if entry.sourceNote}
          <p class="m-0 mt-2 text-[0.8rem] leading-relaxed text-slate-600">
            {entry.sourceNote}
          </p>
        {/if}

        <p class="m-0 mt-2.5 text-[0.85rem]">
          <a class="text-blue-800 hover:underline" href="/references">All references</a>
        </p>
      </section>
    </aside>
  </PageShell>

  {#if audioMount}
    {@render audioMount()}
  {/if}
</main>
