<script lang="ts">
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import type { Lesson } from "$lib/learning/types";
  import type { LessonLevel, LessonStatus } from "$lib/lesson-progress/progress";
  import LessonCoverCard from "$lib/components/lessons/LessonCoverCard.svelte";

  let {
    level,
    number,
    showHeader = true,
    startIndex = 0,
    statusFor,
  }: {
    level: LessonLevel;
    number: number;
    showHeader?: boolean;
    /** Keeps lesson numbering continuous across a track's levels. */
    startIndex?: number;
    statusFor: (lesson: Lesson, index: number) => LessonStatus;
  } = $props();
</script>

<section data-level={level.key}>
  {#if showHeader}
    <div class="mb-1 flex items-baseline justify-between gap-4">
      <h3 class={eyebrowMutedClass}>
        Level {number} · {level.label}
      </h3>

      <span class="shrink-0 text-xs tabular-nums text-slate-500">
        <span data-level-done-pct={level.key}>0</span>%
      </span>
    </div>

  {/if}

  <ul class="m-0 mt-4 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
    {#each level.lessons as lesson, index (lesson.id)}
      <LessonCoverCard
        eager={number === 1 && index < 3}
        index={startIndex + index}
        {lesson}
        status={statusFor(lesson, index)}
      />
    {/each}
  </ul>
</section>
