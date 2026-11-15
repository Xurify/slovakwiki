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
  const BAR_LAMP = 778;
  const BACK = { bottom: 124, left: 800, right: 928, shelves: [60, 94], top: 34 };
  const BENCH_TABLE = 540;
  const CUSHIONS = [
    { paint: "fill-scene-clay", x: 412 },
    { paint: "fill-scene-honey", x: 500 },
    { paint: "fill-scene-plum", x: 580 },
  ];
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
<rect x="392" y="178" width="206" height="4" rx="1.5" class="fill-scene-wood" />
<rect x="394" y="182" width="202" height="27" rx="2" class="fill-scene-green" />
{#each [420, 450, 480, 510, 540, 570] as x (x)}
  <path d="M{x} 185v20" class="stroke-portrait-ink/15" stroke-width="1" />
{/each}
{#each CUSHIONS as { paint, x } (x)}
  <rect x={x - 8} y="194" width="16" height="14" rx="4" class={paint} transform="rotate(-6 {x} 208)" />
  <path d="M{x - 5} 201h10" class="stroke-white/40" stroke-width="0.8" transform="rotate(-6 {x} 208)" />
{/each}
<rect x="392" y="208" width="206" height="7" rx="2.5" class="fill-scene-green-mid" />
<rect x="394" y="215" width="202" height="11" class="fill-scene-coffee/70" />
<path d="M394 217H596" class="stroke-portrait-ink/15" stroke-width="1" />
{#each [388, 596] as x (x)}
  <rect {x} y="174" width="6" height="52" rx="1.5" class="fill-scene-wood" />
  <rect {x} y="174" width="6" height="3" rx="1" class="fill-scene-coffee" />
{/each}

<!-- The banquette's table, out on the floor in front of it, in the gap between the cast's table and where the cast stands. -->
<ellipse cx={BENCH_TABLE} cy="236" rx="11" ry="1.8" class="fill-scene-line/15" />
<path d="M{BENCH_TABLE - 9} 236q9 -4 18 0Z" class="fill-scene-line/80" />
<rect x={BENCH_TABLE - 1.4} y="195" width="2.8" height="40" class="fill-scene-line/80" />
<ellipse cx={BENCH_TABLE} cy="195" rx="14" ry="2.4" class="fill-scene-edge" />
<ellipse cx={BENCH_TABLE} cy="193.4" rx="14" ry="2.4" class="fill-portrait-bib" />
{#each [-7, 5] as dx (dx)}
  <ellipse cx={BENCH_TABLE + dx} cy="193" rx="3.6" ry="0.8" class="fill-white" />
  <path d="M{BENCH_TABLE + dx - 2} 192.6v-3.4h4v3.4Z" class="fill-white" />
  <path d="M{BENCH_TABLE + dx + 2} 189.8q1.8 0 1.8 1.2t-1.8 1.2" class="stroke-white" fill="none" stroke-width="0.7" />
  <path d="M{BENCH_TABLE + dx - 2} 189.4h4" class="stroke-scene-coffee" stroke-width="0.6" />
{/each}

<!-- A macramé hanger on its own hook, clear of the window and of the lamp's cord. -->
<g transform="translate({PARTS.cafe.plant.x} 0)">
  <path d="M-3 6h6" class="stroke-scene-line/60" stroke-width="1.6" />
  <circle cx="0" cy="10" r="2.4" class="stroke-scene-line/60" fill="none" stroke-width="1" />
  <path
    d="M0 12.4L-12 72M0 12.4L0 72M0 12.4L12 72M-6 42L0 52L6 42M-9 58L-3 66M9 58L3 66"
    class="stroke-scene-onion"
    fill="none"
    stroke-width="1.1"
  />
  {#each [[-6, 42], [0, 52], [6, 42], [-0.6, 30]] as [dx, dy] (`${dx} ${dy}`)}
    <circle cx={dx} cy={dy} r="1.5" class="fill-scene-onion" />
  {/each}
  <path d="M0 72v8M-2 80l2 6 2 -6" class="stroke-scene-onion" fill="none" stroke-width="0.9" />
  <path d="M-12 72H12L9 86H-9Z" class="fill-scene-clay" />
  <rect x="-13" y="70" width="26" height="4" rx="1" class="fill-scene-clay" />
  <g class="fill-scene-leaf">
    {#each [[-11, 82], [-14, 92], [-12, 102], [-10, 112], [11, 84], [13, 94], [10, 104], [-4, 90], [5, 92], [3, 102]] as [dx, dy] (`${dx} ${dy}`)}
      <ellipse cx={dx} cy={dy} rx="3.4" ry="2.2" transform="rotate({dx * 3} {dx} {dy})" />
    {/each}
  </g>
  <path
    d="M-11 78Q-15 92 -10 114M11 80Q14 92 10 106M3 84Q4 94 3 104"
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

<path d="M{BAR_LAMP} 6V30" class="stroke-scene-line/60" stroke-width="1.2" />
<path d="M{BAR_LAMP - 5} 6Q{BAR_LAMP} 11 {BAR_LAMP + 5} 6Z" class="fill-portrait-bib" />
<path d="M{BAR_LAMP - 9} 42Q{BAR_LAMP - 9} 30 {BAR_LAMP} 30Q{BAR_LAMP + 9} 30 {BAR_LAMP + 9} 42Z" class="fill-scene-green" />
<ellipse cx={BAR_LAMP} cy="42.6" rx="3.6" ry="2" class="fill-portrait-bib" />

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

<!-- The back bar hangs on the wall, high enough that the machine on the counter clears it at any cast size; below it the wainscot shows through the aisle behind the counter. -->
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
<rect x={BACK.left - 2} y={BACK.bottom} width={BACK.right - BACK.left + 4} height="5" rx="1" class="fill-scene-coffee" />
{#each [BACK.left + 4, BACK.right - 4] as x (x)}
  <rect x={x - 3} y={BACK.bottom + 5} width="6" height="2" rx="0.6" class="fill-scene-coffee" />
  <path d="M{x - 2} {BACK.bottom + 7}h4l-2 4Z" class="fill-scene-coffee" />
{/each}

{#each SYRUPS.slice(0, 7) as paint, index (index)}
  {@const x = 814 + index * 16.6}
  <path d="M{x - 4} {BACK.shelves[0]}v-14q0 -3 2.6 -4v-4h2.8v4q2.6 1 2.6 4v14Z" class={paint} />
  <rect x={x - 3} y={BACK.shelves[0] - 12} width="6" height="5" class="fill-white/80" />
  <rect x={x - 1.4} y={BACK.shelves[0] - 23} width="2.8" height="2" class="fill-portrait-vest" />
{/each}

{#each [810, 822] as x (x)}
  <rect {x} y={BACK.shelves[1] - 16} width="10" height="16" rx="2" class="fill-white/60" />
  <rect x={x + 1.2} y={BACK.shelves[1] - 11.5} width="7.6" height="10.5" rx="1" class="fill-scene-coffee" />
  <rect {x} y={BACK.shelves[1] - 19} width="10" height="3.6" rx="1" class="fill-scene-line/60" />
{/each}
<g transform="translate(856 {BACK.shelves[1]}) scale(0.6)">
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
<g transform="translate(900 {BACK.shelves[1]}) scale(0.82)">
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

{#each [814, 828, 842, 856, 870] as x (x)}
  <path d="M{x} {BACK.shelves[1] + 4}v3q0 2 2 2" class="stroke-scene-steel-dark" fill="none" stroke-width="0.9" />
  <path d="M{x - 4} {BACK.shelves[1] + 10}h8v7q0 2 -2 2h-4q-2 0 -2 -2Z" class="fill-white" />
  <path d="M{x + 4} {BACK.shelves[1] + 12}q3 0 3 2.4t-3 2.4" class="stroke-white" fill="none" stroke-width="1" />
{/each}
{#each [886, 898] as x (x)}
  {#each [0, 1, 2] as level (level)}
    <path d="M{x - 6} {BACK.bottom - level * 4.6}h12l-1 -1.4h-10Z" class="fill-white" />
    <path d="M{x - 3.6} {BACK.bottom - 1.4 - level * 4.6}l0.6 -3h6l0.6 3Z" class="fill-white" />
  {/each}
{/each}
{#each [910, 918] as x (x)}
  <path d="M{x - 3.2} {BACK.bottom}l-0.8 -12h8l-0.8 12Z" class="fill-scene-sky/70 stroke-scene-line/30" stroke-width="0.6" />
{/each}
