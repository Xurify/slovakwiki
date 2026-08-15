import type { Lesson, LessonTrackId } from "$lib/learning/types";
import { lessonExercises } from "$lib/learning/beats";
import { everydayLessons } from "./everyday";
import { grammarLessons } from "./grammar";
import { pronunciationLessons } from "./pronunciation";

export { lessonTracks } from "./tracks";

export const lessons: Lesson[] = [
  ...everydayLessons,
  ...grammarLessons,
  ...pronunciationLessons,
];

export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export function lessonPath(lesson: Pick<Lesson, "slug" | "track">): string {
  return `/lessons/${lesson.track}/${lesson.slug}`;
}

export function lessonsForTrack(track: LessonTrackId): Lesson[] {
  return lessons.filter((lesson) => lesson.track === track);
}

export function validateLessons(): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const lesson of lessons) {
    if (ids.has(lesson.id)) issues.push(`Duplicate lesson: ${lesson.id}`);
    ids.add(lesson.id);

    if (!lesson.scene.length) issues.push(`Missing scene: ${lesson.id}`);
    if (!lesson.beats.length) issues.push(`Missing beats: ${lesson.id}`);

    const exercises = lessonExercises(lesson);
    if (!exercises.length) issues.push(`Missing exercises: ${lesson.id}`);
    if (exercises.filter((exercise) => exercise.type !== "personal").length < 2) {
      issues.push(`Too few graded exercises: ${lesson.id}`);
    }

    for (const beat of lesson.beats) {
      if (!beat.exercises.length) {
        issues.push(`Empty beat ${beat.id} in ${lesson.id}`);
      }
    }
  }

  return issues;
}
