<script lang="ts">
  import type { Snippet } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import PracticeFeaturedFrame from "$lib/components/practice/PracticeFeaturedFrame.svelte";
  import PracticeSheetCard from "$lib/components/practice/PracticeSheetCard.svelte";
  import { emptyPracticeState } from "$lib/components/practice/practice-state";
  import {
    buildPracticeSheets,
    groupSheetsByTrack,
    pickFeaturedSheet,
    totalPracticeExercises,
  } from "$lib/catalog/practice/hub";
  import { practiceSets } from "$lib/catalog/practice";

  let { hub }: { hub?: Snippet } = $props();

  // SSR catalog assumes empty progress — hub island upgrades CTA / featured / recents / done.
  const sheets = buildPracticeSheets(emptyPracticeState());
  const sheetsByTrack = groupSheetsByTrack(sheets);
  const featured = pickFeaturedSheet(sheets);
  const totalExercises = totalPracticeExercises();
  const fallbackHref = `/practice/${featured?.set.id ?? practiceSets[0]?.id ?? ""}`;
</script>

<main>
  <section class="border-b border-slate-200/80" aria-label="Practice">
    <PageShell class="py-16 max-[600px]:py-12">
      <p
        class="m-0 font-serif text-[clamp(3rem,9vw,5.75rem)] font-semibold leading-[0.9] tracking-tighter text-slate-900"
      >
        Practice
      </p>

      <p
        class="mt-5 min-h-[2.75em] max-w-160 font-serif text-[clamp(1.15rem,2.2vw,1.45rem)] leading-snug text-slate-700"
      >
        Drill the forms until they come back without looking.
      </p>

      <div class="mt-9 flex flex-wrap items-center gap-4">
        <span data-practice-cta class="inline-flex">
          <Button href={fallbackHref} class="min-w-48 px-6">
            Start
            <ArrowRight />
          </Button>
        </span>

        <TextLink href="/lessons" class="inline-flex items-center gap-1.5">
          Try a lesson first
        </TextLink>
      </div>

      <div
        class="mt-14 flex flex-wrap gap-x-10 gap-y-3 border-t border-slate-200/90 pt-6 text-sm text-slate-500"
      >
        <p class="m-0">
          <span class="font-serif text-xl font-semibold tabular-nums text-slate-900">
            {practiceSets.length}
          </span>
          topic sets
        </p>
        <p class="m-0">
          <span class="font-serif text-xl font-semibold tabular-nums text-slate-900">
            {totalExercises}
          </span>
          exercises
        </p>
      </div>
    </PageShell>
  </section>

  <div data-practice-featured>
    {#if featured}
      <PracticeFeaturedFrame sheet={featured} />
    {/if}
  </div>

  <section aria-labelledby="topics-heading">
    <PageShell class="py-14 pb-20 max-[600px]:py-10 max-[600px]:pb-14">
      <div class="mb-10 max-w-160">
        <h2 id="topics-heading" class="m-0">Pick a form to drill</h2>
        <p class="mt-3 m-0 text-[0.95rem] leading-[1.65] text-slate-600">
          Each sheet is a short set. Lessons teach; these ask you to use it.
        </p>
      </div>

      <div class="grid gap-12">
        {#each sheetsByTrack as group (group.track.id)}
          <section aria-labelledby={`track-${group.track.id}`}>
            <div class="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <h3
                id={`track-${group.track.id}`}
                class="m-0 font-serif text-lg text-slate-900"
              >
                {group.track.title}
              </h3>
              <p class="m-0 text-xs tabular-nums text-slate-500">
                {group.sheets.length}
                {group.sheets.length === 1 ? "sheet" : "sheets"}
                ·
                {group.exerciseCount}
                {group.exerciseCount === 1 ? "exercise" : "exercises"}
              </p>
            </div>

            <ul class="m-0 grid list-none grid-cols-2 gap-4 p-0 max-[700px]:grid-cols-1">
              {#each group.sheets as sheet (sheet.set.id)}
                <PracticeSheetCard {sheet} />
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    </PageShell>
  </section>

  <div data-practice-recents></div>

  {#if hub}
    {@render hub()}
  {/if}
</main>
