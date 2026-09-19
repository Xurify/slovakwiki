import type { PracticeBootItem } from "./boot-payload";
import type { PracticeHubView } from "./hub-view";

function paintFeatured(view: PracticeHubView): void {
  for (const sheet of document.querySelectorAll<HTMLElement>("[data-featured-sheet]")) {
    const setId = sheet.dataset.featuredSheet;
    sheet.hidden = !setId || setId !== view.featuredSetId;
  }

  for (const row of document.querySelectorAll<HTMLElement>("[data-browse-sheet]")) {
    const setId = row.dataset.browseSheet;
    row.hidden = Boolean(setId && setId === view.featuredSetId);
  }

  for (const track of document.querySelectorAll<HTMLElement>("[data-browse-track]")) {
    const rows = [...track.querySelectorAll<HTMLElement>("[data-browse-sheet]")];
    const visible = rows.filter((row) => !row.hidden);
    track.hidden = visible.length === 0;

    const meta = track.querySelector<HTMLElement>("[data-browse-track-meta]");
    if (!meta) continue;

    const exerciseCount = visible.reduce((sum, row) => {
      const raw = row.dataset.exerciseCount;
      const count = raw ? Number(raw) : 0;
      return sum + (Number.isFinite(count) ? count : 0);
    }, 0);

    const setLabel = visible.length === 1 ? "set" : "sets";
    const exerciseLabel = exerciseCount === 1 ? "exercise" : "exercises";
    meta.textContent = `${visible.length} ${setLabel} · ${exerciseCount} ${exerciseLabel}`;
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
  paintRecents(view.recents);
}
