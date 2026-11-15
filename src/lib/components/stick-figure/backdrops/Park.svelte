<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Bench from "./Bench.svelte";
  import Castle from "./Castle.svelte";
  import Cloud from "./Cloud.svelte";
  import FloorShade from "./FloorShade.svelte";
  import StreetLamp from "./StreetLamp.svelte";

  // Looks the same at every hour; it is handed the props every drawing gets.
  let {}: Record<string, unknown> = $props();

  /** The far bank's old town under the castle hill, small with distance; neighbours never share a paint. */
  const TOWN = [
    { x: 300, width: 34, top: 166, paint: "fill-scene-warm" },
    { x: 334, width: 26, top: 160, paint: "fill-scene-clay" },
    { x: 360, width: 40, top: 168, paint: "fill-scene-honey" },
    { x: 400, width: 30, top: 162, paint: "fill-scene-sage" },
    { x: 430, width: 44, top: 170, paint: "fill-scene-warm" },
    { x: 474, width: 28, top: 164, paint: "fill-scene-clay" },
    { x: 522, width: 36, top: 168, paint: "fill-scene-honey" },
    { x: 558, width: 30, top: 160, paint: "fill-scene-sage" },
    { x: 588, width: 40, top: 166, paint: "fill-scene-warm" },
  ];

  /** Plane trees along the promenade: one past each end of a 1280-wide stage, one inside a phone's view. */
  const TREES = [
    { x: 64, r: 44 },
    { x: 250, r: 40 },
    { x: 890, r: 46 },
  ];

  /**
   * The UFO bridge: its pylon with the saucer on top, stays fanning down to the deck. The pylon stands
   * past what a 1280-wide stage shows, so a narrower one sees the deck and stays run in from the edge,
   * never half a saucer.
   */
  const PYLON = { x: 60, top: 98 };
  const DECK = 180;
</script>

<!-- By the Danube, looking across at the old town and Bratislava Castle on its hill. -->
<Cloud x={250} y={58} size={0.9} />
<Cloud x={770} y={40} size={0.6} />
<Cloud x={890} y={58} size={0.8} />

<!-- The castle is drawn before its hill, so the hill hides the foot of the walls. -->
<Castle x={680} y={112} />
<path
  d="M520 192V170Q600 96 680 88Q760 84 880 120Q930 142 970 156V192Z"
  class="fill-scene-sage"
