import type { LessonGradeResult } from "$lib/components/lessons/lesson-review";
import type { StorageLike } from "$lib/components/practice/practice-state";

/** Where a learner left a lesson, so coming back does not start it over. */
export interface LessonResume {
  answers: Record<string, LessonGradeResult>;
  /** The furthest step reached. */
  at: number;
  /** The lesson's step ids when saved: a lesson changed since then starts fresh. */
  stepIds: string[];
}

const KEY = "slovak.wiki.lesson-resume.v1";

function readAll(storage: StorageLike): Record<string, LessonResume> {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(KEY) ?? "{}");
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, LessonResume>)
      : {};
  } catch {
    return {};
  }
}

function writeAll(storage: StorageLike, all: Record<string, LessonResume>): void {
  try {
    if (Object.keys(all).length === 0) storage.removeItem(KEY);
    else storage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Private mode or a full quota: the lesson still works, it just will not resume.
  }
}

/** The saved place in `lessonId`, when it was saved against the same steps. */
export function readLessonResume(
  storage: StorageLike,
  lessonId: string,
  stepIds: readonly string[],
): LessonResume | null {
  const saved = readAll(storage)[lessonId];
  if (!saved || !Array.isArray(saved.stepIds)) return null;
  const same =
    saved.stepIds.length === stepIds.length &&
    saved.stepIds.every((id, index) => id === stepIds[index]);
  if (
    !same ||
    !Number.isInteger(saved.at) ||
    saved.at <= 0 ||
    saved.at >= stepIds.length
  ) {
    return null;
  }
  return saved;
}

export function writeLessonResume(
  storage: StorageLike,
  lessonId: string,
  resume: LessonResume,
): void {
  writeAll(storage, { ...readAll(storage), [lessonId]: resume });
}

export function clearLessonResume(storage: StorageLike, lessonId: string): void {
  const all = readAll(storage);
  if (!(lessonId in all)) return;
  delete all[lessonId];
  writeAll(storage, all);
}
