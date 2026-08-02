<script lang="ts">
  import ContextRail from "$lib/components/ui/ContextRail.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { FREQUENCY_POS_LABEL } from "$lib/content/frequency-types";
  import type { ContentEntry, EntryKind, Example } from "$lib/content/types";

  interface RelatedEntry {
    english: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  let {
    entry,
    relatedEntries = [],
  }: {
    entry: ContentEntry;
    relatedEntries?: RelatedEntry[];
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

  const sourceLabel = $derived(
    entry.sourceLabel ?? "Jazykovedný ústav Ľudovíta Štúra SAV",
  );
  const onlyPracticeFrames = $derived(
    entry.examples.length > 0 &&
      entry.examples.every((example) => example.isPracticeFrame),
  );

  function groupExamplesByPattern(
    examples: Example[],
  ): { label: string; examples: Example[] }[] {
    const groups: { label: string; examples: Example[] }[] = [];
    const indexByLabel = new Map<string, number>();

    for (const example of examples) {
      const label = example.demonstrates?.trim() || "Other";
      const existing = indexByLabel.get(label);
      if (existing === undefined) {
        indexByLabel.set(label, groups.length);
        groups.push({ label, examples: [example] });
      } else {
        groups[existing]!.examples.push(example);
      }
    }

    return groups;
  }
</script>

<main class="py-10 pb-16 max-[760px]:py-7">
  <PageShell class="max-w-[1080px]">
    <div class="grid grid-cols-[minmax(0,1fr)_200px] gap-12 max-[900px]:block">
      <article class="min-w-0 max-w-[720px]">
        <header class="border-b border-slate-200 pb-8">
          <nav class="mb-5 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
            <TextLink href="/dictionary">Dictionary</TextLink>
            <span aria-hidden="true">/</span>
            <span>{kindLabel[entry.kind]}</span>
          </nav>

          <h1 lang="sk">{entry.slovak}</h1>

          <p class="mt-3 font-serif text-lg text-blue-800">{entry.english}</p>
          <p class="mt-1 text-sm text-slate-500">{entry.category}</p>

          {#if entry.frequency}
            <p class="mt-3 text-sm text-slate-500">
              Among the most common Slovak {FREQUENCY_POS_LABEL[
                entry.frequency.pos
              ].toLowerCase()} (#{entry.frequency.rank}).
              <TextLink href={`/dictionary/common/${entry.frequency.pos}`}
                >Browse the list</TextLink
              >
            </p>
          {/if}

          <p class="mt-5 max-w-[66ch] font-serif text-lg leading-relaxed text-slate-700">
            {entry.summary}
          </p>
        </header>

        <section
          id="usage"
          class="scroll-mt-[88px] pt-10"
          aria-labelledby="usage-heading"
        >
          <Eyebrow>Usage</Eyebrow>
          <h2 id="usage-heading" class="mb-4">How to use it</h2>

          {#each entry.body as paragraph, index (index)}
            <p class="max-w-[67ch] font-serif leading-7 text-slate-700">
              {paragraph}
            </p>
          {/each}
        </section>

        {#if entry.examples.length > 0}
          <section
            id="examples"
            class="scroll-mt-[88px] mt-10 border-t border-slate-200 pt-10"
            aria-labelledby="examples-heading"
          >
            <Eyebrow>{onlyPracticeFrames ? "Practice frame" : "Examples"}</Eyebrow>
            <h2 id="examples-heading" class="mb-4">
              {onlyPracticeFrames ? "Try this pattern" : "In a sentence"}
            </h2>

            {#if onlyPracticeFrames}
              <p class="mb-4 max-w-[60ch] text-sm text-slate-500">
                A simple practice frame, generated for this entry while a corpus example
                is unavailable.
              </p>
            {/if}

            {#if entry.examples.some((example) => example.demonstrates)}
              <div class="grid gap-8">
                {#each groupExamplesByPattern(entry.examples) as group (group.label)}
                  <div>
                    <p
                      class="mb-3 border-b border-slate-200 pb-2 font-sans text-xs font-semibold tracking-wide text-slate-500"
                    >
                      {group.label}
                    </p>
                    <ol class="m-0 list-none p-0">
                      {#each group.examples as example, index (`${example.slovak}-${index}`)}
                        <li
                          class="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-slate-200 py-4 last:border-b-0"
                        >
                          <span class="text-xs font-bold tabular-nums text-slate-400">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <p
                              class="m-0 font-serif font-semibold text-slate-900"
                              lang="sk"
                            >
                              {example.slovak}
                            </p>
                            <small class="text-sm text-slate-500">{example.english}</small
                            >
                            {#if example.isPracticeFrame}
                              <small
                                class="mt-1 block text-xs font-medium text-slate-400"
                              >
                                Practice frame
                              </small>
                            {:else if example.note === "Tatoeba" && example.tatoebaId}
                              <small class="mt-1 block text-xs text-slate-400">
                                <a
                                  class="text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800"
                                  href={`https://tatoeba.org/sentences/show/${example.tatoebaId}`}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  Tatoeba #{example.tatoebaId}
                                </a>
                              </small>
                            {:else if example.note === "Curated" || example.demonstrates}
                              <small
                                class="mt-1 block text-xs font-medium text-slate-400"
                              >
                                Reviewed
                              </small>
                            {/if}
                          </div>
                        </li>
                      {/each}
                    </ol>
                  </div>
                {/each}
              </div>
            {:else}
              <ol class="m-0 list-none border-t border-slate-200 p-0">
                {#each entry.examples as example, index (`${example.slovak}-${index}`)}
                  <li
                    class="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-slate-200 py-4 last:border-b-0"
                  >
                    <span class="text-xs font-bold tabular-nums text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p class="m-0 font-serif font-semibold text-slate-900" lang="sk">
                        {example.slovak}
                      </p>
                      <small class="text-sm text-slate-500">{example.english}</small>
                      {#if example.isPracticeFrame}
                        <small class="mt-1 block text-xs font-medium text-slate-400">
                          Practice frame
                        </small>
                      {:else if example.note === "Tatoeba" && example.tatoebaId}
                        <small class="mt-1 block text-xs text-slate-400">
                          <a
                            class="text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800"
                            href={`https://tatoeba.org/sentences/show/${example.tatoebaId}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Tatoeba #{example.tatoebaId}
                          </a>
                        </small>
                      {:else if example.note === "Curated" || example.demonstrates}
                        <small class="mt-1 block text-xs font-medium text-slate-400">
                          Reviewed
                        </small>
                      {/if}
                    </div>
                  </li>
                {/each}
              </ol>
            {/if}

            {#if entry.examples.some((example) => example.note === "Tatoeba")}
              <p class="mt-4 text-xs text-slate-500">
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
          </section>
        {/if}

        <section
          id="source"
          class="scroll-mt-[88px] mt-10 border-t border-slate-200 pt-10"
          aria-labelledby="source-heading"
        >
          <Eyebrow>Source</Eyebrow>
          <h2 id="source-heading" class="mb-3">Reference</h2>
          <TextLink href={entry.source}>{sourceLabel} ↗</TextLink>
          {#if entry.sourceNote}
            <p class="mt-2 max-w-[60ch] text-sm text-slate-500">{entry.sourceNote}</p>
          {/if}
          <p class="mt-3 text-sm text-slate-500">
            Full attribution on
            <TextLink href="/references">References</TextLink>.
          </p>
        </section>
      </article>

      <ContextRail
        class="sticky top-[calc(var(--header-height)+1.5rem)] h-fit max-[900px]:static max-[900px]:mt-12 max-[900px]:border-t max-[900px]:border-slate-200 max-[900px]:pt-8"
        aria-label="Entry navigation"
      >
        <section>
          <Eyebrow compact tone="muted">On this page</Eyebrow>
          <nav class="grid">
            <a
              class="border-l-2 border-blue-800 py-1.5 pl-3 font-serif text-sm text-blue-800"
              href="#usage"
            >
              How to use it
            </a>
            {#if entry.examples.length > 0}
              <a
                class="border-l-2 border-slate-200 py-1.5 pl-3 font-serif text-sm text-slate-600 hover:border-blue-800 hover:text-blue-800"
                href="#examples"
              >
                Examples
              </a>
            {/if}
            <a
              class="border-l-2 border-slate-200 py-1.5 pl-3 font-serif text-sm text-slate-600 hover:border-blue-800 hover:text-blue-800"
              href="#source"
            >
              Source
            </a>
          </nav>
        </section>

        {#if relatedEntries.length}
          <section>
            <Eyebrow compact tone="muted">Related</Eyebrow>
            <ul class="m-0 list-none p-0">
              {#each relatedEntries as relatedEntry (relatedEntry.slug)}
                <li class="border-b border-slate-200">
                  <a
                    class="grid gap-0.5 py-3 transition-colors hover:text-blue-800"
                    href="/{routeBase[relatedEntry.kind]}/{relatedEntry.slug}"
                  >
                    <strong class="font-serif text-sm" lang="sk">
                      {relatedEntry.slovak}
                    </strong>
                    <small class="truncate text-xs text-slate-500">
                      {relatedEntry.english}
                    </small>
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      </ContextRail>
    </div>
  </PageShell>
</main>
