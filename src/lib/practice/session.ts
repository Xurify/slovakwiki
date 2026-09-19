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

/**
 * Catalog order for prerender. Clock drills need RNG, so SSR leaves them empty
 * and the island fills a fresh session after mount.
 */
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

  const [firstId, ...restIds] = set.itemIds;
  if (!firstId) return [];

  const restSize =
    set.sessionSize === undefined ? undefined : Math.max(0, set.sessionSize - 1);
  const restIdsSampled = samplePracticeItemIds(restIds, restSize);
  const [first, ...rest] = itemsFromIds([firstId, ...restIdsSampled]);
  if (!first) return [];

  return [first, ...rest.map((item) => maybeMaterializeBuildItem(item))];
}

/** Keep the painted first item object when the client session starts with the same id. */
export function mergePracticeSession(
  painted: PracticeItem[],
  next: PracticeItem[],
): PracticeItem[] {
  const paintedFirst = painted[0];
  const nextFirst = next[0];
  if (paintedFirst && nextFirst && paintedFirst.id === nextFirst.id) {
    return [paintedFirst, ...next.slice(1)];
  }

  return next;
}
