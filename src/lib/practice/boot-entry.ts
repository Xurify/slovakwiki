import { readPracticeState } from "$lib/components/practice/practice-state";
import { readFoucBootPayload, runFoucBoot } from "$lib/fouc/boot";
import { applyPracticeHubView } from "./apply-hub";
import type { PracticeBootPayload } from "./boot-payload";
import { PRACTICE_FOUC } from "./fouc";
import { buildPracticeHubView } from "./hub-view";
import { localDayKey, dueFormIdsOldestFirst, readReviewMemory } from "./review-memory";

/**
 * Blocking pre-paint entry. Bundled to an IIFE by `bun run fouc:boot`.
 * Keep free of Astro / Svelte / heavy content imports.
 */
runFoucBoot(PRACTICE_FOUC.readyAttr, () => {
  const payload = readFoucBootPayload<PracticeBootPayload>(PRACTICE_FOUC.dataId);
  if (!payload) return;

  const state = readPracticeState(localStorage);
  const due = dueFormIdsOldestFirst(
    readReviewMemory(localStorage),
    localDayKey(new Date()),
  );
  applyPracticeHubView(
    buildPracticeHubView(payload, state.completedLessonIds, state.recentItemIds, due),
  );
});
