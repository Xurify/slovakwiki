<script lang="ts">
  import { onMount } from "svelte";
  import { emptyPracticeState, readPracticeState } from "$lib/client/practice-state";
  import type { PracticeItem } from "$lib/content/learning-types";
  import { practiceItemById, practiceSets } from "$lib/content/practice";

  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);
  const completedSets = $derived(practiceSets.filter((set) => practiceState.completedLessonIds.includes(set.lessonId)));
  const savedItems = $derived.by(() => {
    const items: PracticeItem[] = [];
    for (const itemId of practiceState.savedReferenceItemIds) { const item = practiceItemById.get(itemId); if (item) items.push(item); }
    return items;
  });
  onMount(() => { practiceState = readPracticeState(localStorage); hydrated = true; });
</script>

<svelte:head><title>Practice | Slovak Wiki</title><meta name="description" content="Review Slovak language moves you missed or practise a completed lesson topic."></svelte:head>

<main class="shell page max-w-[960px] pt-14 max-[620px]:pt-8">
  <header class="max-w-[690px]"><p class="section-label">Practice</p><h1>Bring Slovak back.</h1><p class="lead">Review what was uncertain, or return to a lesson topic when you want another pass.</p></header>

  <section class="mt-10 flex max-w-[780px] items-end justify-between gap-7 border border-slate-300 border-l-4 border-l-blue-600 bg-white p-6 max-[620px]:flex-col max-[620px]:items-stretch" aria-labelledby="review-heading">
    <div><p class="section-label">Review</p><h2 id="review-heading" class="text-2xl font-semibold text-slate-900">What needs another try</h2><span class="mt-2 block max-w-[50ch] font-serif leading-6 text-slate-700">Missed and revealed forms return here. Nothing else is tracked.</span><small class="mt-3 block text-xs text-slate-500"><b class="mr-1 font-serif text-sm text-blue-800" lang="sk">Skús to znova.</b> Try it again.</small></div>
    <a class="button shrink-0 max-[620px]:w-full" href="/practice/review">Open Review</a>
  </section>

  <section class="mt-9 max-w-[780px]" aria-labelledby="topics-heading">
    <div class="mb-3.5"><p class="section-label">Practice a topic</p><h2 id="topics-heading" class="text-2xl font-semibold text-slate-900">From your lessons</h2></div>
    {#if !hydrated || completedSets.length}
      <div class="border-t border-slate-200">{#each completedSets as set (set.id)}<a class="grid grid-cols-[115px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-slate-200 px-2.5 py-4 hover:bg-slate-50 max-[620px]:grid-cols-[1fr_auto]" href="/practice/{set.id}"><span class="text-xs font-bold uppercase tracking-wide text-slate-500 max-[620px]:col-span-2">{set.track}</span><strong class="font-serif text-lg text-blue-800">{set.title}</strong><small class="text-xs text-slate-600">Practice again <b aria-hidden="true">→</b></small></a>{/each}</div>
    {:else}
      <div class="border-y border-slate-200 py-5"><p class="m-0 font-serif text-slate-700">Finish a lesson to practise its language again here.</p><a class="text-link" href="/lessons">Browse lessons</a></div>
    {/if}
  </section>

  {#if hydrated && practiceState.savedReferenceItemIds.length}
    <section class="mt-9 max-w-[780px] border-t border-slate-200 pt-7" aria-labelledby="saved-heading">
      <p class="section-label">Saved from Reference</p><h2 id="saved-heading" class="text-2xl font-semibold text-slate-900">Focused items</h2>
      <div class="mt-3.5 border-t border-slate-200">{#each savedItems as item (item.id)}<a class="grid grid-cols-[120px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-slate-200 px-2.5 py-4 hover:bg-slate-50 max-[620px]:grid-cols-[1fr_auto]" href="/practice/reference/{item.id}"><span class="text-xs font-bold uppercase tracking-wide text-slate-500 max-[620px]:col-span-2">{item.source.label}</span><strong class="font-serif text-blue-800">{item.task.prompt}</strong><b class="text-blue-800" aria-hidden="true">→</b></a>{/each}</div>
    </section>
  {/if}
</main>
