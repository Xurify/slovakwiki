import { readPracticeState } from "$lib/client/practice-state";
import { readFoucBootPayload, runFoucBoot } from "$lib/fouc/boot";
import { applyLessonsProgressView } from "$lib/lesson-progress/apply-progress";
import type { LessonsBootPayload } from "$lib/lesson-progress/boot-payload";
import { LESSONS_FOUC } from "$lib/lesson-progress/fouc";
import { buildLessonsProgressView } from "$lib/lesson-progress/progress-view";

/**
 * Blocking pre-paint entry. Bundled to an IIFE by `bun run fouc:boot`.
 * Keep free of Astro / Svelte / heavy content imports.
 */
runFoucBoot(LESSONS_FOUC.readyAttr, () => {
  const payload = readFoucBootPayload<LessonsBootPayload>(LESSONS_FOUC.dataId);
  if (!payload) return;

  const completed = new Set(readPracticeState(localStorage).completedLessonIds);
  applyLessonsProgressView(buildLessonsProgressView(payload, completed));
});
