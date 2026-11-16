<script lang="ts">
  import Chalkboard from "./Chalkboard.svelte";
  import Cloud from "./Cloud.svelte";
  import Facades, { type Facade } from "./Facades.svelte";
  import FloorShade from "./FloorShade.svelte";
  import Produce, { type Crate } from "./Produce.svelte";
  import StreetLamp from "./StreetLamp.svelte";

  /** The square behind the market, washed back by distance so the stalls stay in front. */
  const houses: Facade[] = [
    { x: -10, width: 130, top: 100, gable: true, door: false, paint: "fill-scene-clay" },
    { x: 120, width: 110, top: 118, gable: false, door: false, paint: "fill-scene-sage" },
    { x: 230, width: 120, top: 96, gable: true, door: false, paint: "fill-scene-honey" },
    { x: 350, width: 150, top: 112, gable: false, door: true, paint: "fill-scene-warm" },
    { x: 500, width: 120, top: 104, gable: true, door: false, paint: "fill-scene-clay" },
    { x: 620, width: 140, top: 116, gable: false, door: false, paint: "fill-scene-sage" },
    { x: 760, width: 110, top: 104, gable: false, door: false, paint: "fill-scene-honey" },
    { x: 870, width: 110, top: 110, gable: false, door: false, paint: "fill-scene-warm" },
  ];

  const FLAG_PAINTS = ["fill-scene-clay", "fill-scene-honey", "fill-scene-sage"];

  /**
   * Bunting from the fruit stall's pole to the farm stall's, sagging over the
   * fruit stall's lower roof: its flags clear the roof by about ten.
   */
  const STRING = { from: { x: 424, y: 32 }, sag: { x: 533, y: 70 }, to: { x: 642, y: 32 } };
  const FLAG = { count: 7, half: 7, drop: 14 };

  function along(t: number): { x: number; y: number } {
    const { from, sag, to } = STRING;
    return {
      x: (1 - t) ** 2 * from.x + 2 * (1 - t) * t * sag.x + t ** 2 * to.x,
      y: (1 - t) ** 2 * from.y + 2 * (1 - t) * t * sag.y + t ** 2 * to.y,
    };
  }

  // Spaced by length along the string, not by t, so they sit evenly where it sags and where it climbs,
  // each turned with the string so its top edge lies on it.
  const flags = (() => {
    const points = Array.from({ length: 201 }, (_, index) => along(index / 200));
    const lengths = [0];
    for (let index = 1; index < points.length; index++) {
      const { x, y } = points[index];
      const last = points[index - 1];
      lengths.push(lengths[index - 1] + Math.hypot(x - last.x, y - last.y));
    }
    const total = lengths[lengths.length - 1];
    return Array.from({ length: FLAG.count }, (_, index) => {
      const at = lengths.findIndex((length) => length >= (total * (index + 1)) / (FLAG.count + 1));
      const before = points[at - 1];
      const after = points[at + 1];
      const angle = (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;
      return { paint: FLAG_PAINTS[index % 3], ...points[at], angle };
    });
  })();

  interface Stall {
    label: string;
    x: number;
    width: number;
    /** Where the roof meets the beam over the front posts; the roof's back edge is 22 higher. */
    beam: number;
    /** The front post that runs on up to hold the bunting. */
    pole: number;
    /** Crates on the counter, left to right, 88 apart from 18 in. */
    crates: Crate[];
    /** A second row on a step behind, to show the stall well stocked. */
    back: Crate[];
    /** Oštiepky hanging from the eaves outside the posts, clear of the goods, each with its price tied under it. */
    cheeses: Array<{ x: number; price: string; size: number }>;
  }

  // Both stalls fit inside what a phone's stage shows of the market (x 360 to 960), with a margin, so neither is cut off.
  const stalls: Stall[] = [
    {
      label: "Ovocie",
      x: 412,
      width: 196,
      beam: 100,
      pole: 424,
      crates: ["apples", "plums"],
      back: ["pears", "pears"],
      cheeses: [],
    },
    {
      label: "Z farmy",
      x: 630,
      width: 300,
      beam: 84,
      pole: 642,
      // Tieto jahody and tamtie jahody, with the vegetables between them.
      crates: ["strawberries", "vegetables", "strawberries"],
      back: ["potatoes", "onions", "potatoes"],
      // Tento syr for five euros, tamten for three. The near one hangs just clear of the fruit roof, which ends at 612.
      cheeses: [
        { x: 626, price: "5 €", size: 1.7 },
        { x: 938, price: "3 €", size: 1.45 },
      ],
    },
  ];

  const STRIPE = 28;
  const POST = 12;
  /** The step the back row stands on: as much higher as it is further back. */
  const STEP = 22;

  // Looks the same at every hour; it is handed the props every drawing gets.
  let {}: Record<string, unknown> = $props();
</script>

<Cloud x={150} y={52} size={0.8} />
<Cloud x={820} y={50} />
<!-- The houses stand across the square, their fronts 14 back from where the stalls stand. -->
<g transform="translate(0 -14)">
  <Facades {houses} />
</g>
<rect x="-10" y="40" width="980" height="172" class="fill-scene-cool/55" />
<rect x="-10" y="212" width="980" height="98" class="fill-scene-sand" />
<rect x="-10" y="212" width="980" height="14" class="fill-scene-cool/30" />
<!-- Cobbles, faint, smaller toward the back. -->
{#each [{ y: 234, size: 14 }, { y: 246, size: 18 }, { y: 262, size: 22 }, { y: 282, size: 26 }] as { y, size }, row (y)}
  {#each Array.from({ length: Math.ceil(990 / (size * 1.8)) }, (_, index) => index * size * 1.8 + (row % 2) * size * 0.9 - 10) as x (x)}
    <path d="M{x} {y}h{size}" class="stroke-scene-line/7" stroke-width="1.2" />
  {/each}
{/each}
<FloorShade />
<StreetLamp lamp={{ x: 300, ground: 226 }} />

{#each stalls as stall (stall.label)}
  {@const left = stall.x + POST}
  {@const right = stall.x + stall.width - POST}
  {@const stripes = Math.round((stall.width + 8) / STRIPE)}
  {@const stripe = (stall.width + 8) / stripes}
  <ellipse
    cx={stall.x + stall.width / 2}
    cy="227"
    rx={stall.width / 2 + 2}
    ry="4"
    class="fill-scene-line/15"
  />

  <!-- The back canvas, in the stall's own shade. -->
  <rect x={left} y={stall.beam} width={right - left} height={170 - stall.beam} class="fill-scene-warm" />
  <rect
    x={left}
    y={stall.beam}
    width={right - left}
    height={170 - stall.beam}
    class="fill-scene-line/12"
  />

  <!-- Posts, and the pole on up to the bunting. -->
  <path
    d="M{left - 2} 226V{stall.beam - 4}h4V226ZM{right - 2} 226V{stall.beam - 4}h4V226Z"
    class="fill-scene-wood"
  />
  <rect x={stall.pole - 2} y="28" width="4" height={stall.beam - 28} class="fill-scene-wood" />
  <circle cx={stall.pole} cy="28" r="2.6" class="fill-scene-wood" />

  <!-- The back row, a step up behind the counter. -->
  <g transform="translate(0 {-STEP})">
    {#each stall.back as crate, index (index)}
      {@const x = stall.x + 18 + index * 88}
      <Produce {crate} {x} />
      <rect {x} y="148" width="76" height="24" rx="2" class="fill-scene-wood" />
      <rect {x} y="148" width="76" height="24" rx="2" class="fill-scene-line/15" />
    {/each}
  </g>

  <!-- The roof, sloping down toward us, and its scalloped valance. -->
  {#each Array.from({ length: stripes }, (_, index) => index) as index (index)}
    {@const bottom = stall.x - 4 + index * stripe}
    {@const top = stall.x + 8 + (index * (stall.width - 16)) / stripes}
    <path
      d="M{top} {stall.beam - 22}H{top + (stall.width - 16) / stripes}L{bottom + stripe} {stall.beam}H{bottom}Z"
      class={index % 2 === 0 ? "fill-scene-clay" : "fill-white/95"}
    />
  {/each}
  <rect x={stall.x - 4} y={stall.beam - 2} width={stall.width + 8} height="4" rx="1.5" class="fill-scene-wood" />
  {#each Array.from({ length: stripes }, (_, index) => stall.x - 4 + index * stripe) as x, index (x)}
    <path
      d="M{x} {stall.beam + 2}H{x + stripe}V{stall.beam + 7}A{stripe / 2} 6 0 0 1 {x} {stall.beam + 7}Z"
      class={index % 2 === 0 ? "fill-scene-clay" : "fill-white/95"}
    />
  {/each}

  <!-- The sign, screwed to the front of the beam over the middle of the stall. -->
  <Chalkboard x={stall.x + stall.width / 2 - 42} y={stall.beam - 20} width={84} height={16}>
    <text x="42" y="13" text-anchor="middle" font-size="13">{stall.label}</text>
  </Chalkboard>

  {#each stall.cheeses as { x, price, size } (x)}
    <path d="M{x} {stall.beam + 2}V97" class="stroke-scene-coffee/70" stroke-width="1.2" />
    <!-- An oštiepok: smoked, spindle-shaped, the stamped pattern round its middle, hung by its cord. -->
    <g transform="translate({x} 97) scale({size})">
      <path d="M-3 2l3-3 3 3" class="stroke-scene-coffee/70" stroke-width="1.2" fill="none" />
      <path
        d="M0 0C7 2 9 9 9 14C9 20 6 24 0 27C-6 24 -9 20 -9 14C-9 9 -7 2 0 0Z"
        class="fill-scene-onion"
      />
      <path d="M3 2C8 7 9 20 3 25C8 20 10 10 3 2Z" class="fill-scene-coffee/25" />
      <path
        d="M-7 9l2.5 3 2.5-3 2.5 3 2.5-3 2.5 3 2.5-3M-8 16l2.5 3 2.5-3 2.5 3 2.5-3 2.5 3 2.5-3 2 2"
        class="stroke-scene-coffee/45"
        stroke-width="0.9"
        fill="none"
      />
      <!-- Its price, on a card tied under it. -->
      <path d="M0 26V32" class="stroke-scene-line" stroke-width="1.8" />
      <rect x="-10" y="31" width="20" height="12" rx="1.5" class="fill-white" />
      <text x="0" y="40.2" text-anchor="middle" font-size="9" font-weight="700" class="fill-scene-line"
        >{price}</text
      >
    </g>
  {/each}

  <!-- The counter: crates on its top, a gingham cloth over its front, its legs under the hem. -->
  {#each stall.crates as crate, index (index)}
    {@const x = stall.x + 18 + index * 88}
    <Produce {crate} {x} />
    <rect {x} y="148" width="76" height="24" rx="2" class="fill-scene-wood" />
    <rect {x} y="158" width="76" height="2" class="fill-scene-line/15" />
    <rect x={x + 2} y="148" width="72" height="2" class="fill-white/30" />
  {/each}

  <!-- In the shade under the counter, spare crates. -->
  <rect x={stall.x + 6} y="204" width={stall.width - 12} height="22" class="fill-scene-line/25" />
  {#each Array.from({ length: Math.floor((stall.width - 40) / 60) }, (_, index) => stall.x + 26 + index * 60) as x (x)}
    <rect {x} y="210" width="44" height="16" rx="1.5" class="fill-scene-wood" />
    <rect {x} y="210" width="44" height="16" rx="1.5" class="fill-scene-line/20" />
    <path d="M{x + 2} 218h40" class="stroke-scene-line/25" stroke-width="1" />
  {/each}
  <path
    d="M{stall.x + 16} 202V226M{stall.x + stall.width - 16} 202V226"
    class="stroke-scene-coffee/60"
    stroke-width="4"
  />
  <rect x={stall.x + 2} y="170" width={stall.width - 4} height="5" rx="1.5" class="fill-scene-wood" />
  <rect x={stall.x + 4} y="175" width={stall.width - 8} height="29" class="fill-scene-warm" />
  {#each Array.from({ length: Math.floor((stall.width - 8) / 12) }, (_, index) => stall.x + 4 + index * 12 + 3) as x (x)}
    <rect {x} y="175" width="6" height="29" class="fill-scene-red/15" />
  {/each}
  {#each [178, 190] as y (y)}
    <rect x={stall.x + 4} {y} width={stall.width - 8} height="6" class="fill-scene-red/15" />
  {/each}
  <path
    d="M{stall.x + 4} 204H{stall.x + stall.width - 4}"
    class="stroke-scene-line/20"
    stroke-width="1.2"
  />
{/each}

<path
  d="M{STRING.from.x} {STRING.from.y}Q{STRING.sag.x} {STRING.sag.y} {STRING.to.x} {STRING.to.y}"
  class="stroke-scene-line/45"
  fill="none"
  stroke-width="1.2"
/>
{#each flags as flag (flag.x)}
  <path
    d="M{-FLAG.half} -0.4H{FLAG.half}L0 {FLAG.drop}Z"
    transform="translate({flag.x} {flag.y}) rotate({flag.angle})"
    class={flag.paint}
  />
{/each}
