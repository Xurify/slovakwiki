<script lang="ts">
  import Chalkboard from "./Chalkboard.svelte";
  import FloorShade from "./FloorShade.svelte";
  import Plant from "./Plant.svelte";

  /** What the teacher has just said, chalked up in place of the greeting. */
  let { board }: { board?: string } = $props();

  /** The start of the Slovak alphabet, digraphs included. */
  const LETTERS = ["A", "Á", "Ä", "B", "C", "Č", "D", "Ď", "Dz", "Dž", "E", "É"];

  // Caveat runs about 0.42 em a letter; the board has 196 units to write in.
  const boardSize = $derived(board ? Math.min(32, 196 / (board.length * 0.42)) : 32);
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-warm" />
<rect x="-10" y="168" width="980" height="58" class="fill-scene-sage/50" />
<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<FloorShade />

{#each LETTERS as letter, index (letter)}
  <rect
    x={261 + index * 37}
    y="36"
    width="33"
    height="32"
    rx="3"
    class="fill-scene-line/10"
  />
  <rect x={260 + index * 37} y="34" width="33" height="32" rx="3" class="fill-white" />
  <circle cx={276.5 + index * 37} cy="37.5" r="1.6" class="fill-scene-clay" />
  <text
    x={276.5 + index * 37}
    y="58"
    text-anchor="middle"
    class="fill-portrait-ink font-serif"
    font-size="16"
  >
    {letter}
  </text>
{/each}

<Chalkboard x={44} y={66} width={220} height={88}>
  <text x="14" y="20" font-size="14">pondelok</text>
  {#key board}
    <text
      x="110"
      y="58"
      text-anchor="middle"
      font-size={boardSize}
      transform="rotate(-2 110 50)"
      class="animate-rise"
    >
      {board ?? "Dobrý deň!"}
    </text>
  {/key}
  <path
    d="M52 68q30-5 58 0t56-1"
    class="stroke-portrait-bib/80"
    fill="none"
    stroke-width="1.6"
  />
</Chalkboard>
<rect x="40" y="158" width="228" height="7" rx="2" class="fill-scene-wood" />
<rect x="220" y="154" width="14" height="4" rx="1.5" class="fill-white" />
<rect x="198" y="155" width="9" height="3" rx="1.5" class="fill-scene-honey" />

<circle cx="800" cy="78" r="20" class="fill-scene-edge" />
<circle cx="800" cy="78" r="17.5" class="fill-white" />
<path d="M800 66V78L808 83" class="stroke-scene-line" fill="none" stroke-width="2" />

<ellipse cx="800" cy="228" rx="118" ry="4" class="fill-scene-line/12" />
<rect x="696" y="180" width="74" height="46" class="fill-scene-wood" />
<rect x="704" y="188" width="58" height="14" rx="2" class="fill-scene-line/8" />
<rect x="902" y="180" width="5" height="46" class="fill-scene-wood" />
<rect x="686" y="170" width="228" height="10" rx="2" class="fill-scene-wood" />
<rect x="686" y="180" width="228" height="3" class="fill-scene-line/12" />
<rect x="716" y="160" width="46" height="10" rx="1" class="fill-scene-clay" />
<rect x="720" y="150" width="40" height="10" rx="1" class="fill-scene-sage" />
<rect x="714" y="140" width="44" height="10" rx="1" class="fill-scene-honey" />
<rect x="854" y="166" width="24" height="4" rx="2" class="fill-scene-line/60" />
<rect x="864.5" y="160" width="3" height="7" class="fill-scene-line/60" />
<circle cx="866" cy="140" r="20" class="fill-scene-sky" />
<path
  d="M852 128q5-6 12-3q3 6-3 9q-6 2-9-6ZM870 138q8-4 12 3q-2 8-8 9q-5-4-4-12Z"
  class="fill-scene-leaf"
/>
<path
  d="M866 118a22 22 0 0 1 0 44"
  class="stroke-scene-line/60"
  fill="none"
  stroke-width="2.4"
/>

<Plant x={944} y={232} />
