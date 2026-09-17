import type { PracticeBootItem } from "./boot-payload";
import type { PracticeHubView } from "./hub-view";

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

function donePercent(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

function paintFeatured(view: PracticeHubView, completed: Set<string>): void {
  for (const sheet of document.querySelectorAll<HTMLElement>("[data-featured-sheet]")) {
    const setId = sheet.dataset.featuredSheet;
    const lessonId = sheet.dataset.featuredLesson;
    const isFeatured = Boolean(setId && setId === view.featuredSetId);

    sheet.hidden = !isFeatured;

    const cta = sheet.querySelector<HTMLElement>("[data-hero-cta]");
    if (cta) {
      cta.textContent = lessonId && completed.has(lessonId) ? "Try again" : "Start set";
    }

    const done = sheet.querySelector<HTMLElement>("[data-featured-done]");
    if (done) {
      done.hidden = !lessonId || !completed.has(lessonId);
    }
  }

  setText("[data-hub-done-count]", String(view.doneCount));
  setText("[data-hub-total-count]", String(view.totalCount));
  setWidth("[data-hub-done-bar]", donePercent(view.doneCount, view.totalCount));
}

function paintSheetDone(completed: Set<string>): void {
  for (const el of document.querySelectorAll<HTMLElement>("[data-sheet-done]")) {
    const lessonId = el.dataset.sheetDone;
    el.textContent = lessonId && completed.has(lessonId) ? " · Done" : "";
  }

  for (const el of document.querySelectorAll<HTMLElement>("[data-sheet-cta]")) {
    const lessonId = el.dataset.sheetCta;
    el.textContent = lessonId && completed.has(lessonId) ? "Repeat" : "Start now";
  }
}

function paintRecents(recents: PracticeBootItem[]): void {
  const host = document.querySelector<HTMLElement>("[data-practice-recents]");
  const list = document.querySelector<HTMLElement>("[data-practice-recents-list]");
  const template = document.querySelector<HTMLTemplateElement>(
    "[data-practice-recent-template]",
  );

  if (!host || !list || !template) return;

  list.replaceChildren();

  if (recents.length === 0) {
    host.hidden = true;
    return;
  }

  host.hidden = false;

  for (const recent of recents) {
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const link = clone.querySelector<HTMLAnchorElement>("[data-recent-href]");
    const slovak = clone.querySelector<HTMLElement>("[data-recent-sk]");
    const english = clone.querySelector<HTMLElement>("[data-recent-en]");
    const source = clone.querySelector<HTMLElement>("[data-recent-source]");

    if (link) link.href = recent.href;
    if (slovak) slovak.textContent = recent.slovak;

    if (english) {
      english.textContent = recent.english;
      english.hidden = !recent.english;
    }

    if (source) source.textContent = recent.sourceLabel;

    list.append(clone);
  }
}

/** Apply a pure hub view to the practice index DOM. Idempotent. */
export function applyPracticeHubView(view: PracticeHubView): void {
  const completed = new Set(view.completedLessonIds);

  paintFeatured(view, completed);
  paintSheetDone(completed);
  paintRecents(view.recents);
}
