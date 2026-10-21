<script lang="ts">
  import Plant from "./Plant.svelte";

  /** The start of the Slovak alphabet, digraphs included. */
  const LETTERS = ["A", "Á", "Ä", "B", "C", "Č", "D", "Ď", "Dz", "Dž", "E", "É"];
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-warm" stroke="none" />
<rect x="-10" y="142" width="980" height="84" class="fill-scene-sage" />
<path d="M-10 142H970" class="stroke-scene-wood" stroke-width="4" />
<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<rect x="-10" y="226" width="980" height="7" class="fill-scene-line/15" stroke="none" />

{#each LETTERS as letter, index (letter)}
  <rect
    x={260 + index * 37}
    y="34"
    width="33"
    height="32"
    rx="3"
    class="fill-portrait-bib"
  />
  <text
    x={276.5 + index * 37}
    y="56"
    text-anchor="middle"
    class="fill-portrait-ink font-serif"
    stroke="none"
    font-size="16"
  >
    {letter}
  </text>
{/each}

<rect x="36" y="58" width="236" height="104" rx="3" class="fill-scene-wood" />
<rect x="44" y="66" width="220" height="88" rx="2" class="fill-scene-board" />
<text x="66" y="106" class="fill-portrait-bib font-serif" stroke="none" font-size="24">
  Dobrý deň!
</text>
<path d="M66 118q62-6 124 0" class="stroke-portrait-bib" />
<rect x="40" y="160" width="228" height="7" rx="2" class="fill-scene-wood" />
<path d="M220 159h14" class="stroke-portrait-bib" stroke-width="3" />

<circle cx="800" cy="78" r="18" class="fill-portrait-bib" />
<path d="M800 64v2M800 90v2M784 78h2M814 78h2" />
<path d="M800 69V78L807 82" stroke-width="2" />

<rect x="686" y="170" width="228" height="10" rx="2" class="fill-scene-wood" />
<rect x="696" y="180" width="74" height="46" class="fill-scene-wood" />
<path d="M904 180V226" stroke-width="3" />
<rect x="716" y="160" width="46" height="10" class="fill-scene-clay" />
<rect x="720" y="150" width="40" height="10" class="fill-scene-sage" />
<rect x="714" y="140" width="44" height="10" class="fill-scene-honey" />
<path d="M854 170h24M866 170v-4" />
<circle cx="866" cy="142" r="20" class="fill-scene-sky" />
<path
  d="M856 128q-6 10 2 18q8 6 4 14M874 126q8 8 2 14"
  class="stroke-scene-leaf"
  stroke-width="3"
/>
<path d="M866 118a24 24 0 0 1 0 48" stroke-width="2.4" />

<Plant x={944} y={226} />
