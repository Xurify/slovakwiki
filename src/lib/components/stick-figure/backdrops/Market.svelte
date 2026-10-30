<script lang="ts">
  import Chalkboard from "./Chalkboard.svelte";
  import Cloud from "./Cloud.svelte";
  import FloorShade from "./FloorShade.svelte";
  import Produce, { type Crate } from "./Produce.svelte";

  const FLAG_PAINTS = ["fill-scene-clay", "fill-scene-honey", "fill-scene-sage"];

  /** Bunting tied to the inner stall poles, sagging from (300, 30) through (480, 74) to (660, 30). */
  const flags = Array.from({ length: 9 }, (_, index) => {
    const t = 0.1 + index * 0.1;
    const x = (1 - t) ** 2 * 300 + 2 * (1 - t) * t * 480 + t ** 2 * 660;
    const y = (1 - t) ** 2 * 30 + 2 * (1 - t) * t * 74 + t ** 2 * 30;
    return { paint: FLAG_PAINTS[index % 3], x, y };
  });

  const stalls: Array<{
    cheeses: number[];
    crates: Crate[];
    inner: number;
    label: string;
    x: number;
  }> = [
    {
      label: "Ovocie",
      x: 20,
      inner: 300,
      crates: ["apples", "pears", "plums"],
      cheeses: [],
    },
    {
      label: "Z farmy",
      x: 640,
      inner: 660,
      // Tieto jahody and tamtie jahody, with the vegetables between them.
      crates: ["strawberries", "vegetables", "strawberries"],
      cheeses: [676, 904],
    },
  ];

  const STRIPE = 30;

  // Looks the same at every hour; it is handed the props every drawing gets.
  let {}: Record<string, unknown> = $props();
</script>

<Cloud x={150} y={52} size={0.8} />
<Cloud x={820} y={50} />
<path
  d="M-10 226V164L36 140L82 164V152H170L206 128L242 152V170H330V146H420V160L470 134L520 160V150H620L660 126L700 150V168H790V144H870L910 120L950 144H970V226Z"
  class="fill-scene-cool"
/>
<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<FloorShade />

<path
  d="M300 30Q480 118 660 30"
  class="stroke-scene-line/40"
  fill="none"
  stroke-width="1.2"
/>
{#each flags as flag (flag.x)}
  <path
    d="M{flag.x - 7} {flag.y}H{flag.x + 7}L{flag.x} {flag.y + 15}Z"
    class={flag.paint}
  />
{/each}

{#each stalls as stall (stall.label)}
  <ellipse cx={stall.x + 150} cy="227" rx="150" ry="4" class="fill-scene-line/12" />
  <path
    d="M{stall.x + 18} 226V86h4V226ZM{stall.x + 278} 226V86h4V226Z"
    class="fill-scene-wood"
  />
  <rect x={stall.inner - 2} y="28" width="4" height="60" class="fill-scene-wood" />

  {#each Array.from({ length: 10 }, (_, index) => stall.x + index * STRIPE) as x, index (x)}
    <path
      d="M{x} 70H{x + STRIPE}V100A15 10 0 0 1 {x} 100Z"
      class={index % 2 === 0 ? "fill-scene-clay" : "fill-white/90"}
    />
  {/each}
  <rect x={stall.x - 4} y="66" width="308" height="6" rx="2" class="fill-scene-wood" />

  {#each stall.cheeses as x (x)}
    <path d="M{x} 100V106" class="stroke-scene-line/60" stroke-width="1.2" />
    <path
      d="M{x} 104C{x + 16} 106 {x + 15} 128 {x} 140C{x - 15} 128 {x - 16} 106 {x} 104Z"
      class="fill-scene-wood"
    />
    <path
      d="M{x - 10} 114h20M{x - 11} 121h22M{x - 9} 128h18"
      class="stroke-scene-honey"
      stroke-width="2"
    />
    <path
      d="M{x - 5} 110v24M{x + 5} 110v24"
      class="stroke-scene-honey/60"
      stroke-width="1.2"
    />
  {/each}

  {#each stall.crates as crate, index (index)}
    <Produce {crate} x={stall.x + 24 + index * 88} />
    <rect
      x={stall.x + 24 + index * 88}
      y="148"
      width="76"
      height="24"
      rx="2"
      class="fill-scene-wood"
    />
    <rect
      x={stall.x + 24 + index * 88}
      y="158"
      width="76"
      height="2"
      class="fill-scene-line/12"
    />
  {/each}

  <rect x={stall.x + 4} y="170" width="292" height="8" rx="2" class="fill-scene-wood" />
  <rect x={stall.x + 10} y="178" width="280" height="48" class="fill-scene-wood" />
  <rect x={stall.x + 10} y="178" width="280" height="4" class="fill-scene-line/12" />
  <Chalkboard x={stall.x + 105} y={188} width={90} height={28}>
    <text x="45" y="21" text-anchor="middle" font-size="19">{stall.label}</text>
  </Chalkboard>
{/each}
