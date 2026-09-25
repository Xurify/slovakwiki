<script lang="ts">
  import type { Snippet } from "svelte";

  import ExternalLookups from "$lib/components/dictionary/ExternalLookups.svelte";
  import GlossWithTerms from "$lib/components/dictionary/GlossWithTerms.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { FREQUENCY_PART_OF_SPEECH_LABEL } from "$lib/catalog/frequency/types";
  import { EXAMPLE_DISPLAY_LIMIT } from "$lib/catalog/dictionary/example-limits";
  import { highlightLemmaInText } from "$lib/catalog/dictionary/highlight-lemma";
  import type { DictionaryImageView } from "$lib/catalog/dictionary/images";
  import { senseSectionId } from "$lib/catalog/dictionary/lemma-senses";
  import {
    REGISTER_CHIP_LABEL,
    DIALECT_CHIP_LABEL,
    type ContentEntry,
    type EntryKind,
    type Example,
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

  const headingClass = "m-0 font-serif text-xl tracking-tight text-slate-900";
  const subheadingClass = "m-0 font-serif text-lg tracking-tight text-slate-900";
  const proseClass =
    "m-0 max-w-[66ch] text-[1.02rem] leading-relaxed text-pretty text-slate-700";

  function onlyPracticeFrames(examples: Example[]): boolean {
    return examples.length > 0 && examples.every((example) => example.isPracticeFrame);
  }

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
</script>

<main class="pb-16">
  <section
    class="relative isolate overflow-hidden bg-panel-inverse"
    aria-labelledby="lemma-heading"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--accent)_28%,transparent),transparent_55%),radial-gradient(ellipse_at_90%_80%,color-mix(in_srgb,var(--panel-inverse-ink)_8%,transparent),transparent_50%)]"
      aria-hidden="true"
    ></div>

    <span
      class="pointer-events-none absolute -bottom-10 -right-4 -z-10 select-none font-serif text-[min(42vw,18rem)] leading-none text-panel-inverse-ink/4"
      aria-hidden="true"
      lang="sk"
    >
      {entry.slovak.slice(0, 1)}
    </span>

    <PageShell class="relative max-w-[880px] pt-8 pb-9 max-[760px]:pt-6 max-[760px]:pb-7">
      <nav
        class="mb-7 flex gap-2 text-xs text-panel-inverse-ink/55"
        aria-label="Breadcrumb"
      >
        <TextLink
          class="text-panel-inverse-ink/70 decoration-panel-inverse-ink/25 hover:text-panel-inverse-ink"
          href="/dictionary"
        >
          Dictionary
        </TextLink>
        <span aria-hidden="true">/</span>
        <span lang="sk">{entry.slovak}</span>
      </nav>

      <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <h1
          id="lemma-heading"
          class="m-0 font-serif text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.95] text-panel-inverse-ink"
          lang="sk"
        >
          {entry.slovak}
        </h1>

        {#if lemmaAudioSrc}
          <span class="inline-grid size-12 shrink-0 align-middle" data-audio-mount="lemma"
          ></span>
        {/if}
      </div>

      {#if multiSense || glossSenses.length <= 1}
        <p
          class="mt-4 max-w-[42ch] font-serif text-[1.25rem] leading-snug text-panel-inverse-ink/80"
        >
          <GlossWithTerms text={heroGloss} variant="inverse" />
        </p>
      {:else}
        <ul
          class="mt-4 m-0 grid list-none gap-1.5 p-0 font-serif text-[1.2rem] leading-snug text-panel-inverse-ink/80"
        >
          {#each glossSenses as sense, index (sense)}
            <li class="flex gap-2.5">
              <span
                class="shrink-0 tabular-nums text-panel-inverse-ink/40"
                aria-hidden="true">{index + 1}.</span
              >
              <span><GlossWithTerms text={sense} variant="inverse" /></span>
            </li>
          {/each}
        </ul>
      {/if}

      <p
        class="mt-5 m-0 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-sm text-panel-inverse-ink/60"
      >
        {#if multiSense}
          <span>{senseViews.map((sense) => sense.entry.category).join(" · ")}</span>
        {:else}
          <span class="font-semibold text-panel-inverse-ink/85">{entry.category}</span>

          {#if entry.frequency}
            <span aria-hidden="true">·</span>
            <a
              class="text-panel-inverse-ink/70 underline decoration-panel-inverse-ink/25 decoration-dotted underline-offset-4 hover:text-panel-inverse-ink hover:decoration-panel-inverse-ink/60"
              href={`/dictionary/common/${entry.frequency.partOfSpeech}`}
            >
              <span class="tabular-nums">#{entry.frequency.rank}</span>
              among common {FREQUENCY_PART_OF_SPEECH_LABEL[
                entry.frequency.partOfSpeech
              ].toLowerCase()}
            </a>
          {/if}

          {#if entry.register}
            <span aria-hidden="true">·</span>
            <span class="italic">{REGISTER_CHIP_LABEL[entry.register]}</span>
          {/if}

          {#if entry.dialect}
            <span aria-hidden="true">·</span>
            <span class="italic">{DIALECT_CHIP_LABEL}</span>
          {/if}
        {/if}
      </p>
    </PageShell>

    {#if multiSense}
      <div
        class="sticky top-(--header-height) z-10 border-t border-panel-inverse-ink/12 bg-panel-inverse/95 backdrop-blur-sm"
      >
        <PageShell class="max-w-[880px]">
          <nav
            class="flex gap-5 overflow-x-auto py-2.5 scrollbar-none"
            aria-label="Senses"
          >
            {#each senseViews as sense (sense.entry.slug)}
              <a
                class="shrink-0 border-b-2 border-transparent py-1.5 font-sans text-sm font-semibold text-panel-inverse-ink/60 hover:text-panel-inverse-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panel-inverse-ink"
                href="#{senseSectionId(sense.entry.category)}"
              >
                {sense.entry.category}
              </a>
            {/each}
          </nav>
        </PageShell>
      </div>
    {/if}
  </section>

  {#snippet exampleRow(
    item: { example: Example; index: number },
    audioSrcs: string[],
    senseIndex: number,
  )}
    <li
      class="group/row grid grid-cols-[2rem_1fr_auto] items-start gap-x-3 border-t border-slate-200 py-3.5 first:border-t-0 first:pt-0 max-[560px]:grid-cols-[2rem_1fr]"
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
              <span class="font-semibold text-blue-800">{part.text}</span>
            {:else}
              {part.text}
            {/if}
          {/each}
        </p>

        <p class="m-0 mt-1 text-[0.95rem] leading-snug text-slate-600">
          {item.example.english}
        </p>
      </div>

      {#if item.example.isPracticeFrame}
        <span
          class="pt-1 text-xs text-slate-400 max-[560px]:col-start-2 max-[560px]:pt-1.5"
        >
          Practice frame
        </span>
      {:else if item.example.note === "Tatoeba" && item.example.tatoebaId}
        <a
          class="pt-1 text-xs tabular-nums text-slate-400 no-underline opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-blue-800 focus-visible:opacity-100 max-[560px]:col-start-2 max-[560px]:pt-1.5 max-[560px]:opacity-100"
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

  <PageShell class="max-w-[880px] pt-10 max-[760px]:pt-8">
    <article class="min-w-0">
      {#if image}
        <figure id="image" class="m-0 mb-10 max-w-[22rem] scroll-mt-[88px]">
          <div
            class="overflow-hidden rounded-(--control-radius) border border-slate-200 bg-slate-50"
          >
            <img
              alt={image.caption}
              class="block h-auto w-full object-cover"
              decoding="async"
              height="280"
              loading="lazy"
              src={image.src}
              width="352"
            />
          </div>

          <figcaption class="mt-2 text-xs leading-snug text-slate-500">
            <span class="text-slate-700">{image.caption}</span>

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

      {#each senseViews as sense, senseIndex (sense.entry.slug)}
        {@const senseEntry = sense.entry}
        {@const hasUsage = senseEntry.body.length > 0}
        {@const summary =
          senseEntry.summary &&
          senseEntry.summary !== `${senseEntry.slovak} means “${senseEntry.english}.”`
            ? senseEntry.summary
            : undefined}
        {@const sectionId = multiSense
          ? senseSectionId(senseEntry.category)
          : hasUsage
            ? "usage"
            : undefined}
        {@const examplesId = multiSense
          ? `${senseSectionId(senseEntry.category)}-examples`
          : "examples"}
        {@const practiceOnly = onlyPracticeFrames(senseEntry.examples)}
        {@const visibleItems = exampleItemsBySense[senseIndex] ?? []}
        {@const grouped = visibleItems.some((item) => item.example.demonstrates)}
        {@const sectionLabelId = multiSense
          ? `${sectionId}-heading`
          : hasUsage
            ? "usage-heading"
            : visibleItems.length > 0
              ? `${examplesId}-heading`
              : undefined}

        <section
          id={sectionId}
          class={`scroll-mt-[88px] ${
            multiSense && senseIndex > 0 ? "mt-14 border-t border-slate-200 pt-10" : ""
          }`}
          aria-labelledby={sectionLabelId}
        >
          {#if multiSense}
            <p
              class="m-0 mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Sense {senseIndex + 1}
            </p>

            <h2 id={`${sectionId}-heading`} class={headingClass}>
              {senseEntry.category}
              <span class="font-sans text-base font-normal text-slate-600">
                — <GlossWithTerms text={senseEntry.english} />
              </span>
            </h2>

            {#if senseEntry.frequency}
              <p class="m-0 mt-2 text-sm text-slate-500">
                <TextLink
                  href={`/dictionary/common/${senseEntry.frequency.partOfSpeech}`}
                >
                  #{senseEntry.frequency.rank} among common {FREQUENCY_PART_OF_SPEECH_LABEL[
                    senseEntry.frequency.partOfSpeech
                  ].toLowerCase()}
                </TextLink>
              </p>
            {/if}
          {/if}

          {#if summary}
            <p class={`${proseClass} ${multiSense ? "mt-4" : ""}`}>{summary}</p>
          {/if}

          {#if hasUsage}
            <div class={summary || multiSense ? "mt-8" : ""}>
              {#if multiSense}
                <h3 class={subheadingClass}>How to use it</h3>
              {:else}
                <h2 id="usage-heading" class={headingClass}>How to use it</h2>
              {/if}

              <div class="mt-3 grid gap-3">
                {#each senseEntry.body as paragraph, index (index)}
                  <p class={proseClass}>{paragraph}</p>
                {/each}
              </div>
            </div>
          {/if}

          {#if visibleItems.length > 0}
            <div
              id={examplesId}
              class={`scroll-mt-[88px] ${summary || hasUsage || multiSense ? "mt-10" : ""}`}
            >
              {#if multiSense}
                <h3 id={`${examplesId}-heading`} class={subheadingClass}>
                  {practiceOnly ? "Try this pattern" : "Examples"}
                </h3>
              {:else}
                <h2 id={`${examplesId}-heading`} class={headingClass}>
                  {practiceOnly ? "Try this pattern" : "Examples"}
                </h2>
              {/if}

              {#if practiceOnly}
                <p class="m-0 mt-1 max-w-[60ch] text-sm text-slate-500">
                  A simple practice frame while a corpus example is unavailable.
                </p>
              {/if}

              {#if grouped}
                <div class="mt-5 grid gap-7">
                  {#each groupExamplesByPattern(visibleItems) as group (group.label)}
                    <div>
                      <p
                        class="m-0 mb-3 border-b border-slate-200 pb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase"
                      >
                        {group.label}
                      </p>

                      <ol class="m-0 list-none p-0">
                        {#each group.items as item (`${item.example.slovak}-${item.index}`)}
                          {@render exampleRow(item, sense.exampleAudioSrcs, senseIndex)}
                        {/each}
                      </ol>
                    </div>
                  {/each}
                </div>
              {:else}
                <ol class="m-0 mt-5 list-none p-0">
                  {#each visibleItems as item (`${item.example.slovak}-${item.index}`)}
                    {@render exampleRow(item, sense.exampleAudioSrcs, senseIndex)}
                  {/each}
                </ol>
              {/if}

              {#if visibleItems.some((item) => item.example.note === "Tatoeba")}
                <p class="m-0 mt-4 text-xs text-slate-500">
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
        </section>
      {/each}

      {#if relatedEntries.length}
        <section
          id="related"
          class="mt-14 scroll-mt-[88px]"
          aria-labelledby="related-heading"
        >
          <h2 id="related-heading" class={headingClass}>Related words</h2>

          <ul
            class="m-0 mt-4 grid list-none grid-cols-2 gap-x-8 border-t border-slate-200 p-0 max-[560px]:grid-cols-1"
          >
            {#each relatedEntries as relatedEntry (relatedEntry.slug)}
              <li class="border-b border-slate-200">
                <a
                  class="group flex items-baseline gap-3 py-3 no-underline"
                  href={relatedEntry.href}
                >
                  <span
                    class="shrink-0 font-serif text-[1.1rem] font-semibold text-slate-900 group-hover:text-blue-800"
                    lang="sk"
                  >
                    {relatedEntry.slovak}
                  </span>
                  <span class="min-w-0 flex-1 truncate text-sm text-slate-600">
                    {relatedEntry.english}
                  </span>
                  <span
                    class="shrink-0 text-slate-300 transition-colors group-hover:text-blue-800"
                    aria-hidden="true">→</span
                  >
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <footer class="mt-14 grid gap-10 border-t border-slate-200 pt-10">
        <ExternalLookups
          lemma={entry.slovak}
          dialect={senseViews.some((sense) => sense.entry.dialect === true)}
        />

        <section id="source" class="scroll-mt-[88px]" aria-labelledby="source-heading">
          <h2 id="source-heading" class="sr-only">Source</h2>
          <p class="m-0 max-w-[66ch] text-sm leading-relaxed text-slate-500">
            Source:
            <TextLink href={entry.source}>{sourceLabel} ↗</TextLink>.
            {#if entry.sourceNote}
              {entry.sourceNote}
            {/if}
            Full attribution on <TextLink href="/references">References</TextLink>.
          </p>
        </section>
      </footer>
    </article>
  </PageShell>

  {#if audioMount}
    {@render audioMount()}
  {/if}
</main>
