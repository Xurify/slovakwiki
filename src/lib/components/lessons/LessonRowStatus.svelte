<script lang="ts">
  import type { LessonStatus } from "$lib/lessons/progress";

  let {
    lessonId,
    status,
    /** When leading is motif, complete shows a visible check on the right. */
    completeOnRight = false,
  }: {
    lessonId: string;
    status: LessonStatus;
    completeOnRight?: boolean;
  } = $props();
</script>

{#if status === "complete"}
  {#if completeOnRight}
    <span
      class="inline-flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
      data-lesson-done={lessonId}
    >
      <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          stroke="currentColor"
          stroke-width="2.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="sr-only">Completed</span>
    </span>
  {:else}
    <span class="sr-only" data-lesson-done={lessonId}>Completed</span>
  {/if}
{:else if status === "active"}
  <span
    class="inline-flex min-h-8 items-center rounded-(--control-radius) bg-blue-600 px-3.5 text-xs font-bold text-white"
  >
    Start
  </span>
{:else}
  <span class="sr-only">Not started</span>
{/if}
