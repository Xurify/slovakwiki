<script lang="ts">
  /** Where the floor meets the wall, and whether to draw seams in perspective. */
  let { seams = false, y = 226 }: { seams?: boolean; y?: number } = $props();

  const id = $props.id();
  const starts = Array.from({ length: 17 }, (_, index) => -160 + index * 80);
</script>

<defs>
  <linearGradient
    id="{id}-shade"
    class="text-scene-line"
    x1="0"
    y1={y}
    x2="0"
    y2={y + 36}
    gradientUnits="userSpaceOnUse"
  >
    <stop offset="0" stop-color="currentColor" stop-opacity="0.22" />
    <stop offset="1" stop-color="currentColor" stop-opacity="0" />
  </linearGradient>
</defs>

{#if seams}
  {#each starts as x (x)}
    <path d="M{x} {y}L{480 + (x - 480) * 1.9} 310" class="stroke-scene-edge/40" />
  {/each}
{/if}
<rect x="-10" {y} width="980" height="36" fill="url(#{id}-shade)" stroke="none" />
