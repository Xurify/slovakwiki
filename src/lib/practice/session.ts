import {
  practiceItemById,
  samplePracticeItemIds,
  type PracticeSet,
} from "$lib/catalog/practice";
import { maybeMaterializeBuildItem } from "$lib/learning/exercises/materialize-build";
import type { PracticeItem } from "$lib/learning/types";
import {
  buildDaysDatesTimeSession,
  isDaysDatesTimeKind,
  materializeDaysDatesTimeItem,
} from "$lib/learning/time/session";

function itemsFromIds(itemIds: readonly string[]): PracticeItem[] {
  return itemIds
    .map((itemId) => practiceItemById.get(itemId))
    .filter((item): item is PracticeItem => item !== undefined);
}

/** Catalog order, no shuffle / RNG — SSR must match the first client render. */
export function ssrPracticeSession(set: PracticeSet): PracticeItem[] {
  if (set.sessionKind === "days-dates-time") return [];

  const ids =
    set.sessionSize === undefined || set.sessionSize >= set.itemIds.length
      ? set.itemIds
      : set.itemIds.slice(0, set.sessionSize);

  return itemsFromIds(ids);
}

/** Shuffle, `?at`, clock/build materialize — call only after mount. */
export function clientPracticeSession(
  set: PracticeSet,
  atItemId: string | null,
): PracticeItem[] {
  if (set.sessionKind === "days-dates-time") {
    if (atItemId && isDaysDatesTimeKind(atItemId)) {
      return [materializeDaysDatesTimeItem(atItemId)];
    }

    return buildDaysDatesTimeSession();
  }

  if (atItemId && set.itemIds.includes(atItemId)) {
    const item = practiceItemById.get(atItemId);
    if (item) return [maybeMaterializeBuildItem(item)];
  }

  const sampledIds = samplePracticeItemIds(set.itemIds, set.sessionSize);
  return itemsFromIds(sampledIds).map((item) => maybeMaterializeBuildItem(item));
}
