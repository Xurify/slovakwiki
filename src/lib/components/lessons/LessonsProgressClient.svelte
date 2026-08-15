<script lang="ts">
  import { onMount } from "svelte";

  import { readPracticeState } from "$lib/components/practice/practice-state";
  import type { LessonsBootPayload } from "$lib/lesson-progress/boot-payload";
  import {
    markLessonsProgressReady,
    paintLessonsProgress,
  } from "$lib/lesson-progress/paint-progress";

  let { payload }: { payload: LessonsBootPayload } = $props();

  onMount(() => {
    const completed = new Set(readPracticeState(localStorage).completedLessonIds);
    paintLessonsProgress(payload, completed);
    markLessonsProgressReady();
  });
</script>
