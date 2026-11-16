<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Bench from "./Bench.svelte";
  import Cloud from "./Cloud.svelte";
  import Cobbles from "./Cobbles.svelte";
  import Facades, { type Facade } from "./Facades.svelte";
  import FloorShade from "./FloorShade.svelte";
  import StreetLamp from "./StreetLamp.svelte";
  import Tree from "./Tree.svelte";

  let { hour }: { hour: number } = $props();

  /**
   * Burgher houses round the square, left to right; neighbours never share a
   * paint, as nothing outlines them. The shops' signs sit inside what a phone
   * shows (x 180 to 780), so none is cut in half.
   */
  const houses: Facade[] = [
    { x: -10, width: 124, top: 98, gable: true, door: true, flowers: true, paint: "fill-scene-clay" },
    { x: 114, width: 136, top: 112, gable: false, door: true, shutters: true, paint: "fill-scene-sage" },
    {
      x: 316,
      width: 150,
      top: 120,
      gable: false,
      door: true,
      shop: "Lekáreň",
      emblem: "cross",
      paint: "fill-scene-warm",
      fasciaY: 172,
    },
    {
      x: 466,
      width: 120,
      top: 100,
      gable: true,
      door: true,
      balcony: true,
      flowers: true,
      paint: "fill-scene-clay",
    },
    {
      x: 586,
      width: 124,
      top: 112,
      gable: false,
      door: true,
      shop: "Kaviareň",
      awning: "fill-scene-red-mid",
      emblem: "cup",
      paint: "fill-scene-honey",
    },
    { x: 710, width: 112, top: 96, gable: true, door: false, arcade: true, paint: "fill-scene-sage" },
    { x: 822, width: 148, top: 114, gable: false, door: true, shutters: true, paint: "fill-scene-warm" },
  ];

  /** Roland's fountain stands out on the square, its basin's front edge at `ground`. */
  // Inside what a phone shows (x 180 to 780), right of the café's sign.
  const FOUNTAIN = { x: 708, ground: 248, size: 0.62 };
  /** The café's terrace under its awning: a table with a chair either side. */
  const TABLES = [606, 646];
  const BOLLARDS = [258, 308];
  /** How deep the pavement runs from the houses: past the bin's and the tables' feet, short of the fountain's. */
  const KERB = 18;
  /** The pavement's slabs: two rows, the far one shallower, their joints half a slab apart. */
  const SLAB = { row: 226 + 8, width: 22 };
  const slabJoints = Array.from({ length: 46 }, (_, index) => {
    const x = -10 + index * SLAB.width;
    return `M${x} 226V${SLAB.row}M${x + SLAB.width / 2} ${SLAB.row}V${226 + KERB}`;
  }).join("");
  /**
   * The gate's clock face: a short thick hour hand and a long thin minute
   * hand, so half past eleven does not read as one straight stroke.
   */
  const clock = PARTS.plaza.clock;
  const hands = $derived.by(() => {
    const hourAngle = ((hour % 12) / 12) * 2 * Math.PI;
    const minuteAngle = (hour % 1) * 2 * Math.PI;
    return {
      hour: { x: clock.x + Math.sin(hourAngle) * clock.hand * 0.62, y: clock.y - Math.cos(hourAngle) * clock.hand * 0.62 },
      minute: { x: clock.x + Math.sin(minuteAngle) * clock.hand, y: clock.y - Math.cos(minuteAngle) * clock.hand },
    };
  });
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
<circle cx={clock.x} cy={clock.y} r={clock.r + 2} class="fill-white" />
<circle cx={clock.x} cy={clock.y} r={clock.r} class="fill-scene-edge" />
<circle cx={clock.x} cy={clock.y} r={clock.r * 0.86} class="fill-white" />
{#each Array.from({ length: 12 }, (_, index) => (index * Math.PI) / 6) as angle (angle)}
  <path
    d="M{clock.x + Math.sin(angle) * clock.r * 0.72} {clock.y - Math.cos(angle) * clock.r * 0.72}L{clock.x + Math.sin(angle) * clock.r * 0.84} {clock.y - Math.cos(angle) * clock.r * 0.84}"
    class="stroke-scene-line/60"
    stroke-width={angle % (Math.PI / 2) === 0 ? 1.8 : 0.9}
  />
{/each}
<path d="M{clock.x} {clock.y}L{hands.minute.x} {hands.minute.y}" class="stroke-scene-line" stroke-width="1.2" stroke-linecap="round" />
<path d="M{clock.x} {clock.y}L{hands.hour.x} {hands.hour.y}" class="stroke-scene-line" stroke-width="2.6" stroke-linecap="round" />
<circle cx={clock.x} cy={clock.y} r="1.6" class="fill-scene-line" />

<!--
  The square: grey granite, a smooth pavement along the houses that the street
  furniture stands on, a kerb's drop, then setts laid in fans. The fountain,
  the bench and the tree stand on the setts, just past the kerb.
-->
<rect x="-10" y="226" width="980" height="84" class="fill-scene-steel-light" />
<rect x="-10" y="226" width="980" height={KERB} class="fill-scene-cool" />
<path
  d="M-10 {SLAB.row}H970{slabJoints}"
  class="stroke-scene-line/12"
  fill="none"
  stroke-width="1"
/>
<rect x="-10" y={226 + KERB} width="980" height="2.5" class="fill-scene-line/25" />
<Cobbles from={226 + KERB + 2.5} />
<FloorShade />

<StreetLamp lamp={PARTS.plaza.lamp} />

<!-- Bollards either side of the gate, a bin by the lamp, a bike at a stand. -->
{#each BOLLARDS as x (x)}
  <ellipse cx={x} cy="236" rx="5" ry="1.5" class="fill-scene-line/15" />
  <rect x={x - 3} y="222" width="6" height="14" rx="2.5" class="fill-scene-line/60" />
  <rect x={x - 3} y="225" width="6" height="2" class="fill-white/40" />
{/each}
<ellipse cx="200" cy="241" rx="8" ry="2" class="fill-scene-line/15" />
<path d="M193 224h14l-1.5 17h-11Z" class="fill-scene-line/55" />
<rect x="192" y="222" width="16" height="3" rx="1" class="fill-scene-line/70" />
<g class="stroke-scene-line/85" fill="none" stroke-width="1.8">
  <path d="M148 240V228a6 6 0 0 1 12 0V240" />
  {#each [140] as x (x)}
    <circle cx={x} cy="234" r="6" />
    <circle cx={x + 18} cy="234" r="6" />
    <path d="M{x} 234l6-8h9l3 8M{x + 6} 226l3 8h6" class="stroke-scene-red-mid" stroke-width="2.2" />
    <path d="M{x + 4} 224h4M{x + 15} 226v-3h3" />
  {/each}
</g>

<!-- The café's terrace: bistro tables and chairs under its awning, planters at either end. -->
{#each [584] as x (x)}
  <rect x={x - 6} y="230" width="12" height="9" rx="1" class="fill-scene-clay" />
  <circle cx={x - 3} cy="228" r="4" class="fill-scene-leaf" />
  <circle cx={x + 3} cy="227" r="4.5" class="fill-scene-leaf" />
{/each}
{#each TABLES as x (x)}
  <ellipse cx={x} cy="240" rx="16" ry="2" class="fill-scene-line/15" />
  {#each [-1, 1] as side (side)}
    {@const chair = x + side * 13}
    <path d="M{chair + side * 4} 239V222M{chair - side * 4} 239V230M{chair + side * 4} 230H{chair - side * 4}" class="stroke-scene-coffee/70" stroke-width="1.5" fill="none" />
    <rect x={chair - 5} y="228.5" width="10" height="2.5" rx="1" class="fill-scene-coffee/70" />
  {/each}
  <rect x={x - 0.8} y="228" width="1.6" height="11" class="fill-scene-line/60" />
  <rect x={x - 4} y="238" width="8" height="1.5" class="fill-scene-line/60" />
  <ellipse cx={x} cy="227.5" rx="8" ry="1.8" class="fill-white" />
  <rect x={x - 3} y="223.5" width="3" height="3.5" rx="0.5" class="fill-white" />
  <rect x={x + 1.5} y="224.5" width="2.5" height="2.5" rx="0.5" class="fill-scene-honey" />
{/each}

<!-- Roland's fountain: an octagonal stone basin, a bowl on a column, the knight on top. -->
<g transform="translate({FOUNTAIN.x} {FOUNTAIN.ground}) scale({FOUNTAIN.size})">
  <ellipse cx="0" cy="1" rx="64" ry="5" class="fill-scene-line/15" />
  <ellipse cx="0" cy="-22" rx="60" ry="8" class="fill-scene-warm" />
  <ellipse cx="0" cy="-22" rx="55" ry="5.5" class="fill-scene-water/40" />
  <path d="M-10 -22V-90h20V-22Z" class="fill-scene-warm" />
  <path d="M4 -22V-90h6V-22Z" class="fill-scene-line/10" />
  <rect x="-14" y="-38" width="28" height="12" rx="1" class="fill-scene-warm" />
  <rect x="-14" y="-38" width="28" height="3" class="fill-white/60" />
  <path d="M-6 -34a3 3 0 0 1 6 0M0 -34a3 3 0 0 1 6 0" class="stroke-scene-line/25" fill="none" stroke-width="1" />
  <!-- Water spouting from under the knight into the bowl, and over the bowl's rim into the basin. -->
  <path
    d="M-6 -88C-14 -88 -18 -80 -20 -70M6 -88C14 -88 18 -80 20 -70M-27 -67C-38 -62 -42 -46 -44 -24M27 -67C38 -62 42 -46 44 -24M-20 -62C-26 -54 -28 -40 -29 -23M20 -62C26 -54 28 -40 29 -23"
    class="stroke-scene-water/60"
    fill="none"
    stroke-width="1.8"
  />
  <path d="M-26 -68H26Q20 -57 0 -55Q-20 -57 -26 -68Z" class="fill-scene-warm" />
  <path d="M0 -55Q20 -57 26 -68H8Z" class="fill-scene-line/10" />
  <rect x="-27" y="-70" width="54" height="3.5" rx="1.5" class="fill-white" />
  <ellipse cx="0" cy="-69" rx="22" ry="1.6" class="fill-scene-water/50" />
  <rect x="-8" y="-96" width="16" height="6" rx="1" class="fill-white" />
  <!-- The knight in armour, shield on his arm and a lance in his hand. -->
  <path d="M-6 -96l1.5-13h-1.5l1.5-10h9l1.5 10h-1.5l1.5 13h-4l-1-9h-2l-1 9Z" class="fill-scene-steel-dark" />
  <circle cx="0" cy="-123" r="4" class="fill-scene-steel-dark" />
  <path d="M-4 -126h8l-1.5-3.5h-5Z" class="fill-scene-line/60" />
  <path d="M-12 -116h8v8q0 5-4 7q-4-2-4-7Z" class="fill-scene-steel-dark" />
  <path d="M-8 -114v10M-11 -110h6" class="stroke-white/40" stroke-width="1" />
  <path d="M7 -94V-138" class="stroke-scene-line/70" stroke-width="1.6" />
  <path d="M7 -138l-2 5h4Z" class="fill-scene-line/70" />
  <path d="M5 -112h4" class="stroke-scene-steel-dark" stroke-width="2.5" />
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
