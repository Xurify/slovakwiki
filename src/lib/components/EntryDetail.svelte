<script lang="ts">
  import { entryBySlug } from "$lib/content/data";
  import type { ContentEntry } from "$lib/content/types";

  let { entry }: { entry: ContentEntry } = $props();
  const routeBase = { grammar: "grammar", pronunciation: "pronunciation", word: "dictionary" };
  const kindLabel = { grammar: "Grammar", pronunciation: "Pronunciation", word: "Dictionary" };
</script>

<svelte:head><title>{entry.slovak} — {entry.english} | Slovak Wiki</title><meta name="description" content={entry.summary}></svelte:head>

<main><div class="grid grid-cols-[minmax(0,1fr)_210px] max-[1080px]:block">
  <article class="mx-auto w-full max-w-[760px] px-[30px] py-[34px] pb-[74px] max-[760px]:px-3.5 max-[760px]:py-7 max-[760px]:pb-[52px]">
    <header class="border-b border-slate-200 pb-7"><nav class="mb-5 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><a class="text-blue-800 underline underline-offset-2" href="/wiki">Reference</a><span>/</span><span>{kindLabel[entry.kind]}</span></nav><h1 lang="sk">{entry.slovak}</h1><div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500"><span class="h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-100" aria-hidden="true"></span><strong class="font-serif text-base text-blue-800">{entry.english}</strong><span>{entry.category}</span></div><p class="mt-4 max-w-[66ch] font-serif text-lg text-slate-700">{entry.summary}</p></header>
    <section id="usage" class="scroll-mt-[72px] pt-8" aria-labelledby="usage-heading"><p class="section-label">Usage</p><h2 id="usage-heading" class="mb-3 text-2xl">How to use it</h2>{#each entry.body as paragraph, index (index)}<p class="max-w-[67ch] font-serif leading-7 text-slate-700">{paragraph}</p>{/each}</section>
    <section id="examples" class="scroll-mt-[72px] mt-6 border-t border-slate-200 pt-8" aria-labelledby="examples-heading"><p class="section-label">Examples</p><h2 id="examples-heading" class="mb-3 text-2xl">In a sentence</h2><ol class="surface-panel mt-5 m-0 list-none rounded bg-slate-50 p-0">{#each entry.examples as example, index (`${example.slovak}-${index}`)}<li class="grid grid-cols-[32px_1fr] gap-3 border-b border-slate-200 px-4 py-3.5 last:border-b-0"><span class="text-xs font-bold text-blue-700">{String(index + 1).padStart(2, "0")}</span><div><p class="m-0 mb-0.5 font-serif font-semibold text-slate-900" lang="sk">{example.slovak}</p><small class="text-xs text-slate-500">{example.english}</small></div></li>{/each}</ol></section>
    <section id="source" class="scroll-mt-[72px] mt-6 border-t border-slate-200 pt-8" aria-labelledby="source-heading"><p class="section-label">Source</p><h2 id="source-heading" class="mb-3 text-2xl">Reference</h2><a class="font-serif font-semibold text-blue-800 underline underline-offset-2" href={entry.source}>Jazykovedný ústav Ľudovíta Štúra SAV ↗</a></section>
  </article>
  <aside class="context-rail sticky top-[var(--header-height)] h-fit min-w-0 border-l border-slate-200 px-[18px] pb-12 pt-8 max-[1080px]:static max-[1080px]:grid max-[1080px]:grid-cols-2 max-[1080px]:gap-8 max-[1080px]:border-l-0 max-[1080px]:border-t max-[1080px]:px-[30px] max-[1080px]:py-6 max-[760px]:grid-cols-1 max-[760px]:gap-6 max-[760px]:px-3.5" aria-label="Entry navigation">
    <section><p class="rail-label">On this page</p><nav class="grid border-l-2 border-slate-200"><a class="border-l-2 border-blue-600 py-1.5 pl-2.5 font-serif text-sm text-blue-800" href="#usage">How to use it</a><a class="py-1.5 pl-2.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline" href="#examples">Examples</a><a class="py-1.5 pl-2.5 font-serif text-sm text-slate-700 hover:text-blue-800 hover:underline" href="#source">Reference</a></nav></section>
    <section><p class="rail-label">Related entries</p><ul class="m-0 list-none p-0">{#each entry.related as relatedSlug (relatedSlug)}{@const relatedEntry = entryBySlug.get(relatedSlug)}{#if relatedEntry}<li class="border-b border-slate-200"><a class="grid gap-0.5 py-2" href="/{routeBase[relatedEntry.kind]}/{relatedEntry.slug}"><strong class="font-serif text-sm text-blue-800">{relatedEntry.slovak}</strong><small class="truncate text-xs text-slate-500">{relatedEntry.english}</small></a></li>{/if}{/each}</ul></section>
  </aside>
</div></main>
