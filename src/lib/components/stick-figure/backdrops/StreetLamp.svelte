<script lang="ts">
  import type { StreetLamp } from "$lib/stick-figure/backdrop-parts";

  /** An old-town lamp post on the ground at x: a cast-iron foot, a tapering post and a lantern, its head at the same height on every street. */
  let { lamp }: { lamp: StreetLamp } = $props();

  const { ground, x } = $derived(lamp);
</script>

<ellipse cx={x} cy={ground} rx="14" ry="3" class="fill-scene-line/15" />
<rect x={x - 9} y={ground - 6} width="18" height="6" rx="1.5" class="fill-scene-line/70" />
<path
  d="M{x - 7} {ground - 6}C{x - 7} {ground - 18} {x - 3.5} {ground - 22} {x - 3.5} {ground - 32}H{x + 3.5}C{x + 3.5} {ground - 22} {x + 7} {ground - 18} {x + 7} {ground - 6}Z"
  class="fill-scene-line/70"
/>
<rect x={x - 5} y={ground - 36} width="10" height="4" rx="1" class="fill-scene-line/70" />
<path d="M{x - 3} {ground - 36}L{x - 2} 100H{x + 2}L{x + 3} {ground - 36}Z" class="fill-scene-line/70" />
<rect x={x - 1} y="102" width="1.5" height={ground - 140} class="fill-white/15" />
<rect x={x - 4.5} y="97" width="9" height="4" rx="1" class="fill-scene-line/70" />
<!-- The lantern: four panes of glass between a tray and a pointed cap. -->
<rect x={x - 9} y="93" width="18" height="4" rx="1" class="fill-scene-line/70" />
<path d="M{x - 8} 93L{x - 11} 74H{x + 11}L{x + 8} 93Z" class="fill-scene-honey" />
<path d="M{x} 74V93M{x - 9.5} 83H{x + 9.5}" class="stroke-scene-line/45" stroke-width="1" />
<path d="M{x + 2} 74H{x + 11}L{x + 8} 93H{x + 2}Z" class="fill-scene-line/10" />
<path d="M{x - 14} 75L{x} 64L{x + 14} 75Z" class="fill-scene-line/70" />
<circle cx={x} cy="62.5" r="2.2" class="fill-scene-line/70" />
