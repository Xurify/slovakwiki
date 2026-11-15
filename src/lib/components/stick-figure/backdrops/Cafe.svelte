<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Chalkboard from "./Chalkboard.svelte";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  // A phone shows x 360 to 960 of the café and a desktop 240 to 960: the window, the bar
  // and the back bar stand inside the phone's part, and nothing straddles 240 or 360.
  // The table and its chairs are the cast's (CAFE_SET), so they keep their size against people.
  const LAMP = 466;
  const BACK = { left: 782, right: 946, top: 40, shelves: [66, 112, 150] };
  const SYRUPS = [
    "fill-scene-red",
    "fill-scene-honey",
    "fill-scene-green-mid",
    "fill-scene-coffee",
    "fill-scene-plum",
    "fill-scene-carrot",
    "fill-scene-red-mid",
    "fill-scene-green",
  ];
</script>

<Room wall="fill-scene-warm" floor="fill-scene-sand" />

<g class="stroke-scene-coffee/12" stroke-width="1">
  <path d="M-10 236H970M-10 250H970M-10 268H970M-10 290H970" />
  {#each Array.from({ length: 12 }, (_, index) => 30 + index * 84) as x, index (x)}
    <path d="M{x + (index % 2) * 40} 236v14M{x + 20} 250v18M{x + 56} 268v22" />
  {/each}
</g>

<rect x="-10" y="-10" width="980" height="16" class="fill-scene-wood/50" />
<rect x="-10" y="6" width="980" height="2" class="fill-scene-coffee/30" />

<rect x="-10" y="168" width="980" height="58" class="fill-scene-wood/45" />
{#each Array.from({ length: 16 }, (_, index) => -2 + index * 62) as x (x)}
  <rect {x} y="176" width="50" height="40" rx="2" class="fill-scene-coffee/8" />
{/each}
<rect x="-10" y="164" width="980" height="5" class="fill-scene-wood" />
<rect x="-10" y="220" width="980" height="6" class="fill-scene-coffee/40" />

<!-- Left of what a desktop shows. -->
<path d="M50 204V112A88 88 0 0 1 226 112V204Z" class="fill-portrait-bib" />
<path d="M60 200V112A78 78 0 0 1 216 112V200Z" class="fill-scene-sky" />
<path d="M60 200V150H94V132H140V154H174V142H216V200Z" class="fill-scene-clay" />
<path d="M136 34h4v166h-4ZM60 126h156v4H60Z" class="fill-portrait-bib" />
<rect x="42" y="200" width="192" height="9" rx="3" class="fill-scene-wood" />

<!-- Shown from a desktop on: the town's castle framed, and the day's papers on their sticks. -->
<path d="M272 41L298 30L324 41" class="stroke-scene-line/60" fill="none" stroke-width="0.8" />
<circle cx="298" cy="30" r="1.4" class="fill-scene-line" />
<rect x="274" y="44" width="56" height="44" class="fill-scene-line/10" />
<rect x="270" y="40" width="56" height="44" class="fill-scene-coffee" />
<rect x="275" y="45" width="46" height="34" class="fill-scene-sky" />
<path d="M275 79V70H321V79Z" class="fill-scene-leaf" />
<path d="M284 70V58h4v-3h3v3h14v-3h3v3h4v12Z" class="fill-white" />
<path d="M288 62h20" class="stroke-scene-clay" stroke-width="1.4" />
<rect x="276" y="104" width="44" height="4" rx="1" class="fill-scene-coffee" />
<circle cx="279" cy="106" r="0.9" class="fill-scene-steel-light" />
<circle cx="317" cy="106" r="0.9" class="fill-scene-steel-light" />
{#each [282, 296, 310] as x, index (x)}
  <rect x={x - 1} y="102" width="2" height="8" class="fill-scene-coffee" />
  <rect x={x - 6} y="108" width="12" height={44 - index * 6} class="fill-white" />
  <rect x={x - 5} y="110" width="10" height="3" class="fill-portrait-ink" />
  <path
    d="M{x - 4} 117h8M{x - 4} 121h6M{x - 4} 125h8M{x - 4} 129h5"
    class="stroke-scene-line/40"
    stroke-width="0.8"
  />
{/each}

<!-- The window, its sill above the table's top at any cast size. -->
<rect x="400" y="20" width="164" height="132" rx="2" class="fill-portrait-bib" />
<rect x="408" y="28" width="148" height="116" class="fill-scene-sky" />
<path d="M408 144V96H436V76H476V100H516V84H556V144Z" class="fill-scene-clay/80" />
<path d="M516 144V112H556V144ZM436 144V108H476V144Z" class="fill-scene-honey/80" />
<path
  d="M444 84h8v10h-8ZM460 84h8v10h-8ZM524 92h8v10h-8ZM542 92h8v10h-8Z"
  class="fill-portrait-bib/80"
/>
<path d="M457 28v116M507 28v116M408 76h148" class="stroke-portrait-bib" stroke-width="4" />
<path d="M414 44l22 -14M414 62l34 -24" class="stroke-white/70" stroke-width="2" />
<path d="M404 104h156" class="stroke-scene-line/60" stroke-width="1.6" />
<path
  d="M408 104H556V142Q547 145 538 142Q529 145 520 142Q511 145 502 142Q493 145 484 142Q475 145 466 142Q457 145 448 142Q439 145 430 142Q421 145 412 142Q410 143 408 142Z"
  class="fill-white/80"
/>
<path
  d="M426 106v34M444 106v34M462 106v34M480 106v34M498 106v34M516 106v34M534 106v34"
  class="stroke-scene-line/10"
  stroke-width="1.2"
/>
<rect x="394" y="150" width="176" height="7" rx="2" class="fill-scene-wood" />

<g transform="translate({PARTS.cafe.plant.x} 0)">
  <path d="M0 6V58M0 58L-12 74M0 58L12 74" class="stroke-scene-coffee/70" stroke-width="1" />
  <path d="M-12 74H12L9 88H-9Z" class="fill-scene-clay" />
  <rect x="-13" y="72" width="26" height="4" rx="1" class="fill-scene-clay" />
  <g class="fill-scene-leaf">
    {#each [[-11, 84], [-14, 94], [-12, 104], [-10, 114], [11, 86], [13, 96], [10, 106], [-4, 92], [5, 94], [3, 104]] as [dx, dy] (`${dx} ${dy}`)}
      <ellipse cx={dx} cy={dy} rx="3.4" ry="2.2" transform="rotate({dx * 3} {dx} {dy})" />
    {/each}
  </g>
  <path
    d="M-11 80Q-15 94 -10 116M11 82Q14 94 10 108M3 86Q4 96 3 106"
    class="stroke-scene-leaf"
    stroke-width="0.8"
    fill="none"
  />
</g>

<!-- The pendant hangs in front of the window: its shadow falls on the frame behind it. -->
<ellipse cx={LAMP + 6} cy="62" rx="16" ry="4" class="fill-scene-line/12" />
<path d="M{LAMP} 6V40" class="stroke-scene-line/60" stroke-width="1.2" />
<rect x={LAMP - 3} y="5" width="6" height="2.4" rx="1" class="fill-scene-coffee" />
<path d="M{LAMP - 16} 56Q{LAMP - 16} 40 {LAMP} 40Q{LAMP + 16} 40 {LAMP + 16} 56Z" class="fill-scene-green" />
<ellipse cx={LAMP} cy="56" rx="16" ry="2.4" class="fill-scene-line/15" />
<ellipse cx={LAMP} cy="57" rx="5" ry="2.6" class="fill-portrait-bib" />

<path
  d="M{PARTS.cafe.clock.x - 1} {PARTS.cafe.clock.y - PARTS.cafe.clock.r - 3}h2v3h-2Z"
  class="fill-scene-line"
/>
<WallClock clock={PARTS.cafe.clock} {hour} />

<path d="M650 -10V12M746 -10V12" class="stroke-scene-line/50" stroke-width="1.2" />
<Chalkboard x={642} y={18} width={112} height={46}>
  <text x="56" y="12" text-anchor="middle" font-size="11">Menu</text>
  <text x="7" y="23" font-size="9.5">Káva</text>
  <text x="105" y="23" text-anchor="end" font-size="9.5">2,50&nbsp;€</text>
  <text x="7" y="33.5" font-size="9.5">Čaj</text>
  <text x="105" y="33.5" text-anchor="end" font-size="9.5">2,00&nbsp;€</text>
  <text x="7" y="44" font-size="9.5">Koláč</text>
  <text x="105" y="44" text-anchor="end" font-size="9.5">3,00&nbsp;€</text>
</Chalkboard>

<!-- The back bar, standing on the floor behind the counter: syrups on top, cakes and cups below. -->
<rect x={BACK.left} y={BACK.top} width={BACK.right - BACK.left} height={226 - BACK.top} class="fill-scene-coffee/25" />
<rect x={BACK.left} y={BACK.top - 6} width={BACK.right - BACK.left} height="7" rx="1" class="fill-scene-coffee" />
<text
  x={(BACK.left + BACK.right) / 2}
  y={BACK.top - 0.6}
  text-anchor="middle"
  class="fill-scene-honey font-sans"
  font-size="5.5"
  font-weight="700"
  letter-spacing="1.5"
>
  KAVIAREŇ
</text>
<rect x={BACK.left} y={BACK.top} width="6" height={226 - BACK.top} class="fill-scene-coffee" />
<rect x={BACK.right - 6} y={BACK.top} width="6" height={226 - BACK.top} class="fill-scene-coffee" />
{#each BACK.shelves as y (y)}
  <rect x={BACK.left + 6} {y} width={BACK.right - BACK.left - 12} height="4" class="fill-scene-coffee" />
{/each}
<rect x={BACK.left + 6} y="154" width={BACK.right - BACK.left - 12} height="72" class="fill-scene-wood" />
<path d="M{(BACK.left + BACK.right) / 2} 158v64" class="stroke-scene-line/25" stroke-width="1" />

{#each SYRUPS as paint, index (index)}
  {@const x = 796 + index * 18}
  <path d="M{x - 4} {BACK.shelves[0]}v-14q0 -3 2.6 -4v-4h2.8v4q2.6 1 2.6 4v14Z" class={paint} />
  <rect x={x - 3} y={BACK.shelves[0] - 12} width="6" height="5" class="fill-white/80" />
  <rect x={x - 1.4} y={BACK.shelves[0] - 23} width="2.8" height="2" class="fill-portrait-vest" />
{/each}

{#each [794, 808] as x (x)}
  <rect {x} y={BACK.shelves[1] - 18} width="12" height="18" rx="2" class="fill-white/60" />
  <rect x={x + 1.5} y={BACK.shelves[1] - 13} width="9" height="12" rx="1" class="fill-scene-coffee" />
  <rect {x} y={BACK.shelves[1] - 21} width="12" height="4" rx="1" class="fill-scene-line/60" />
{/each}
<g transform="translate(848 {BACK.shelves[1]}) scale(0.78)">
  <rect x="-1.5" y="-7" width="3" height="7" class="fill-scene-edge" />
  <ellipse cx="0" cy="-7" rx="24" ry="2.6" class="fill-scene-edge" />
  <path d="M-18 -9V-20H18V-9Z" class="fill-scene-onion" />
  <path d="M-18 -20H18V-17H-18Z" class="fill-white" />
  <path d="M-18 -14H18" class="stroke-scene-plum" stroke-width="2" />
  <path d="M-6 -20V-9M6 -20V-9" class="stroke-scene-coffee/40" stroke-width="0.8" />
  {#each [-13, -5, 3, 11] as x (x)}
    <circle cx={x} cy="-21.6" r="2" class="fill-scene-red" />
  {/each}
  <path
    d="M-22 -7V-29A22 22 0 0 1 22 -29V-7Z"
    class="fill-white/25 stroke-scene-line/50"
    stroke-width="1.2"
  />
  <circle cx="0" cy="-52" r="2.4" class="fill-scene-line/70" />
  <path d="M-17 -28a17 17 0 0 1 9 -12" class="stroke-white" fill="none" stroke-width="2" />
</g>
<g transform="translate(906 {BACK.shelves[1]})">
  <path d="M-18 0h36l-2 -2h-32Z" class="fill-scene-steel" />
  <rect x="-1.5" y="-6" width="3" height="5" class="fill-scene-steel" />
  <rect x="-16" y="-24" width="32" height="18" rx="2" class="fill-scene-honey" />
  <path d="M-16 -18h32v2.4h-32ZM-16 -12h32v2.4h-32Z" class="fill-scene-clay" />
  <rect x="-17" y="-28" width="34" height="6" rx="3" class="fill-portrait-bib" />
  {#each [-11, -4, 4, 11] as x (x)}
    <circle cx={x} cy="-28" r="2.4" class="fill-portrait-bib" />
    <circle cx={x} cy="-30.4" r="1.6" class="fill-scene-red" />
  {/each}
</g>

{#each [800, 816, 832, 848, 864, 880, 896, 912, 928] as x (x)}
  <path d="M{x} {BACK.shelves[1] + 4}v3q0 2 2 2" class="stroke-scene-steel-dark" fill="none" stroke-width="0.9" />
  <path d="M{x - 4} {BACK.shelves[1] + 10}h8v7q0 2 -2 2h-4q-2 0 -2 -2Z" class="fill-white" />
  <path d="M{x + 4} {BACK.shelves[1] + 12}q3 0 3 2.4t-3 2.4" class="stroke-white" fill="none" stroke-width="1" />
{/each}

{#each [804, 830, 856] as x (x)}
  {#each [0, 1, 2] as level (level)}
    <path d="M{x - 7} {BACK.shelves[2] - level * 5}h14l-1 -1.4h-12Z" class="fill-white" />
    <path d="M{x - 4} {BACK.shelves[2] - 1.4 - level * 5}l0.6 -3.4h6.8l0.6 3.4Z" class="fill-white" />
  {/each}
{/each}
{#each [884, 896, 908, 920, 932] as x (x)}
  <path d="M{x - 3.5} {BACK.shelves[2]}l-1 -14h9l-1 14Z" class="fill-scene-sky/70 stroke-scene-line/30" stroke-width="0.6" />
{/each}
