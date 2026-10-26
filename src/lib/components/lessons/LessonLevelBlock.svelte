<script lang="ts">
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import type { Lesson } from "$lib/learning/types";
  import type { LessonLevel, LessonStatus } from "$lib/lesson-progress/progress";
  import LessonPathCard from "$lib/components/lessons/LessonPathCard.svelte";

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

    <span class="mt-3 mb-4 block h-1 overflow-hidden rounded-full bg-slate-200">
      <span
        class="block h-full rounded-full bg-blue-600"
        data-level-progress-bar={level.key}
        style:width="0%"
      ></span>
    </span>
  {/if}

  <ul
    class="m-0 list-none divide-y divide-slate-200/70 overflow-hidden rounded-(--frame-radius) bg-surface p-0 shadow-(--shadow-border)"
  >
    {#each level.lessons as lesson, index (lesson.id)}
      <LessonPathCard
        index={startIndex + index}
        {lesson}
        leading="motif"
        status={statusFor(lesson, index)}
      />
    {/each}
  </ul>
</section>
