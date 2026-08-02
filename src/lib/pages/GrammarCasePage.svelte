<script lang="ts">
  import { sectionLabel } from "$lib/ui/classes";

  let { data } = $props();
  const topic = $derived(data.topic);
</script>

<main class="mx-auto w-[min(780px,calc(100%-48px))] py-9 pb-[74px] max-[560px]:w-[calc(100%-28px)] max-[560px]:py-7">
  <article>
    <nav class="mb-5 flex flex-wrap gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><a class="text-blue-800 underline underline-offset-2" href="/grammar">Grammar</a><span>/</span><a class="text-blue-800 underline underline-offset-2" href="/grammar/cases-overview">Cases</a><span>/</span><span>{topic.name}</span></nav>
    <header class="border-b border-slate-200 pb-7"><p class={sectionLabel}>Slovak cases</p><h1>{topic.name}</h1><p class="mt-2 font-serif text-lg text-blue-800">{topic.question}</p><p class="mt-4 font-serif text-lg text-slate-700">{topic.summary}</p></header>
    {#if topic.status === "ready"}<section class="scroll-mt-[72px] pt-8"><p class={sectionLabel}>What it does</p><h2 class="mb-3 text-2xl">Role in a sentence</h2>{#each topic.body as paragraph (paragraph)}<p class="max-w-[66ch] font-serif leading-7 text-slate-700">{paragraph}</p>{/each}</section><section class="scroll-mt-[72px] mt-6 border-t border-slate-200 pt-8"><p class={sectionLabel}>Annotated examples</p><h2 class="mb-3 text-2xl">What this shows</h2><ol class="mt-5 grid list-none gap-2 p-0">{#each topic.examples as example (example.slovak)}<li class="grid gap-1 border-l-4 border-blue-600 bg-slate-50 px-4 py-3"><strong class="font-serif" lang="sk">{example.slovak}</strong><span class="text-sm text-slate-500">{example.english}</span>{#if example.note}<small class="border-t border-slate-200 pt-2 font-serif text-sm text-blue-800">{example.note}</small>{/if}</li>{/each}</ol></section>{:else}<section class="mt-8 rounded border border-slate-300 bg-blue-50 p-5"><p class={sectionLabel}>Research draft</p><h2 class="mb-3 text-2xl">Build this reference</h2><p class="mb-0 max-w-[66ch] font-serif leading-7 text-slate-700">This case has its own page now. Add the researched rule, common prepositions, endings, and examples here when ready.</p></section>{/if}
    {#if topic.researchPrompts.length}<section class="mt-6 border-t border-slate-200 pt-8"><p class={sectionLabel}>{topic.status === "ready" ? "Practice prompts" : "Research prompts"}</p><h2 class="mb-3 text-2xl">{topic.status === "ready" ? "Try this next" : "What to add"}</h2><ul class="grid gap-2 m-0 list-none p-0">{#each topic.researchPrompts as prompt (prompt)}<li class="border border-slate-200 px-3 py-2.5 font-serif text-slate-700">{prompt}</li>{/each}</ul></section>{/if}
  </article>
</main>
