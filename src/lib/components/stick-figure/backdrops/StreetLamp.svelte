<script lang="ts">
  import type { StreetLamp } from "$lib/stick-figure/backdrop-parts";

  /** A lamp post on the ground at x, its head at the same height on every street. */
  let { lamp }: { lamp: StreetLamp } = $props();

  const { ground, x } = $derived(lamp);
</script>

<ellipse cx={x} cy={ground} rx="12" ry="3" class="fill-scene-line/15" />
<rect x={x - 3} y="96" width="6" height={ground - 97} class="fill-scene-line/60" />
<rect x={x - 8} y={ground - 7} width="16" height="7" rx="2" class="fill-scene-line/60" />
<path d="M{x - 12} 96h24l-4-22h-16Z" class="fill-scene-honey" />
<path d="M{x - 10} 74h20l-10-8Z" class="fill-scene-line/60" />
