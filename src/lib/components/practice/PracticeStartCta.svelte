<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";

  import { onMount, untrack } from "svelte";
  import {
    emptyPracticeState,
    readPracticeState,
    type PracticeState,
  } from "$lib/components/practice/practice-state";
  import { buildPracticeSheets, pickFeaturedSheet } from "$lib/catalog/practice/hub";
  import { practiceSets } from "$lib/catalog/practice";

  let { initialState }: { initialState?: PracticeState } = $props();

  // Seed once from hub mount; localStorage owns state after that.
  let practiceState = $state(untrack(() => initialState ?? emptyPracticeState()));
  let hydrated = $state(untrack(() => initialState !== undefined));

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
