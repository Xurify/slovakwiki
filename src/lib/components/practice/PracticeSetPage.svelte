<script lang="ts">
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { onMount, tick } from "svelte";
  import {
    readPracticeState,
    saveRecentItem,
    writePracticeState,
  } from "$lib/components/practice/practice-state";
  import PracticePlayer from "$lib/components/practice/PracticePlayer.svelte";
  import PracticeSessionChrome from "$lib/components/practice/PracticeSessionChrome.svelte";
  import { practiceSessionCount, type PracticeSet } from "$lib/catalog/practice";
  import type { PracticeItem } from "$lib/learning/types";
  import { markPracticeSetReady } from "$lib/practice/fouc";
  import { clientPracticeSession, ssrPracticeSession } from "$lib/practice/session";

  let {
    data,
  }: {
    data: {
      set: PracticeSet;
      clozeAudioSrcs?: Record<string, string>;
      dictionaryHrefs?: Record<string, string>;
    };
  } = $props();

  let hintMode = $state<"inline" | "rail">("inline");
  let sessionItems = $state<PracticeItem[]>(ssrPracticeSession(data.set));
  let sectionTitle = $state(data.set.title);

  function sectionTitleFor(item: PracticeItem | undefined): string {
    const task = item?.task;
    if (!task) return data.set.title;
    if (task.type === "typed" && task.task === "repair") return "Repair this sentence";
    if (task.type === "cloze") return "Fill the gap";
    if (task.type === "selectAll") return "Mark every correct way";
    if (task.type === "choice") return "Choose the answer";
    if (task.type === "build") return "";
    if (task.type === "typed") return "Write the sentence";
    return data.set.title;
  }

  onMount(() => {
    void (async () => {
      try {
        const params = new URLSearchParams(location.search);
        const atItemId = params.get("at");
        const focusedItem = Boolean(atItemId && data.set.itemIds.includes(atItemId));

        sessionItems = clientPracticeSession(data.set, atItemId);
        sectionTitle = focusedItem ? sectionTitleFor(sessionItems[0]) : data.set.title;

        if (focusedItem && atItemId) {
          const current = readPracticeState(localStorage);
          writePracticeState(localStorage, saveRecentItem(current, atItemId));
        }

        hintMode = params.get("hint") === "rail" ? "rail" : "inline";
      } finally {
        await tick();
        markPracticeSetReady();
      }
    })();
  });
</script>

<main class="py-8 pb-16 max-[600px]:py-5">
  <PageShell class="max-w-[640px]">
    <div class="min-h-[32rem]" data-practice-set-hydrate>
      {#if sessionItems.length > 0}
        <PracticePlayer
          items={sessionItems}
          {hintMode}
          audioSrcs={data.clozeAudioSrcs ?? {}}
          dictionaryHrefs={data.dictionaryHrefs ?? {}}
          backHref="/practice"
          backLabel="Practice"
          sessionTitle={data.set.title}
          bind:sectionTitle
        />
      {:else}
        <div
          class="mx-auto w-full max-w-[640px]"
          aria-busy="true"
          aria-label="Loading practice"
        >
          <PracticeSessionChrome
            backHref="/practice"
            backLabel="Practice"
            total={practiceSessionCount(data.set)}
          />

          <section
            class="min-h-80 overflow-hidden rounded-(--frame-radius) border border-slate-200 bg-surface shadow-(--shadow-border)"
          ></section>
        </div>
      {/if}
    </div>
  </PageShell>
</main>
