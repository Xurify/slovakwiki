<script lang="ts">
  import type { Lesson, LessonTrack } from "$lib/learning/types";
  import type { LessonStatus } from "$lib/lesson-progress/progress";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import SectionHead from "$lib/components/ui/SectionHead.svelte";
  import LessonPathCard from "$lib/components/lessons/LessonPathCard.svelte";
  import { moreLinkClass } from "$lib/components/ui/system-ui";

  let {
    track,
    lessons,
    statusFor,
  }: {
    track: LessonTrack;
    lessons: Lesson[];
    statusFor: (lesson: Lesson, index: number) => LessonStatus;
  } = $props();
</script>

<section data-level={track.id} aria-labelledby="track-{track.id}-heading">
  <SectionHead
    eyebrow="Track"
    title={track.title}
    id="track-{track.id}-heading"
    href="/lessons/{track.id}"
    description={track.description}
  >
    {#snippet aside()}
      <span data-level-done-pct={track.id}>0</span>%
    {/snippet}
  </SectionHead>

  <p class="m-0 mt-2 text-xs tabular-nums text-slate-500">
    {lessons.length}
    {lessons.length === 1 ? "lesson" : "lessons"}
  </p>

  <span class="mt-4 mb-4 block h-1 overflow-hidden rounded-full bg-slate-200">
    <span
      class="block h-full rounded-full bg-blue-600"
      data-level-progress-bar={track.id}
      style:width="0%"
    ></span>
  </span>

  <ul class="m-0 flex list-none flex-col gap-2 p-0">
    {#each lessons as lesson, index (lesson.id)}
      <LessonPathCard
        {index}
        {lesson}
        leading="motif"
        status={statusFor(lesson, index)}
      />
    {/each}
  </ul>

  <p class="m-0 mt-4">
    <a class={moreLinkClass} href="/lessons/{track.id}">
      View track
      <ArrowRight />
    </a>
  </p>
</section>
