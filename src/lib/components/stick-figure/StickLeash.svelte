<script lang="ts">
  import { n } from "$lib/stick-figure/draw";
  import type { LeashSpan } from "$lib/stick-figure/leash";

  /** A lead between a walker's hand and a dog's collar, moving with them over `ms`. */
  let { ms = 0, span }: { ms?: number; span: LeashSpan } = $props();

  /** A slack lead dips below its lower end, more the further apart they are. */
  const sag = $derived(Math.min(18, span.width * 0.18));
  const height = $derived(span.height + sag);
  const path = $derived.by(() => {
    const [from, to] = span.flip ? [span.collar, span.hand] : [span.hand, span.collar];
    const y = (up: number) => n(span.height - up);
    return `M0 ${y(from)}Q${n(span.width / 2)} ${n(height + sag)} ${n(span.width)} ${y(to)}`;
  });
</script>

<div
  class="pointer-events-none absolute transition-all ease-linear"
  style:left="{span.left}px"
  style:top="{span.top}px"
  style:width="{span.width}px"
  style:height="{height}px"
  style:transition-duration="{ms}ms"
>
  <svg
    class="block size-full overflow-visible"
    viewBox="0 0 {n(span.width)} {n(height)}"
    preserveAspectRatio="none"
    fill="none"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <path
      d={path}
      class="stroke-portrait-ink"
      stroke-width="2.4"
      vector-effect="non-scaling-stroke"
    />
    <path
      d={path}
      class="stroke-scene-red"
      stroke-width="1.2"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</div>
