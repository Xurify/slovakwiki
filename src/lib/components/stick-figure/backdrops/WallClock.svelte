<script lang="ts">
  import type { WallClock } from "$lib/stick-figure/backdrop-parts";
  import ClockHands from "./ClockHands.svelte";

  /** A clock with its hands at `hour`: a rim, a white face, and marks at the quarters on some. */
  let { clock, hour }: { clock: WallClock; hour: number } = $props();

  const { hand, r, ticks, x, y } = $derived(clock);
</script>

<circle cx={x} cy={y} {r} class="fill-scene-edge" />
<circle cx={x} cy={y} r={r * 0.87} class="fill-white" />

{#if ticks}
  <path
    d="M{x} {y - r + 6}v3M{x} {y + r - 9}v3M{x - r + 6} {y}h3M{x + r - 9} {y}h3"
    class="stroke-scene-line/50"
    fill="none"
    stroke-width="1.6"
  />
{/if}

<ClockHands {hour} length={hand} width={2} {x} {y} />
