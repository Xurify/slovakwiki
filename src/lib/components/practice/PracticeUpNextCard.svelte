<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import { practiceTaskKindsPhrase } from "$lib/catalog/practice/hub";
  import { practiceGraphicId } from "$lib/catalog/practice/motifs";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import PracticeDrillLine from "$lib/components/practice/PracticeDrillLine.svelte";

  let {
    sheets,
    featuredId,
  }: {
    sheets: PracticeHubSheet[];
    featuredId: string;
  } = $props();

  function trackPosition(sheet: PracticeHubSheet): { step: number; total: number } {
    const inTrack = sheets.filter((entry) => entry.set.track === sheet.set.track);
    return {
      step: inTrack.findIndex((entry) => entry.set.id === sheet.set.id) + 1,
      total: inTrack.length,
    };
  }
</script>

<div data-practice-hydrate>
  {#each sheets as candidate (candidate.set.id)}
    {@const position = trackPosition(candidate)}

    <article
      class="overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)"
      aria-labelledby="up-next-{candidate.set.id}"
      data-featured-sheet={candidate.set.id}
      data-featured-lesson={candidate.set.lessonId}
      hidden={candidate.set.id !== featuredId}
    >
      <div class="relative h-36 overflow-hidden border-b border-slate-200/70">
        <img
          src={motifArtSrc(practiceGraphicId(candidate.set.id, candidate.set.lessonId))}
          alt=""
          width="512"
          height="512"
          loading="lazy"
          decoding="async"
          class="absolute inset-0 size-full object-cover outline-0"
        />
      </div>

      {#if candidate.drill.slovak}
        <div class="border-b border-slate-200/70 px-5 pt-4 pb-4 text-center">
          <PracticeDrillLine
            slovak={candidate.drill.slovak}
            class="text-lg text-slate-900"
          />

          {#if candidate.drill.english}
            <p class="m-0 mt-1 text-sm leading-snug text-pretty text-slate-600">
              {candidate.drill.english}
            </p>
          {/if}
        </div>
      {/if}

      <div class="flex flex-col px-5 pt-5 pb-5">
        <p
          class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
        >
          Up next
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          <a
            class="text-inherit no-underline hover:text-blue-800 hover:underline"
            href="#browse-{candidate.set.track}"
          >
            {candidate.trackTitle}
          </a>
        </p>

        <h2
          id="up-next-{candidate.set.id}"
          class="m-0 mt-2 font-serif text-xl leading-snug tracking-tight text-balance text-slate-900"
        >
          {candidate.set.title}
        </h2>

        <p class="m-0 mt-2 text-sm leading-relaxed text-pretty text-slate-600">
          {candidate.purpose}
        </p>

        <p class="m-0 mt-4 text-xs leading-relaxed text-pretty text-slate-500">
          Set {position.step} of {position.total}
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          {candidate.exerciseCount}
          {candidate.exerciseCount === 1 ? "exercise" : "exercises"}, about
          {candidate.minutes} min
          {#if candidate.taskKinds.length > 0}
            <span class="block">
              {candidate.taskKinds.length === 1 ? "Format" : "Formats"}:
              {practiceTaskKindsPhrase(candidate.taskKinds)}.
            </span>
          {/if}
        </p>

        <div class="mt-5 flex flex-col gap-3">
          <Button
            href="/practice/{candidate.set.id}"
            variant="accent"
            class="w-full px-4"
            data-hero-cta=""
          >
            Start set
            <ArrowRight />
          </Button>

          {#if candidate.lessonHref}
            <a
              class="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-blue-800 no-underline hover:underline"
              href={candidate.lessonHref}
            >
              Review the lesson first
              <ArrowRight />
            </a>
          {/if}
        </div>
      </div>
    </article>
  {/each}
</div>
