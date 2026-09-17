<script lang="ts">
  import { onMount } from "svelte";
  import {
    emptyPracticeState,
    readPracticeState,
    type PracticeState,
  } from "$lib/components/practice/practice-state";
  import { buildPracticeSheets, pickFeaturedSheet } from "$lib/catalog/practice/hub";
  import PracticeFeaturedFrame from "$lib/components/practice/PracticeFeaturedFrame.svelte";

  let { initialState }: { initialState?: PracticeState } = $props();

  let practiceState = $state(initialState ?? emptyPracticeState());
  let hydrated = $state(initialState !== undefined);

  const featured = $derived(pickFeaturedSheet(buildPracticeSheets(practiceState)));

  onMount(() => {
    if (initialState === undefined) {
      practiceState = readPracticeState(localStorage);
    }
    hydrated = true;
  });
</script>

{#if featured}
  <PracticeFeaturedFrame sheet={featured} completed={hydrated && featured.completed} />
{/if}
