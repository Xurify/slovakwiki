<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  /** `open`: how far the door has swung in, from 0 shut to 1 wide open against the wall. */
  let { hour, open = 0 }: { hour: number; open?: number } = $props();

  /**
   * A point on the door, `u` from its hinge to its free edge and `v` from
   * top to bottom. The free edge swings from the frame's far side round
   * past the hinge toward us, so it grows a little taller as it comes near.
   */
  function on(u: number, v: number): string {
    const edge = 256 - 86 * open;
    const near = 10 * open * u;
    const x = 196 + (edge - 196) * u;
    const y = 46 - near + (180 + 2 * near) * v;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  function quad(u0: number, u1: number, v0: number, v1: number): string {
    return `M${on(u0, v0)}L${on(u1, v0)}L${on(u1, v1)}L${on(u0, v1)}Z`;
  }

  /** The tiles behind the counter, a row of them. */
  const tiles = Array.from({ length: 8 }, (_, index) => 536 + index * 30);
</script>

<!-- Everything sits between x 180 and 780, all a phone's 2:1 stage shows. -->
<Room wall="fill-scene-warm" floor="fill-scene-sand" />

<rect x="190" y="40" width="72" height="186" rx="2" class="fill-portrait-bib" />
{#if open > 0}
  <!-- The dim hall beyond the open door. -->
  <rect x="196" y="46" width="60" height="180" class="fill-scene-line/55" />
{/if}
<path d={quad(0, 1, 0, 1)} class="fill-scene-wood" />
<path
  d="{quad(0.1, 0.9, 0.078, 0.444)}{quad(0.1, 0.9, 0.522, 0.933)}"
  class="fill-scene-line/10"
/>
<path d={quad(0.7, 0.9, 0.5, 0.522)} class="fill-scene-line/70" />

<ellipse cx="308" cy="227" rx="34" ry="3" class="fill-scene-line/12" />
<rect x="280" y="66" width="56" height="160" rx="6" class="fill-white" />
<rect x="280" y="66" width="56" height="160" rx="6" class="fill-scene-line/5" />
<path d="M280 122H336" class="stroke-scene-line/30" stroke-width="1.6" />
<path d="M328 82v26M328 134v36" class="stroke-scene-line/50" stroke-width="3" />
<rect x="292" y="80" width="12" height="9" rx="1.5" class="fill-scene-apple" />
<circle cx="312" cy="92" r="4" class="fill-scene-honey" />

<rect x="352" y="54" width="104" height="80" class="fill-portrait-bib" />
<rect x="360" y="62" width="88" height="64" class="fill-scene-sky" />
<path d="M360 126V108Q380 96 404 104Q426 94 448 104V126Z" class="fill-scene-sage" />
<path d="M402 62h4v64h-4Z" class="fill-portrait-bib" />
<rect x="346" y="132" width="116" height="6" rx="2" class="fill-portrait-bib" />

<WallClock clock={PARTS.kitchen.clock} {hour} />

<!-- The tiled wall the counter and stove stand against; they are the set's, drawn at the cast's scale (StickSet.svelte). -->
{#each tiles as x (x)}
  {#each [110, 140, 170, 200] as y (y)}
    <rect x={x + 1} {y} width="28" height="28" class="fill-scene-cool" />
  {/each}
{/each}
<rect x="560" y="40" width="214" height="58" rx="3" class="fill-scene-wood" />
<path d="M631 40V98M702 40V98" class="stroke-scene-line/25" stroke-width="1.6" />
<path
  d="M620 64v12M642 64v12M713 64v12"
  class="stroke-scene-line/50"
  stroke-width="2.4"
/>
