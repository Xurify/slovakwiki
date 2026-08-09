<script lang="ts">
  import type { Snippet } from "svelte";

  import ExternalLookups from "$lib/components/ExternalLookups.svelte";
  import GlossWithTerms from "$lib/components/GlossWithTerms.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { FREQUENCY_PART_OF_SPEECH_LABEL } from "$lib/content/frequency-types";
  import { EXAMPLE_DISPLAY_LIMIT } from "$lib/content/example-limits";
  import { highlightLemmaInText } from "$lib/content/highlight-lemma";
  import type { DictionaryImageView } from "$lib/content/images";
  import { senseSectionId } from "$lib/content/lemma-senses";
  import type { ContentEntry, EntryKind, Example } from "$lib/content/types";

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
  const showHeroUsageGap = $derived(
    multiSense || senseViews.some((sense) => sense.entry.body.length > 0),
  );

  function onlyPracticeFrames(examples: Example[]): boolean {
    return examples.length > 0 && examples.every((example) => example.isPracticeFrame);
  }

  /** First N examples for the page; extras stay in data for later picking. */
  function visibleExampleItems(
    examples: Example[],
  ): { example: Example; index: number }[] {
    const limit = Math.min(EXAMPLE_DISPLAY_LIMIT, examples.length);
    const items: { example: Example; index: number }[] = [];
    for (let index = 0; index < limit; index += 1) {
      items.push({ example: examples[index]!, index });
    }
    return items;
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

      <div class="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2">
        {#if multiSense}
          <span class="text-sm text-panel-inverse-ink/55">
            {senseViews.map((sense) => sense.entry.category).join(" · ")}
          </span>
        {:else}
          <span
            class="rounded-(--control-radius) border border-panel-inverse-ink/20 px-2.5 py-1 text-xs font-semibold tracking-wide text-panel-inverse-ink/80"
          >
            {entry.category}
          </span>

          {#if entry.frequency}
            <a
              class="rounded-(--control-radius) border border-panel-inverse-ink/20 px-2.5 py-1 text-xs font-semibold tabular-nums text-panel-inverse-ink/80 transition-colors hover:border-panel-inverse-ink/45 hover:bg-panel-inverse-ink/10"
              href={`/dictionary/common/${entry.frequency.partOfSpeech}`}
            >
              #{entry.frequency.rank}
              {FREQUENCY_PART_OF_SPEECH_LABEL[entry.frequency.partOfSpeech]}
            </a>
          {/if}
        {/if}
      </div>
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
    {:else}
      <div class="border-t border-panel-inverse-ink/12">
        <PageShell class="max-w-[880px]">
          <nav
            class="flex flex-wrap gap-x-5 gap-y-1 py-2.5 text-sm text-panel-inverse-ink/50"
            aria-label="On this page"
          >
            <a class="hover:text-panel-inverse-ink" href="#lookups">Elsewhere</a>
            {#if image}
              <a class="hover:text-panel-inverse-ink" href="#image">Image</a>
            {/if}
            {#if entry.body.length > 0}
              <a class="hover:text-panel-inverse-ink" href="#usage">Usage</a>
            {/if}
            {#if entry.examples.length > 0}
              <a class="hover:text-panel-inverse-ink" href="#examples">Examples</a>
            {/if}
            {#if relatedEntries.length > 0}
              <a class="hover:text-panel-inverse-ink" href="#related">Related</a>
            {/if}
            <a class="hover:text-panel-inverse-ink" href="#source">Source</a>
          </nav>
        </PageShell>
      </div>
    {/if}
  </section>

  <PageShell
    class={`max-w-[880px] ${showHeroUsageGap ? "pt-10 max-[760px]:pt-8" : "pt-8 max-[760px]:pt-6"}`}
  >
    <article class="min-w-0">
      <ExternalLookups class="mb-10" lemma={entry.slovak} />

      {#if image}
        <section
          id="image"
          class="mb-10 scroll-mt-[88px]"
          aria-labelledby="image-heading"
        >
          <h2 id="image-heading" class="mb-3 text-xl">{image.caption}</h2>

          <figure class="m-0 max-w-[22rem]">
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
              {#if image.artist}
                <span>{image.artist}</span>
                {#if image.license}
                  <span aria-hidden="true"> · </span>
                {/if}
              {/if}

              {#if image.license}
                {#if image.licenseUrl}
                  <a
                    class="underline decoration-slate-300 hover:text-slate-800"
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
                  class="underline decoration-slate-300 hover:text-slate-800"
                  href={image.sourcePageUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Wikimedia
                </a>
              {/if}
            </figcaption>
          </figure>
        </section>
      {/if}

      {#each senseViews as sense, senseIndex (sense.entry.slug)}
        {@const senseEntry = sense.entry}
        {@const hasUsage = senseEntry.body.length > 0}
        {@const sectionId = multiSense
          ? senseSectionId(senseEntry.category)
          : hasUsage
            ? "usage"
            : undefined}
        {@const examplesId = multiSense
          ? `${senseSectionId(senseEntry.category)}-examples`
          : "examples"}
        {@const practiceOnly = onlyPracticeFrames(senseEntry.examples)}
        {@const sectionLabelId = multiSense
          ? `${sectionId}-heading`
          : hasUsage
            ? "usage-heading"
            : senseEntry.examples.length > 0
              ? `${examplesId}-heading`
              : undefined}

        <section
          id={sectionId}
          class={`scroll-mt-[88px] ${
            multiSense && senseIndex > 0 ? "mt-12 border-t border-slate-200 pt-12" : ""
          }`}
          aria-labelledby={sectionLabelId}
        >
          {#if multiSense}
            <h2 id={`${sectionId}-heading`} class="mb-2">{senseEntry.category}</h2>
            <p class="font-serif text-lg text-blue-800">
              <GlossWithTerms text={senseEntry.english} />
            </p>

            {#if senseEntry.frequency}
              <p class="mt-3 text-sm text-slate-500">
                Among the most common Slovak {FREQUENCY_PART_OF_SPEECH_LABEL[
                  senseEntry.frequency.partOfSpeech
                ].toLowerCase()} (#{senseEntry.frequency.rank}).
                <TextLink href={`/dictionary/common/${senseEntry.frequency.partOfSpeech}`}
                  >Browse the list</TextLink
                >
              </p>
            {/if}

            {#if senseEntry.summary && senseEntry.summary !== `${senseEntry.slovak} means “${senseEntry.english}.”`}
              <p
                class="mt-4 max-w-[66ch] font-serif text-lg leading-relaxed text-slate-700"
              >
                {senseEntry.summary}
              </p>
            {/if}

            {#if hasUsage}
              <div class="mt-8">
                <h3 class="mb-4 text-xl">How to use it</h3>
                {#each senseEntry.body as paragraph, index (index)}
                  <p class="max-w-[66ch] font-serif leading-7 text-slate-700">
                    {paragraph}
                  </p>
                {/each}
              </div>
            {/if}
          {:else}
            {#if entry.summary && entry.summary !== `${entry.slovak} means “${entry.english}.”`}
              <p
                class="mb-8 max-w-[66ch] font-serif text-lg leading-relaxed text-slate-700"
              >
                {entry.summary}
              </p>
            {/if}

            {#if hasUsage}
              <h2 id="usage-heading" class="mb-4">How to use it</h2>

              {#each senseEntry.body as paragraph, index (index)}
                <p class="max-w-[66ch] font-serif leading-7 text-slate-700">
                  {paragraph}
                </p>
              {/each}
            {/if}
          {/if}

          {#if senseEntry.examples.length > 0}
            {@const visibleItems = visibleExampleItems(senseEntry.examples)}
            <div
              id={examplesId}
              class={`scroll-mt-[88px] ${hasUsage ? "mt-10" : multiSense ? "mt-8" : ""}`}
              aria-labelledby={`${examplesId}-heading`}
            >
              <h3 id={`${examplesId}-heading`} class="mb-4 text-xl">
                {practiceOnly ? "Try this pattern" : "In a sentence"}
              </h3>

              {#if practiceOnly}
                <p class="mb-5 max-w-[60ch] text-sm text-slate-500">
                  A simple practice frame while a corpus example is unavailable.
                </p>
              {/if}

              {#if visibleItems.some((item) => item.example.demonstrates)}
                <div class="grid gap-8">
                  {#each groupExamplesByPattern(visibleItems) as group (group.label)}
                    <div>
                      <p class="mb-3 text-xs font-semibold tracking-wide text-slate-500">
                        {group.label}
                      </p>
                      <ul class="m-0 grid list-none gap-5 p-0">
                        {#each group.items as item (`${item.example.slovak}-${item.index}`)}
                          <li class="border-l-2 border-blue-600/60 pl-4">
                            <p
                              class="m-0 font-serif text-[1.1rem] leading-snug text-slate-900"
                              lang="sk"
                            >
                              {#each highlightLemma(item.example.slovak, entry.slovak) as part, partIndex (`${partIndex}-${part.text}`)}
                                {#if part.hit}
                                  <span class="font-semibold text-blue-900"
                                    >{part.text}</span
                                  >
                                {:else}
                                  {part.text}
                                {/if}
                              {/each}{#if sense.exampleAudioSrcs[item.index]}
                                <span
                                  class="ml-3 inline-grid size-7 shrink-0 align-middle"
                                  data-audio-mount={`s${senseIndex}-e${item.index}`}
                                ></span>
                              {/if}
                            </p>
                            <p class="mt-1 m-0 text-sm leading-relaxed text-slate-500">
                              {item.example.english}
                            </p>
                            {#if item.example.isPracticeFrame}
                              <p class="mt-1 m-0 text-xs text-slate-400">
                                Practice frame
                              </p>
                            {:else if item.example.note === "Tatoeba" && item.example.tatoebaId}
                              <p class="mt-1 m-0 text-xs text-slate-400">
                                <a
                                  class="text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800"
                                  href={`https://tatoeba.org/sentences/show/${item.example.tatoebaId}`}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  Tatoeba #{item.example.tatoebaId}
                                </a>
                              </p>
                            {/if}
                          </li>
                        {/each}
                      </ul>
                    </div>
                  {/each}
                </div>
              {:else}
                <ul class="m-0 grid list-none gap-5 p-0">
                  {#each visibleItems as item (`${item.example.slovak}-${item.index}`)}
                    <li class="border-l-2 border-blue-600/60 pl-4">
                      <p
                        class="m-0 font-serif text-[1.1rem] leading-snug text-slate-900"
                        lang="sk"
                      >
                        {#each highlightLemma(item.example.slovak, entry.slovak) as part, partIndex (`${partIndex}-${part.text}`)}
                          {#if part.hit}
                            <span class="font-semibold text-blue-900">{part.text}</span>
                          {:else}
                            {part.text}
                          {/if}
                        {/each}{#if sense.exampleAudioSrcs[item.index]}
                          <span
                            class="ml-3 inline-grid size-7 shrink-0 align-middle"
                            data-audio-mount={`s${senseIndex}-e${item.index}`}
                          ></span>
                        {/if}
                      </p>
                      <p class="mt-1 m-0 text-sm leading-relaxed text-slate-500">
                        {item.example.english}
                      </p>
                      {#if item.example.isPracticeFrame}
                        <p class="mt-1 m-0 text-xs text-slate-400">Practice frame</p>
                      {:else if item.example.note === "Tatoeba" && item.example.tatoebaId}
                        <p class="mt-1 m-0 text-xs text-slate-400">
                          <a
                            class="text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800"
                            href={`https://tatoeba.org/sentences/show/${item.example.tatoebaId}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Tatoeba #{item.example.tatoebaId}
                          </a>
                        </p>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}

              {#if visibleItems.some((item) => item.example.note === "Tatoeba")}
                <p class="mt-5 text-xs text-slate-500">
                  Examples from
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
          class="scroll-mt-[88px] mt-12 border-t border-slate-200 pt-10"
          aria-labelledby="related-heading"
        >
          <h2 id="related-heading" class="mb-5">Related</h2>
          <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
            {#each relatedEntries as relatedEntry (relatedEntry.slug)}
              <li>
                <a
                  class="inline-flex max-w-full flex-col gap-0.5 rounded-(--control-radius) border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition-colors hover:border-blue-800 hover:bg-blue-50"
                  href={relatedEntry.href}
                >
                  <strong class="font-serif text-sm text-slate-900" lang="sk">
                    {relatedEntry.slovak}
                  </strong>
                  <span class="truncate text-xs text-slate-500">
                    {relatedEntry.english}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <section
        id="source"
        class="scroll-mt-[88px] mt-12 border-t border-slate-200 pt-8"
        aria-labelledby="source-heading"
      >
        <h2 id="source-heading" class="mb-1 text-base font-semibold">Source</h2>
        <TextLink href={entry.source}>{sourceLabel} ↗</TextLink>
        {#if entry.sourceNote}
          <p class="mt-1 max-w-[60ch] text-sm text-slate-500">{entry.sourceNote}</p>
        {/if}
        <p class="mt-2 text-sm text-slate-500">
          Full attribution on
          <TextLink href="/references">References</TextLink>.
        </p>
      </section>
    </article>
  </PageShell>

  {#if audioMount}
    {@render audioMount()}
  {/if}
</main>
