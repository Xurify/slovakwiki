<script lang="ts">
  import {
    practiceTaskKindsPhrase,
    type PracticeHubSheet,
  } from "$lib/catalog/practice/hub";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import PracticeDrillLine from "$lib/components/practice/PracticeDrillLine.svelte";

  let {
    sheets,
    featuredId,
  }: {
    sheets: PracticeHubSheet[];
    featuredId: string;
  } = $props();

  const articleClass =
    "grid gap-8 border-y border-slate-300 py-8 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] min-[760px]:gap-12 min-[760px]:py-10";

  const specimenClass =
    "flex min-w-0 flex-col justify-center border-slate-300 max-[759px]:border-t max-[759px]:pt-6 min-[760px]:border-l min-[760px]:pl-12";

  function summary(sheet: PracticeHubSheet): string {
    const count = `${sheet.exerciseCount} ${sheet.exerciseCount === 1 ? "exercise" : "exercises"}`;
    const kinds = sheet.taskKinds.length
      ? `: ${practiceTaskKindsPhrase(sheet.taskKinds)}`
      : "";
    const time = `About ${sheet.minutes} ${sheet.minutes === 1 ? "minute" : "minutes"}.`;
    return `${count}${kinds}. ${time}`;
  }
</script>

<section aria-label="Up next">
  <PageShell class="pt-10 max-[600px]:pt-8">
    <div data-practice-hydrate>
      {#each sheets as candidate (candidate.set.id)}
        <article
          class={articleClass}
          data-featured-sheet={candidate.set.id}
          data-featured-lesson={candidate.set.lessonId}
          hidden={candidate.set.id !== featuredId}
        >
          <div class="flex min-w-0 flex-col">
            <p class="m-0 font-serif text-base text-slate-500 italic">
              Up next in {candidate.trackTitle}
            </p>

            <h2
              class="m-0 mt-2 font-serif text-[clamp(1.7rem,2.8vw,2.25rem)] leading-tight tracking-tight text-balance text-slate-900"
            >
              {candidate.set.title}
            </h2>

            <p
              class="m-0 mt-3 max-w-lg text-[1.02rem] leading-relaxed text-pretty text-slate-600"
            >
              {candidate.purpose}
            </p>

            <div class="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button
                class="group px-5"
                href="/practice/{candidate.set.id}"
                variant="accent"
                data-hero-cta=""
              >
                Start set
                <ArrowRight />
              </Button>

              {#if candidate.lessonHref}
                <a
                  class="text-sm font-semibold text-blue-800 underline decoration-slate-300 underline-offset-4 hover:decoration-current"
                  href={candidate.lessonHref}
                >
                  Review the lesson first
                </a>
              {/if}
            </div>

            <p class="m-0 mt-5 text-sm text-pretty text-slate-500">
              {summary(candidate)}
            </p>
          </div>

          {#if candidate.drill.slovak}
            <figure class="m-0 {specimenClass}">
              <figcaption class="font-serif text-sm text-slate-500 italic">
                A line from this set
              </figcaption>

              <PracticeDrillLine
                slovak={candidate.drill.slovak}
                class="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] text-slate-900"
              />

              {#if candidate.drill.english}
                <p class="m-0 mt-1.5 text-[0.98rem] text-pretty text-slate-600">
                  {candidate.drill.english}
                </p>
              {/if}
            </figure>
          {/if}
        </article>
      {/each}
    </div>
  </PageShell>
</section>
