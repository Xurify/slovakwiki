import { readPracticeState } from "$lib/components/practice/practice-state";
import { readFoucBootPayload, runFoucBoot } from "$lib/fouc/boot";
import { applyPracticeHubView } from "./apply-hub";
import type { PracticeBootPayload } from "./boot-payload";
import { PRACTICE_FOUC } from "./fouc";
import { buildPracticeHubView } from "./hub-view";

/**
 * Blocking pre-paint entry. Bundled to an IIFE by `bun run fouc:boot`.
 * Keep free of Astro / Svelte / heavy content imports.
 */
runFoucBoot(PRACTICE_FOUC.readyAttr, () => {
  const payload = readFoucBootPayload<PracticeBootPayload>(PRACTICE_FOUC.dataId);
  if (!payload) return;

  const state = readPracticeState(localStorage);
  applyPracticeHubView(
    buildPracticeHubView(payload, state.completedLessonIds, state.recentItemIds),
  );
});
