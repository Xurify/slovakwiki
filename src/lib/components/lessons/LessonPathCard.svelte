<script lang="ts">
  import type { Lesson } from "$lib/learning/types";
  import type { LessonStatus } from "$lib/lessons/progress";
  import LessonMotif from "$lib/components/lessons/LessonMotif.svelte";
  import LessonRowStatus from "$lib/components/lessons/LessonRowStatus.svelte";
  import { lessonPath } from "$lib/content/lessons";
  import { lessonMotifId } from "$lib/lessons/lesson-motifs";

  let {
    index,
    lesson,
    status = "upcoming",
    /** `index` = number↔check (track page). `motif` = topic tile left, status right. */
    leading = "index",
  }: {
    index: number;
    lesson: Lesson;
    status?: LessonStatus;
    leading?: "index" | "motif";
  } = $props();

  const numberLabel = String(index + 1).padStart(2, "0");
  const motif = $derived(lessonMotifId(lesson.id));
  const useMotif = $derived(leading === "motif");

  const rowClass = $derived(
    useMotif
      ? "group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3.5 rounded-(--frame-radius) border-2 bg-surface/80 px-3.5 py-3 no-underline shadow-(--shadow-border) transition-[background-color,box-shadow,border-color] duration-150 hover:bg-surface hover:shadow-(--shadow-border-hover)"
      : "group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-(--frame-radius) border-2 bg-surface/80 px-3.5 py-3.5 no-underline shadow-(--shadow-border) transition-[background-color,box-shadow,border-color] duration-150 hover:bg-surface hover:shadow-(--shadow-border-hover)",
  );
</script>

<li>
  <a
    class="{rowClass} {status === 'active' ? 'border-blue-600' : 'border-transparent'}"
    data-lesson-card={lesson.id}
    data-lesson-index={numberLabel}
    data-lesson-leading={leading}
    data-lesson-status={status}
    href={lessonPath(lesson)}
  >
    {#if useMotif}
      <span class="justify-self-center" data-lesson-motif-slot>
        <LessonMotif {motif} />
      </span>
    {:else}
      <span
        class="flex size-7 items-center justify-center justify-self-center"
        data-lesson-index-slot
      >
        {#if status === "complete"}
          <span
            class="inline-flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
            aria-hidden="true"
          >
            <svg class="size-3.5" viewBox="0 0 16 16" fill="none">
              <path
                d="M3.5 8.5 6.5 11.5 12.5 4.5"
                stroke="currentColor"
                stroke-width="2.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        {:else}
          <span class="font-serif text-sm tabular-nums text-slate-400">
            {numberLabel}
          </span>
        {/if}
      </span>
    {/if}

    <span class="min-w-0">
      <strong
        class="block font-serif text-base leading-snug tracking-tight text-balance text-blue-800 underline-offset-2 group-hover:underline sm:text-lg"
      >
        {lesson.title}
      </strong>

      <span class="mt-0.5 block text-sm leading-snug text-pretty text-slate-500">
        {lesson.promise}
      </span>
    </span>

    <span class="shrink-0" data-lesson-status-slot>
      <LessonRowStatus {status} lessonId={lesson.id} completeOnRight={useMotif} />
    </span>
  </a>
</li>
