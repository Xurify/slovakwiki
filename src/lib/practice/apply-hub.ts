import type { PracticeBootItem } from "./boot-payload";
import type { PracticeHubView } from "./hub-view";

function paintFeatured(view: PracticeHubView): void {
  for (const sheet of document.querySelectorAll<HTMLElement>("[data-featured-sheet]")) {
    const setId = sheet.dataset.featuredSheet;
    sheet.hidden = !setId || setId !== view.featuredSetId;
  }
}

function paintBrowse(view: PracticeHubView): void {
  const completed = new Set(view.completedLessonIds);

  for (const row of document.querySelectorAll<HTMLElement>("[data-browse-sheet]")) {
    const setId = row.dataset.browseSheet;
    const lessonId = row.dataset.browseLesson;
    const isNext = Boolean(setId && setId === view.featuredSetId);
    const isDone = Boolean(lessonId && completed.has(lessonId));

    const next = row.querySelector<HTMLElement>("[data-browse-next]");
    const done = row.querySelector<HTMLElement>("[data-browse-done]");

    if (next) next.hidden = !isNext;
    if (done) done.hidden = !isDone;
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
  paintFeatured(view);
  paintBrowse(view);
  paintRecents(view.recents);
}
