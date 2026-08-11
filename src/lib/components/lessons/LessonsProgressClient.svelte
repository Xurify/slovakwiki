<script lang="ts">
  import { onMount } from "svelte";

  import { readPracticeState } from "$lib/client/practice-state";
  import type { LessonsBootPayload } from "$lib/lessons/boot-payload";
  import {
    markLessonsProgressReady,
    paintLessonsProgress,
  } from "$lib/lessons/paint-progress";

  let { payload }: { payload: LessonsBootPayload } = $props();

  onMount(() => {
    const completed = new Set(readPracticeState(localStorage).completedLessonIds);
    paintLessonsProgress(payload, completed);
    markLessonsProgressReady();
  });
</script>
