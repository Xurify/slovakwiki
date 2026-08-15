import type { LessonsBootPayload } from "$lib/lesson-progress/boot-payload";
import { applyLessonsProgressView } from "$lib/lesson-progress/apply-progress";
import { markFoucReady } from "$lib/fouc/gate";
import { LESSONS_FOUC } from "$lib/lesson-progress/fouc";
import { buildLessonsProgressView } from "$lib/lesson-progress/progress-view";

/** Idempotent DOM paint used by the client island. */
export function paintLessonsProgress(
  payload: LessonsBootPayload,
  completed: Set<string>,
): void {
  applyLessonsProgressView(buildLessonsProgressView(payload, completed));
}

export function markLessonsProgressReady(): void {
  markFoucReady(LESSONS_FOUC.readyAttr);
}