/>
<path d="M640 108Q700 96 760 100L770 112Q700 106 640 116Z" class="fill-scene-leaf/50" />
<!-- Trees along the foot of the hill. -->
{#each Array.from({ length: 33 }, (_, index) => 526 + index * 14) as x, index (x)}
  <circle cx={x} cy={178 - (index % 3) * 2} r={9 + (index % 2) * 2} class="fill-scene-leaf/70" />
{/each}

<!-- St Martin's Cathedral: its spire with the gilded crown, above the roofs of the old town. -->
<rect x="490" y="128" width="22" height="64" class="fill-scene-warm" />
<rect x="508" y="128" width="4" height="64" class="fill-scene-line/8" />
<path d="M488 128L501 76L514 128Z" class="fill-scene-sage" />
<path d="M501 76L514 128H501Z" class="fill-scene-line/10" />
<rect x="497" y="140" width="8" height="14" rx="4" class="fill-scene-line/25" />
<path d="M496 76l2-6 3 4 3-4 2 6Z" class="fill-scene-honey" />
<path d="M486 192V170H520V192Z" class="fill-scene-warm" />
<path d="M484 170L503 156L522 170Z" class="fill-scene-red-mid" />

{#each TOWN as house (house.x)}
  <rect x={house.x} y={house.top} width={house.width} height={192 - house.top} class={house.paint} />
  <path d="M{house.x - 1} {house.top}L{house.x + 5} {house.top - 9}H{house.x + house.width - 5}L{house.x + house.width + 1} {house.top}Z" class="fill-scene-red-mid" />
  {#each Array.from({ length: Math.floor(house.width / 9) }, (_, index) => house.x + 4 + index * 9) as x (x)}
    <rect {x} y={house.top + 5} width="4" height="5" class="fill-scene-line/20" />
    <rect {x} y={house.top + 14} width="4" height="5" class="fill-scene-line/20" />
  {/each}
{/each}

<!-- The bridge: the deck on its piers, the stays, the pylon's two legs and the saucer. -->
<path
  d="M{PYLON.x} {PYLON.top + 8}L{PYLON.x + 60} {DECK}M{PYLON.x} {PYLON.top + 8}L{PYLON.x + 110} {DECK}M{PYLON.x} {PYLON.top + 8}L{PYLON.x + 160} {DECK}M{PYLON.x} {PYLON.top + 8}L{PYLON.x + 210} {DECK}"
  class="stroke-scene-line/30"
  stroke-width="1"
/>
<rect x="-10" y={DECK} width="460" height="6" class="fill-scene-steel-light" />
<rect x="-10" y={DECK + 6} width="460" height="2" class="fill-scene-line/20" />
<path d="M-10 {DECK - 3}H450" class="stroke-scene-line/30" stroke-width="1" />
{#each [100, 300, 440] as x (x)}
  <rect x={x - 3} y={DECK + 8} width="6" height="8" class="fill-scene-steel" />
{/each}
<path d="M{PYLON.x - 18} 194L{PYLON.x - 4} {PYLON.top + 10}H{PYLON.x + 4}L{PYLON.x - 8} 194Z" class="fill-scene-steel" />
<path d="M{PYLON.x + 6} 194L{PYLON.x - 2} {PYLON.top + 10}H{PYLON.x + 6}L{PYLON.x + 16} 194Z" class="fill-scene-steel" />
<ellipse cx={PYLON.x} cy={PYLON.top + 2} rx="22" ry="6" class="fill-scene-steel" />
<path d="M{PYLON.x - 13} {PYLON.top}Q{PYLON.x} {PYLON.top - 12} {PYLON.x + 13} {PYLON.top}Z" class="fill-scene-steel-light" />
<path d="M{PYLON.x - 20} {PYLON.top + 2}H{PYLON.x + 20}" class="stroke-scene-line/30" stroke-width="1.5" />

<!-- Distance pales the far bank. -->
<rect x="-10" y="40" width="980" height="152" class="fill-scene-cool/35" />

<!-- The Danube, a river boat on it, and the light on the water. -->
<rect x="-10" y="190" width="980" height="34" class="fill-portrait-ground" />
<rect x="-10" y="190" width="980" height="3" class="fill-scene-line/10" />
<g transform="translate(616 207) scale(0.8)">
  <path d="M-46 0H46L40 9H-40Z" class="fill-white" />
  <rect x="-40" y="5" width="80" height="2" class="fill-scene-line/40" />
  <rect x="-30" y="-9" width="58" height="9" rx="1.5" class="fill-white" />
  {#each [-26, -18, -10, -2, 6, 14] as x (x)}
    <rect {x} y="-7" width="5" height="4" class="fill-scene-sky" />
  {/each}
  <rect x="-18" y="-15" width="26" height="6" rx="1" class="fill-white" />
  <rect x="-6" y="-20" width="4" height="5" class="fill-scene-red-mid" />
  <path d="M-44 12H44" class="stroke-white/60" stroke-width="1.2" />
</g>
<path
  d="M60 200h30M150 212h44M300 204h36M420 216h28M540 202h40M820 214h36M900 202h30"
  class="stroke-white/70"
  stroke-width="1.5"
/>

<!-- The embankment: a stone wall with a railing along its top. -->
<rect x="-10" y="224" width="980" height="10" class="fill-scene-warm" />
<rect x="-10" y="224" width="980" height="2" class="fill-white/60" />
<path d="M-10 229H970" class="stroke-scene-line/10" stroke-width="1" />
{#each Array.from({ length: 50 }, (_, index) => index * 20 - 10) as x (x)}
  <path d="M{x} 226v3M{x + 10} 229v5" class="stroke-scene-line/10" stroke-width="1" />
{/each}
<rect x="-10" y="232" width="980" height="2" class="fill-scene-line/12" />
<rect x="-10" y="204" width="980" height="2.5" class="fill-scene-line/50" />
<rect x="-10" y="214" width="980" height="1.2" class="fill-scene-line/40" />
{#each Array.from({ length: 41 }, (_, index) => index * 24 - 6) as x (x)}
  <rect {x} y="204" width="2" height="20" class="fill-scene-line/50" />
{/each}

<!-- The lawn along the wall, its bushes and flowers, then the gravel promenade. -->
<rect x="-10" y="234" width="980" height="76" class="fill-scene-sage" />
<FloorShade y={234} />
{#each [{ x: 330, r: 12 }, { x: 452, r: 10 }, { x: 572, r: 13 }, { x: 790, r: 11 }] as bush (bush.x)}
  <circle cx={bush.x - bush.r * 0.8} cy={246 - bush.r * 0.3} r={bush.r * 0.75} class="fill-scene-leaf" />
  <circle cx={bush.x + bush.r * 0.8} cy={246 - bush.r * 0.3} r={bush.r * 0.75} class="fill-scene-leaf" />
  <circle cx={bush.x} cy={246 - bush.r * 0.7} r={bush.r} class="fill-scene-leaf" />
  <circle cx={bush.x - bush.r * 0.3} cy={246 - bush.r * 1.1} r={bush.r * 0.35} class="fill-white/15" />
{/each}
<path
  d="M396 244h3v3h-3ZM408 241h3v3h-3ZM506 245h3v3h-3ZM620 240h3v3h-3ZM672 244h3v3h-3ZM736 241h3v3h-3Z"
  class="fill-scene-red"
/>
<path d="M418 245h3v3h-3ZM498 241h3v3h-3ZM646 243h3v3h-3ZM712 245h3v3h-3Z" class="fill-scene-honey" />

<rect x="-10" y="250" width="980" height="52" class="fill-scene-sand" />
<rect x="-10" y="250" width="980" height="3" class="fill-white/50" />
<rect x="-10" y="253" width="980" height="1.5" class="fill-scene-line/10" />
<path
  d="M40 266h3M130 280h2M220 270h3M330 290h2M410 262h3M520 284h2M610 272h3M700 292h2M800 268h3M880 286h2"
  class="stroke-scene-line/20"
  stroke-width="1.5"
/>
<rect x="-10" y="300" width="980" height="10" class="fill-scene-sage" />
<rect x="-10" y="299" width="980" height="2" class="fill-white/40" />

{#each TREES as tree (tree.x)}
  <ellipse cx={tree.x} cy="246" rx={tree.r * 0.9} ry="4" class="fill-scene-line/12" />
  <path d="M{tree.x - 7} 246L{tree.x - 4} 150H{tree.x + 4}L{tree.x + 7} 246Z" class="fill-scene-wood" />
  <path d="M{tree.x + 1} 246L{tree.x + 2} 150H{tree.x + 4}L{tree.x + 7} 246Z" class="fill-scene-line/12" />
  <!-- A plane tree's bark, flaking in pale patches. -->
  <path d="M{tree.x - 6} 230q4-6 8-2l-1 8q-4 2-7-2ZM{tree.x + 1} 196q4-4 5 0l-1 6q-3 1-4-2ZM{tree.x - 4} 170q3-3 5 1l-2 5q-3 0-3-3ZM{tree.x + 2} 214q3-3 4 1l-1 5q-3 0-3-3Z" class="fill-white/35" />
  <path d="M{tree.x - 2} 176L{tree.x - 24} 150l3-3L{tree.x + 1} 168ZM{tree.x + 2} 166L{tree.x + 22} 140l-3-3L{tree.x - 1} 160Z" class="fill-scene-wood" />
  {#each [{ cx: -0.6, cy: 150, k: 0.5 }, { cx: 0.6, cy: 146, k: 0.52 }, { cx: 0, cy: 154, k: 0.55 }] as blob (blob.cx)}
    <circle cx={tree.x + blob.cx * tree.r} cy={blob.cy} r={tree.r * blob.k} class="fill-scene-leaf" />
    <circle cx={tree.x + blob.cx * tree.r} cy={blob.cy} r={tree.r * blob.k} class="fill-scene-line/15" />
  {/each}
  {#each [{ cx: -0.42, cy: 128, k: 0.56 }, { cx: 0.42, cy: 122, k: 0.58 }, { cx: 0, cy: 108, k: 0.5 }, { cx: -0.8, cy: 140, k: 0.34 }, { cx: 0.82, cy: 136, k: 0.34 }] as blob (blob.cx)}
    <circle cx={tree.x + blob.cx * tree.r} cy={blob.cy} r={tree.r * blob.k} class="fill-scene-leaf" />
  {/each}
  <circle cx={tree.x - tree.r * 0.32} cy="112" r={tree.r * 0.22} class="fill-white/15" />
  <circle cx={tree.x + tree.r * 0.2} cy="100" r={tree.r * 0.16} class="fill-white/15" />
{/each}

<StreetLamp lamp={PARTS.default.lamp} />
<Bench bench={PARTS.default.bench} />

<!-- A litter bin at the bench's end. -->
<ellipse cx="622" cy="266" rx="9" ry="2" class="fill-scene-line/15" />
<rect x="620.5" y="242" width="3" height="24" class="fill-scene-steel-dark" />
<path d="M614 232h16l-1.5 22h-13Z" class="fill-scene-board" />
<rect x="613" y="230" width="18" height="3" rx="1" class="fill-scene-line/50" />
