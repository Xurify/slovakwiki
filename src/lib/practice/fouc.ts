import { defineFoucSurface, markFoucReady } from "$lib/fouc/gate";

/** Practice index hub FOUC surface. */
export const PRACTICE_FOUC = defineFoucSurface("practice");

/** Practice set player FOUC surface (gate + early ready; island marks leftover). */
export const PRACTICE_SET_FOUC = defineFoucSurface("practice-set");

export function markPracticeSetReady(): void {
  markFoucReady(PRACTICE_SET_FOUC.readyAttr);
}

/**
 * Blocking snippet: unhide default SSR player before the island.
 * Stay hidden for RNG sets, `?at`, and `hint=rail` (prerender HTML cannot know those).
 */
export function practiceSetEarlyReadyScript(deferReveal: boolean): string {
  const readyAttr = PRACTICE_SET_FOUC.readyAttr;
  const skipSet = deferReveal ? "true" : "false";
  return `(function(){if(${skipSet})return;var p=new URLSearchParams(location.search);if(p.has("at")||p.get("hint")==="rail")return;document.documentElement.setAttribute("data-${readyAttr}","1");})();`;
}
