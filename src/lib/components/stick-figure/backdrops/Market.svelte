<script lang="ts">
  import FloorShade from "./FloorShade.svelte";

  const FLAG_PAINTS = ["fill-scene-clay", "fill-scene-honey", "fill-scene-sage"];

  /** Bunting on a curve from (250, 34) through (480, 80) to (710, 34). */
  const flags = Array.from({ length: 11 }, (_, index) => {
    const t = 0.08 + index * 0.084;
    const x = (1 - t) ** 2 * 250 + 2 * (1 - t) * t * 480 + t ** 2 * 710;
    const y = (1 - t) ** 2 * 34 + 2 * (1 - t) * t * 80 + t ** 2 * 34;
    return { paint: FLAG_PAINTS[index % 3], x, y };
  });

  const stalls = [
    {
      label: "Ovocie",
      x: 20,
      produce: ["fill-scene-clay", "fill-scene-honey", "fill-scene-sage"],
    },
    {
      label: "Zelenina",
      x: 640,
      produce: ["fill-scene-leaf", "fill-scene-clay", "fill-scene-honey"],
    },
  ];

  const STRIPE = 30;
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-sky" stroke="none" />
<path
  d="M-10 226V164L36 140L82 164V152H170L206 128L242 152V170H330V146H420V160L470 134L520 160V150H620L660 126L700 150V168H790V144H870L910 120L950 144H970V226Z"
  class="fill-scene-cool"
  stroke="none"
/>
<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" stroke="none" />
<FloorShade seams />

<path d="M250 34Q480 80 710 34" />
{#each flags as flag (flag.x)}
  <path
    d="M{flag.x - 7} {flag.y}H{flag.x + 7}L{flag.x} {flag.y + 15}Z"
    class={flag.paint}
  />
{/each}

{#each stalls as stall (stall.label)}
  <path d="M{stall.x + 20} 226V86M{stall.x + 280} 226V86" stroke-width="3" />

  {#each Array.from({ length: 10 }, (_, index) => stall.x + index * STRIPE) as x, index (x)}
    <path
      d="M{x} 70H{x + STRIPE}V100A15 10 0 0 1 {x} 100Z"
      class={index % 2 === 0 ? "fill-scene-clay" : "fill-scene-warm"}
    />
  {/each}
  <path d="M{stall.x - 4} 70H{stall.x + 304}" stroke-width="3" />

  {#each stall.produce as paint, crate (crate)}
    <rect
      x={stall.x + 24 + crate * 88}
      y="148"
      width="76"
      height="24"
      class="fill-scene-wood"
    />
    {#each [0, 1, 2, 3, 4] as fruit (fruit)}
      <circle cx={stall.x + 34 + crate * 88 + fruit * 14} cy="144" r="7" class={paint} />
    {/each}
  {/each}

  <rect x={stall.x + 4} y="170" width="292" height="8" rx="2" class="fill-scene-wood" />
  <rect x={stall.x + 10} y="178" width="280" height="48" class="fill-scene-wood" />
  <text
    x={stall.x + 150}
    y="208"
    text-anchor="middle"
    class="fill-portrait-bib font-serif"
    stroke="none"
    font-size="17"
  >
    {stall.label}
  </text>
{/each}
