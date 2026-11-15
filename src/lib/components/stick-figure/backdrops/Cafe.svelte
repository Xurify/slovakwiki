<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Chalkboard from "./Chalkboard.svelte";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  // A phone shows x 360 to 960 of the café and a desktop 240 to 960: the tables, the bar
  // and its back wall stand inside the phone's part, and nothing straddles 240 or 360.
  // Furniture stands a little out from the wall, on the floor at 246.
  const FLOOR = 246;
  // The third table only a desktop shows. The cast stands from about 600 on, clear of the chairs.
  const TABLES = [296, 420, 516];
  const LAMPS = [420, 516];
  const CHAIRS: Array<[number, 1 | -1]> = [
    [332, -1],
    [384, 1],
    [480, 1],
  ];
  const BACK = { left: 782, right: 946, shelf: 118 };

  /** A bentwood chair seen side on, its seat toward `facing`. */
  function sideChair(x: number, facing: 1 | -1): string {
    const back = x - facing * 13;
    const front = x + facing * 11;
    return [
      `M${back} 218Q${back - facing * 3} 198 ${back - facing * 5} 182q${facing * 2} -3 ${facing * 4} 0`,
      `M${back + facing} 222L${back - facing * 2} ${FLOOR}`,
      `M${front} 222L${front + facing * 3} ${FLOOR}`,
      `M${back + facing * 2} 234H${front}`,
    ].join("");
  }
</script>

<Room wall="fill-scene-warm" floor="fill-scene-sand" />

