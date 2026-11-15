<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Bench from "./Bench.svelte";
  import Cloud from "./Cloud.svelte";
  import Cobbles from "./Cobbles.svelte";
  import Facades, { type Facade } from "./Facades.svelte";
  import FloorShade from "./FloorShade.svelte";
  import StreetLamp from "./StreetLamp.svelte";
  import Tree from "./Tree.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  /**
   * Burgher houses round the square, left to right; neighbours never share a
   * paint, as nothing outlines them. The shops' signs sit inside what a phone
   * shows (x 180 to 780), so none is cut in half.
   */
  const houses: Facade[] = [
    { x: -10, width: 124, top: 98, gable: true, door: true, flowers: true, paint: "fill-scene-clay" },
    { x: 114, width: 136, top: 112, gable: false, door: true, paint: "fill-scene-sage" },
    { x: 316, width: 150, top: 120, gable: false, door: true, shop: "Lekáreň", paint: "fill-scene-warm" },
    { x: 466, width: 120, top: 100, gable: true, door: true, flowers: true, paint: "fill-scene-clay" },
    {
      x: 586,
      width: 124,
      top: 112,
      gable: false,
      door: false,
      shop: "Kaviareň",
      awning: "fill-scene-red-mid",
      paint: "fill-scene-honey",
    },
    { x: 710, width: 112, top: 96, gable: true, door: true, paint: "fill-scene-sage" },
    { x: 822, width: 148, top: 114, gable: false, door: false, shop: "Cukráreň", awning: "fill-scene-sage", paint: "fill-scene-warm" },
  ];

  /** Roland's fountain stands out on the square, its basin's front edge at `ground`. */
  const FOUNTAIN = { x: 690, ground: 248 };
  const quoins = [112, 128, 144, 160, 176, 192, 208];
</script>

<Cloud x={560} y={60} />
<Cloud x={860} y={64} size={0.7} />
<Cloud x={110} y={56} size={0.8} />

<Facades {houses} />

