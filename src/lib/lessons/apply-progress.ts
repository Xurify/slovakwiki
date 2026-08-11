import type { LessonStatus } from "$lib/lessons/progress";
import type { LessonsProgressView } from "$lib/lessons/progress-view";

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

function progressPercent(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
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

/** Apply a pure progress view to the lessons DOM. Idempotent. */
export function applyLessonsProgressView(view: LessonsProgressView): void {
  for (const track of view.tracks) {
    setText(`[data-track-done-count="${track.id}"]`, String(track.doneCount));
    setWidth(`[data-track-progress-bar="${track.id}"]`, track.percent);
  }

  if (view.scopedProgressPct !== null) {
    setText("[data-track-progress-pct]", String(view.scopedProgressPct));
  }

  if (view.trackContinue) {
    setText("[data-track-continue-cta-label]", view.trackContinue.ctaLabel);
    setHref("[data-track-continue-cta]", view.trackContinue.ctaHref);
  }

  if (view.continueCard) {
    const card = view.continueCard;
    setText("[data-continue-track-title]", card.trackTitle);
    setText("[data-continue-lesson-title]", card.lessonTitle);
    setText("[data-continue-promise]", card.promise);
    setText("[data-continue-cta-label]", card.ctaLabel);
    setHref("[data-continue-cta]", card.ctaHref);
    setHref("[data-continue-track-link]", card.trackHref);
    setText("[data-continue-lesson-number]", String(card.lessonNumber));
    setText("[data-continue-lesson-total]", String(card.lessonTotal));
    setText("[data-continue-phrase-sk]", card.phraseSk);
    setText("[data-continue-phrase-en]", card.phraseEn);
    setWidth("[data-continue-progress-bar]", card.progressPercent);
    showContinueMotif(card.motifLessonId);
  }

  paintLevelBars(new Set(view.completedIds));

  for (const row of document.querySelectorAll<HTMLElement>("[data-lesson-card]")) {
    const lessonId = row.dataset.lessonCard;
    if (!lessonId) continue;

    const status = view.lessonStatuses[lessonId] ?? "upcoming";
    paintRow(row, lessonId, status);
  }
}
