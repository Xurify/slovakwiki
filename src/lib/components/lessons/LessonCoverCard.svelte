<script lang="ts">
  import type { Lesson } from "$lib/learning/types";
  import type { LessonStatus } from "$lib/lesson-progress/progress";
  import LessonRowStatus from "$lib/components/lessons/LessonRowStatus.svelte";
  import { panelClass, panelHoverClass } from "$lib/components/ui/system-ui";
  import { lessonCoverSrc, lessonPath } from "$lib/catalog/lessons";
  import { cx } from "$lib/ui/classes";

  let {
    eager = false,
    index,
    lesson,
    status = "upcoming",
  }: {
    eager?: boolean;
    index: number;
    lesson: Lesson;
    status?: LessonStatus;
  } = $props();
</script>

<li class="flex">
  <!--
    `data-lesson-leading="motif"` asks the progress boot for a visible check in the status slot;
    the slot sits on the cover, so it is painted before the page hydrates.
  -->
  <a
    class={cx(
      panelClass,
      panelHoverClass,
      "group flex w-full flex-col overflow-hidden no-underline",
      "data-[lesson-status=active]:ring-2 data-[lesson-status=active]:ring-blue-600",
    )}
    data-lesson-card={lesson.id}
    data-lesson-index={String(index + 1).padStart(2, "0")}
    data-lesson-leading="motif"
    data-lesson-status={status}
    href={lessonPath(lesson)}
  >
    <span class="relative block">
      <img
        src={lessonCoverSrc(lesson)}
        alt=""
        width="960"
        height="480"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        class="aspect-[2/1] w-full border-b border-slate-900/10 bg-subtle object-cover"
      />

      <span class="absolute top-2.5 right-2.5 flex" data-lesson-status-slot>
        <LessonRowStatus {status} lessonId={lesson.id} completeOnRight />
      </span>
    </span>

    <span class="flex flex-1 flex-col px-4 pt-3.5 pb-4">
      <strong
        class="font-serif text-lg leading-snug tracking-tight text-balance text-blue-800 underline-offset-2 group-hover:underline"
      >
        {lesson.title}
      </strong>

      <span class="mt-1.5 text-sm leading-snug text-pretty text-slate-600">
        {lesson.promise}
      </span>
    </span>
  </a>
</li>
