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

/** Set on `<html>` before first paint while a saved place waits for the player to restore it. */
export const LESSON_RESUME_PENDING_ATTR = "data-lesson-resume-pending";

/** How long a pending resume may hide the lesson after `load` if the player never mounts. */
const RESUME_PENDING_FALLBACK_MS = 3000;

/**
 * Blocking head script: marks `<html>` with {@link LESSON_RESUME_PENDING_ATTR} when
 * {@link readLessonResume} would restore a step. Kept beside it and checked against it in
 * `resume.test.ts`, since an inline script cannot import this module.
 */
export function lessonResumeBootScript(
  lessonId: string,
  stepIds: readonly string[],
): string {
  const args = [
    KEY,
    lessonId,
    stepIds,
    LESSON_RESUME_PENDING_ATTR,
    RESUME_PENDING_FALLBACK_MS,
  ]
    .map((value) => JSON.stringify(value).replace(/</g, "\\u003c"))
    .join(",");
  return `(function(key,id,ids,attr,wait){try{var s=JSON.parse(localStorage.getItem(key)||"{}");s=s&&s[id];if(!s||!Array.isArray(s.stepIds)||s.stepIds.length!==ids.length||!s.stepIds.every(function(v,i){return v===ids[i];})||!Number.isInteger(s.at)||s.at<=0||s.at>=ids.length)return;}catch(e){return;}var root=document.documentElement;root.setAttribute(attr,"");addEventListener("load",function(){setTimeout(function(){root.removeAttribute(attr);},wait);});})(${args});`;
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
