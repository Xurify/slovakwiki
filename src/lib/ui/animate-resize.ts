/**
 * Eases a change in an element's natural height (a caption swapping to a longer or
 * shorter line, or an English line toggling on) instead of letting it snap. Svelte's
 * `transition:` runs only on mount and destroy, so it never sees these changes.
 *
 * Skipped under `prefers-reduced-motion: reduce`, as in `StickWeather.svelte`'s
 * `reducedMotion()`.
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
