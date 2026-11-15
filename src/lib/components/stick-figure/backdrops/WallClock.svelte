<script lang="ts">
  import type { WallClock } from "$lib/stick-figure/backdrop-parts";
  import ClockHands from "./ClockHands.svelte";

  /** A clock with its hands at `hour`: a rim, a white face, and marks at the quarters on some. */
  let { clock, hour }: { clock: WallClock; hour: number } = $props();

  const { hand, numerals, r, ticks, x, y } = $derived(clock);
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

{#if numerals}
  {#each Array.from({ length: 12 }, (_, index) => (index * Math.PI) / 6) as angle (angle)}
    <path
      d="M{x + Math.sin(angle) * r * 0.8} {y - Math.cos(angle) * r * 0.8}L{x + Math.sin(angle) * r * 0.72} {y - Math.cos(angle) * r * 0.72}"
      class="stroke-scene-line/60"
      stroke-width="1"
    />
  {/each}
  {#each [[12, 0, -1], [3, 1, 0], [6, 0, 1], [9, -1, 0]] as [label, dx, dy] (label)}
    <text
      x={x + dx * r * 0.52}
      y={y + dy * r * 0.52 + 2.2}
      text-anchor="middle"
      font-size={r * 0.3}
      font-weight="700"
      class="fill-scene-line/70 font-sans"
    >
      {label}
    </text>
  {/each}
{/if}

<ClockHands {hour} length={hand} width={2} {x} {y} />
