<script lang="ts">
  import { onMount } from "svelte";
  import { addReviewItem, emptyPracticeState, readPracticeState, removeReviewItem, writePracticeState } from "$lib/client/practice-state";
  import PracticePlayer from "$lib/components/practice/PracticePlayer.svelte";
  import { practiceItemById } from "$lib/content/practice";

  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);
  const items = $derived(practiceState.reviewItemIds.map((itemId) => practiceItemById.get(itemId)).filter((item): item is NonNullable<typeof item> => item !== undefined));

  onMount(() => { practiceState = readPracticeState(localStorage); hydrated = true; });
  function recordResult(result: { itemId: string; needsReview: boolean }): void {
    practiceState = result.needsReview ? addReviewItem(practiceState, result.itemId) : removeReviewItem(practiceState, result.itemId);
    if (hydrated) writePracticeState(localStorage, practiceState);
  }
</script>

<svelte:head><title>Review | Slovak Wiki</title><meta name="description" content="Review Slovak phrases and forms you want to keep close."></svelte:head>

<main class="px-[30px] py-12 pb-[78px] max-[600px]:px-3.5 max-[600px]:py-[30px] max-[600px]:pb-[54px]">
  <div class="mx-auto w-full max-w-[720px]">
    <nav class="mb-8 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><a class="text-blue-800 underline underline-offset-2" href="/practice">Practice</a><span aria-hidden="true">/</span><span>Review</span></nav>
    {#if !hydrated}
      <p class="font-serif text-slate-500">Loading Review...</p>
    {:else if items.length}
      <PracticePlayer {items} mode="review" onresult={recordResult} />
    {:else}
      <section class="max-w-[570px] border-l-4 border-blue-600 bg-blue-50 p-7">
        <p class="m-0 text-xs font-semibold uppercase tracking-widest text-blue-800">Review</p>
        <h1 class="mb-1.5 mt-2 text-4xl font-semibold tracking-tight text-slate-900">Nothing needs another try.</h1>
        <span class="font-serif leading-6 text-slate-700">Missed or revealed items from Lessons and Practice will appear here.</span>
        <a class="button mt-5" href="/lessons">Browse lessons</a>
      </section>
    {/if}
  </div>
</main>
