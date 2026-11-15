<script lang="ts">
  import type { Tree } from "$lib/stick-figure/backdrop-parts";

  /** A town tree: a leafy crown over its trunk, standing in a grate in the paving or in a planter. */
  let { tree }: { tree: Tree } = $props();

  const { ground, planter, x } = $derived(tree);
  const foot = $derived(planter ? ground - 26 : ground);
</script>

<ellipse cx={x} cy={ground} rx="34" ry="4" class="fill-scene-line/12" />
<path d="M{x - 6} {foot}L{x - 4} 150H{x + 4}L{x + 6} {foot}Z" class="fill-scene-wood" />
<path d="M{x + 1} {foot}L{x + 2.5} 150H{x + 4}L{x + 6} {foot}Z" class="fill-scene-line/12" />
<path
  d="M{x - 2} 168L{x - 20} 148l3-2L{x + 1} 162ZM{x + 2} 160L{x + 18} 142l-3-2L{x - 1} 156Z"
  class="fill-scene-wood"
/>
<!-- The crown: a shaded back layer, the lit front, a few highlights. -->
{#each [{ cx: -26, cy: 152, r: 20 }, { cx: 28, cy: 148, r: 20 }, { cx: 0, cy: 156, r: 22 }] as { cx, cy, r } (cx)}
  <circle cx={x + cx} cy={cy} {r} class="fill-scene-leaf" />
  <circle cx={x + cx} cy={cy} {r} class="fill-scene-line/15" />
{/each}
{#each [{ cx: -18, cy: 136, r: 24 }, { cx: 18, cy: 130, r: 25 }, { cx: 0, cy: 120, r: 20 }, { cx: -32, cy: 146, r: 14 }, { cx: 33, cy: 144, r: 14 }] as { cx, cy, r } (cx)}
  <circle cx={x + cx} cy={cy} {r} class="fill-scene-leaf" />
{/each}
<circle cx={x - 14} cy="124" r="9" class="fill-white/15" />
<circle cx={x + 10} cy="114" r="7" class="fill-white/15" />
<circle cx={x + 26} cy="134" r="6" class="fill-white/10" />

{#if planter}
  <path d="M{x - 24} {ground - 26}h48l-4 26h-40Z" class="fill-scene-clay" />
  <path d="M{x + 6} {ground - 26}h18l-4 26h-14Z" class="fill-scene-line/10" />
  <rect x={x - 27} y={ground - 31} width="54" height="7" rx="2" class="fill-scene-clay" />
  <rect x={x - 27} y={ground - 25} width="54" height="2" class="fill-scene-line/12" />
{:else}
  <rect x={x - 16} y={ground - 2} width="32" height="3" rx="1" class="fill-scene-line/30" />
{/if}
