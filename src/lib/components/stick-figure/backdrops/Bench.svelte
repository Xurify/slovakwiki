<script lang="ts">
  import { BENCH, type Bench } from "$lib/stick-figure/backdrop-parts";
  import { n } from "$lib/stick-figure/draw";

  /** A park bench: wooden slats on cast-iron ends, drawn at the square's size and scaled to its width. */
  let { bench }: { bench: Bench } = $props();

  const { ground, width, x } = $derived(bench);
</script>

<g transform="translate({x} {ground}) scale({n(width / BENCH.width)})">
  <ellipse cx="56" cy="0" rx="60" ry="4" class="fill-scene-line/12" />
  <!-- The back slats, the seat's three, and the shade under the seat. -->
  {#each [-51, -45, -39] as y (y)}
    <rect x="4" {y} width="104" height="4.5" rx="1" class="fill-scene-wood" />
  {/each}
  <rect x="6" y="-35" width="100" height="5" class="fill-scene-line/10" />
  <rect x="0" y="-30" width="112" height="4" rx="1" class="fill-scene-wood" />
  <rect x="0" y="-26" width="112" height="3.5" class="fill-scene-wood" />
  <rect x="0" y="-26" width="112" height="3.5" class="fill-scene-line/12" />
  <!-- The iron ends: a back upright, an armrest, a leg with a curled foot. -->
  {#each [9, 103] as end (end)}
    <rect x={end - 1.5} y="-53" width="3" height="27" class="fill-scene-line/70" />
    <rect x={end - 6} y="-37" width="12" height="3" rx="1.5" class="fill-scene-line/70" />
    <path
      d="M{end - 2} -34h4l1 32h3v2h-11v-2h3Z"
      class="fill-scene-line/70"
    />
  {/each}
</g>
