<script lang="ts">
  import type { Tree } from "$lib/stick-figure/backdrop-parts";

  /** A town tree: a round crown over its trunk, standing in the street or in a planter. */
  let { tree }: { tree: Tree } = $props();

  const { ground, planter, x } = $derived(tree);
</script>

<ellipse cx={x} cy={ground} rx="34" ry="4" class="fill-scene-line/12" />
<rect
  x={x - 5}
  y="160"
  width="10"
  height={(planter ? ground - 18 : ground) - 160}
  class="fill-scene-wood"
/>
<circle cx={x - 20} cy="160" r="24" class="fill-scene-leaf" />
<circle cx={x + 24} cy="156" r="26" class="fill-scene-leaf" />
<circle cx={x} cy="132" r="32" class="fill-scene-leaf" />
<circle cx={x - 10} cy="124" r="14" class="fill-white/15" />

{#if planter}
  <path d="M{x - 24} {ground - 28}h48l-4 28h-40Z" class="fill-scene-clay" />
  <rect x={x - 26} y={ground - 32} width="52" height="7" rx="2" class="fill-scene-clay" />
{/if}
