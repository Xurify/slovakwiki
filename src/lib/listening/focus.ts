import { isEditableTarget } from "$lib/learning/exercises";

export function focusUnlessTyping(el: HTMLElement | null | undefined): void {
  if (!el || isEditableTarget(document.activeElement)) return;
  el.focus({ preventScroll: true });
}
