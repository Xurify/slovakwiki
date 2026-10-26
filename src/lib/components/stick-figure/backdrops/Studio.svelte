<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Plant from "./Plant.svelte";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  /** Acoustic foam behind the hosts, its wedges turned a quarter each tile. */
  const panels = [350, 520];
  const foam = panels.flatMap((left) =>
    Array.from({ length: 12 }, (_, index) => ({
      across: (index % 3) % 2 === Math.floor(index / 3) % 2,
      x: left + (index % 3) * 30,
      y: 80 + Math.floor(index / 3) * 26,
    })),
  );

  const wave = [3, 7, 4, 10, 6, 12, 5, 9, 4, 11, 7, 5, 8, 3];
</script>

<Room wall="fill-scene-cool" floor="fill-scene-wood" />
<ellipse cx="480" cy="272" rx="270" ry="20" class="fill-portrait-ground" />
<ellipse cx="480" cy="272" rx="246" ry="13" class="fill-white/20" />

<!-- Everything sits between x 180 and 780, all a phone's 2:1 stage shows, so nothing named is cut in half. -->
<rect x="190" y="40" width="72" height="186" rx="2" class="fill-portrait-bib" />
<rect x="196" y="46" width="60" height="180" class="fill-scene-wood" />
<rect x="202" y="128" width="48" height="86" rx="2" class="fill-scene-line/10" />
<circle cx="226" cy="84" r="12" class="fill-portrait-bib" />
<circle cx="226" cy="84" r="9" class="fill-scene-sky" />
<rect x="238" y="140" width="12" height="4" rx="2" class="fill-scene-line/70" />
<circle cx="241" cy="142" r="3" class="fill-scene-line/70" />

<WallClock clock={PARTS.studio.clock} {hour} />

<path d="M444 -10V22M516 -10V22" class="stroke-scene-line/40" stroke-width="1.2" />
<rect x="404" y="18" width="152" height="42" rx="9" class="fill-scene-red/20" />
<rect x="410" y="22" width="140" height="34" rx="6" class="fill-scene-red" />
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

{#each panels as left (left)}
  <rect x={left - 4} y="76" width="98" height="112" rx="4" class="fill-portrait-ground" />
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

<!-- Stands where the hosts do, at the front, so the mics come up to their mouths. -->
<ellipse cx="480" cy="289" rx="24" ry="4" class="fill-scene-line/15" />
<ellipse cx="480" cy="286" rx="17" ry="3.5" class="fill-scene-line/60" />
<rect x="476.5" y="212" width="7" height="74" class="fill-scene-line/60" />
<ellipse cx="480" cy="210" rx="30" ry="6" class="fill-scene-wood" />
<ellipse cx="480" cy="212" rx="28" ry="3" class="fill-scene-line/12" />
<!-- Two desk arms, one per host, each holding a broadcast mic level with their mouth. -->
{#each [-1, 1] as side (side)}
  {@const elbow = { x: 480 + side * 12, y: 168 }}
  {@const tip = { x: 480 + side * 24, y: 136 }}
  <rect
    x={480 + side * 6 - 3}
    y="203"
    width="6"
    height="7"
    rx="1"
    class="fill-scene-line/70"
  />
  <path
    d="M{480 + side * 6} 205L{elbow.x} {elbow.y}L{tip.x} {tip.y}"
    class="stroke-scene-line/70"
    fill="none"
    stroke-width="2.6"
  />
  <circle cx={elbow.x} cy={elbow.y} r="2.6" class="fill-scene-line/80" />
  <g transform="translate({tip.x + side * 9} {tip.y - 3}) rotate({-side * 6})">
    <ellipse
      cx="0"
      cy="0"
      rx="3.2"
      ry="9"
      class="stroke-scene-line/80"
      fill="none"
      stroke-width="1.4"
    />
    <rect x="-14" y="-6.5" width="28" height="13" rx="6.5" class="fill-portrait-vest" />
    <rect
      x={side > 0 ? 1 : -14}
      y="-6.5"
      width="13"
      height="13"
      rx="6"
      class="fill-scene-line"
    />
    {#each [4, 7.5, 11] as offset (offset)}
      <path d="M{side * offset} -5V5" class="stroke-portrait-vest/70" stroke-width="1" />
    {/each}
    <path d="M{-side * 9} -4.5h{side * 6}" class="stroke-white/25" stroke-width="1.2" />
  </g>
{/each}

<rect x="636" y="36" width="124" height="88" rx="2" class="fill-portrait-bib" />
<rect x="643" y="43" width="110" height="74" class="fill-scene-sky" />
<path
  d="M643 117V96H658V84L667 77L676 84V92H698V80H714V88L726 78L738 88V100H753V117Z"
  class="fill-scene-edge/60"
/>
<path d="M696 43h4v74h-4ZM643 78h110v4H643Z" class="fill-portrait-bib" />
<rect x="630" y="122" width="136" height="6" rx="2" class="fill-portrait-bib" />

<ellipse cx="702" cy="227" rx="76" ry="4" class="fill-scene-line/12" />
<path d="M634 178h5v48h-5ZM765 178h5v48h-5Z" class="fill-scene-line/50" />
<rect x="636" y="202" width="132" height="4" class="fill-scene-line/30" />
<rect x="626" y="170" width="152" height="10" rx="2" class="fill-scene-wood" />
<rect x="630" y="178" width="144" height="3" class="fill-scene-line/12" />

<rect x="642" y="132" width="50" height="34" rx="2" class="fill-portrait-vest" />
<rect x="645" y="135" width="44" height="28" rx="1" class="fill-scene-sky" />
<path
  d="M{wave
    .map((height, index) => `${648 + index * 3} ${149 - height / 2}v${height}`)
    .join('M')}"
  class="stroke-scene-blue"
  fill="none"
  stroke-width="1.6"
/>
<path d="M634 170l6-4h54l6 4Z" class="fill-scene-edge" />

<path
  d="M714 168Q714 146 730 146Q746 146 746 168"
  class="stroke-portrait-vest"
  fill="none"
  stroke-width="3.5"
/>
<rect x="708" y="157" width="10" height="13" rx="4" class="fill-portrait-vest" />
<rect x="742" y="157" width="10" height="13" rx="4" class="fill-portrait-vest" />

<Plant plant={PARTS.studio.plant} />
