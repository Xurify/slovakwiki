<script lang="ts">
  import Plant from "./Plant.svelte";

  /** Old-town facades left to right: x, width, roof line, paint. */
  const houses = [
    { x: -10, width: 120, top: 92, gable: true, paint: "fill-scene-clay" },
    { x: 110, width: 70, top: 116, gable: false, paint: "fill-scene-sage" },
    { x: 180, width: 70, top: 104, gable: true, paint: "fill-scene-honey" },
    { x: 316, width: 158, top: 124, gable: false, paint: "fill-scene-warm" },
    { x: 474, width: 124, top: 112, gable: true, paint: "fill-scene-cool" },
    { x: 598, width: 112, top: 98, gable: false, paint: "fill-scene-sage" },
    { x: 710, width: 112, top: 118, gable: true, paint: "fill-scene-clay" },
    { x: 822, width: 148, top: 90, gable: false, paint: "fill-scene-warm" },
  ];

  function housePath(house: (typeof houses)[number]): string {
    const right = house.x + house.width;
    const roof = house.gable
      ? `L${house.x + house.width / 2} ${house.top - 30}`
      : `H${right}`;
    return `M${house.x} 226V${house.top}${roof}L${right} ${house.top}V226Z`;
  }

  const WINDOW_ROWS = [106, 140, 174];

  /** Evenly spaced window columns across a facade. */
  function windowXs(house: (typeof houses)[number]): number[] {
    const count = Math.max(1, Math.floor(house.width / 40));
    const step = house.width / count;
    return Array.from(
      { length: count },
      (_, index) => house.x + step * (index + 0.5) - 6,
    );
  }
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-sky" stroke="none" />

{#each houses as house (house.x)}
  <path d={housePath(house)} class={house.paint} />

  {#each windowXs(house) as x (x)}
    {#each WINDOW_ROWS.filter((y) => y > house.top + 8) as y (y)}
      <rect {x} {y} width="12" height="18" rx="1.5" class="fill-portrait-bib" />
    {/each}
  {/each}
{/each}

<!-- Michael's Gate: the old-town tower with a green copper roof. -->
<rect x="250" y="104" width="66" height="122" class="fill-scene-warm" />
<rect x="258" y="82" width="50" height="22" class="fill-scene-warm" />
<path d="M256 82Q256 64 283 60Q310 64 310 82Z" class="fill-scene-sage" />
<path d="M270 60Q270 48 283 42Q296 48 296 60Z" class="fill-scene-sage" />
<path d="M283 42V30" />
<circle cx="283" cy="29" r="2.4" class="fill-scene-honey" />
<circle cx="283" cy="128" r="13" class="fill-portrait-bib" />
<path d="M283 120V128L289 132" />
<path d="M272 226V190A11 11 0 0 1 294 190V226Z" class="fill-scene-line/25" />

<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<rect x="-10" y="226" width="980" height="7" class="fill-scene-line/15" stroke="none" />
<path
  d="M40 256q30-6 60 0M160 276q34-6 68 0M300 252q30-5 60 0M612 256q32-6 64 0M760 278q34-6 68 0M860 250q30-5 60 0"
  class="stroke-scene-line/40"
/>

<g stroke-width="2.6">
  <path d="M30 226V206M130 226V206M24 206H136M28 186H132M30 206V186M130 206V186" />
</g>
<rect x="22" y="198" width="116" height="8" rx="2" class="fill-scene-wood" />
<rect x="26" y="180" width="108" height="8" rx="2" class="fill-scene-wood" />

<rect x="776" y="96" width="6" height="130" class="fill-scene-line" />
<path d="M769 226h20" stroke-width="3" />
<path d="M767 96h24l-4-22h-16Z" class="fill-scene-honey" />
<path d="M771 74h16l-8-8Z" class="fill-scene-line" />

<Plant x={900} y={226} />
