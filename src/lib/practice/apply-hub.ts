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

    if (setId && setId === view.featuredSetId) row.dataset.state = "next";
    else row.dataset.state = lessonId && completed.has(lessonId) ? "done" : "todo";
  }

  for (const track of document.querySelectorAll<HTMLElement>("[data-practice-track]")) {
    const lessonIds = new Set<string>();

    for (const row of track.querySelectorAll<HTMLElement>("[data-browse-lesson]")) {
      if (row.dataset.browseLesson) lessonIds.add(row.dataset.browseLesson);
    }

    const doneCount = [...lessonIds].filter((id) => completed.has(id)).length;
    const pct = lessonIds.size ? Math.round((doneCount / lessonIds.size) * 100) : 0;

    const done = track.querySelector<HTMLElement>("[data-track-done]");
    const bar = track.querySelector<HTMLElement>("[data-track-bar]");

    if (done) done.textContent = String(doneCount);
    if (bar) bar.style.width = `${pct}%`;
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
