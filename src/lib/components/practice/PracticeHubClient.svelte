<script lang="ts">
  import { onMount } from "svelte";

  import { readPracticeState } from "$lib/components/practice/practice-state";
  import type { PracticeBootPayload } from "$lib/practice/boot-payload";
  import { markPracticeHubReady, paintPracticeHub } from "$lib/practice/paint-hub";

  let { payload }: { payload: PracticeBootPayload } = $props();

  onMount(() => {
    const state = readPracticeState(localStorage);
    paintPracticeHub(payload, state.completedLessonIds, state.recentItemIds);
    markPracticeHubReady();
  });
</script>
