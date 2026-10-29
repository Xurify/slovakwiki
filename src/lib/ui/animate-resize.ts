/**
 * Smooths a jump in an element's natural height (its content changed, not a
 * `transition:` mount/unmount) into a short animation, instead of the box
 * snapping straight to its new size. A caption swapping to a longer or
 * shorter line, or an English line toggling on, is a content change like
 * this, not a mount: Svelte's own `transition:` directives only run on
 * mount/destroy, so they never see it.
 *
 * Skipped under `prefers-reduced-motion: reduce`, per this repo's motion
 * convention (see `StickWeather.svelte`'s local `reducedMotion()`).
 */
export function animateResize(node: HTMLElement): { destroy(): void } {
  let previousHeight = node.getBoundingClientRect().height;

  const observer = new ResizeObserver(() => {
    const from = previousHeight;
    const next = node.getBoundingClientRect().height;
    previousHeight = next;
    if (Math.abs(next - from) < 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    node.animate([{ height: `${from}px` }, { height: `${next}px` }], {
      duration: 200,
      easing: "ease-out",
    });
  });

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
}
