<script lang="ts">
  import type { Snippet } from "svelte";

  import ExternalLookups from "$lib/components/dictionary/ExternalLookups.svelte";
  import GlossWithTerms from "$lib/components/dictionary/GlossWithTerms.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { FREQUENCY_PART_OF_SPEECH_LABEL } from "$lib/catalog/frequency/types";
  import { declensionRows } from "$lib/catalog/dictionary/declension";
  import { EXAMPLE_DISPLAY_LIMIT } from "$lib/catalog/dictionary/example-limits";
  import type { FrequencyNeighbor } from "$lib/catalog/dictionary/frequency-neighbors";
  import { highlightLemmaInText } from "$lib/catalog/dictionary/highlight-lemma";
  import type { DictionaryImageView } from "$lib/catalog/dictionary/images";
  import { senseSectionId } from "$lib/catalog/dictionary/lemma-senses";
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

  const contents = $derived(
    [
      hasExamples && { href: "#examples", label: "Examples" },
      forms && { href: "#forms", label: "Forms" },
      !multiSense && hasUsage && { href: "#usage", label: "Usage" },
      relatedEntries.length > 0 && { href: "#related", label: "Related" },
      frequencyNeighbors.length > 0 && { href: "#frequency", label: "Frequency" },
      { href: "#lookups", label: "Elsewhere" },
    ].filter((item): item is { href: string; label: string } => Boolean(item)),
  );

  const metaSeparator = "text-panel-inverse-ink/35";
  const genderLinkInverseClass = cx(
    "text-panel-inverse-ink/80",
    "underline decoration-panel-inverse-ink/30 decoration-dotted underline-offset-4",
    "hover:text-panel-inverse-ink hover:decoration-panel-inverse-ink/70",
  );
  const genderLinkDefaultClass = cx(
    "text-slate-600",
    "underline decoration-slate-300 decoration-dotted underline-offset-4",
    "hover:text-slate-900 hover:decoration-slate-500",
  );

  const headingClass =
    "m-0 border-b border-slate-200 pb-2.5 text-[1.05rem] font-semibold tracking-[-0.01em]";
  const subheadingClass = "m-0 text-[0.95rem] font-semibold tracking-normal";
  const proseClass =
    "m-0 max-w-[66ch] text-[1rem] leading-relaxed text-pretty text-slate-700";
  const sectionClass = "scroll-mt-[136px]";
  const markClass = "font-semibold shadow-[inset_0_-0.32em_0_var(--surface-selected)]";

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
    return category === "Nouns" ? "Noun" : category.replace(/s$/, "");
  }
</script>

{#snippet genderLabel(
  gender: NounGender,
  pluralOnlyGender: PluralOnlyGender | undefined,
  variant: "inverse" | "default",
)}
  {@const label = nounGenderLabel(gender, pluralOnlyGender)}

  <a
    class={variant === "inverse" ? genderLinkInverseClass : genderLinkDefaultClass}
    href="/grammar/grammatical-gender"
    title={`In Slovak: ${label.slovak}`}
  >
    {label.english}
    <span
      class={variant === "inverse"
        ? "font-serif text-panel-inverse-ink/60"
        : "font-serif text-slate-500"}
      lang="sk"
    >
      {label.slovak}
    </span>
  </a>
{/snippet}