<g class="stroke-scene-coffee/12" stroke-width="1">
  <path d="M-10 236H970M-10 250H970M-10 268H970M-10 290H970" />
  {#each Array.from({ length: 12 }, (_, index) => 30 + index * 84) as x, index (x)}
    <path d="M{x + (index % 2) * 40} 236v14M{x + 20} 250v18M{x + 56} 268v22" />
  {/each}
</g>

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
  <path
    d="M{x - 4} 114h8M{x - 4} 118h6M{x - 4} 122h8M{x - 4} 126h5"
    class="stroke-scene-line/40"
    stroke-width="0.8"
  />
{/each}


<rect x="400" y="38" width="164" height="144" rx="2" class="fill-portrait-bib" />
<rect x="408" y="46" width="148" height="128" class="fill-scene-sky" />
<path d="M408 174V124H436V104H476V128H516V112H556V174Z" class="fill-scene-clay/80" />
<path d="M516 174V140H556V174ZM436 174V136H476V174Z" class="fill-scene-honey/80" />
<path
  d="M444 112h8v10h-8ZM460 112h8v10h-8ZM524 120h8v10h-8ZM542 120h8v10h-8Z"
  class="fill-portrait-bib/80"
/>
<path d="M457 46v128M507 46v128M408 100h148" class="stroke-portrait-bib" stroke-width="4" />
<path d="M414 62l22 -14M414 80l34 -24" class="stroke-white/70" stroke-width="2" />
<path d="M404 128h156" class="stroke-scene-line/60" stroke-width="1.6" />
<path
  d="M408 128H556V172Q547 175 538 172Q529 175 520 172Q511 175 502 172Q493 175 484 172Q475 175 466 172Q457 175 448 172Q439 175 430 172Q421 175 412 172Q410 173 408 172Z"
  class="fill-white/80"
/>
<path d="M426 130v40M444 130v40M462 130v40M480 130v40M498 130v40M516 130v40M534 130v40" class="stroke-scene-line/10" stroke-width="1.2" />
<rect x="394" y="180" width="176" height="7" rx="2" class="fill-scene-wood" />

<g transform="translate({PARTS.cafe.plant.x} 0)">
  <path d="M0 -10V70M0 70L-12 86M0 70L12 86" class="stroke-scene-coffee/70" stroke-width="1" />
  <path d="M-12 86H12L9 100H-9Z" class="fill-scene-clay" />
  <rect x="-13" y="84" width="26" height="4" rx="1" class="fill-scene-clay" />
  <g class="fill-scene-leaf">
    {#each [[-11, 96], [-14, 106], [-12, 116], [-10, 126], [11, 98], [13, 108], [10, 118], [-4, 104], [5, 106], [3, 116]] as [dx, dy] (`${dx} ${dy}`)}
      <ellipse cx={dx} cy={dy} rx="3.4" ry="2.2" transform="rotate({dx * 3} {dx} {dy})" />
    {/each}
  </g>
  <path d="M-11 92Q-15 106 -10 128M11 94Q14 106 10 120M3 98Q4 108 3 118" class="stroke-scene-leaf" stroke-width="0.8" fill="none" />
</g>


{#each LAMPS as x (x)}
  <path d="M{x} -10V40" class="stroke-scene-line/40" stroke-width="1.2" />
  <path d="M{x - 16} 56Q{x - 16} 40 {x} 40Q{x + 16} 40 {x + 16} 56Z" class="fill-scene-green" />
  <ellipse cx={x} cy="56" rx="16" ry="2.4" class="fill-scene-line/15" />
  <ellipse cx={x} cy="57" rx="5" ry="2.6" class="fill-portrait-bib" />
{/each}
{#each TABLES as x (x)}
  <ellipse cx={x} cy={FLOOR} rx="46" ry="3.5" class="fill-scene-line/12" />
{/each}

<g class="stroke-scene-coffee" fill="none" stroke-width="2.6">
  {#each CHAIRS as [x, facing] (x)}
    <path d={sideChair(x, facing)} />
  {/each}
</g>
{#each CHAIRS as [x, facing] (x)}
  <rect x={Math.min(x - facing * 14, x + facing * 13)} y="217" width="27" height="5" rx="2" class="fill-scene-coffee" />
{/each}

{#each TABLES as x (x)}
  <path d="M{x - 1.5} 206h3v38h-3Z" class="fill-scene-line/80" />
  <path d="M{x - 13} {FLOOR}q13 -8 26 0Z" class="fill-scene-line/80" />
  <ellipse cx={x} cy="204" rx="30" ry="4.5" class="fill-scene-edge" />
  <ellipse cx={x} cy="202" rx="30" ry="4.5" class="fill-portrait-bib" />
{/each}
<g transform="translate(-20 0)">
  <path d="M420 201h14M446 201h14" class="stroke-scene-line/40" stroke-width="1.6" />
  <path d="M422 200v-6h10v6ZM448 200v-6h10v6Z" class="fill-white" />
  <path d="M432 195q4 0 4 2.5t-4 2.5M458 195q4 0 4 2.5t-4 2.5" class="stroke-white" fill="none" stroke-width="1.4" />
  <path d="M422 194h10M448 194h10" class="stroke-scene-coffee" stroke-width="1.2" />
  <rect x="437" y="191" width="6" height="9" rx="2" class="fill-scene-sky" />
  <path d="M440 191v-9" class="stroke-scene-leaf" stroke-width="1.2" />
  <circle cx="440" cy="181" r="3" class="fill-scene-red-mid" />
</g>
<g transform="translate(-28 0)">
  <ellipse cx="540" cy="200.5" rx="9" ry="1.6" class="fill-white" />
  <path d="M534 200l12 -1v-5l-12 4Z" class="fill-scene-honey" />
  <path d="M534 198l12 -4" class="stroke-white" stroke-width="1.2" />
  <path d="M556 201h12M558 200v-6h8v6Z" class="fill-white stroke-scene-line/30" stroke-width="0.8" />
</g>
<path d="M286 201h14M289 200v-6h8v6Z" class="fill-white stroke-scene-line/30" stroke-width="0.8" />
<rect x="303" y="199" width="12" height="2" class="fill-white" />
<path d="M304 199v-1h10v1" class="stroke-scene-line/40" stroke-width="0.6" />

<path
  d="M{PARTS.cafe.clock.x - 1} {PARTS.cafe.clock.y - PARTS.cafe.clock.r - 3}h2v3h-2Z"
  class="fill-scene-line"
/>
<WallClock clock={PARTS.cafe.clock} {hour} />

<path d="M693 23L714 12L735 23" class="stroke-scene-line/60" fill="none" stroke-width="0.8" />
<circle cx="714" cy="12" r="1.4" class="fill-scene-line" />
<g transform="translate(0 10)">
<rect x="696" y="16" width="44" height="56" class="fill-scene-line/10" />
<rect x="692" y="12" width="44" height="56" class="fill-scene-red" />
<rect x="696" y="16" width="36" height="48" class="fill-scene-honey" />
<path d="M704 44h20v4q0 8 -10 8t-10 -8Z" class="fill-white" />
<path d="M724 46q5 0 5 3t-5 3" class="stroke-white" fill="none" stroke-width="1.6" />
<path d="M700 57h28" class="stroke-white" stroke-width="2" />
<path d="M710 40q-3 -4 0 -8t0 -8M718 40q-3 -4 0 -8t0 -8" class="stroke-scene-coffee/60" fill="none" stroke-width="1.2" />
<text x="714" y="22.5" text-anchor="middle" class="fill-scene-coffee font-sans" font-size="6" font-weight="700">
  Káva
</text>
</g>

<path d="M808 -10V8M920 -10V8" class="stroke-scene-line/50" stroke-width="1.2" />
<Chalkboard x={794} y={14} width={140} height={50}>
  <text x="70" y="12" text-anchor="middle" font-size="12">Menu</text>
  <text x="8" y="25" font-size="10.5">Káva</text>
  <text x="132" y="25" text-anchor="end" font-size="10.5">2,50&nbsp;€</text>
  <text x="8" y="36" font-size="10.5">Čaj</text>
  <text x="132" y="36" text-anchor="end" font-size="10.5">2,00&nbsp;€</text>
  <text x="8" y="47" font-size="10.5">Koláč</text>
  <text x="132" y="47" text-anchor="end" font-size="10.5">3,00&nbsp;€</text>
</Chalkboard>

<rect x={BACK.left} y={BACK.shelf} width={BACK.right - BACK.left} height="4" rx="1" class="fill-scene-coffee" />
<path
  d="M788 {BACK.shelf + 4}l8 8v-8ZM940 {BACK.shelf + 4}l-8 8v-8Z"
  class="fill-scene-coffee"
/>
{#each [792, 806] as x (x)}
  <rect {x} y={BACK.shelf - 18} width="12" height="18" rx="2" class="fill-white/60" />
  <rect x={x + 1.5} y={BACK.shelf - 13} width="9" height="12" rx="1" class="fill-scene-coffee" />
  <rect {x} y={BACK.shelf - 21} width="12" height="4" rx="1" class="fill-scene-line/60" />
{/each}
<g transform="translate(846 {BACK.shelf}) scale(0.82)">
  <rect x="-1.5" y="-7" width="3" height="7" class="fill-scene-edge" />
  <ellipse cx="0" cy="-7" rx="24" ry="2.6" class="fill-scene-edge" />
  <path d="M-18 -9V-22Q0 -27 18 -22V-9Z" class="fill-scene-honey" />
  <path d="M-18 -22Q0 -27 18 -22V-18Q9 -14 0 -19Q-9 -14 -18 -18Z" class="fill-portrait-bib" />
  <path d="M0 -9V-24" class="stroke-scene-coffee/30" stroke-width="1" />
  <path d="M-22 -7V-29A22 22 0 0 1 22 -29V-7Z" class="fill-scene-sky/50 stroke-scene-line/50" stroke-width="1" />
  <circle cx="0" cy="-52" r="2.4" class="fill-scene-line/60" />
  <path d="M-17 -28a17 17 0 0 1 9 -12" class="stroke-white/80" fill="none" stroke-width="2" />
</g>
<g transform="translate(906 {BACK.shelf})">
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
{#each [866, 880, 894, 908, 922] as x (x)}
  <path d="M{x} {BACK.shelf + 4}v3" class="stroke-scene-steel-dark" stroke-width="0.8" />
  <path d="M{x - 4} {BACK.shelf + 7}h8v6q0 2 -2 2h-4q-2 0 -2 -2Z" class="fill-white" />
  <path d="M{x + 4} {BACK.shelf + 9}q3 0 3 2t-3 2" class="stroke-white" fill="none" stroke-width="1" />
{/each}
