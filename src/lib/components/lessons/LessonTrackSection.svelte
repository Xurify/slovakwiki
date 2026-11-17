<script lang="ts">
  import type { Lesson, LessonTrack } from "$lib/learning/types";
  import type { LessonStatus } from "$lib/lesson-progress/progress";
  import SectionHead from "$lib/components/ui/SectionHead.svelte";
  import LessonCoverCard from "$lib/components/lessons/LessonCoverCard.svelte";

  let {
    eager = false,
    track,
    lessons,
    statusFor,
  }: {
    /** The first track's covers are above the fold. */
    eager?: boolean;
    track: LessonTrack;
    lessons: Lesson[];
    statusFor: (lesson: Lesson, index: number) => LessonStatus;
  } = $props();
</script>

<section data-level={track.id} aria-labelledby="track-{track.id}-heading">
  <SectionHead
    title={track.title}
    id="track-{track.id}-heading"
    href="/lessons/{track.id}"
    description={track.description}
  >
    {#snippet aside()}
      {lessons.length}
      {lessons.length === 1 ? "lesson" : "lessons"} ·
      <span data-level-done-pct={track.id}>0</span>% done
    {/snippet}
  </SectionHead>

  <ul class="m-0 mt-5 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
    {#each lessons as lesson, index (lesson.id)}
      <LessonCoverCard
        eager={eager && index < 3}
        {index}
        {lesson}
        status={statusFor(lesson, index)}
      />
    {/each}
  </ul>
</section>
