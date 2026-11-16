<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Bench from "./Bench.svelte";
  import Castle from "./Castle.svelte";
  import Cloud from "./Cloud.svelte";
  import Cobbles from "./Cobbles.svelte";
  import FloorShade from "./FloorShade.svelte";
  import StreetLamp from "./StreetLamp.svelte";

  // Looks the same at every hour; it is handed the props every drawing gets.
  let {}: Record<string, unknown> = $props();

  /** The far bank's old town under the castle hill, small with distance; neighbours never share a paint. */
  const TOWN = [
    { x: -10, width: 40, top: 166, paint: "fill-scene-sage" },
    { x: 30, width: 34, top: 160, paint: "fill-scene-warm" },
    { x: 64, width: 44, top: 168, paint: "fill-scene-clay" },
    { x: 108, width: 30, top: 162, paint: "fill-scene-honey" },
    { x: 138, width: 42, top: 166, paint: "fill-scene-sage" },
    { x: 180, width: 30, top: 158, paint: "fill-scene-warm" },
    { x: 210, width: 40, top: 168, paint: "fill-scene-clay" },
    { x: 250, width: 50, top: 162, paint: "fill-scene-honey" },
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

  /** The far bank is lifted this much, so the Danube between the banks reads as the wide river it is. */
  const FAR = -18;
  /** Lamps along the promenade: the place's lamp, and one more past the bench. */
  const LAMPS = [PARTS.default.lamp, { ground: PARTS.default.lamp.ground, x: 752 }];
</script>

<!-- By the Danube, looking across at the old town and Bratislava Castle on its hill. -->
<Cloud x={250} y={58} size={0.9} />
<Cloud x={770} y={40} size={0.6} />
<Cloud x={890} y={58} size={0.8} />

<g transform="translate(0 {FAR})">
<!-- The castle is drawn before its hill, so the hill hides the foot of the walls. -->
<Castle x={680} y={112} />
<path
  d="M520 192V170Q600 96 680 88Q760 84 880 120Q930 142 970 156V192Z"
  class="fill-portrait-ground-sage"
/>
<path
  d="M520 192V170Q600 96 680 88Q760 84 880 120Q930 142 970 156V192Z"
  class="fill-scene-leaf/25"
/>
<!-- Trees along the foot of the hill. -->
{#each Array.from({ length: 33 }, (_, index) => 526 + index * 14) as x, index (x)}
  <circle cx={x} cy={178 - (index % 3) * 2} r={9 + (index % 2) * 2} class="fill-scene-leaf/90" />
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

<!-- The far bank's quay along the water. -->
<rect x="-10" y="190" width="980" height="5" class="fill-scene-warm" />
<rect x="-10" y="190" width="980" height="1.5" class="fill-white/60" />
</g>

<!-- Distance pales the far bank. -->
<rect x="-10" y="40" width="980" height="138" class="fill-scene-cool/10" />

<!-- The Danube, a river boat on it, and the light on the water. -->
<rect x="-10" y="177" width="980" height="47" class="fill-portrait-ground" />
<rect x="-10" y="177" width="980" height="47" class="fill-scene-water/30" />
<rect x="-10" y="177" width="980" height="3" class="fill-scene-line/12" />
<g transform="translate(616 188) scale(0.8)">
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
  d="M60 190h30M150 200h44M300 186h36M420 196h28M540 188h40M820 194h36M900 186h30M200 184h20M720 202h30"
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
<!-- Flower beds in the lawn: red and yellow tulips in dark soil. -->
{#each [{ x: 404, width: 44 }, { x: 884, width: 56 }] as bed (bed.x)}
  <ellipse cx={bed.x} cy="243" rx={bed.width / 2} ry="4.5" class="fill-scene-coffee/45" />
  {#each Array.from({ length: Math.floor(bed.width / 5) }, (_, index) => bed.x - bed.width / 2 + 4 + index * 5) as x, index (x)}
    <path d="M{x} 243v-4" class="stroke-scene-leaf" stroke-width="1.2" />
    <circle cx={x} cy={238.5 - (index % 2)} r="2" class={index % 3 === 1 ? "fill-scene-honey" : "fill-scene-red"} />
  {/each}
{/each}

<rect x="-10" y="250" width="980" height="52" class="fill-scene-sand" />
<rect x="-10" y="250" width="980" height="3" class="fill-white/50" />
<rect x="-10" y="253" width="980" height="1.5" class="fill-scene-line/10" />
<Cobbles from={256} to={300} />
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

{#each LAMPS as lamp (lamp.x)}
  <StreetLamp {lamp} />
{/each}
<Bench bench={PARTS.default.bench} />

<!-- A litter bin at the bench's end, on its post. -->
<ellipse cx="600" cy="265" rx="9" ry="2.2" class="fill-scene-line/20" />
<rect x="595" y="262" width="10" height="3" rx="1" class="fill-scene-steel-dark" />
<rect x="598.5" y="244" width="3" height="19" class="fill-scene-steel-dark" />
<path d="M592 232h16l-1.5 20h-13Z" class="fill-scene-board" />
<rect x="591" y="230" width="18" height="3" rx="1" class="fill-scene-line/50" />
