<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { onMount } from "svelte";
  import PracticePlayer from "$lib/components/practice/PracticePlayer.svelte";
  import PracticeSessionSkeleton from "$lib/components/practice/PracticeSessionSkeleton.svelte";
  import type { PracticeItem } from "$lib/learning/types";
  import {
    localDayKey,
    daysBetween,
    dueFormIdsOldestFirst,
    nextDueDay,
    readReviewMemory,
    saveAnswerForReview,
    MAX_CARDS_PER_REVIEW,
  } from "$lib/practice/review-memory";
  import { buildReviewSession } from "$lib/practice/session";

  let {
    audioSrcs,
    dictionaryHrefs,
  }: {
    audioSrcs: Record<string, string>;
    dictionaryHrefs: Record<string, string>;
  } = $props();

  let phase = $state<"loading" | "review" | "empty">("loading");
  let items = $state<PracticeItem[]>([]);
  let daysToNext = $state<number | null>(null);

  const nextReviewLine = $derived.by(() => {
    if (daysToNext === null || daysToNext < 1) return null;
    if (daysToNext === 1) return "The next one is due tomorrow.";
    return `The next one is due in ${daysToNext} days.`;
  });

  onMount(() => {
    const memory = readReviewMemory(localStorage);
    const today = localDayKey(new Date());
    items = buildReviewSession(dueFormIdsOldestFirst(memory, today));

    const next = nextDueDay(memory);
    daysToNext = next ? daysBetween(today, next) : null;
    phase = items.length > 0 ? "review" : "empty";
  });
</script>

<main class="py-8 pb-16 max-[600px]:py-5">
  <PageShell class="max-w-[640px]">
    {#if phase === "review"}
      <PracticePlayer
        {items}
        {audioSrcs}
        {dictionaryHrefs}
        backHref="/practice"
        backLabel="Practice"
        sessionTitle="Review"
        onAnswer={(item, grade) => saveAnswerForReview(localStorage, item.id, grade)}
      />
    {:else if phase === "empty"}
      <section
        class="animate-rise rounded-(--frame-radius) bg-surface px-7 py-8 shadow-(--shadow-border) max-[560px]:px-4 max-[560px]:py-6"
        aria-labelledby="review-empty-heading"
      >
        <h1
          id="review-empty-heading"
          class="m-0 font-serif text-[clamp(1.6rem,4vw,2rem)] leading-tight font-semibold tracking-tight text-slate-900"
        >
          Nothing to review today
        </h1>

        <p
          class="m-0 mt-3 max-w-[48ch] text-sm leading-relaxed text-pretty text-slate-600"
        >
          When you miss an exercise in a practice set, it comes back here the next day.
          Get it right and it returns after 3, then 7, then 21 days, until it sticks.
        </p>

        {#if nextReviewLine}
          <p class="m-0 mt-2 text-sm leading-relaxed text-slate-600">
            {nextReviewLine}
          </p>
        {/if}

        <Button href="/practice" variant="accent" class="mt-6 w-full px-4 sm:w-auto">
          Go to practice
          <ArrowRight />
        </Button>
      </section>
    {:else}
      <PracticeSessionSkeleton title="Review" total={MAX_CARDS_PER_REVIEW} />
    {/if}
  </PageShell>
</main>
