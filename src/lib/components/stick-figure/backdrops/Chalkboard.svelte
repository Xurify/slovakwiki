<script lang="ts">
  import type { Snippet } from "svelte";

  /** A framed chalkboard; `children` write on it with 0,0 at its top left. */
  let {
    children,
    height,
    width,
    x,
    y,
  }: { children: Snippet; height: number; width: number; x: number; y: number } =
    $props();
</script>

<g transform="translate({x} {y})">
  <rect
    x="-4"
    y="-2"
    width={width + 12}
    height={height + 12}
    rx="5"
    class="fill-scene-line/10"
  />
  <rect
    x="-6"
    y="-6"
    width={width + 12}
    height={height + 12}
    rx="5"
    class="fill-scene-wood"
  />
  <rect {width} {height} rx="2" class="fill-scene-board" />
  <!-- earlier chalk, half wiped off -->
  <ellipse
    cx={width * 0.3}
    cy={height * 0.72}
    rx={width * 0.24}
    ry={height * 0.12}
    class="fill-portrait-bib/5"
  />
  <ellipse
    cx={width * 0.74}
    cy={height * 0.28}
    rx={width * 0.18}
    ry={height * 0.1}
    class="fill-portrait-bib/5"
  />
  <g class="fill-portrait-bib/90 font-hand" font-weight="600">
    {@render children()}
  </g>
</g>
