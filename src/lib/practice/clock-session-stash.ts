import type { PracticeItem } from "$lib/learning/types";

const CLOCK_SESSION_KEY = "__slovakWikiClockSession";

type ClockSessionHost = typeof globalThis & {
  [CLOCK_SESSION_KEY]?: PracticeItem[];
};

export function stashClockSession(items: PracticeItem[]): void {
  (globalThis as ClockSessionHost)[CLOCK_SESSION_KEY] = items;
}

export function readClockSession(): PracticeItem[] | null {
  const host = globalThis as ClockSessionHost;
  const items = host[CLOCK_SESSION_KEY];
  if (items && items.length > 0) {
    delete host[CLOCK_SESSION_KEY];
    return items;
  }
  return null;
}

export function hideClockQ1Boot(): void {
  const elements = document.querySelectorAll<HTMLElement>(
    "[data-clock-q1-layer], [data-clock-q1-boot]",
  );
  for (const element of elements) {
    element.hidden = true;
    element.setAttribute("aria-hidden", "true");
    element.setAttribute("inert", "");
  }
}
