<script lang="ts">
  import { onMount } from "svelte";
  import { addReviewItem, emptyPracticeState, readPracticeState, writePracticeState } from "$lib/client/practice-state";
  import PracticePlayer from "$lib/components/practice/PracticePlayer.svelte";

  let { data } = $props();
  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);
  onMount(() => { practiceState = readPracticeState(localStorage); hydrated = true; });
  function recordResult(result: { itemId: string; needsReview: boolean }): void { if (!result.needsReview) return; practiceState = addReviewItem(practiceState, result.itemId); if (hydrated) writePracticeState(localStorage, practiceState); }
</script>

<svelte:head><title>Reference practice | Slovak Wiki</title><meta name="description" content="Practise one Slovak form saved from the reference."></svelte:head>

<main class="px-[30px] py-12 pb-[78px] max-[600px]:px-3.5 max-[600px]:py-[30px] max-[600px]:pb-[54px]"><div class="mx-auto w-full max-w-[720px]"><nav class="mb-8 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><a class="text-blue-800 underline underline-offset-2" href="/practice">Practice</a><span aria-hidden="true">/</span><span>Reference item</span></nav><PracticePlayer items={[data.item]} mode="topic" onresult={recordResult} /></div></main>
