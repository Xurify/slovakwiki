import type { PracticeItem } from "$lib/learning/types";
import { daysDatesTimePracticeItems } from "$lib/learning/time/practice-catalog";
import { everydayPracticeItems } from "./items-everyday";
import { grammarPracticeItems } from "./items-grammar";
import { pronunciationPracticeItems } from "./items-pronunciation";
import { practiceSets, type PracticeSet } from "./sets";

export type { PracticeSet } from "./sets";
export { practiceSets } from "./sets";

export const practiceItems: PracticeItem[] = [
  ...everydayPracticeItems,
  ...grammarPracticeItems,
  ...pronunciationPracticeItems,
  ...daysDatesTimePracticeItems,
];

export const practiceItemById = new Map(practiceItems.map((item) => [item.id, item]));

export const practiceSetById = new Map(practiceSets.map((set) => [set.id, set]));

export const practiceSetByLessonId = new Map<string, PracticeSet>();
for (const set of practiceSets) {
  if (!practiceSetByLessonId.has(set.lessonId)) {
    practiceSetByLessonId.set(set.lessonId, set);
  }
}

export function practiceSetForLesson(lessonId: string): PracticeSet | undefined {
  return practiceSetByLessonId.get(lessonId);
}

export function practiceSetForItem(itemId: string): PracticeSet | undefined {
  return practiceSets.find((set) => set.itemIds.includes(itemId));
}

/** Drill one exercise inside its topic set. */
export function practiceItemHref(itemId: string): string | undefined {
  const set = practiceSetForItem(itemId);
  if (!set) return undefined;
  return `/practice/${set.id}?at=${encodeURIComponent(itemId)}`;
}

export function samplePracticeItemIds(
  itemIds: readonly string[],
  sessionSize?: number,
): string[] {
  const pool = [...itemIds];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = pool[index]!;
    pool[index] = pool[swapIndex]!;
    pool[swapIndex] = current;
  }

  if (sessionSize === undefined || sessionSize >= pool.length) return pool;
  return pool.slice(0, Math.max(0, sessionSize));
}

export function practiceSessionCount(set: PracticeSet): number {
  if (set.sessionSize === undefined) return set.itemIds.length;
  return Math.min(set.sessionSize, set.itemIds.length);
}

export function validatePracticeItems(): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const item of practiceItems) {
    if (ids.has(item.id)) issues.push(`Duplicate practice item: ${item.id}`);
    ids.add(item.id);

    if (!item.feedback.correction || !item.feedback.why) {
      issues.push(`Incomplete feedback: ${item.id}`);
    }

    if (item.task.practiceItemId !== item.id) {
      issues.push(`Mismatched practice task: ${item.id}`);
    }

    if (!practiceSetForItem(item.id)) {
      issues.push(`Practice item not in any set: ${item.id}`);
    }

    if (item.task.type === "cloze") {
      if (item.task.frame.split("{}").length !== 2) {
        issues.push(`Cloze frame needs exactly one {}: ${item.id}`);
      }
      if (!item.task.answer.trim()) {
        issues.push(`Cloze answer missing: ${item.id}`);
      }
      if (!item.task.gapEn.trim()) {
        issues.push(`Cloze gap gloss missing: ${item.id}`);
      }
      if (!item.task.hint.chip.trim() || !item.task.hint.note.trim()) {
        issues.push(`Cloze hint incomplete: ${item.id}`);
      }
    }
  }

  for (const set of practiceSets) {
    for (const itemId of set.itemIds) {
      if (!practiceItemById.has(itemId))
        issues.push(`Unknown practice item: ${set.id}/${itemId}`);
    }

    if (set.previewItemId && !set.itemIds.includes(set.previewItemId)) {
      issues.push(`previewItemId not in set: ${set.id}/${set.previewItemId}`);
    }

    if (set.sessionSize !== undefined) {
      if (!Number.isInteger(set.sessionSize) || set.sessionSize < 1) {
        issues.push(`Invalid sessionSize: ${set.id}`);
      } else if (set.sessionSize > set.itemIds.length) {
        issues.push(
          `sessionSize ${set.sessionSize} exceeds pool ${set.itemIds.length}: ${set.id}`,
        );
      }
    }
  }

  return issues;
}
