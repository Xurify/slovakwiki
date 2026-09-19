import { defineFoucSurface, markFoucReady } from "$lib/fouc/gate";

/** Practice index hub FOUC surface. */
export const PRACTICE_FOUC = defineFoucSurface("practice");

/** Practice set player FOUC surface (gate + island ready; no boot IIFE). */
export const PRACTICE_SET_FOUC = defineFoucSurface("practice-set");

export function markPracticeSetReady(): void {
  markFoucReady(PRACTICE_SET_FOUC.readyAttr);
}
