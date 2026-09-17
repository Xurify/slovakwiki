import type {
  PracticeBootItem,
  PracticeBootPayload,
  PracticeBootSheet,
} from "./boot-payload";

export const PRACTICE_RECENTS_CAP = 8;

export interface PracticeHubView {
  completedLessonIds: readonly string[];
  doneCount: number;
  featuredCta: string;
  featuredSetId: string | null;
  recents: PracticeBootItem[];
  totalCount: number;
}

function pickFeaturedSheet(
  sheets: PracticeBootSheet[],
  completed: Set<string>,
): PracticeBootSheet | undefined {
  return sheets.find((sheet) => !completed.has(sheet.lessonId)) ?? sheets[0];
}

function buildRecents(
  items: PracticeBootItem[],
  recentItemIds: readonly string[],
): PracticeBootItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const recents: PracticeBootItem[] = [];

  for (const itemId of [...recentItemIds].reverse()) {
    const item = byId.get(itemId);
    if (!item) continue;

    recents.push(item);
    if (recents.length >= PRACTICE_RECENTS_CAP) break;
  }

  return recents;
}

/** Pure hub model for `/practice`. No DOM. */
export function buildPracticeHubView(
  payload: PracticeBootPayload,
  completedLessonIds: readonly string[],
  recentItemIds: readonly string[],
): PracticeHubView {
  const completed = new Set(completedLessonIds);
  const featured = pickFeaturedSheet(payload.sheets, completed);
  const featuredCompleted = featured ? completed.has(featured.lessonId) : false;

  return {
    completedLessonIds: [...completed],
    doneCount: payload.sheets.filter((sheet) => completed.has(sheet.lessonId)).length,
    featuredCta: featuredCompleted ? "Try again" : "Start set",
    featuredSetId: featured?.id ?? null,
    recents: buildRecents(payload.items, recentItemIds),
    totalCount: payload.sheets.length,
  };
}
