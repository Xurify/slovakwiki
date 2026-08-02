<script lang="ts">
  import ContextRail from "$lib/components/ui/ContextRail.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { entryBySlug } from "$lib/content/data";
  import type { ContentEntry } from "$lib/content/types";

  let { entry }: { entry: ContentEntry } = $props();

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
</script>

<main class="py-10 pb-16 max-[760px]:py-7">
  <PageShell class="max-w-[1080px]">
    <div class="grid grid-cols-[minmax(0,1fr)_200px] gap-12 max-[900px]:block">
      <article class="min-w-0 max-w-[720px]">
        <header class="border-b border-slate-200 pb-8">
          <nav class="mb-5 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
            <TextLink href="/wiki">Dictionary</TextLink>
            <span aria-hidden="true">/</span>
            <span>{kindLabel[entry.kind]}</span>
          </nav>

          <h1 lang="sk">{entry.slovak}</h1>

          <p class="mt-3 font-serif text-lg text-blue-800">{entry.english}</p>
          <p class="mt-1 text-sm text-slate-500">{entry.category}</p>
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

        <section
          id="examples"
          class="scroll-mt-[88px] mt-10 border-t border-slate-200 pt-10"
          aria-labelledby="examples-heading"
        >
          <Eyebrow>Examples</Eyebrow>
          <h2 id="examples-heading" class="mb-4">In a sentence</h2>

          <ol class="m-0 list-none border-t border-slate-200 p-0">
            {#each entry.examples as example, index (`${example.slovak}-${index}`)}
              <li
                class="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-slate-200 py-4"
              >
                <span class="text-xs font-bold tabular-nums text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p class="m-0 font-serif font-semibold text-slate-900" lang="sk">
                    {example.slovak}
                  </p>
                  <small class="text-sm text-slate-500">{example.english}</small>
                </div>
              </li>
            {/each}
          </ol>
        </section>

        <section
          id="source"
          class="scroll-mt-[88px] mt-10 border-t border-slate-200 pt-10"
          aria-labelledby="source-heading"
        >
          <Eyebrow>Source</Eyebrow>
          <h2 id="source-heading" class="mb-3">Reference</h2>
          <TextLink href={entry.source}>Jazykovedný ústav Ľudovíta Štúra SAV ↗</TextLink>
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
            <a
              class="border-l-2 border-slate-200 py-1.5 pl-3 font-serif text-sm text-slate-600 hover:border-blue-800 hover:text-blue-800"
              href="#examples"
            >
              Examples
            </a>
            <a
              class="border-l-2 border-slate-200 py-1.5 pl-3 font-serif text-sm text-slate-600 hover:border-blue-800 hover:text-blue-800"
              href="#source"
            >
              Source
            </a>
          </nav>
        </section>

        {#if entry.related.length}
          <section>
            <Eyebrow compact tone="muted">Related</Eyebrow>
            <ul class="m-0 list-none p-0">
              {#each entry.related as relatedSlug (relatedSlug)}
                {@const relatedEntry = entryBySlug.get(relatedSlug)}
                {#if relatedEntry}
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
                {/if}
              {/each}
            </ul>
          </section>
        {/if}
      </ContextRail>
    </div>
  </PageShell>
</main>
