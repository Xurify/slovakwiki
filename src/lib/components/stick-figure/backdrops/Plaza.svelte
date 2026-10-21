<script lang="ts">
  import ClockHands from "./ClockHands.svelte";
  import Cloud from "./Cloud.svelte";
  import FloorShade from "./FloorShade.svelte";

  /** What the tower clock shows. */
  let { hour }: { hour: number } = $props();

  /** Old-town facades left to right; neighbours never share a paint, as nothing outlines them. */
  const houses = [
    { x: -10, width: 120, top: 92, gable: true, door: true, paint: "fill-scene-clay" },
    { x: 110, width: 70, top: 116, gable: false, door: false, paint: "fill-scene-sage" },
    { x: 180, width: 70, top: 104, gable: true, door: false, paint: "fill-scene-honey" },
    { x: 316, width: 158, top: 124, gable: false, door: true, paint: "fill-scene-warm" },
    { x: 474, width: 124, top: 112, gable: true, door: false, paint: "fill-scene-clay" },
    { x: 598, width: 112, top: 98, gable: false, door: true, paint: "fill-scene-sage" },
    { x: 710, width: 112, top: 118, gable: true, door: false, paint: "fill-scene-honey" },
    { x: 822, width: 148, top: 90, gable: false, door: true, paint: "fill-scene-warm" },
  ];
  type House = (typeof houses)[number];

  const WINDOW_ROWS = [106, 140, 174];

  function housePath(house: House): string {
    const right = house.x + house.width;
    const roof = house.gable ? `L${house.x + house.width / 2} ${house.top - 30}` : "";
    return `M${house.x} 226V${house.top}${roof}L${right} ${house.top}V226Z`;
  }

  /** Evenly spaced window columns across a facade. */
  function windowXs(house: House): number[] {
    const count = Math.max(1, Math.floor(house.width / 40));
    const step = house.width / count;
    return Array.from(
      { length: count },
      (_, index) => house.x + step * (index + 0.5) - 7,
    );
  }
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-sky" />
<Cloud x={560} y={60} />
<Cloud x={860} y={64} size={0.7} />
<Cloud x={110} y={56} size={0.8} />

{#each houses as house (house.x)}
  <path d={housePath(house)} class={house.paint} />

  {#if house.gable}
    <circle
      cx={house.x + house.width / 2}
      cy={house.top - 10}
      r="5"
      class="fill-white/60"
    />
  {:else}
    <rect
      x={house.x}
      y={house.top}
      width={house.width}
      height="5"
      class="fill-white/35"
    />
  {/if}

  {#each windowXs(house) as x (x)}
    {#each WINDOW_ROWS.filter((y) => y > house.top + 8) as y (y)}
      <rect {x} {y} width="14" height="20" rx="1.5" class="fill-white/70" />
      <rect x={x + 2} y={y + 2} width="10" height="16" rx="1" class="fill-scene-sky" />
    {/each}
  {/each}

  {#if house.door}
    <path
      d="M{house.x + house.width / 2 - 9} 226V206a9 9 0 0 1 18 0V226Z"
      class="fill-scene-line/25"
    />
  {/if}
{/each}

<!-- Michael's Gate: the old-town tower with a green copper roof. -->
<rect x="250" y="104" width="66" height="122" class="fill-portrait-bib" />
<rect x="258" y="82" width="50" height="22" class="fill-portrait-bib" />
<rect x="258" y="98" width="50" height="6" class="fill-scene-line/8" />
<path d="M256 82Q256 64 283 60Q310 64 310 82Z" class="fill-scene-sage" />
<path d="M283 60Q310 64 310 82H283Z" class="fill-scene-line/10" />
<path d="M270 60Q270 48 283 42Q296 48 296 60Z" class="fill-scene-sage" />
<path d="M282 42h2v-12h-2Z" class="fill-scene-line/50" />
<circle cx="283" cy="29" r="2.6" class="fill-scene-honey" />
<circle cx="283" cy="128" r="14" class="fill-scene-edge" />
<circle cx="283" cy="128" r="12" class="fill-white" />
<ClockHands {hour} length={9} width={1.8} x={283} y={128} />
<path d="M272 226V190A11 11 0 0 1 294 190V226Z" class="fill-scene-line/25" />

<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<FloorShade />

<ellipse cx="80" cy="251" rx="62" ry="4" class="fill-scene-line/12" />
<path d="M32 200h4v50h-4ZM124 200h4v50h-4Z" class="fill-scene-wood" />
<rect x="24" y="220" width="112" height="8" rx="2" class="fill-scene-wood" />
<rect x="28" y="200" width="104" height="8" rx="2" class="fill-scene-wood" />
<rect x="24" y="228" width="112" height="3" class="fill-scene-line/12" />

<ellipse cx="779" cy="231" rx="12" ry="3" class="fill-scene-line/15" />
<rect x="776" y="96" width="6" height="134" class="fill-scene-line/60" />
<rect x="771" y="224" width="16" height="7" rx="2" class="fill-scene-line/60" />
<path d="M767 96h24l-4-22h-16Z" class="fill-scene-honey" />
<path d="M769 74h20l-10-8Z" class="fill-scene-line/60" />

<ellipse cx="902" cy="250" rx="34" ry="4" class="fill-scene-line/12" />
<rect x="897" y="160" width="10" height="72" class="fill-scene-wood" />
<circle cx="880" cy="160" r="24" class="fill-scene-leaf" />
<circle cx="926" cy="156" r="26" class="fill-scene-leaf" />
<circle cx="902" cy="132" r="32" class="fill-scene-leaf" />
<circle cx="892" cy="124" r="14" class="fill-white/15" />
<path d="M878 222h48l-4 28h-40Z" class="fill-scene-clay" />
<rect x="876" y="218" width="52" height="7" rx="2" class="fill-scene-clay" />
