<script lang="ts">
  import { onMount } from "svelte";

  import { readPracticeState } from "$lib/components/practice/practice-state";
  import type { PracticeBootPayload } from "$lib/practice/boot-payload";
  import { markPracticeHubReady, paintPracticeHub } from "$lib/practice/paint-hub";
  import {
    localDayKey,
    dueFormIdsOldestFirst,
    readReviewMemory,
  } from "$lib/practice/review-memory";

  let { payload }: { payload: PracticeBootPayload } = $props();

  onMount(() => {
    const state = readPracticeState(localStorage);
    const due = dueFormIdsOldestFirst(
      readReviewMemory(localStorage),
      localDayKey(new Date()),
    );
    paintPracticeHub(payload, state.completedLessonIds, state.recentItemIds, due);
    markPracticeHubReady();
  });
</script>
