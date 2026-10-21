<script lang="ts">
  import ClockHands from "./ClockHands.svelte";
  import FloorShade from "./FloorShade.svelte";
  import Plant from "./Plant.svelte";

  let { hour }: { hour: number } = $props();

  /** Acoustic foam behind the hosts, its wedges turned a quarter each tile. */
  const foam = [340, 500].flatMap((left) =>
    Array.from({ length: 16 }, (_, index) => ({
      across: (index % 4) % 2 === Math.floor(index / 4) % 2,
      x: left + (index % 4) * 30,
      y: 80 + Math.floor(index / 4) * 26,
    })),
  );

  /** A recording's waveform on the laptop screen. */
  const wave = [3, 7, 4, 10, 6, 12, 5, 9, 4, 11, 7, 5, 8, 3];
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-cool" />
<rect x="-10" y="226" width="980" height="84" class="fill-scene-wood" />
<FloorShade />
<ellipse cx="480" cy="272" rx="270" ry="20" class="fill-portrait-ground" />
<ellipse cx="480" cy="272" rx="246" ry="13" class="fill-white/20" />

<ellipse cx="114" cy="227" rx="96" ry="4" class="fill-scene-line/12" />
<path d="M34 166h5v60h-5ZM189 166h5v60h-5Z" class="fill-scene-line/50" />
<rect x="36" y="196" width="156" height="4" class="fill-scene-line/30" />
<rect x="24" y="158" width="180" height="10" rx="2" class="fill-scene-wood" />
<rect x="28" y="166" width="172" height="3" class="fill-scene-line/12" />

<rect x="64" y="118" width="52" height="36" rx="2" class="fill-portrait-vest" />
<rect x="67" y="121" width="46" height="30" rx="1" class="fill-scene-sky" />
<path
  d="M{wave
    .map((height, index) => `${70 + index * 3} ${136 - height / 2}v${height}`)
    .join('M')}"
  class="stroke-blue-500"
  fill="none"
  stroke-width="1.6"
/>
<path d="M56 158l6-4h56l6 4Z" class="fill-scene-edge" />

<path
  d="M140 156Q140 132 158 132Q176 132 176 156"
  class="stroke-portrait-vest"
  fill="none"
  stroke-width="3.5"
/>
<rect x="134" y="144" width="10" height="14" rx="4" class="fill-portrait-vest" />
<rect x="172" y="144" width="10" height="14" rx="4" class="fill-portrait-vest" />

<rect x="246" y="40" width="82" height="186" rx="2" class="fill-portrait-bib" />
<rect x="252" y="46" width="70" height="180" class="fill-scene-wood" />
<rect x="259" y="128" width="56" height="86" rx="2" class="fill-scene-line/10" />
<circle cx="287" cy="84" r="13" class="fill-portrait-bib" />
<circle cx="287" cy="84" r="10" class="fill-scene-sky" />
<rect x="304" y="140" width="12" height="4" rx="2" class="fill-scene-line/70" />
<circle cx="307" cy="142" r="3" class="fill-scene-line/70" />

<circle cx="114" cy="66" r="20" class="fill-scene-edge" />
<circle cx="114" cy="66" r="17" class="fill-white" />
<path
  d="M114 52v3M114 77v3M100 66h3M125 66h3"
  class="stroke-scene-line/50"
  fill="none"
  stroke-width="1.6"
/>
<ClockHands {hour} length={10} width={2} x={114} y={66} />

<path d="M444 -10V22M516 -10V22" class="stroke-scene-line/40" stroke-width="1.2" />
<rect x="404" y="18" width="152" height="42" rx="9" class="fill-rose-500/20" />
<rect x="410" y="22" width="140" height="34" rx="6" class="fill-rose-500" />
<text
  x="480"
  y="45"
  text-anchor="middle"
  class="fill-white font-sans"
  font-size="17"
  font-weight="700"
>
  Vysielame
</text>

{#each [340, 500] as left (left)}
  <rect
    x={left - 4}
    y="76"
    width="128"
    height="112"
    rx="4"
    class="fill-portrait-ground"
  />
{/each}
{#each foam as tile (`${tile.x}-${tile.y}`)}
  <rect x={tile.x + 1} y={tile.y + 1} width="28" height="24" class="fill-scene-line/10" />
  <path
    d={tile.across
      ? `M${tile.x + 4} ${tile.y + 7}h22M${tile.x + 4} ${tile.y + 13}h22M${tile.x + 4} ${tile.y + 19}h22`
      : `M${tile.x + 8} ${tile.y + 4}v18M${tile.x + 15} ${tile.y + 4}v18M${tile.x + 22} ${tile.y + 4}v18`}
    class="stroke-scene-line/25"
    fill="none"
    stroke-width="1.4"
  />
{/each}

<ellipse cx="480" cy="227" rx="20" ry="3" class="fill-scene-line/15" />
<path d="M466 224h28v3h-28Z" class="fill-scene-line/50" />
<rect x="477" y="180" width="6" height="44" class="fill-scene-line/50" />
<ellipse cx="480" cy="178" rx="32" ry="6" class="fill-scene-wood" />
<ellipse cx="480" cy="180" rx="30" ry="3" class="fill-scene-line/12" />
<path
  d="M468 175L462 154M492 175L498 154"
  class="stroke-scene-line/70"
  fill="none"
  stroke-width="2"
/>
<path d="M462 175h12M486 175h12" class="stroke-scene-line/70" stroke-width="2.4" />
{#each [{ x: 459, turn: -18 }, { x: 501, turn: 18 }] as mic (mic.x)}
  <g transform="rotate({mic.turn} {mic.x} 146)">
    <rect
      x={mic.x - 5}
      y="134"
      width="10"
      height="20"
      rx="5"
      class="fill-portrait-vest"
    />
    <path
      d="M{mic.x - 4} 140h8M{mic.x - 4} 144h8"
      class="stroke-scene-edge"
      stroke-width="1"
    />
  </g>
{/each}

<rect x="660" y="52" width="140" height="108" rx="2" class="fill-portrait-bib" />
<rect x="667" y="59" width="126" height="94" class="fill-scene-sky" />
<path
  d="M667 153V126H686V112L696 104L706 112V122H730V108H748V118L762 106L776 118V132H793V153Z"
  class="fill-scene-edge/60"
/>
<path d="M728 59h4v94h-4ZM667 104h126v4H667Z" class="fill-portrait-bib" />
<rect x="654" y="158" width="152" height="7" rx="2" class="fill-portrait-bib" />

<ellipse cx="852" cy="227" rx="26" ry="3" class="fill-scene-line/15" />
<rect x="832" y="140" width="40" height="86" rx="3" class="fill-portrait-vest" />
<circle cx="852" cy="162" r="9" class="fill-scene-line" />
<circle cx="852" cy="162" r="4" class="fill-portrait-vest" />
<circle cx="852" cy="198" r="14" class="fill-scene-line" />
<circle cx="852" cy="198" r="6" class="fill-portrait-vest" />

<Plant x={922} y={240} />
