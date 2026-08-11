<script lang="ts">
  import type { Lesson, LessonTrack } from "$lib/learning/types";
  import type { LessonStatus } from "$lib/lessons/progress";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import LessonPathCard from "$lib/components/lessons/LessonPathCard.svelte";

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
  <div class="mb-1 flex items-baseline justify-between gap-4">
    <div class="min-w-0">
      <p class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
        Track
      </p>

      <h2
        id="track-{track.id}-heading"
        class="m-0 mt-1 font-serif text-xl tracking-tight text-balance text-slate-900 sm:text-2xl"
      >
        <a class="text-inherit no-underline hover:underline" href="/lessons/{track.id}">
          {track.title}
        </a>
      </h2>
    </div>

    <span class="shrink-0 text-xs tabular-nums text-slate-500">
      <span data-level-done-pct={track.id}>0</span>%
    </span>
  </div>

  <p class="m-0 mt-2 max-w-[36rem] text-sm leading-relaxed text-pretty text-slate-600">
    {track.description}
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
    <a
      class="inline-flex items-center gap-1.5 text-sm font-bold text-blue-800 no-underline hover:underline"
      href="/lessons/{track.id}"
    >
      View track
      <ArrowRight />
    </a>
  </p>
</section>
