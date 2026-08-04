<script lang="ts">
  import AudioButton from "$lib/components/AudioButton.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { FREQUENCY_POS_LABEL } from "$lib/content/frequency-types";
  import { senseSectionId } from "$lib/content/lemma-senses";
  import type { ContentEntry, EntryKind, Example } from "$lib/content/types";

  interface RelatedEntry {
    english: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  interface SenseView {
    entry: ContentEntry;
    exampleAudioSrcs: string[];
  }

  let {
    entry,
    exampleAudioSrcs = [],
    lemmaAudioSrc,
    relatedEntries = [],
    senses,
  }: {
    entry: ContentEntry;
    exampleAudioSrcs?: string[];
    lemmaAudioSrc?: string;
    relatedEntries?: RelatedEntry[];
    senses?: SenseView[];
  } = $props();

  const routeBase = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };
  const kindLabel = {
    grammar: "Grammar",
    pronunciation: "Pronunciation",
    word: "Dictionary",
  };

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

  function onlyPracticeFrames(examples: Example[]): boolean {
    return examples.length > 0 && examples.every((example) => example.isPracticeFrame);
  }

  function groupExamplesByPattern(
    examples: Example[],
  ): { label: string; items: { example: Example; index: number }[] }[] {
    const groups: {
      label: string;
      items: { example: Example; index: number }[];
    }[] = [];
    const indexByLabel = new Map<string, number>();

    for (let index = 0; index < examples.length; index += 1) {
      const example = examples[index]!;
      const label = example.demonstrates?.trim() || "Other";
      const existing = indexByLabel.get(label);
      if (existing === undefined) {
        indexByLabel.set(label, groups.length);
        groups.push({ label, items: [{ example, index }] });
      } else {
        groups[existing]!.items.push({ example, index });
      }
    }

    return groups;
  }

  /** Split SK example so lemma stem can be emphasized when it appears. */
  function highlightLemma(
    slovakLine: string,
    lemma: string,
  ): { text: string; hit: boolean }[] {
    const needle = lemma.trim();
    if (!needle) return [{ text: slovakLine, hit: false }];

    const lowerLine = slovakLine.toLocaleLowerCase("sk");
    const lowerNeedle = needle.toLocaleLowerCase("sk");
    const at = lowerLine.indexOf(lowerNeedle);
    if (at === -1) return [{ text: slovakLine, hit: false }];

    const before = slovakLine.slice(0, at);
    const match = slovakLine.slice(at, at + needle.length);
    const after = slovakLine.slice(at + needle.length);
    const parts: { text: string; hit: boolean }[] = [];
    if (before) parts.push({ text: before, hit: false });
    parts.push({ text: match, hit: true });
    if (after) parts.push({ text: after, hit: false });
    return parts;
  }
</script>

