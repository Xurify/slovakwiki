<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  /** `open`: the door swung in, someone in the doorway. */
  let { hour, open = false }: { hour: number; open?: boolean } = $props();

  /** The tiles behind the counter, a row of them. */
  const tiles = Array.from({ length: 8 }, (_, index) => 536 + index * 30);
</script>

<!-- Everything sits between x 180 and 780, all a phone's 2:1 stage shows. -->
<Room wall="fill-scene-warm" floor="fill-scene-sand" />

<rect x="190" y="40" width="72" height="186" rx="2" class="fill-portrait-bib" />
{#if open}
  <!-- The dim hall beyond, and the door swung in on its hinge, its far edge toward us. -->
  <rect x="196" y="46" width="60" height="180" class="fill-scene-line/55" />
  <path d="M196 46L256 46L256 226L196 226Z" class="fill-scene-line/20" />
  <path d="M196 46L170 36V236L196 226Z" class="fill-scene-wood" />
  <path
    d="M192 62L176 56V128L192 130ZM192 142L176 142V222L192 216Z"
    class="fill-scene-line/10"
  />
  <rect x="172" y="134" width="4" height="10" rx="1.5" class="fill-scene-line/70" />
{:else}
  <rect x="196" y="46" width="60" height="180" class="fill-scene-wood" />
  <rect x="202" y="60" width="48" height="66" rx="2" class="fill-scene-line/10" />
  <rect x="202" y="140" width="48" height="74" rx="2" class="fill-scene-line/10" />
  <rect x="238" y="136" width="12" height="4" rx="2" class="fill-scene-line/70" />
{/if}

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
