<script lang="ts">
  import { onMount } from "svelte";
  import { leashPath } from "$lib/stick-figure/leash";

  /**
   * A lead from the hand holding it to the dog's collar, `length` px long.
   * Both ends are read off the drawn figures every frame, so the lead stays
   * on them through a walk, a turn or a wave of the arm.
   */
  let { length }: { length: number } = $props();

  let svg: SVGSVGElement;
  let path = $state("");

  onMount(() => {
    let frame = requestAnimationFrame(function follow() {
      const stage = svg.parentElement;
      const hand = stage?.querySelector('[data-leash-end="hand"]');
      const collar = stage?.querySelector('[data-leash-end="collar"]');
      if (stage && hand && collar) {
        const box = svg.getBoundingClientRect();
        const centre = (end: Element) => {
          const at = end.getBoundingClientRect();
          return {
            x: at.left + at.width / 2 - box.left,
            y: at.top + at.height / 2 - box.top,
          };
        };
        path = leashPath(centre(hand), centre(collar), length);
      } else {
        path = "";
      }
      frame = requestAnimationFrame(follow);
    });
    return () => cancelAnimationFrame(frame);
  });
</script>

<svg
  bind:this={svg}
  class="pointer-events-none absolute inset-0 size-full overflow-visible"
  fill="none"
  stroke-linecap="round"
  aria-hidden="true"
>
  {#if path}
    <path d={path} class="stroke-portrait-ink" stroke-width="2.4" />
    <path d={path} class="stroke-scene-red" stroke-width="1.2" />
  {/if}
</svg>