<main class="pb-16">
  <!-- Lemma Stage hero -->
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

    <PageShell
      class="relative max-w-[880px] pt-8 pb-10 max-[760px]:pt-6 max-[760px]:pb-8"
    >
      <nav
        class="mb-8 flex gap-2 text-xs text-panel-inverse-ink/55"
        aria-label="Breadcrumb"
      >
        <TextLink
          class="text-panel-inverse-ink/70 decoration-panel-inverse-ink/30 hover:text-panel-inverse-ink"
          href="/dictionary"
        >
          Dictionary
        </TextLink>
        <span aria-hidden="true">/</span>
        <span>{kindLabel[entry.kind]}</span>
      </nav>

      <div class="flex flex-wrap items-end gap-x-5 gap-y-4">
        <h1
          id="lemma-heading"
          class="m-0 max-w-[16ch] font-serif text-[clamp(2.75rem,8vw,4.75rem)] leading-[0.95] tracking-[-0.02em] text-panel-inverse-ink"
          lang="sk"
        >
          {entry.slovak}
        </h1>

        {#if lemmaAudioSrc}
          <div class="mb-1.5 shrink-0">
            <AudioButton
              label={`Listen to ${entry.slovak}`}
              size="lg"
              src={lemmaAudioSrc}
              text={entry.slovak}
              variant="inverse"
            />
          </div>
        {/if}
      </div>

      <p
        class="mt-5 max-w-[40ch] font-serif text-[clamp(1.15rem,2.5vw,1.45rem)] leading-snug text-panel-inverse-ink/85"
      >
        {heroGloss}
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
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
              href={`/dictionary/common/${entry.frequency.pos}`}
            >
              #{entry.frequency.rank}
              {FREQUENCY_POS_LABEL[entry.frequency.pos]}
            </a>
          {/if}
        {/if}
      </div>

      {#if !multiSense}
        <p
          class="mt-6 max-w-[66ch] font-serif text-base leading-relaxed text-panel-inverse-ink/65"
        >
          {entry.summary}
        </p>
      {/if}
    </PageShell>

    {#if multiSense}
      <div
        class="sticky top-(--header-height) z-10 border-t border-panel-inverse-ink/15 bg-panel-inverse/95 backdrop-blur-sm"
      >
        <PageShell class="max-w-[880px]">
          <nav class="flex gap-1 overflow-x-auto py-2 scrollbar-none" aria-label="Senses">
            {#each senseViews as sense (sense.entry.slug)}
              <a
                class="shrink-0 rounded-(--control-radius) px-3.5 py-2 font-sans text-sm font-semibold text-panel-inverse-ink/70 transition-colors hover:bg-panel-inverse-ink/10 hover:text-panel-inverse-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panel-inverse-ink"
                href="#{senseSectionId(sense.entry.category)}"
              >
                {sense.entry.category}
              </a>
            {/each}
          </nav>
        </PageShell>
      </div>
    {:else}
      <div class="border-t border-panel-inverse-ink/15">
        <PageShell class="max-w-[880px]">
          <nav
            class="flex flex-wrap gap-x-5 gap-y-2 py-3 text-sm text-panel-inverse-ink/55"
            aria-label="On this page"
          >
            <a
              class="font-medium text-panel-inverse-ink/70 transition-colors hover:text-panel-inverse-ink"
              href="#usage"
            >
              Usage
            </a>
            {#if entry.examples.length > 0}
              <a
                class="font-medium text-panel-inverse-ink/70 transition-colors hover:text-panel-inverse-ink"
                href="#examples"
              >
                Examples
              </a>
            {/if}
            <a
              class="font-medium text-panel-inverse-ink/70 transition-colors hover:text-panel-inverse-ink"
              href="#source"
            >
              Source
            </a>
          </nav>
        </PageShell>
      </div>
    {/if}
  </section>

  <PageShell class="max-w-[880px] pt-10 max-[760px]:pt-8">
    <article class="min-w-0">
      {#each senseViews as sense, senseIndex (sense.entry.slug)}
        {@const senseEntry = sense.entry}
        {@const sectionId = multiSense ? senseSectionId(senseEntry.category) : "usage"}
        {@const examplesId = multiSense
          ? `${senseSectionId(senseEntry.category)}-examples`
          : "examples"}
        {@const practiceOnly = onlyPracticeFrames(senseEntry.examples)}

        <section
          id={sectionId}
          class={`scroll-mt-[88px] ${
            multiSense && senseIndex > 0 ? "mt-12 border-t border-slate-200 pt-12" : ""
          }`}
          aria-labelledby={`${sectionId}-heading`}
        >
          {#if multiSense}
            <Eyebrow>{senseEntry.category}</Eyebrow>
            <h2 id={`${sectionId}-heading`} class="mb-2">{senseEntry.category}</h2>
            <p class="font-serif text-lg text-blue-800">{senseEntry.english}</p>

            {#if senseEntry.frequency}
              <p class="mt-3 text-sm text-slate-500">
                Among the most common Slovak {FREQUENCY_POS_LABEL[
                  senseEntry.frequency.pos
                ].toLowerCase()} (#{senseEntry.frequency.rank}).
                <TextLink href={`/dictionary/common/${senseEntry.frequency.pos}`}
                  >Browse the list</TextLink
                >
              </p>
            {/if}

            <p
              class="mt-4 max-w-[66ch] font-serif text-lg leading-relaxed text-slate-700"
            >
              {senseEntry.summary}
            </p>

            <div class="mt-8">
              <Eyebrow>Usage</Eyebrow>
              <h3 class="mb-4 text-xl">How to use it</h3>
              {#each senseEntry.body as paragraph, index (index)}
                <p class="max-w-[66ch] font-serif leading-7 text-slate-700">
                  {paragraph}
                </p>
              {/each}
            </div>
          {:else}
            <Eyebrow>Usage</Eyebrow>
            <h2 id={`${sectionId}-heading`} class="mb-4">How to use it</h2>

            {#each senseEntry.body as paragraph, index (index)}
              <p class="max-w-[66ch] font-serif leading-7 text-slate-700">
                {paragraph}
              </p>
            {/each}
          {/if}

          {#if senseEntry.examples.length > 0}
            <div
              id={examplesId}
              class="scroll-mt-[88px] mt-10"
              aria-labelledby={`${examplesId}-heading`}
            >
              <Eyebrow>{practiceOnly ? "Practice frame" : "Examples"}</Eyebrow>
              <h3 id={`${examplesId}-heading`} class="mb-4 text-xl">
                {practiceOnly ? "Try this pattern" : "In a sentence"}
              </h3>

              {#if practiceOnly}
                <p class="mb-5 max-w-[60ch] text-sm text-slate-500">
                  A simple practice frame, generated for this entry while a corpus example
                  is unavailable.
                </p>
              {/if}

              {#if senseEntry.examples.some((example) => example.demonstrates)}
                <div class="grid gap-10">
                  {#each groupExamplesByPattern(senseEntry.examples) as group (group.label)}
                    <div>
                      <p
                        class="mb-4 font-sans text-xs font-semibold tracking-wide text-slate-500"
                      >
                        {group.label}
                      </p>
                      <ul class="m-0 grid list-none gap-4 p-0">
                        {#each group.items as item (`${item.example.slovak}-${item.index}`)}
                          <li
                            class="border-l-[3px] border-blue-600/70 pl-4 transition-[border-color] motion-safe:duration-200 hover:border-blue-800"
                          >
                            <div class="flex items-start gap-3">
                              <p
                                class="m-0 min-w-0 flex-1 font-serif text-[1.15rem] font-semibold leading-snug text-slate-900"
                                lang="sk"
                              >
                                {#each highlightLemma(item.example.slovak, entry.slovak) as part, partIndex (`${partIndex}-${part.text}`)}
                                  {#if part.hit}
                                    <mark
                                      class="rounded-sm bg-blue-50 px-0.5 text-blue-900"
                                      >{part.text}</mark
                                    >
                                  {:else}
                                    {part.text}
                                  {/if}
                                {/each}
                              </p>

                              {#if sense.exampleAudioSrcs[item.index]}
                                <div class="shrink-0">
                                  <AudioButton
                                    label={`Listen to example: ${item.example.slovak}`}
                                    src={sense.exampleAudioSrcs[item.index]}
                                    text={item.example.slovak}
                                  />
                                </div>
                              {/if}
                            </div>
                            <p
                              class="mt-1.5 m-0 text-[0.95rem] leading-relaxed text-slate-500"
                            >
                              {item.example.english}
                            </p>
                            {#if item.example.isPracticeFrame}
                              <p class="mt-1.5 m-0 text-xs font-medium text-slate-400">
                                Practice frame
                              </p>
                            {:else if item.example.note === "Tatoeba" && item.example.tatoebaId}
                              <p class="mt-1.5 m-0 text-xs text-slate-400">
                                <a
                                  class="text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800"
                                  href={`https://tatoeba.org/sentences/show/${item.example.tatoebaId}`}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  Tatoeba #{item.example.tatoebaId}
                                </a>
                              </p>
                            {:else if item.example.note === "Curated" || item.example.demonstrates}
                              <p class="mt-1.5 m-0 text-xs font-medium text-slate-400">
                                Reviewed
                              </p>
                            {/if}
                          </li>
                        {/each}
                      </ul>
                    </div>
                  {/each}
                </div>
              {:else}
                <ul class="m-0 grid list-none gap-4 p-0">
                  {#each senseEntry.examples as example, index (`${example.slovak}-${index}`)}
                    <li
                      class="border-l-[3px] border-blue-600/70 pl-4 transition-[border-color] motion-safe:duration-200 hover:border-blue-800"
                    >
                      <div class="flex items-start gap-3">
                        <p
                          class="m-0 min-w-0 flex-1 font-serif text-[1.15rem] font-semibold leading-snug text-slate-900"
                          lang="sk"
                        >
                          {#each highlightLemma(example.slovak, entry.slovak) as part, partIndex (`${partIndex}-${part.text}`)}
                            {#if part.hit}
                              <mark class="rounded-sm bg-blue-50 px-0.5 text-blue-900"
                                >{part.text}</mark
                              >
                            {:else}
                              {part.text}
                            {/if}
                          {/each}
                        </p>

                        {#if sense.exampleAudioSrcs[index]}
                          <div class="shrink-0">
                            <AudioButton
                              label={`Listen to example: ${example.slovak}`}
                              src={sense.exampleAudioSrcs[index]}
                              text={example.slovak}
                            />
                          </div>
                        {/if}
                      </div>
                      <p class="mt-1.5 m-0 text-[0.95rem] leading-relaxed text-slate-500">
                        {example.english}
                      </p>
                      {#if example.isPracticeFrame}
                        <p class="mt-1.5 m-0 text-xs font-medium text-slate-400">
                          Practice frame
                        </p>
                      {:else if example.note === "Tatoeba" && example.tatoebaId}
                        <p class="mt-1.5 m-0 text-xs text-slate-400">
                          <a
                            class="text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800"
                            href={`https://tatoeba.org/sentences/show/${example.tatoebaId}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Tatoeba #{example.tatoebaId}
                          </a>
                        </p>
                      {:else if example.note === "Curated" || example.demonstrates}
                        <p class="mt-1.5 m-0 text-xs font-medium text-slate-400">
                          Reviewed
                        </p>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}

              {#if senseEntry.examples.some((example) => example.note === "Tatoeba")}
                <p class="mt-5 text-xs text-slate-500">
                  Example sentences from
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
          class="scroll-mt-[88px] mt-14 border-t border-slate-200 pt-10"
          aria-labelledby="related-heading"
        >
          <Eyebrow>Related</Eyebrow>
          <h2 id="related-heading" class="mb-5">Keep browsing</h2>
          <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
            {#each relatedEntries as relatedEntry (relatedEntry.slug)}
              <li>
                <a
                  class="inline-flex max-w-full flex-col gap-0.5 rounded-(--control-radius) border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition-colors hover:border-blue-800 hover:bg-blue-50"
                  href="/{routeBase[relatedEntry.kind]}/{relatedEntry.slug}"
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
        <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <div>
            <h2 id="source-heading" class="mb-1 text-base font-semibold">Source</h2>
            <TextLink href={entry.source}>{sourceLabel} ↗</TextLink>
            {#if entry.sourceNote}
              <p class="mt-1 max-w-[60ch] text-sm text-slate-500">{entry.sourceNote}</p>
            {/if}
          </div>
          <p class="m-0 text-sm text-slate-500">
            Full attribution on
            <TextLink href="/references">References</TextLink>.
          </p>
        </div>
      </section>
    </article>
  </PageShell>
</main>
