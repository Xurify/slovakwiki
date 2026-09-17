import { markFoucReady } from "$lib/fouc/gate";
import { applyPracticeHubView } from "./apply-hub";
import type { PracticeBootPayload } from "./boot-payload";
import { PRACTICE_FOUC } from "./fouc";
import { buildPracticeHubView } from "./hub-view";

/** Idempotent DOM paint used by the client island. */
export function paintPracticeHub(
  payload: PracticeBootPayload,
  completedLessonIds: readonly string[],
  recentItemIds: readonly string[],
): void {
  applyPracticeHubView(buildPracticeHubView(payload, completedLessonIds, recentItemIds));
}

export function markPracticeHubReady(): void {
  markFoucReady(PRACTICE_FOUC.readyAttr);
}
