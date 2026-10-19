import {
  practiceItemById,
  samplePracticeItemIds,
  type PracticeSet,
} from "$lib/catalog/practice";
import { maybeMaterializeBuildItem } from "$lib/learning/exercises/materialize-build";
import type { PracticeItem } from "$lib/learning/types";
import {
  buildDemonstrativesSession,
  isDemonstrativeKind,
  materializeDemonstrativeItem,
} from "$lib/learning/demonstratives/session";
import {
  buildPossessivesSession,
  isPossessiveKind,
  materializePossessiveItem,
  seededRng,
} from "$lib/learning/possessives/session";
import {
  buildDaysDatesTimeSession,
  isDaysDatesTimeKind,
  materializeDaysDatesTimeItem,
} from "$lib/learning/time/session";
import { drawWithNewSentence } from "./retry";
import { MAX_CARDS_PER_REVIEW } from "./review-memory";

function itemsFromIds(itemIds: readonly string[]): PracticeItem[] {
  return itemIds
    .map((itemId) => practiceItemById.get(itemId))
    .filter((item): item is PracticeItem => item !== undefined);
}

/**
 * Catalog order for prerender. Clock drills need RNG, so SSR leaves them empty
 * and the island fills a fresh session after mount. Possessive and demonstrative
 * drills render a fixed-seed session so hydration matches; the client then draws
 * a fresh one.
 */
export function ssrPracticeSession(set: PracticeSet): PracticeItem[] {
  if (set.sessionKind === "days-dates-time") return [];
  if (set.sessionKind === "possessives") return buildPossessivesSession(seededRng(1));
  if (set.sessionKind === "demonstratives") {
    return buildDemonstrativesSession(seededRng(1));
  }

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

  if (set.sessionKind === "possessives") {
    if (atItemId && isPossessiveKind(atItemId)) {
      return [materializePossessiveItem(atItemId)];
    }

    return buildPossessivesSession();
  }

  if (set.sessionKind === "demonstratives") {
    if (atItemId && isDemonstrativeKind(atItemId)) {
      return [materializeDemonstrativeItem(atItemId)];
    }

    return buildDemonstrativesSession();
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

export function retryCardFor(set: PracticeSet, missed: PracticeItem): PracticeItem {
  const draw = drawForSameRule(set, missed.id);
  if (!draw) return maybeMaterializeBuildItem(missed);
  return drawWithNewSentence(draw, (item) => item.feedback.correction, missed);
}

function drawForSameRule(
  set: PracticeSet,
  itemId: string,
): (() => PracticeItem) | undefined {
  if (set.sessionKind === "days-dates-time" && isDaysDatesTimeKind(itemId)) {
    return () => materializeDaysDatesTimeItem(itemId);
  }
  if (set.sessionKind === "possessives" && isPossessiveKind(itemId)) {
    return () => materializePossessiveItem(itemId);
  }
  if (set.sessionKind === "demonstratives" && isDemonstrativeKind(itemId)) {
    return () => materializeDemonstrativeItem(itemId);
  }
  return undefined;
}

export function freshCardForReview(formId: string): PracticeItem | undefined {
  if (isDemonstrativeKind(formId)) return materializeDemonstrativeItem(formId);
  if (isPossessiveKind(formId)) return materializePossessiveItem(formId);
  if (isDaysDatesTimeKind(formId)) return materializeDaysDatesTimeItem(formId);

  const item = practiceItemById.get(formId);
  return item ? maybeMaterializeBuildItem(item) : undefined;
}

export function buildReviewSession(formIds: readonly string[]): PracticeItem[] {
  return formIds
    .map((formId) => freshCardForReview(formId))
    .filter((item): item is PracticeItem => item !== undefined)
    .slice(0, MAX_CARDS_PER_REVIEW);
}
