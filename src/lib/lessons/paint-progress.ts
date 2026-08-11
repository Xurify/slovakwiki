import type { LessonStatus } from "$lib/lessons/progress";
import {
  lessonHref,
  type LessonsBootLesson,
  type LessonsBootPayload,
} from "$lib/lessons/boot-payload";

function setText(selector: string, text: string): void {
  for (const element of document.querySelectorAll<HTMLElement>(selector)) {
    element.textContent = text;
  }
}

function setWidth(selector: string, percent: number): void {
  for (const element of document.querySelectorAll<HTMLElement>(selector)) {
    element.style.width = `${percent}%`;
  }
}

function setHref(selector: string, href: string): void {
  for (const element of document.querySelectorAll<HTMLAnchorElement>(selector)) {
    element.href = href;
  }
}

function progressPercent(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

function nextLesson(
  completed: Set<string>,
  lessonList: LessonsBootLesson[],
): LessonsBootLesson | null {
  return lessonList.find((lesson) => !completed.has(lesson.id)) ?? lessonList[0] ?? null;
}

const CHECK_ICON =
  '<svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const CHECK_LEFT = `<span class="inline-flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">${CHECK_ICON}</span>`;

const CHECK_RIGHT = (lessonId: string) =>
  `<span class="inline-flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" data-lesson-done="${lessonId}">${CHECK_ICON}<span class="sr-only">Completed</span></span>`;

function indexMarkup(status: LessonStatus, numberLabel: string): string {
  if (status === "complete") return CHECK_LEFT;
  return `<span class="font-serif text-sm tabular-nums text-slate-400">${numberLabel}</span>`;
}

function statusMarkup(
  status: LessonStatus,
  lessonId: string,
  completeOnRight: boolean,
): string {
  if (status === "complete") {
    if (completeOnRight) return CHECK_RIGHT(lessonId);
    return `<span class="sr-only" data-lesson-done="${lessonId}">Completed</span>`;
  }

  if (status === "active") {
    return `<span class="inline-flex min-h-8 items-center rounded-(--control-radius) bg-blue-600 px-3.5 text-xs font-bold text-white">Start</span>`;
  }

  return `<span class="sr-only">Not started</span>`;
}

function paintRow(row: HTMLElement, lessonId: string, status: LessonStatus): void {
  row.dataset.lessonStatus = status;
  row.classList.toggle("border-blue-600", status === "active");
  row.classList.toggle("border-transparent", status !== "active");

  const leading = row.dataset.lessonLeading ?? "index";
  const completeOnRight = leading === "motif";

  if (!completeOnRight) {
    const numberLabel = row.dataset.lessonIndex ?? "";
    const indexSlot = row.querySelector("[data-lesson-index-slot]");
    if (indexSlot) indexSlot.innerHTML = indexMarkup(status, numberLabel);
  }

  const slot = row.querySelector("[data-lesson-status-slot]");
  if (slot) slot.innerHTML = statusMarkup(status, lessonId, completeOnRight);
}

function paintLevelBars(completed: Set<string>): void {
  for (const section of document.querySelectorAll<HTMLElement>("[data-level]")) {
    const key = section.dataset.level;
    if (!key) continue;

    const ids = [...section.querySelectorAll<HTMLElement>("[data-lesson-card]")].flatMap(
      (row) => {
        const id = row.dataset.lessonCard;
        return id ? [id] : [];
      },
    );

    const done = ids.filter((id) => completed.has(id)).length;
    const percent = progressPercent(done, ids.length);
    setWidth(`[data-level-progress-bar="${CSS.escape(key)}"]`, percent);
    setText(`[data-level-done-pct="${CSS.escape(key)}"]`, String(percent));
  }
}

function showContinueMotif(lessonId: string): void {
  for (const element of document.querySelectorAll<HTMLElement>("[data-continue-motif]")) {
    element.classList.toggle("hidden", element.dataset.continueMotif !== lessonId);
  }
}

function paintContinueCard(
  lesson: LessonsBootLesson,
  track: { id: string; title: string; lessonIds: string[] },
  completed: Set<string>,
  review: boolean,
): void {
  const trackLessonCount = track.lessonIds.length;
  const lessonNumber = Math.max(track.lessonIds.indexOf(lesson.id) + 1, 1);
  const done = track.lessonIds.filter((id) => completed.has(id)).length;
  const trackHref = `/lessons/${track.id}`;

  setText("[data-continue-track-title]", track.title);
  setText("[data-continue-lesson-title]", lesson.title);
  setText("[data-continue-promise]", lesson.promise);
  setText("[data-continue-cta-label]", review ? "Review lesson" : "Continue");
  setHref("[data-continue-cta]", lessonHref(lesson));
  setHref("[data-continue-track-link]", trackHref);
  setText("[data-continue-lesson-number]", String(lessonNumber));
  setText("[data-continue-lesson-total]", String(trackLessonCount));
  setText("[data-continue-phrase-sk]", lesson.phraseSk);
  setText("[data-continue-phrase-en]", lesson.phraseEn);
  setWidth("[data-continue-progress-bar]", progressPercent(done, trackLessonCount));
  showContinueMotif(lesson.id);
}

function paintTrackContinue(
  lesson: LessonsBootLesson,
  trackLessons: LessonsBootLesson[],
  completed: Set<string>,
): void {
  const allDone = trackLessons.every((entry) => completed.has(entry.id));
  setText(
    "[data-track-continue-cta-label]",
    allDone ? "Review lesson" : "Continue learning",
  );
  setHref("[data-track-continue-cta]", lessonHref(lesson));
}

/** Idempotent DOM paint used by the client island (mirrors the inline boot). */
export function paintLessonsProgress(
  payload: LessonsBootPayload,
  completed: Set<string>,
): void {
  const byId = new Map(payload.lessons.map((lesson) => [lesson.id, lesson]));

  for (const track of payload.tracks) {
    const trackLessons = track.lessonIds.flatMap((id) => {
      const lesson = byId.get(id);
      return lesson ? [lesson] : [];
    });
    const done = trackLessons.filter((lesson) => completed.has(lesson.id)).length;
    const percent = progressPercent(done, trackLessons.length);

    setText(`[data-track-done-count="${track.id}"]`, String(done));
    setWidth(`[data-track-progress-bar="${track.id}"]`, percent);
  }

  const scopedLessons = payload.scopedTrackId
    ? (payload.tracks
        .find((track) => track.id === payload.scopedTrackId)
        ?.lessonIds.flatMap((id) => {
          const lesson = byId.get(id);
          return lesson ? [lesson] : [];
        }) ?? [])
    : payload.lessons;

  const focusLesson = nextLesson(completed, scopedLessons);

  if (payload.scopedTrackId) {
    const done = scopedLessons.filter((lesson) => completed.has(lesson.id)).length;
    setText(
      "[data-track-progress-pct]",
      String(progressPercent(done, scopedLessons.length)),
    );
    if (focusLesson) paintTrackContinue(focusLesson, scopedLessons, completed);
  } else if (focusLesson) {
    const track = payload.tracks.find((entry) => entry.id === focusLesson.track);
    if (track) {
      const review = track.lessonIds.every((id) => completed.has(id));
      paintContinueCard(focusLesson, track, completed, review);
    }
  }

  paintLevelBars(completed);

  for (const row of document.querySelectorAll<HTMLElement>("[data-lesson-card]")) {
    const lessonId = row.dataset.lessonCard;
    if (!lessonId) continue;

    let status: LessonStatus = "upcoming";
    if (completed.has(lessonId)) status = "complete";
    else if (focusLesson?.id === lessonId) status = "active";

    paintRow(row, lessonId, status);
  }
}

export function markLessonsProgressReady(): void {
  document.documentElement.dataset.lessonsReady = "1";
}
