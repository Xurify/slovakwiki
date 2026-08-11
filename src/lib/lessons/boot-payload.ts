import { lessonPath, lessonTracks, lessons, lessonsForTrack } from "$lib/content/lessons";
import type { Lesson, LessonTrackId } from "$lib/learning/types";

/** Compact lesson fields the pre-paint boot needs. */
export interface LessonsBootLesson {
  id: string;
  track: LessonTrackId;
  slug: string;
  title: string;
  promise: string;
  phraseSk: string;
  phraseEn: string;
}

export interface LessonsBootTrack {
  id: LessonTrackId;
  title: string;
  lessonIds: string[];
}

export interface LessonsBootPayload {
  /** When set, progress is scoped to this track (track syllabus page). */
  scopedTrackId: LessonTrackId | null;
  tracks: LessonsBootTrack[];
  lessons: LessonsBootLesson[];
}

function bootLessonFrom(lesson: Lesson): LessonsBootLesson {
  const phrase = lesson.keyPhrases[0];

  return {
    id: lesson.id,
    track: lesson.track,
    slug: lesson.slug,
    title: lesson.title,
    promise: lesson.promise,
    phraseSk: phrase?.slovak ?? "",
    phraseEn: phrase?.english ?? "",
  };
}

/** Payload for `/lessons` (all tracks) or `/lessons/[track]` (scoped). */
export function buildLessonsBootPayload(
  scopedTrackId: LessonTrackId | null = null,
): LessonsBootPayload {
  const trackList = scopedTrackId
    ? lessonTracks.filter((track) => track.id === scopedTrackId)
    : lessonTracks;

  const lessonList = scopedTrackId ? lessonsForTrack(scopedTrackId) : lessons;

  return {
    scopedTrackId,
    tracks: trackList.map((track) => ({
      id: track.id,
      title: track.title,
      lessonIds: lessonsForTrack(track.id).map((lesson) => lesson.id),
    })),
    lessons: lessonList.map(bootLessonFrom),
  };
}

export function lessonHref(lesson: Pick<LessonsBootLesson, "track" | "slug">): string {
  return lessonPath({ track: lesson.track, slug: lesson.slug });
}
