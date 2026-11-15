<script lang="ts">
  import Chalkboard from "./Chalkboard.svelte";
  import Cloud from "./Cloud.svelte";
  import FloorShade from "./FloorShade.svelte";
  import Produce, { type Crate } from "./Produce.svelte";

  const FLAG_PAINTS = ["fill-scene-clay", "fill-scene-honey", "fill-scene-sage"];

  /** Bunting tied just under the tops of the inner stall poles, sagging between them. */
  const STRING = { from: { x: 300, y: 32 }, sag: { x: 480, y: 116 }, to: { x: 660, y: 32 } };
  const FLAG = { count: 9, half: 7, drop: 15 };

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

  const stalls: Array<{
    cheeses: number[];
    crates: Crate[];
    inner: number;
    label: string;
    /** The chalkboard's left edge, from the stall's. */
    sign: number;
    x: number;
  }> = [
    {
      label: "Ovocie",
      x: 20,
      inner: 300,
      sign: 105,
      crates: ["apples", "pears", "plums"],
      cheeses: [],
    },
    {
      label: "Z farmy",
      x: 640,
      inner: 660,
      // Right of the middle, clear of Lucia at the stall's end and of the crate beside her (MARKET_SET).
      sign: 186,
      // Tieto jahody and tamtie jahody, with the vegetables between them.
      crates: ["strawberries", "vegetables", "strawberries"],
      cheeses: [680, 896],
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
  d="M{STRING.from.x} {STRING.from.y}Q{STRING.sag.x} {STRING.sag.y} {STRING.to.x} {STRING.to.y}"
  class="stroke-scene-line/40"
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
  <Chalkboard x={stall.x + stall.sign} y={188} width={90} height={28}>
    <text x="45" y="21" text-anchor="middle" font-size="19">{stall.label}</text>
  </Chalkboard>
{/each}
