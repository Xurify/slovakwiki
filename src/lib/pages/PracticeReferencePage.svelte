<script lang="ts">
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { onMount } from "svelte";
  import {
    addReviewItem,
    emptyPracticeState,
    readPracticeState,
    writePracticeState,
  } from "$lib/client/practice-state";
  import PracticePlayer from "$lib/components/practice/PracticePlayer.svelte";

  let { data } = $props();

  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    hydrated = true;
  });

  function recordResult(result: { itemId: string; needsReview: boolean }): void {
    if (!result.needsReview) return;
    practiceState = addReviewItem(practiceState, result.itemId);
    if (hydrated) writePracticeState(localStorage, practiceState);
  }
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[720px]">
    <nav class="mb-8 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/practice">Practice</TextLink>
      <span aria-hidden="true">/</span>
      <span>Reference item</span>
    </nav>

    {#if hydrated}
      <PracticePlayer items={[data.item]} mode="topic" onresult={recordResult} />
    {:else}
      <p class="font-serif text-slate-500">Loading practice…</p>
    {/if}
  </PageShell>
</main>
