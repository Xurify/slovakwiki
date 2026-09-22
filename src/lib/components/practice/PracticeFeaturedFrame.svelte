<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import { practiceGraphicId } from "$lib/catalog/practice/motifs";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import PracticeDrillLine from "$lib/components/practice/PracticeDrillLine.svelte";
  import PracticeTaskChips from "$lib/components/practice/PracticeTaskChips.svelte";

  let {
    sheets,
    featuredId,
  }: {
    sheets: PracticeHubSheet[];
    featuredId: string;
  } = $props();

  const frameClass =
    "grid overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border) min-[760px]:grid-cols-[minmax(0,1fr)_18rem]";

  const artClass =
    "relative overflow-hidden border-slate-200/70 max-[759px]:h-44 max-[759px]:border-b min-[760px]:order-last min-[760px]:min-h-full min-[760px]:border-l";

  const drillPanelClass =
    "rounded-(--control-radius) bg-slate-50 px-4 py-3.5 ring-1 ring-slate-200/80 ring-inset";
</script>

<section aria-label="Start here">
  <PageShell class="pt-8 max-[600px]:pt-6">
    <div data-practice-hydrate>
      {#each sheets as candidate (candidate.set.id)}
        {@const graphic = practiceGraphicId(candidate.set.id, candidate.set.lessonId)}
        {@const src = motifArtSrc(graphic)}

        <article
          class={frameClass}
          data-featured-sheet={candidate.set.id}
          data-featured-lesson={candidate.set.lessonId}
          hidden={candidate.set.id !== featuredId}
        >
          <div class={artClass} aria-hidden="true">
            <img
              {src}
              alt=""
              width="512"
              height="512"
              decoding="async"
              class="absolute inset-0 size-full object-cover outline-0"
            />
          </div>

          <div class="flex min-w-0 flex-col gap-5 p-6 sm:p-8">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Eyebrow compact class="mb-0">Start here</Eyebrow>

              <span
                class="text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
              >
                {candidate.trackTitle}
              </span>
            </div>

            <div class="min-w-0">
              <h2
                class="m-0 font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight tracking-tight text-balance text-slate-900"
              >
                {candidate.set.title}
              </h2>

              <p
                class="m-0 mt-2.5 max-w-xl text-[0.98rem] leading-relaxed text-pretty text-slate-600"
              >
                {candidate.purpose}
              </p>
            </div>

            {#if candidate.drill.slovak}
              <div class={drillPanelClass}>
                <p
                  class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
                >
                  Sample drill
                </p>

                <PracticeDrillLine
                  slovak={candidate.drill.slovak}
                  class="mt-1.5 text-[clamp(1.15rem,2vw,1.4rem)] text-slate-900"
                />

                {#if candidate.drill.english}
                  <p class="m-0 mt-1 text-sm text-pretty text-slate-600">
                    {candidate.drill.english}
                  </p>
                {/if}
              </div>
            {/if}

            <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p class="m-0 text-sm tabular-nums text-slate-600">
                <span class="font-bold text-slate-900">{candidate.exerciseCount}</span>
                {candidate.exerciseCount === 1 ? "exercise" : "exercises"}
                <span class="mx-1.5 text-slate-400" aria-hidden="true">·</span>
                about {candidate.minutes}
                {candidate.minutes === 1 ? "minute" : "minutes"}
              </p>

              <PracticeTaskChips kinds={candidate.taskKinds} size="md" />
            </div>

            <div class="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
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
                  class="group inline-flex items-center gap-1.5 text-sm font-bold text-blue-800 no-underline hover:underline"
                  href={candidate.lessonHref}
                >
                  Review the lesson
                  <ArrowRight />
                </a>
              {/if}
            </div>
          </div>
        </article>
      {/each}
    </div>
  </PageShell>
</section>
