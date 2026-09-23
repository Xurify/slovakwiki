<script lang="ts">
  import type { LessonTrack } from "$lib/learning/types";
  import { practiceStepState, type PracticeHubSheet } from "$lib/catalog/practice/hub";
  import PracticePathStep from "$lib/components/practice/PracticePathStep.svelte";

  let {
    track,
    sheets,
    exerciseCount,
    featuredId,
  }: {
    track: LessonTrack;
    sheets: PracticeHubSheet[];
    exerciseCount: number;
    featuredId: string;
  } = $props();

  const lessonCount = $derived(new Set(sheets.map((sheet) => sheet.set.lessonId)).size);
</script>

<section
  id="browse-{track.id}"
  class="scroll-mt-24"
  aria-labelledby="track-{track.id}-heading"
  data-practice-track={track.id}
>
  <div class="flex items-baseline justify-between gap-4">
    <div class="min-w-0">
      <p class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
        Track
      </p>

      <h2
        id="track-{track.id}-heading"
        class="m-0 mt-1 font-serif text-xl tracking-tight text-balance text-slate-900 sm:text-2xl"
      >
        {track.title}
      </h2>
    </div>

    <span class="shrink-0 text-xs tabular-nums text-slate-500">
      <span data-track-done>0</span> of {lessonCount}
      {lessonCount === 1 ? "lesson" : "lessons"} done
    </span>
  </div>

  <p class="m-0 mt-2 max-w-xl text-sm leading-relaxed text-pretty text-slate-600">
    {track.description}
  </p>

  <p class="m-0 mt-2 text-xs tabular-nums text-slate-500">
    {sheets.length}
    {sheets.length === 1 ? "set" : "sets"}
    <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
    {exerciseCount}
    {exerciseCount === 1 ? "exercise" : "exercises"}
  </p>

  <span class="mt-4 mb-5 block h-1 overflow-hidden rounded-full bg-slate-200">
    <span
      class="block h-full rounded-full bg-emerald-700 transition-[width] duration-300"
      data-track-bar
      style:width="0%"
    ></span>
  </span>

  <ol class="m-0 flex list-none flex-col gap-3 p-0">
    {#each sheets as sheet, index (sheet.set.id)}
      <PracticePathStep
        {sheet}
        step={index + 1}
        state={practiceStepState(sheet, featuredId)}
      />
    {/each}
  </ol>
</section>
