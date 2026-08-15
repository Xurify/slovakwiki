<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";

  import { onMount } from "svelte";
  import {
    emptyPracticeState,
    readPracticeState,
    type PracticeState,
  } from "$lib/components/practice/practice-state";
  import { buildPracticeSheets, pickFeaturedSheet } from "$lib/catalog/practice/hub";
  import { practiceSets } from "$lib/catalog/practice";

  let { initialState }: { initialState?: PracticeState } = $props();

  let practiceState = $state(initialState ?? emptyPracticeState());
  let hydrated = $state(initialState !== undefined);

  const featured = $derived(pickFeaturedSheet(buildPracticeSheets(practiceState)));
  const primaryHref = $derived(
    `/practice/${featured?.set.id ?? practiceSets[0]?.id ?? ""}`,
  );
  const primaryLabel = $derived(
    featured?.completed
      ? `Try again · ${featured.set.title}`
      : `Start · ${featured?.set.title ?? "practice"}`,
  );

  onMount(() => {
    if (initialState === undefined) {
      practiceState = readPracticeState(localStorage);
    }
    hydrated = true;
  });
</script>

{#if hydrated}
  <Button href={primaryHref} class="min-w-48 px-6">
    {primaryLabel}
    <ArrowRight />
  </Button>
{:else}
  <Button href="/practice/{practiceSets[0]?.id}" class="min-w-48 px-6">
    Start
    <ArrowRight />
  </Button>
{/if}