{#snippet exampleRow(
  item: { example: Example; index: number },
  audioSrcs: string[],
  senseIndex: number,
)}
  <li
    class="group/row grid grid-cols-[2rem_1fr_auto] items-start gap-x-3 border-t border-slate-200 py-3.5 first:border-t-0 first:pt-1 max-[560px]:grid-cols-[2rem_1fr]"
  >
    <span class="grid h-7 place-items-center">
      {#if audioSrcs[item.index]}
        <span
          class="inline-grid size-7 place-items-center"
          data-audio-mount={`s${senseIndex}-e${item.index}`}
        ></span>
      {:else}
        <span class="text-xs tabular-nums text-slate-400" aria-hidden="true">
          {item.index + 1}
        </span>
      {/if}
    </span>

    <div class="min-w-0">
      <p
        class="m-0 font-serif text-[1.15rem] leading-snug text-slate-900 text-pretty"
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

      <p class="m-0 mt-1 text-[0.9rem] leading-snug text-slate-600">
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
  <span class="font-serif text-[1.05rem] text-slate-900" lang="sk">
    {stem}{#if ending}<span class={markClass}>{ending}</span>{/if}
  </span>
{/snippet}

<main class="pb-16">
  <section class="bg-panel-inverse" aria-labelledby="lemma-heading">
    <PageShell class="pt-8 pb-8 max-[760px]:pt-6 max-[760px]:pb-6">
      <nav
        class="mb-6 flex items-baseline gap-2 text-[0.8125rem] leading-none text-panel-inverse-ink/60"
        aria-label="Breadcrumb"
      >
        <a
          class="text-panel-inverse-ink/85 underline decoration-panel-inverse-ink/35 underline-offset-[3px] hover:text-panel-inverse-ink"
          href="/dictionary"
        >
          Dictionary
        </a>
        <span aria-hidden="true">/</span>
        <span class="font-serif" lang="sk">{entry.slovak}</span>
      </nav>

      <div class="flex flex-wrap items-end gap-x-4 gap-y-3">
        <h1
          id="lemma-heading"
          class="m-0 font-serif text-[clamp(3rem,6.2vw,4.5rem)] leading-[0.9] font-medium tracking-[-0.03em] text-panel-inverse-ink"
          lang="sk"
        >
          {entry.slovak}
        </h1>

        {#if lemmaAudioSrc}
          <span
            class="mb-1.5 inline-grid size-12 shrink-0 align-middle"
            data-audio-mount="lemma"
          ></span>
        {/if}
      </div>

      {#if multiSense || glossSenses.length <= 1}
        <p
          class="m-0 mt-4 max-w-[40ch] text-[1.3rem] font-medium leading-snug text-panel-inverse-ink"
        >
          <GlossWithTerms text={heroGloss} variant="inverse" />
        </p>
      {:else}
        <ol
          class="m-0 mt-4 flex list-none flex-wrap gap-x-7 gap-y-1.5 p-0 text-[1.3rem] font-medium leading-snug text-panel-inverse-ink"
        >
          {#each glossSenses as sense, index (sense)}
            <li class="flex items-baseline gap-2">
              <span
                class="text-[0.85rem] tabular-nums text-panel-inverse-ink/55"
                aria-hidden="true">{index + 1}</span
              >
              <span><GlossWithTerms text={sense} variant="inverse" /></span>
            </li>
          {/each}
        </ol>
      {/if}

      <p
        class="m-0 mt-6 flex max-w-[60rem] flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t border-panel-inverse-ink/15 pt-3.5 text-[0.85rem] text-panel-inverse-ink/80"
      >
        {#if multiSense}
          <span>{senseViews.map((sense) => sense.entry.category).join(" · ")}</span>
        {:else}
          <span class="font-semibold text-panel-inverse-ink">
            {categoryLabel(entry.category)}
          </span>

          {#if entry.gender}
            <span class={metaSeparator} aria-hidden="true">·</span>
            {@render genderLabel(entry.gender, entry.pluralOnlyGender, "inverse")}
          {/if}

          {#if plural}
            <span class={metaSeparator} aria-hidden="true">·</span>
            <span>
              plural
              <span class="font-serif text-[0.95rem] text-panel-inverse-ink" lang="sk">
                {plural}
              </span>
            </span>
          {/if}

          {#if entry.frequency}
            <span class={metaSeparator} aria-hidden="true">·</span>
            <a
              class="text-panel-inverse-ink/80 underline decoration-panel-inverse-ink/30 decoration-dotted underline-offset-4 hover:text-panel-inverse-ink"
              href={`/dictionary/common/${entry.frequency.partOfSpeech}`}
            >
              <span class="font-semibold tabular-nums text-panel-inverse-ink">
                #{entry.frequency.rank}
              </span>
              among common {FREQUENCY_PART_OF_SPEECH_LABEL[
                entry.frequency.partOfSpeech
              ].toLowerCase()}
            </a>
          {/if}

          {#if entry.register}
            <span class={metaSeparator} aria-hidden="true">·</span>
            <span class="italic">{REGISTER_CHIP_LABEL[entry.register]}</span>
          {/if}

          {#if entry.dialect}
            <span class={metaSeparator} aria-hidden="true">·</span>
            <span class="italic">{DIALECT_CHIP_LABEL}</span>
          {/if}
        {/if}
      </p>
    </PageShell>
  </section>

  <nav
    class="border-b border-slate-200 bg-canvas/95 min-[801px]:sticky min-[801px]:top-(--header-height) min-[801px]:z-10 min-[801px]:backdrop-blur-sm"
    aria-label="On this page"
  >
    <PageShell class="flex gap-6 overflow-x-auto scrollbar-none">
      {#if multiSense}
        {#each senseViews as sense (sense.entry.slug)}
          <a
            class="shrink-0 py-3 text-[0.85rem] font-medium text-slate-600 hover:text-slate-900"
            href="#{senseSectionId(sense.entry.category)}"
          >
            {sense.entry.category}
          </a>
        {/each}
      {/if}

      {#each contents as item (item.href)}
        <a
          class="shrink-0 py-3 text-[0.85rem] font-medium text-slate-600 hover:text-slate-900"
          href={item.href}
        >
          {item.label}
        </a>
      {/each}
    </PageShell>
  </nav>

  <PageShell
    class="grid grid-cols-[minmax(0,1fr)_18rem] gap-x-14 gap-y-12 pt-10 max-[900px]:grid-cols-1 max-[760px]:pt-8"
  >
    <article class="grid min-w-0 content-start gap-y-12">
      {#each senseViews as sense, senseIndex (sense.entry.slug)}
        {@const senseEntry = sense.entry}
        {@const senseHasUsage = senseEntry.body.length > 0}
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
          class={cx(sectionClass, "grid gap-y-10")}
          aria-label={multiSense
            ? `${senseEntry.category}: ${senseEntry.english}`
            : undefined}
        >
          {#if multiSense}
            <header>
              <p class="m-0 text-[0.75rem] font-semibold text-slate-500">
                Sense {senseIndex + 1}
              </p>

              <h2 class="m-0 mt-1 text-[1.25rem] font-semibold">
                {senseEntry.category}
                <span class="text-base font-normal text-slate-600">
                  — <GlossWithTerms text={senseEntry.english} />
                </span>
              </h2>

              {#if senseEntry.gender || senseEntry.frequency}
                <p class="m-0 mt-2 flex flex-wrap gap-x-3 text-sm text-slate-600">
                  {#if senseEntry.gender}
                    {@render genderLabel(
                      senseEntry.gender,
                      senseEntry.pluralOnlyGender,
                      "default",
                    )}
                  {/if}

                  {#if senseEntry.frequency}
                    <TextLink
                      href={`/dictionary/common/${senseEntry.frequency.partOfSpeech}`}
                    >
                      #{senseEntry.frequency.rank} among common {FREQUENCY_PART_OF_SPEECH_LABEL[
                        senseEntry.frequency.partOfSpeech
                      ].toLowerCase()}
                    </TextLink>
                  {/if}
                </p>
              {/if}
            </header>
          {/if}

          {#if summary}
            <p class={proseClass}>{summary}</p>
          {/if}

          {#if visibleItems.length > 0}
            <div id={examplesId} class={sectionClass}>
              <h2 class={multiSense ? subheadingClass : headingClass}>
                {practiceOnly ? "Try this pattern" : "Examples"}
              </h2>

              {#if practiceOnly}
                <p class="m-0 mt-2 max-w-[60ch] text-sm text-slate-600">
                  A simple practice frame while a corpus example is unavailable.
                </p>
              {/if}

              {#if grouped}
                <div class="mt-4 grid gap-7">
                  {#each groupExamplesByPattern(visibleItems) as group (group.label)}
                    <div>
                      <h3
                        class="m-0 mb-2 text-[0.8rem] font-semibold tracking-normal text-slate-600"
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
                <ol class="m-0 mt-4 list-none p-0">
                  {#each visibleItems as item (`${item.example.slovak}-${item.index}`)}
                    {@render exampleRow(item, sense.exampleAudioSrcs, senseIndex)}
                  {/each}
                </ol>
              {/if}

              {#if visibleItems.some((item) => item.example.note === "Tatoeba")}
                <p class="m-0 mt-4 text-xs text-slate-600">
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
              <h2 class={multiSense ? subheadingClass : headingClass}>How to use it</h2>

              <div class="mt-4 grid gap-3">
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
          <div
            class="flex items-baseline justify-between gap-6 border-b border-slate-200 pb-2.5"
          >
            <h2
              id="forms-heading"
              class="m-0 text-[1.05rem] font-semibold tracking-[-0.01em]"
            >
              Forms
            </h2>

            <span class="text-[0.8rem] text-slate-600">one stem, six cases</span>
          </div>

          <div
            class="mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-center max-[640px]:grid-cols-1"
          >
            <p
              class="m-0 flex items-center pt-8 font-serif text-[2rem] leading-none text-slate-900 max-[640px]:hidden"
              lang="sk"
              aria-hidden="true"
            >
              {entry.slovak}
              <span class="ml-2 size-1.5 rounded-full bg-slate-500"></span>
              <span class="h-px w-6 bg-slate-400"></span>
            </p>

            <div class="relative min-w-0 overflow-x-auto">
              <span
                class="absolute left-0 top-[3.4rem] bottom-[1.4rem] w-px bg-slate-400 max-[640px]:hidden"
                aria-hidden="true"
              ></span>

              <table class="w-full border-collapse text-left">
                <thead>
                  <tr class="h-8 text-[0.75rem] text-slate-600">
                    <td class="w-4 p-0 max-[640px]:hidden" aria-hidden="true"></td>
                    <th class="p-0 font-medium" scope="col"
                      ><span class="sr-only">Question</span></th
                    >
                    <th class="p-0 font-medium" scope="col">case</th>
                    <th class="p-0 font-medium" scope="col">one</th>
                    <th class="p-0 font-medium" scope="col">many</th>
                  </tr>
                </thead>

                <tbody>
                  {#each forms as row (row.caseSlug)}
                    <tr class="h-11 border-t border-slate-200">
                      <td class="relative p-0 max-[640px]:hidden" aria-hidden="true">
                        <span class="absolute left-0 top-1/2 h-px w-3 bg-slate-400"
                        ></span>
                      </td>
                      <td class="pr-4 font-serif text-[0.95rem] text-slate-900" lang="sk">
                        {row.question}
                      </td>
                      <th
                        class="pr-4 text-[0.8rem] font-normal text-slate-600"
                        scope="row"
                      >
                        <a
                          class="hover:text-blue-800 hover:underline"
                          href="/grammar/cases/{row.caseSlug}"
                        >
                          {row.caseName}
                        </a>
                      </th>
                      <td class="pr-4">
                        {@render formCell(row.singular.stem, row.singular.ending)}
                      </td>
                      <td>
                        {@render formCell(row.plural.stem, row.plural.ending)}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>

          {#if entry.slovak.endsWith("ľ") && plural && !plural.includes("ľ")}
            <p class="m-0 mt-4 text-[0.85rem] leading-relaxed text-slate-600">
              Before <span class="font-serif" lang="sk">i</span> and
              <span class="font-serif" lang="sk">e</span>,
              <span class="font-serif" lang="sk">ľ</span> is written plain
              <span class="font-serif" lang="sk">l</span> and still sounds soft:
              <span class="font-serif text-slate-900" lang="sk">{plural}</span>.
            </p>
          {/if}
        </section>
      {/if}

      {#if relatedEntries.length}
        <section id="related" class={sectionClass} aria-labelledby="related-heading">
          <h2 id="related-heading" class={headingClass}>Related words</h2>

          <ul
            class="m-0 mt-3 grid list-none grid-cols-2 gap-x-10 p-0 max-[560px]:grid-cols-1"
          >
            {#each relatedEntries as relatedEntry (relatedEntry.slug)}
              <li>
                <a
                  class="group grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-x-3 py-1.5"
                  href={relatedEntry.href}
                >
                  <span
                    class="truncate font-serif text-[1.05rem] text-slate-900 group-hover:text-blue-800"
                    lang="sk"
                  >
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

      <ExternalLookups
        lemma={entry.slovak}
        dialect={senseViews.some((sense) => sense.entry.dialect === true)}
      />

      <section id="source" class={sectionClass} aria-labelledby="source-heading">
        <h2 id="source-heading" class="sr-only">Source</h2>
        <p class="m-0 max-w-[66ch] text-sm leading-relaxed text-slate-600">
          Source:
          <TextLink href={entry.source}>{sourceLabel} ↗</TextLink>.
          {#if entry.sourceNote}
            {entry.sourceNote}
          {/if}
          Full attribution on <TextLink href="/references">References</TextLink>.
        </p>
      </section>
    </article>

    <aside class="grid min-w-0 content-start gap-y-12" aria-label="Word details">
      {#if frequencyNeighbors.length > 0 && entry.frequency}
        <section id="frequency" class={sectionClass} aria-labelledby="frequency-heading">
          <h2 id="frequency-heading" class={headingClass}>Frequency</h2>

          <p class="m-0 mt-3 text-[0.8rem] leading-relaxed text-slate-600">
            Rank among {FREQUENCY_PART_OF_SPEECH_LABEL[
              entry.frequency.partOfSpeech
            ].toLowerCase()} in the Slovak National Corpus, with the words ranked just above
            and below.
          </p>

          <table class="mt-3 w-full border-collapse text-left">
            <thead>
              <tr class="text-[0.72rem] text-slate-600">
                <th class="pb-1.5 font-medium" scope="col">Rank</th>
                <th class="pb-1.5 font-medium" scope="col">Word</th>
                <th class="pb-1.5 text-right font-medium" scope="col">Count</th>
              </tr>
            </thead>

            <tbody>
              {#each frequencyNeighbors as row (row.rank)}
                <tr
                  class={cx("border-t border-slate-200", row.current && "bg-selected/60")}
                  aria-current={row.current ? "true" : undefined}
                >
                  <td class="py-1.5 pl-1 text-[0.8rem] tabular-nums text-slate-600">
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
                    class="py-1.5 pr-1 text-right text-[0.8rem] tabular-nums text-slate-700"
                  >
                    {#if row.count}
                      {row.count.toLocaleString("en")}
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>

          <p class="m-0 mt-3 text-[0.8rem]">
            <TextLink href={`/dictionary/common/${entry.frequency.partOfSpeech}`}>
              Most common {FREQUENCY_PART_OF_SPEECH_LABEL[
                entry.frequency.partOfSpeech
              ].toLowerCase()}
            </TextLink>
          </p>
        </section>
      {/if}

      {#if image}
        <figure id="image" class="m-0 {sectionClass}">
          <img
            alt={image.caption}
            class="block aspect-[5/4] h-auto w-full rounded-[2px] object-cover"
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
    </aside>
  </PageShell>

  {#if audioMount}
    {@render audioMount()}
  {/if}
</main>
