import type { Lesson, LessonTrackId } from "$lib/learning/types";

export type LessonStatus = "complete" | "active" | "upcoming";

export interface TrackAccent {
  dot: string;
  glyph: string;
}

export interface LessonLevel {
  key: string;
  label: string;
  lessons: Lesson[];
}

export function lessonsDoneCount(doneIds: Set<string>, lessonList: Lesson[]): number {
  return lessonList.filter((lesson) => doneIds.has(lesson.id)).length;
}

export function lessonProgressPercent(
  doneIds: Set<string>,
  lessonList: Lesson[],
): number {
  if (lessonList.length === 0) return 0;
  return Math.round((lessonsDoneCount(doneIds, lessonList) / lessonList.length) * 100);
}

export function nextLessonInList(
  doneIds: Set<string>,
  lessonList: Lesson[],
): Lesson | null {
  return lessonList.find((lesson) => !doneIds.has(lesson.id)) ?? lessonList[0] ?? null;
}

export function lessonStatus(
  lesson: Lesson,
  doneIds: Set<string>,
  focusLesson: Lesson | null,
): LessonStatus {
  if (doneIds.has(lesson.id)) return "complete";
  if (focusLesson?.id === lesson.id) return "active";
  return "upcoming";
}

/**
 * Levels come from the authored lesson `group` label, in authored order.
 * Ungrouped lessons collect under an unlabelled level so the UI can skip the
 * header instead of inventing a name for it.
 */
export function lessonLevels(trackLessons: Lesson[]): LessonLevel[] {
  const levels: LessonLevel[] = [];

  for (const lesson of trackLessons) {
    const label = lesson.group?.trim() ?? "";
    const existing = levels.find((level) => level.label === label);

    if (existing) {
      existing.lessons.push(lesson);
      continue;
    }

    levels.push({
      key: `${lesson.track}::${label || "ungrouped"}`,
      label,
      lessons: [lesson],
    });
  }

  return levels;
}

/** A single level is just the track's lesson list — no level chrome earns its place. */
export function hasNamedLevels(levels: LessonLevel[]): boolean {
  return levels.length > 1 && levels.every((level) => level.label !== "");
}

/**
 * What the UI should actually render: named levels when the track is fully
 * grouped, otherwise one flat list. Avoids splitting a track into unlabelled
 * cards the learner has no way to interpret.
 */
export function displayLevels(trackLessons: Lesson[]): LessonLevel[] {
  const levels = lessonLevels(trackLessons);
  if (hasNamedLevels(levels)) return levels;

  const [first] = levels;
  if (!first) return [];

  return [
    {
      key: `${first.lessons[0]?.track ?? "track"}::all`,
      label: "",
      lessons: trackLessons,
    },
  ];
}

export function trackAccent(trackId: LessonTrackId): TrackAccent {
  switch (trackId) {
    case "everyday":
      return { dot: "bg-rose-500", glyph: "bg-rose-100 text-rose-800" };
    case "grammar":
      return { dot: "bg-blue-600", glyph: "bg-blue-100 text-blue-800" };
    case "pronunciation":
      return { dot: "bg-emerald-600", glyph: "bg-emerald-100 text-emerald-800" };
  }
}
