<script lang="ts">
  import { onMount } from "svelte";
  import { addReviewItem, emptyPracticeState, readPracticeState, writePracticeState } from "$lib/client/practice-state";
  import PracticePlayer from "$lib/components/practice/PracticePlayer.svelte";
  import { practiceItemById } from "$lib/content/practice";

  let { data } = $props();
  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);
  const items = $derived(data.set.itemIds.map((itemId: string) => practiceItemById.get(itemId)).filter((item): item is NonNullable<typeof item> => item !== undefined));
  onMount(() => { practiceState = readPracticeState(localStorage); hydrated = true; });
  function recordResult(result: { itemId: string; needsReview: boolean }): void { if (!result.needsReview) return; practiceState = addReviewItem(practiceState, result.itemId); if (hydrated) writePracticeState(localStorage, practiceState); }
</script>

<main class="px-[30px] py-12 pb-[78px] max-[600px]:px-3.5 max-[600px]:py-[30px] max-[600px]:pb-[54px]"><div class="mx-auto w-full max-w-[720px]"><nav class="mb-8 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><a class="text-blue-800 underline underline-offset-2" href="/practice">Practice</a><span aria-hidden="true">/</span><span>{data.set.title}</span></nav>{#if !hydrated}<p class="font-serif text-slate-500">Loading practice…</p>{:else if items.length}<PracticePlayer items={items} mode="topic" onresult={recordResult} />{:else}<p class="font-serif text-slate-700">This practice topic is not available yet.</p>{/if}</div></main>
