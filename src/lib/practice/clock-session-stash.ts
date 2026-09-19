import type { PracticeItem } from "$lib/learning/types";

const CLOCK_SESSION_KEY = "__slovakWikiClockSession";

type ClockSessionHost = typeof globalThis & {
  [CLOCK_SESSION_KEY]?: PracticeItem[];
};

export function stashClockSession(items: PracticeItem[]): void {
  (globalThis as ClockSessionHost)[CLOCK_SESSION_KEY] = items;
}

export function readClockSession(): PracticeItem[] | null {
  const items = (globalThis as ClockSessionHost)[CLOCK_SESSION_KEY];
  return items && items.length > 0 ? items : null;
}

export function hideClockQ1Boot(): void {
  const layer = document.querySelector<HTMLElement>("[data-clock-q1-layer]");
  const boot = document.querySelector<HTMLElement>("[data-clock-q1-boot]");
  const el = layer ?? boot;
  if (!el) return;
  el.hidden = true;
  el.setAttribute("aria-hidden", "true");
  el.setAttribute("inert", "");
}
