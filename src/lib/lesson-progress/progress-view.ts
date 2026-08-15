import type {
  LessonsBootLesson,
  LessonsBootPayload,
  LessonsBootTrack,
} from "$lib/lesson-progress/boot-payload";
import type { LessonStatus } from "$lib/lesson-progress/progress";

export interface LessonsTrackProgressView {
  id: string;
  doneCount: number;
  percent: number;
}

export interface LessonsContinueCardView {
  trackTitle: string;
  lessonTitle: string;
  promise: string;
  ctaLabel: string;
  ctaHref: string;
  trackHref: string;
  lessonNumber: number;
  lessonTotal: number;
  phraseSk: string;
  phraseEn: string;
  progressPercent: number;
  motifLessonId: string;
}

export interface LessonsTrackContinueView {
  ctaLabel: string;
  ctaHref: string;
}

export interface LessonsProgressView {
  tracks: LessonsTrackProgressView[];
  /** Scoped track page only. */
  scopedProgressPct: number | null;
  continueCard: LessonsContinueCardView | null;
  trackContinue: LessonsTrackContinueView | null;
  focusLessonId: string | null;
  /** Status for every lesson id in the payload (and any extras apply may see). */
  lessonStatuses: Record<string, LessonStatus>;
  /** For DOM-discovered level bars. */
  completedIds: readonly string[];
}

function progressPercent(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

function bootLessonHref(lesson: Pick<LessonsBootLesson, "track" | "slug">): string {
  return `/lessons/${lesson.track}/${lesson.slug}`;
}

function nextLesson(
  completed: Set<string>,
  lessonList: LessonsBootLesson[],
): LessonsBootLesson | null {
  return lessonList.find((lesson) => !completed.has(lesson.id)) ?? lessonList[0] ?? null;
}

function statusFor(
  lessonId: string,
  completed: Set<string>,
  focusLessonId: string | null,
): LessonStatus {
  if (completed.has(lessonId)) return "complete";
  if (focusLessonId === lessonId) return "active";
  return "upcoming";
}

function resolveScopedLessons(
  payload: LessonsBootPayload,
  byId: Map<string, LessonsBootLesson>,
): LessonsBootLesson[] {
  if (!payload.scopedTrackId) return payload.lessons;

  const track = payload.tracks.find((entry) => entry.id === payload.scopedTrackId);
  if (!track) return [];

  return track.lessonIds.flatMap((id) => {
    const lesson = byId.get(id);
    return lesson ? [lesson] : [];
  });
}

function trackLessons(
  track: LessonsBootTrack,
  byId: Map<string, LessonsBootLesson>,
): LessonsBootLesson[] {
  return track.lessonIds.flatMap((id) => {
    const lesson = byId.get(id);
    return lesson ? [lesson] : [];
  });
}

function buildContinueCard(
  lesson: LessonsBootLesson,
  track: LessonsBootTrack,
  completed: Set<string>,
): LessonsContinueCardView {
  const review = track.lessonIds.every((id) => completed.has(id));
  const done = track.lessonIds.filter((id) => completed.has(id)).length;

  return {
    trackTitle: track.title,
    lessonTitle: lesson.title,
    promise: lesson.promise,
    ctaLabel: review ? "Review lesson" : "Continue",
    ctaHref: bootLessonHref(lesson),
    trackHref: `/lessons/${track.id}`,
    lessonNumber: Math.max(track.lessonIds.indexOf(lesson.id) + 1, 1),
    lessonTotal: track.lessonIds.length,
    phraseSk: lesson.phraseSk,
    phraseEn: lesson.phraseEn,
    progressPercent: progressPercent(done, track.lessonIds.length),
    motifLessonId: lesson.id,
  };
}

function buildTrackContinue(
  lesson: LessonsBootLesson,
  scopedLessons: LessonsBootLesson[],
  completed: Set<string>,
): LessonsTrackContinueView {
  const allDone =
    scopedLessons.length > 0 && scopedLessons.every((entry) => completed.has(entry.id));

  return {
    ctaLabel: allDone ? "Review lesson" : "Continue learning",
    ctaHref: bootLessonHref(lesson),
  };
}

/** Pure progress model for lessons index / track pages. No DOM. */
export function buildLessonsProgressView(
  payload: LessonsBootPayload,
  completed: Set<string>,
): LessonsProgressView {
  const byId = new Map(payload.lessons.map((lesson) => [lesson.id, lesson]));

  const tracks: LessonsTrackProgressView[] = payload.tracks.map((track) => {
    const list = trackLessons(track, byId);
    const doneCount = list.filter((lesson) => completed.has(lesson.id)).length;
    return {
      id: track.id,
      doneCount,
      percent: progressPercent(doneCount, list.length),
    };
  });

  const scopedLessons = resolveScopedLessons(payload, byId);
  const focusLesson = nextLesson(completed, scopedLessons);
  const focusLessonId = focusLesson?.id ?? null;

  let scopedProgressPct: number | null = null;
  let continueCard: LessonsContinueCardView | null = null;
  let trackContinue: LessonsTrackContinueView | null = null;

  if (payload.scopedTrackId) {
    const done = scopedLessons.filter((lesson) => completed.has(lesson.id)).length;
    scopedProgressPct = progressPercent(done, scopedLessons.length);
    if (focusLesson) {
      trackContinue = buildTrackContinue(focusLesson, scopedLessons, completed);
    }
  } else if (focusLesson) {
    const track = payload.tracks.find((entry) => entry.id === focusLesson.track);
    if (track) continueCard = buildContinueCard(focusLesson, track, completed);
  }

  const lessonStatuses: Record<string, LessonStatus> = {};
  for (const lesson of payload.lessons) {
    lessonStatuses[lesson.id] = statusFor(lesson.id, completed, focusLessonId);
  }

  // Scoped payload may omit other-track lessons; still mark focus/complete for DOM rows.
  if (focusLessonId && !lessonStatuses[focusLessonId]) {
    lessonStatuses[focusLessonId] = statusFor(focusLessonId, completed, focusLessonId);
  }
  for (const id of completed) {
    if (!lessonStatuses[id]) lessonStatuses[id] = "complete";
  }

  return {
    tracks,
    scopedProgressPct,
    continueCard,
    trackContinue,
    focusLessonId,
    lessonStatuses,
    completedIds: [...completed],
  };
}
