import { isEditableTarget } from "$lib/learning/exercises";

/**
 * Moves focus to the step that just appeared, so screen readers announce it
 * and number keys reach the question, unless the learner is typing elsewhere.
 */
export function followFocus(el: HTMLElement | null | undefined): void {
  if (!el || isEditableTarget(document.activeElement)) return;
  el.focus({ preventScroll: true });
}
