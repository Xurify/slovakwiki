<script lang="ts">
  import type { Snippet } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

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
  <section
    class="relative overflow-hidden border-b border-slate-200/80"
    aria-label="Practice"
  >
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden select-none font-serif text-[clamp(5rem,18vw,11rem)] font-semibold leading-none tracking-[-0.06em] text-slate-900/5"
      aria-hidden="true"
    >
      <span class="absolute left-[4%] top-[12%] -rotate-[9deg]" lang="sk">ľ</span>
      <span class="absolute right-[6%] top-[22%] rotate-[7deg]" lang="sk">č</span>
      <span class="absolute bottom-[8%] left-[18%] rotate-[5deg]" lang="sk">š</span>
      <span class="absolute bottom-[14%] right-[10%] -rotate-6" lang="sk">ť</span>
    </div>

    <PageShell class="relative py-16 max-[600px]:py-12">
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
          Prefer a lesson first
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
      <section class="border-b border-slate-200/80" aria-labelledby="continue-heading">
        <PageShell class="py-12 max-[600px]:py-10">
          <div
            class="overflow-hidden rounded-(--frame-radius) bg-paper shadow-(--shadow-border)"
          >
            <div
              class="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] max-[760px]:grid-cols-1"
            >
              <a
                class="group relative block px-8 py-9 transition-colors hover:bg-slate-50 max-[600px]:px-5 max-[600px]:py-7"
                href="/practice/{featured.set.id}"
                aria-labelledby="continue-heading"
              >
                <Eyebrow>Up next</Eyebrow>
                <p
                  class="m-0 mt-4 font-serif text-[clamp(1.8rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-slate-900"
                  lang="sk"
                >
                  {featured.drill.slovak}
                </p>
                {#if featured.drill.english}
                  <p class="m-0 mt-3 font-serif text-base italic text-slate-600">
                    {featured.drill.english}
                  </p>
                {/if}
                <span
                  class="mt-8 inline-flex items-center gap-2 text-sm font-bold text-rose-600"
                >
                  Open set
                  <ArrowRight />
                </span>
              </a>

              <div
                class="border-l border-slate-200 bg-slate-50 px-8 py-9 max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:px-5 max-[760px]:py-6"
              >
                <p
                  class="m-0 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-slate-500"
                >
                  {featured.trackTitle}
                </p>
                <h2
                  id="continue-heading"
                  class="m-0 mt-2 font-serif text-2xl text-slate-900"
                >
                  {featured.set.title}
                </h2>
                <p class="m-0 mt-3 text-sm leading-relaxed text-slate-600">
                  {featured.purpose}
                </p>
                <p class="m-0 mt-5 text-xs text-slate-500">
                  {featured.exerciseCount}
                  {featured.exerciseCount === 1 ? "exercise" : "exercises"}
                </p>
              </div>
            </div>
          </div>
        </PageShell>
      </section>
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
                <li>
                  <a
                    class="group flex h-full flex-col rounded-(--frame-radius) bg-surface/80 p-6 shadow-(--shadow-border) transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-surface hover:shadow-(--shadow-border-hover)"
                    href="/practice/{sheet.set.id}"
                  >
                    <p
                      class="m-0 font-serif text-[clamp(1.35rem,2.6vw,1.7rem)] font-semibold leading-snug tracking-tight text-slate-900"
                      lang="sk"
                    >
                      {sheet.drill.slovak}
                    </p>

                    {#if sheet.drill.english}
                      <p class="m-0 mt-2 text-sm text-slate-500">
                        {sheet.drill.english}
                      </p>
                    {/if}

                    <div class="mt-6 border-t border-slate-200 pt-4">
                      <strong class="font-serif text-base tracking-tight text-blue-800">
                        {sheet.set.title}
                      </strong>
                      <p class="m-0 mt-1 text-sm leading-relaxed text-slate-600">
                        {sheet.purpose}
                      </p>
                    </div>

                    <div
                      class="mt-auto flex items-center justify-between gap-3 pt-5 text-sm"
                    >
                      <span class="text-slate-500">
                        {sheet.exerciseCount}
                        {sheet.exerciseCount === 1 ? "exercise" : "exercises"}
                        <span data-sheet-done={sheet.set.lessonId}></span>
                      </span>
                      <span
                        class="inline-flex items-center gap-1.5 font-bold text-blue-800"
                      >
                        Drill
                        <ArrowRight />
                      </span>
                    </div>
                  </a>
                </li>
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
