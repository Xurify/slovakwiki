<script lang="ts">
  import type { LessonTrack } from "$lib/learning/types";
  import { practiceStepState, type PracticeHubSheet } from "$lib/catalog/practice/hub";
  import PracticePathStep from "$lib/components/practice/PracticePathStep.svelte";
  import SectionHead from "$lib/components/ui/SectionHead.svelte";

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
  <SectionHead
    title={track.title}
    id="track-{track.id}-heading"
    description={track.description}
  >
    {#snippet aside()}
      <span data-track-done>0</span> of {lessonCount}
      {lessonCount === 1 ? "lesson" : "lessons"} done
    {/snippet}
  </SectionHead>

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
