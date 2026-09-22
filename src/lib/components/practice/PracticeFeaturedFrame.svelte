<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import {
    practiceFeaturedFieldClass,
    practiceGraphicId,
  } from "$lib/catalog/practice/motifs";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
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
    "grid overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border) min-[760px]:grid-cols-[minmax(0,1fr)_17rem]";

  const fieldClass =
    "flex items-center justify-center p-6 max-[759px]:order-first max-[759px]:border-b max-[759px]:border-slate-900/5 min-[760px]:order-last min-[760px]:border-l min-[760px]:border-slate-900/5";

  const artClass =
    "aspect-square w-full max-w-[9rem] rounded-(--frame-radius) object-cover shadow-(--shadow-border-hover) outline-0 min-[760px]:max-w-[12rem]";

  const labelClass =
    "m-0 text-[0.64rem] font-bold tracking-[0.14em] text-blue-800 uppercase";

  const footerClass =
    "flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-slate-200/80 pt-5";
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
          <div
            class="{fieldClass} {practiceFeaturedFieldClass[graphic]}"
            aria-hidden="true"
          >
            <img
              {src}
              alt=""
              width="512"
              height="512"
              decoding="async"
              class={artClass}
            />
          </div>

          <div class="flex min-w-0 flex-col p-6 sm:p-8">
            <p class={labelClass}>
              Start here
              <span class="mx-1.5 text-slate-400" aria-hidden="true">·</span>
              <span class="text-slate-500">{candidate.trackTitle}</span>
            </p>

            <h2
              class="m-0 mt-3 font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight tracking-tight text-balance text-slate-900"
            >
              {candidate.set.title}
            </h2>

            <p
              class="m-0 mt-2.5 max-w-xl text-[0.98rem] leading-relaxed text-pretty text-slate-600"
            >
              {candidate.purpose}
            </p>

            {#if candidate.drill.slovak}
              <div class="mt-6 border-l-2 border-blue-600 py-0.5 pl-4">
                <PracticeDrillLine
                  slovak={candidate.drill.slovak}
                  class="text-[clamp(1.15rem,2vw,1.4rem)] text-slate-900"
                />

                {#if candidate.drill.english}
                  <p class="m-0 mt-1 text-sm text-pretty text-slate-600">
                    {candidate.drill.english}
                  </p>
                {/if}
              </div>
            {/if}

            <div class="mt-auto pt-8">
              <div class={footerClass}>
                <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
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

                <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <p class="m-0 text-sm tabular-nums text-slate-600">
                    {candidate.exerciseCount}
                    {candidate.exerciseCount === 1 ? "exercise" : "exercises"}
                    <span class="mx-1.5 text-slate-400" aria-hidden="true">·</span>
                    ~{candidate.minutes} min
                  </p>

                  <PracticeTaskChips kinds={candidate.taskKinds} size="md" />
                </div>
              </div>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </PageShell>
</section>
