<script lang="ts">
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { onMount } from "svelte";
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

  onMount(() => {
    const sampledIds = samplePracticeItemIds(data.set.itemIds, data.set.sessionSize);
    sessionItems = sampledIds
      .map((itemId) => practiceItemById.get(itemId))
      .filter((item): item is PracticeItem => item !== undefined);
    sectionTitle = sectionTitleFor(sessionItems[0]);
    hintMode =
      new URLSearchParams(location.search).get("hint") === "rail" ? "rail" : "inline";
    hydrated = true;
  });
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[720px]">
    <nav class="mb-8 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/practice">Practice</TextLink>
      <span aria-hidden="true">/</span>
      <span>{sectionTitle}</span>
    </nav>

    {#if hydrated}
      <PracticePlayer
        items={sessionItems}
        {hintMode}
        audioSrcs={data.clozeAudioSrcs ?? {}}
        bind:sectionTitle
      />
    {:else}
      <PracticePlayerSkeleton />
    {/if}
  </PageShell>
</main>
