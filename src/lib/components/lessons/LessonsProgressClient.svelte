<script lang="ts">
  import { onMount } from "svelte";

  import { readPracticeState } from "$lib/client/practice-state";
  import { lessons } from "$lib/content/lessons";

  onMount(() => {
    const completed = new Set(readPracticeState(localStorage).completedLessonIds);
    const doneTotal = lessons.filter((lesson) => completed.has(lesson.id)).length;

    for (const element of document.querySelectorAll<HTMLElement>("[data-lesson-done]")) {
      const lessonId = element.dataset.lessonDone;

      if (lessonId && completed.has(lessonId)) {
        element.classList.remove("hidden");
      }
    }

    for (const element of document.querySelectorAll<HTMLElement>(
      "[data-lessons-done-count]",
    )) {
      element.textContent = String(doneTotal);
    }

    for (const element of document.querySelectorAll<HTMLElement>(
      "[data-lessons-done-summary]",
    )) {
      if (doneTotal > 0) {
        element.classList.remove("hidden");
      }
    }

    for (const element of document.querySelectorAll<HTMLElement>(
      "[data-lesson-title-completed]",
    )) {
      const lessonId = element.dataset.lessonTitleCompleted;

      if (lessonId && completed.has(lessonId)) {
        element.classList.add("text-slate-500");
        element.classList.remove("text-blue-800");
      }
    }
  });
</script>
