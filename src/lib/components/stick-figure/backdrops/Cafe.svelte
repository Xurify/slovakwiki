<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Chalkboard from "./Chalkboard.svelte";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  // A phone shows x 360 to 960 of the café and a desktop 240 to 960: the window, the bar
  // and the back bar stand inside the phone's part, and nothing straddles 240 or 360.
  // The window table, its chairs and the bar stools are the cast's (CAFE_SET), so they keep their size against people.
  const LAMP = 466;
  const BACK = { bottom: 154, left: 782, right: 946, shelves: [66, 112, 150], top: 40 };
  const BANQUETTE_TABLES = [392, 580];
  const BANQUETTE_TUFTS = [400, 430, 460, 490, 520, 550, 574];
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

<!-- Shown from a desktop on: the street door, and a coat stand beside it. -->
<rect x="248" y="68" width="60" height="158" class="fill-scene-coffee" />
<rect x="254" y="74" width="48" height="152" class="fill-scene-wood" />
<rect x="260" y="80" width="36" height="88" rx="1" class="fill-scene-sky" />
<path d="M260 150H296V168H260Z" class="fill-scene-clay/60" />
<path d="M264 92l14 -10M264 110l24 -18" class="stroke-white/70" stroke-width="1.6" />
<rect x="260" y="178" width="36" height="38" rx="1" class="fill-scene-coffee/20" />
<path d="M292 128v26" class="stroke-scene-steel-dark" stroke-width="2.4" stroke-linecap="round" />
<path d="M270 98l8 -8 8 8" class="stroke-scene-line/50" fill="none" stroke-width="0.6" />
<rect x="263" y="98" width="30" height="10" rx="1.5" class="fill-white" />
<text x="278" y="105.4" text-anchor="middle" class="fill-scene-green font-sans" font-size="5.4" font-weight="700">
  Otvorené
</text>
<rect x="244" y="224" width="68" height="3" class="fill-scene-steel" />

<ellipse cx="336" cy="227" rx="13" ry="2.4" class="fill-scene-line/12" />
<path d="M336 96V224M326 226l10 -5 10 5" class="stroke-scene-coffee" stroke-width="2.6" />
<path d="M336 102l-9 -5M336 102l9 -5" class="stroke-scene-coffee" stroke-width="1.8" />
<circle cx="336" cy="94" r="2.6" class="fill-scene-coffee" />
<path d="M344 100L334 108L332 156H356L354 108Z" class="fill-scene-plum" />
<path d="M339 103l5 9 5 -9Z" class="fill-scene-plum/70" />
<path d="M344 112V154" class="stroke-portrait-ink/20" stroke-width="0.8" />
<path d="M322 97q6 -7 12 0Z" class="fill-scene-clay" />
<rect x="320" y="96" width="16" height="2.4" rx="1" class="fill-scene-clay" />

<!-- The window, its sill above the table's top at any cast size. -->
<rect x="400" y="20" width="164" height="132" rx="2" class="fill-portrait-bib" />
<rect x="408" y="28" width="148" height="116" class="fill-scene-sky" />
<path d="M408 94V60H436V44H476V64H516V52H556V94Z" class="fill-scene-clay/80" />
<path d="M436 94V70H476V94ZM516 94V74H556V94Z" class="fill-scene-honey/80" />
<path
  d="M444 50h8v8h-8ZM460 50h8v8h-8ZM524 58h8v8h-8ZM542 58h8v8h-8ZM444 78h8v8h-8ZM524 80h8v8h-8Z"
  class="fill-portrait-bib/80"
/>
<rect x="408" y="94" width="148" height="10" class="fill-scene-steel-light" />
<path d="M408 98H556" class="stroke-scene-steel/70" stroke-width="1" />
<path d="M492 98V66M492 66h-5" class="stroke-scene-line/60" fill="none" stroke-width="1.2" />
<rect x="484" y="65" width="6" height="3" rx="1" class="fill-scene-line/60" />
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

<!-- A banquette against the far wall, drawn smaller than the cast's table because it stands further back. -->
<rect x="372" y="172" width="228" height="4" rx="1.5" class="fill-scene-wood" />
<rect x="374" y="176" width="224" height="24" rx="2" class="fill-scene-green" />
{#each BANQUETTE_TUFTS as x (x)}
  <path d="M{x} 179v18" class="stroke-portrait-ink/15" stroke-width="1" />
{/each}
<rect x="372" y="199" width="228" height="7" rx="2.5" class="fill-scene-green-mid" />
<rect x="374" y="206" width="224" height="20" class="fill-scene-coffee/70" />
<path d="M374 208H598" class="stroke-portrait-ink/15" stroke-width="1" />
{#each [368, 598] as x (x)}
  <rect {x} y="168" width="6" height="58" rx="1.5" class="fill-scene-wood" />
  <rect {x} y="168" width="6" height="3" rx="1" class="fill-scene-coffee" />
{/each}
{#each BANQUETTE_TABLES as x (x)}
  <ellipse cx={x} cy="225" rx="7" ry="1.6" class="fill-scene-line/15" />
  <path d="M{x - 6} 225q6 -3 12 0Z" class="fill-scene-line/70" />
  <path d="M{x} 192V224" class="stroke-scene-line/70" stroke-width="1.6" />
  <ellipse cx={x} cy="191" rx="12" ry="1.8" class="fill-scene-edge" />
  <ellipse cx={x} cy="190" rx="12" ry="1.8" class="fill-portrait-bib" />
  <path d="M{x - 6} 189.6v-2.6h3.6v2.6ZM{x + 2} 189.6v-2.6h3.6v2.6Z" class="fill-white" />
  <path d="M{x - 6} 187h3.6M{x + 2} 187h3.6" class="stroke-scene-coffee" stroke-width="0.5" />
{/each}

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

<path d="M{LAMP} 6V40" class="stroke-scene-line/60" stroke-width="1.2" />
<path d="M{LAMP - 7} 6Q{LAMP} 12 {LAMP + 7} 6Z" class="fill-portrait-bib" />
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

<!-- The back bar hangs on the wall: below it the wainscot shows through the aisle behind the counter. -->
<rect x={BACK.left} y={BACK.top} width={BACK.right - BACK.left} height={BACK.bottom - BACK.top} class="fill-scene-coffee/25" />
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
<rect x={BACK.left} y={BACK.top} width="6" height={BACK.bottom - BACK.top} class="fill-scene-coffee" />
<rect x={BACK.right - 6} y={BACK.top} width="6" height={BACK.bottom - BACK.top} class="fill-scene-coffee" />
{#each BACK.shelves as y (y)}
  <rect x={BACK.left + 6} {y} width={BACK.right - BACK.left - 12} height="4" class="fill-scene-coffee" />
{/each}
<rect x={BACK.left - 2} y={BACK.bottom} width={BACK.right - BACK.left + 4} height="4" rx="1" class="fill-scene-coffee" />
{#each [BACK.left + 12, BACK.right - 12] as x (x)}
  <path d="M{x - 1} {BACK.bottom + 4}h2v8l-6 -6v-2Z" class="fill-scene-coffee" />
{/each}

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
