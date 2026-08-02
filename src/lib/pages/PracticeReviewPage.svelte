<script lang="ts">
  import { onMount } from "svelte";
  import {
    addReviewItem,
    emptyPracticeState,
    readPracticeState,
    removeReviewItem,
    writePracticeState,
  } from "$lib/client/practice-state";
  import PracticePlayer from "$lib/components/practice/PracticePlayer.svelte";
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

<main
  class="min-h-[min(620px,calc(100vh-var(--header-height)))] px-8 py-12 pb-[72px] max-[800px]:px-5 max-[800px]:py-9 max-[800px]:pb-14"
>
  <div class="mx-auto w-full max-w-[1120px]">
    <nav class="mb-10 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <a class="text-blue-800 underline underline-offset-2" href="/practice">Practice</a>
      <span aria-hidden="true">/</span>
      <span>Review</span>
    </nav>

    {#if !hydrated}
      <p class="font-serif text-slate-500">Loading Review...</p>
    {:else if items.length}
      <PracticePlayer {items} mode="review" onresult={recordResult} />
    {:else}
      <section
        class="grid max-w-[920px] grid-cols-[minmax(0,1fr)_280px] border border-(--line) bg-(--surface) max-[800px]:grid-cols-1"
      >
        <div class="px-14 py-14 max-[800px]:px-5 max-[800px]:py-9">
          <p class="mb-4 text-[0.82rem] font-bold text-(--accent-dark)">Review</p>
          <h1 class="max-w-[560px] text-[clamp(2.4rem,4vw,3.65rem)] tracking-tight">
            Nothing to review.
          </h1>
          <p
            class="mt-[18px] max-w-[520px] text-[0.98rem] leading-[1.65] text-(--muted-strong)"
          >
            You have no missed or revealed items right now. Keep building your Slovak by
            starting a lesson or exploring a focused practice set.
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-[18px]">
            <a
              class="inline-flex min-h-11 items-center justify-center rounded-(--control-radius) bg-(--action) px-4 font-bold text-white hover:bg-(--action-dark)"
              href="/lessons"
            >
              Start a lesson
            </a>
            <a
              class="text-[0.82rem] font-bold text-(--accent-dark) underline decoration-[color-mix(in_srgb,var(--accent)_55%,transparent)] underline-offset-[3px]"
              href="/practice"
            >
              Browse practice
            </a>
          </div>
        </div>

        <aside
          class="flex flex-col items-stretch border-l border-(--line) py-10 pl-8 max-[800px]:border-l-0 max-[800px]:border-t max-[800px]:py-7 max-[800px]:pl-0"
          aria-label="Review queue information"
        >
          <p class="mb-3.5 text-[0.86rem] font-bold text-(--ink)">Keep learning</p>
          <a
            class="flex justify-between gap-4 border-t border-(--line) py-3.5 pr-4 text-[0.88rem] font-semibold text-(--accent-dark) after:text-(--muted) after:content-['→']"
            href="/lessons"
          >
            Lessons
          </a>
          <a
            class="flex justify-between gap-4 border-t border-(--line) py-3.5 pr-4 text-[0.88rem] font-semibold text-(--accent-dark) after:text-(--muted) after:content-['→']"
            href="/wiki"
          >
            Reference
          </a>
          <p class="mt-4 pr-4 text-[0.84rem] leading-[1.55] text-(--muted)">
            Missed or revealed answers return here automatically.
          </p>
        </aside>
      </section>
    {/if}
  </div>
</main>
