import type { Lesson, LessonTrackId } from "$lib/learning/types";
import { lessonExercises } from "$lib/learning/beats";
import { lineSentences } from "$lib/stick-figure/line-plan";
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
  // Scene and exercise-context lines share one audio map per lesson, keyed by line id.
  const idOwners = new Map<string, string>();

  function claim(id: string, lessonId: string): void {
    const owner = idOwners.get(id);
    if (owner) issues.push(`Duplicate id ${id} in ${lessonId} and ${owner}`);
    idOwners.set(id, lessonId);
  }

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

    const prefix = `${lesson.slug}-`;

    for (const beat of lesson.beats) {
      claim(beat.id, lesson.id);
      if (!beat.id.startsWith(prefix)) {
        issues.push(`Beat id ${beat.id} in ${lesson.id} must start with ${prefix}`);
      }
      if (!beat.exercises.length) {
        issues.push(`Empty beat ${beat.id} in ${lesson.id}`);
      }
      for (const lineId of beat.teach.sceneLineIds ?? []) {
        if (!lesson.scene.some((line) => line.id === lineId)) {
          issues.push(`Unknown scene line ${lineId} in beat ${beat.id} of ${lesson.id}`);
        }
      }
    }

    const lines = [
      ...lesson.scene,
      ...exercises.flatMap((exercise) =>
        "context" in exercise ? (exercise.context ?? []) : [],
      ),
    ];
    const sceneSpeakers = new Set(lesson.scene.map((line) => line.speaker));
    for (const line of lesson.scene) {
      if (line.to && (line.to === line.speaker || !sceneSpeakers.has(line.to))) {
        issues.push(
          `Line ${line.id} in ${lesson.id} is said to ${line.to}, not in its scene`,
        );
      }
    }

    for (const line of lines) {
      claim(line.id, lesson.id);
      if (line.gestures && line.gestures.length > lineSentences(line.slovak).length) {
        issues.push(`Line ${line.id} in ${lesson.id} has more gestures than sentences`);
      }
      if (!line.id.startsWith(prefix)) {
        issues.push(`Line id ${line.id} in ${lesson.id} must start with ${prefix}`);
      }
    }

    for (const exercise of exercises) claim(exercise.id, lesson.id);
  }

  return issues;
}
