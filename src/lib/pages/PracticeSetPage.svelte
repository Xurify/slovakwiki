<script lang="ts">
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { onMount } from "svelte";
  import {
    readPracticeState,
    saveReferenceItem,
    writePracticeState,
  } from "$lib/client/practice-state";
  import PracticePlayer from "$lib/components/practice/PracticePlayer.svelte";
  import PracticePlayerSkeleton from "$lib/components/practice/PracticePlayerSkeleton.svelte";
  import {
    practiceItemById,
    samplePracticeItemIds,
    type PracticeSet,
  } from "$lib/content/practice";
  import type { PracticeItem } from "$lib/content/learning-types";

  let {
    data,
  }: {
    data: {
      set: PracticeSet;
      clozeAudioSrcs?: Record<string, string>;
    };
  } = $props();

  let hydrated = $state(false);
  let hintMode = $state<"inline" | "rail">("inline");
  let sessionItems = $state<PracticeItem[]>([]);
  let focusedItem = $state(false);

  function sectionTitleFor(item: PracticeItem | undefined): string {
    const task = item?.task;
    if (!task) return data.set.title;
    if (task.type === "typed" && task.task === "repair") return "Repair this sentence";
    if (task.type === "cloze") return "Fill the gap";
    if (task.type === "choice") return "Choose the answer";
    if (task.type === "build") return "Build the sentence";
    if (task.type === "typed") return "Write the sentence";
    return data.set.title;
  }

  let sectionTitle = $state(data.set.title);

  function resolveSessionItems(atItemId: string | null): PracticeItem[] {
    if (atItemId && data.set.itemIds.includes(atItemId)) {
      const item = practiceItemById.get(atItemId);
      if (item) return [item];
    }

    const sampledIds = samplePracticeItemIds(data.set.itemIds, data.set.sessionSize);
    return sampledIds
      .map((itemId) => practiceItemById.get(itemId))
      .filter((item): item is PracticeItem => item !== undefined);
  }

  onMount(() => {
    const params = new URLSearchParams(location.search);
    const atItemId = params.get("at");
    focusedItem = Boolean(atItemId && data.set.itemIds.includes(atItemId));

    sessionItems = resolveSessionItems(atItemId);
    sectionTitle = focusedItem ? sectionTitleFor(sessionItems[0]) : data.set.title;

    if (focusedItem && atItemId) {
      const current = readPracticeState(localStorage);
      writePracticeState(localStorage, saveReferenceItem(current, atItemId));
    }

    hintMode = params.get("hint") === "rail" ? "rail" : "inline";
    hydrated = true;
  });
</script>

<main class="py-8 pb-16 max-[600px]:py-5">
  <PageShell class="max-w-[640px]">
    {#if hydrated}
      <PracticePlayer
        items={sessionItems}
        {hintMode}
        audioSrcs={data.clozeAudioSrcs ?? {}}
        backHref="/practice"
        backLabel="Practice"
        bind:sectionTitle
      />
    {:else}
      <PracticePlayerSkeleton />
    {/if}
  </PageShell>
</main>
