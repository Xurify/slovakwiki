<script lang="ts">
  import { BENCH, type Bench } from "$lib/stick-figure/backdrop-parts";
  import { n } from "$lib/stick-figure/draw";

  /** A wooden bench with a back, drawn at the square's size and scaled to its width. */
  let { bench }: { bench: Bench } = $props();

  const { ground, width, x } = $derived(bench);
</script>

<g transform="translate({x} {ground}) scale({n(width / BENCH.width)})">
  <ellipse cx="56" cy="0" rx="62" ry="4" class="fill-scene-line/12" />
  <path d="M8 -51h4v50h-4ZM100 -51h4v50h-4Z" class="fill-scene-wood" />
  <rect x="0" y="-31" width="112" height="8" rx="2" class="fill-scene-wood" />
  <rect x="4" y="-51" width="104" height="8" rx="2" class="fill-scene-wood" />
  <rect x="0" y="-23" width="112" height="3" class="fill-scene-line/12" />
</g>