<!-- Michael's Gate: the old-town gate tower, its copper onion roof and St Michael on the spire. -->
<rect x="250" y="104" width="66" height="122" class="fill-portrait-bib" />
<rect x="312" y="104" width="4" height="122" class="fill-scene-line/6" />
{#each quoins as y, index (y)}
  <rect x={250} {y} width={index % 2 ? 6 : 10} height="7" class="fill-scene-line/8" />
  <rect x={index % 2 ? 306 : 310} {y} width={index % 2 ? 10 : 6} height="7" class="fill-scene-line/8" />
{/each}
<rect x="248" y="150" width="70" height="4" class="fill-scene-line/10" />
<rect x="246" y="100" width="74" height="6" class="fill-white" />
<rect x="246" y="105" width="74" height="2" class="fill-scene-line/12" />
<rect x="262" y="158" width="6" height="14" rx="3" class="fill-scene-line/25" />
<rect x="298" y="158" width="6" height="14" rx="3" class="fill-scene-line/25" />
<!-- The gate passage, darker in its depth, and its stone surround. -->
<path d="M266 226V196A17 17 0 0 1 300 196V226Z" class="fill-white" />
<path d="M270 226V197A13 13 0 0 1 296 197V226Z" class="fill-scene-line/45" />
<path d="M277 226V204A6 6 0 0 1 289 204V226Z" class="fill-scene-sand/70" />
<!-- The belfry: arched openings above a gallery, under the roof. -->
<rect x="258" y="70" width="50" height="30" class="fill-portrait-bib" />
<rect x="304" y="70" width="4" height="30" class="fill-scene-line/6" />
{#each [266, 280, 294] as x (x)}
  <path d="M{x} 92V80a3 3 0 0 1 6 0V92Z" class="fill-scene-line/35" />
{/each}
<rect x="254" y="96" width="58" height="3" class="fill-scene-line/45" />
{#each [256, 263, 270, 277, 284, 291, 298, 305] as x (x)}
  <rect x={x} y="91" width="1.6" height="6" class="fill-scene-line/45" />
{/each}
<rect x="254" y="90" width="58" height="2" class="fill-scene-line/45" />
<rect x="255" y="67" width="56" height="4" class="fill-white" />
<path d="M256 67Q256 50 283 46Q310 50 310 67Z" class="fill-scene-sage" />
<path d="M283 46Q310 50 310 67H283Z" class="fill-scene-line/10" />
<rect x="276" y="38" width="14" height="9" class="fill-scene-sage" />
<rect x="279" y="40" width="3" height="5" class="fill-scene-line/25" />
<rect x="284" y="40" width="3" height="5" class="fill-scene-line/25" />
<path d="M273 39Q273 30 283 26Q293 30 293 39Z" class="fill-scene-sage" />
<path d="M283 26Q293 30 293 39H283Z" class="fill-scene-line/10" />
<path d="M282.2 26V12h1.6V26Z" class="fill-scene-line/50" />
<circle cx="283" cy="19" r="2.2" class="fill-scene-honey" />
<path d="M283 12l-2.5-4h5Z" class="fill-scene-honey" />
<WallClock clock={PARTS.plaza.clock} {hour} />

<!-- The square: a pavement of slabs along the houses, then cobbles. -->
<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<rect x="-10" y="226" width="980" height="6" class="fill-white/30" />
<path d="M-10 232H970" class="stroke-scene-line/15" stroke-width="1" />
<Cobbles from={236} />
<FloorShade />

<StreetLamp lamp={PARTS.plaza.lamp} />

<!-- Roland's fountain: an octagonal stone basin, a bowl on a column, the knight on top. -->
<g transform="translate({FOUNTAIN.x} {FOUNTAIN.ground})">
  <ellipse cx="0" cy="1" rx="64" ry="5" class="fill-scene-line/15" />
  <ellipse cx="0" cy="-22" rx="60" ry="8" class="fill-scene-warm" />
  <ellipse cx="0" cy="-22" rx="55" ry="5.5" class="fill-scene-water/40" />
  <path d="M-10 -22V-90h20V-22Z" class="fill-scene-warm" />
  <path d="M4 -22V-90h6V-22Z" class="fill-scene-line/10" />
  <rect x="-14" y="-38" width="28" height="12" rx="1" class="fill-scene-warm" />
  <rect x="-14" y="-38" width="28" height="3" class="fill-white/60" />
  <path d="M-6 -34a3 3 0 0 1 6 0M0 -34a3 3 0 0 1 6 0" class="stroke-scene-line/25" fill="none" stroke-width="1" />
  <!-- Water from the bowl's rim into the basin. -->
  <path
    d="M-24 -66C-34 -60 -38 -44 -40 -24M24 -66C34 -60 38 -44 40 -24M-16 -62C-22 -54 -24 -40 -25 -24M16 -62C22 -54 24 -40 25 -24"
    class="stroke-scene-water/45"
    fill="none"
    stroke-width="1.4"
  />
  <path d="M-26 -68H26Q20 -57 0 -55Q-20 -57 -26 -68Z" class="fill-scene-warm" />
  <path d="M0 -55Q20 -57 26 -68H8Z" class="fill-scene-line/10" />
  <rect x="-27" y="-70" width="54" height="3.5" rx="1.5" class="fill-white" />
  <rect x="-8" y="-96" width="16" height="6" rx="1" class="fill-white" />
  <!-- The knight in armour, shield on his arm and a lance in his hand. -->
  <path d="M-5 -96l1-12h-1l1-9h8l1 9h-1l1 12h-3l-1-8h-2l-1 8Z" class="fill-scene-edge" />
  <circle cx="0" cy="-120" r="3.4" class="fill-scene-edge" />
  <path d="M-3 -123h6l-1-2.5h-4Z" class="fill-scene-line/40" />
  <ellipse cx="-7" cy="-108" rx="3.5" ry="5" class="fill-scene-line/35" />
  <path d="M6 -94V-132" class="stroke-scene-line/45" stroke-width="1.4" />
  <path d="M6 -132l-1.5 4h3Z" class="fill-scene-line/45" />
  <!-- The basin's front: eight stone panels and a moulded rim. -->
  <path d="M-58 -22V-4Q0 3 58 -4V-22Z" class="fill-scene-warm" />
  <path d="M-58 -22V-4Q-50 -3 -40 -2V-22Z" class="fill-scene-line/12" />
  <path d="M40 -22V-2Q50 -3 58 -4V-22Z" class="fill-scene-line/8" />
  <path d="M-40 -20V-2M-14 -19V0M14 -19V0M40 -20V-2" class="stroke-scene-line/15" stroke-width="1" />
  <path d="M-61 -24Q0 -16 61 -24V-19Q0 -11 -61 -19Z" class="fill-white" />
  <path d="M-58 -18Q0 -10 58 -18" class="stroke-scene-line/12" fill="none" stroke-width="1.5" />
</g>

<Bench bench={PARTS.plaza.bench} />
<Tree tree={PARTS.plaza.tree} />
