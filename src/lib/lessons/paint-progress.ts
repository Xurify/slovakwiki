import type { LessonsBootPayload } from "$lib/lessons/boot-payload";
import { applyLessonsProgressView } from "$lib/lessons/apply-progress";
import { LESSONS_FOUC, markFoucReady } from "$lib/fouc/gate";
import { buildLessonsProgressView } from "$lib/lessons/progress-view";

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
