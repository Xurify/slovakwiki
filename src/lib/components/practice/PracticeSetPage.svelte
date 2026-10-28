<script lang="ts">
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { onMount, tick, untrack } from "svelte";
  import {
    readPracticeState,
    saveRecentItem,
    writePracticeState,
  } from "$lib/components/practice/practice-state";
  import PracticePlayer from "$lib/components/practice/PracticePlayer.svelte";
  import PracticeSessionSkeleton from "$lib/components/practice/PracticeSessionSkeleton.svelte";
  import { sessionSubtitle } from "$lib/components/practice/practice-session-ui";
  import { practiceSessionCount, type PracticeSet } from "$lib/catalog/practice";
  import type { PracticeSessionContext } from "$lib/catalog/practice/hub";
  import type { PracticeItem } from "$lib/learning/types";
  import { hideClockQ1Boot, readClockSession } from "$lib/practice/clock-session-stash";
  import { markPracticeSetReady, PRACTICE_SET_FOUC } from "$lib/practice/fouc";
  import {
    clientPracticeSession,
    mergePracticeSession,
    retryCardFor,
    ssrPracticeSession,
  } from "$lib/practice/session";
  import { saveAnswerForReview } from "$lib/practice/review-memory";
  import { practiceTaskKicker } from "$lib/practice/task-kicker";

  let {
    data,
    layout = "page",
  }: {
    data: {
      set: PracticeSet;
      clozeAudioSrcs?: Record<string, string>;
      dictionaryHrefs?: Record<string, string>;
      sessionContext?: PracticeSessionContext;
    };
    layout?: "page" | "embed";
  } = $props();

  let hintMode = $state<"inline" | "rail">("inline");
  // The server's session first; onMount swaps in the reader's own.
  let sessionItems = $state<PracticeItem[]>(untrack(() => ssrPracticeSession(data.set)));
  let sectionTitle = $state(untrack(() => practiceTaskKicker(sessionItems[0]?.task)));

  onMount(() => {
    void (async () => {
      try {
        const params = new URLSearchParams(location.search);
        const atItemId = params.get("at");
        const focusedItem = Boolean(atItemId && data.set.itemIds.includes(atItemId));
        const isClockSet = data.set.sessionKind === "days-dates-time";
        const stashed = isClockSet ? readClockSession() : null;
        const nextSession = stashed ?? clientPracticeSession(data.set, atItemId);

        if (stashed) {
          sessionItems = stashed;
        } else if (focusedItem) {
          sessionItems = nextSession;
        } else {
          sessionItems = mergePracticeSession(sessionItems, nextSession);
        }

        if (focusedItem && atItemId) {
          const current = readPracticeState(localStorage);
          writePracticeState(localStorage, saveRecentItem(current, atItemId));
        }

        hintMode = params.get("hint") === "rail" ? "rail" : "inline";
      } finally {
        const alreadyVisible = document.documentElement.hasAttribute(
          `data-${PRACTICE_SET_FOUC.readyAttr}`,
        );

        if (!alreadyVisible || layout === "embed") {
          await tick();
          if (layout === "embed") {
            await new Promise<void>((resolve) => {
              requestAnimationFrame(() => resolve());
            });
          }
        }
        hideClockQ1Boot();
        markPracticeSetReady();
      }
    })();
  });
</script>

{#if layout === "embed"}
  {#if sessionItems.length > 0}
    <PracticePlayer
      items={sessionItems}
      {hintMode}
      audioSrcs={data.clozeAudioSrcs ?? {}}
      dictionaryHrefs={data.dictionaryHrefs ?? {}}
      backHref="/practice"
      backLabel="Practice"
      sessionTitle={data.set.title}
      sessionContext={data.sessionContext}
      buildRetryOfMissedCard={(missed) => retryCardFor(data.set, missed)}
      onAnswer={(item, grade) => saveAnswerForReview(localStorage, item.id, grade)}
      bind:sectionTitle
    />
  {/if}
{:else}
  <main class="py-8 pb-16 max-[600px]:py-5">
    <PageShell class="max-w-[640px]">
      <div data-practice-set-hydrate>
        {#if sessionItems.length > 0}
          <PracticePlayer
            items={sessionItems}
            {hintMode}
            audioSrcs={data.clozeAudioSrcs ?? {}}
            dictionaryHrefs={data.dictionaryHrefs ?? {}}
            backHref="/practice"
            backLabel="Practice"
            sessionTitle={data.set.title}
            sessionContext={data.sessionContext}
            buildRetryOfMissedCard={(missed) => retryCardFor(data.set, missed)}
            onAnswer={(item, grade) => saveAnswerForReview(localStorage, item.id, grade)}
            bind:sectionTitle
          />
        {:else}
          <PracticeSessionSkeleton
            subtitle={sessionSubtitle(data.sessionContext)}
            title={data.set.title}
            total={practiceSessionCount(data.set)}
          />
        {/if}
      </div>
    </PageShell>
  </main>
{/if}
