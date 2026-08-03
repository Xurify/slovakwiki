<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { onMount } from "svelte";
  import {
    addReviewItem,
    emptyPracticeState,
    readPracticeState,
    removeReviewItem,
    writePracticeState,
  } from "$lib/client/practice-state";
  import PracticePlayer from "$lib/components/practice/PracticePlayer.svelte";
  import PracticePlayerSkeleton from "$lib/components/practice/PracticePlayerSkeleton.svelte";
  import { practiceItemById } from "$lib/content/practice";

  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);

  const items = $derived(
    practiceState.reviewItemIds
      .map((itemId) => practiceItemById.get(itemId))
      .filter((item): item is NonNullable<typeof item> => item !== undefined),
  );

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    hydrated = true;
  });

  function recordResult(result: { itemId: string; needsReview: boolean }): void {
    practiceState = result.needsReview
      ? addReviewItem(practiceState, result.itemId)
      : removeReviewItem(practiceState, result.itemId);
    if (hydrated) writePracticeState(localStorage, practiceState);
  }
</script>

<main class="py-12 pb-20 max-[800px]:py-8">
  <PageShell class="max-w-[820px]">
    <nav class="mb-8 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/practice">Practice</TextLink>
      <span aria-hidden="true">/</span>
      <span>Review</span>
    </nav>

    {#if !hydrated}
      <PracticePlayerSkeleton mode="review" />
    {:else if items.length}
      <PracticePlayer {items} mode="review" onresult={recordResult} />
    {:else}
      <section class="max-w-[640px]">
        <Eyebrow>Review</Eyebrow>
        <h1>Nothing to review.</h1>
        <p class="mt-4 max-w-[520px] font-serif leading-relaxed text-slate-600">
          You have no missed or revealed items right now. Keep building your Slovak by
          starting a lesson or exploring a focused practice set.
        </p>
        <div class="mt-7 flex flex-wrap items-center gap-4">
          <Button href="/lessons">Start a lesson</Button>
          <TextLink href="/practice">Browse practice</TextLink>
        </div>

        <nav
          class="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-8 text-sm"
          aria-label="Continue learning"
        >
          <TextLink href="/lessons">Lessons</TextLink>
          <TextLink href="/dictionary">Dictionary</TextLink>
        </nav>
      </section>
    {/if}
  </PageShell>
</main>
