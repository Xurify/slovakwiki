<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Chalkboard from "./Chalkboard.svelte";
  import Plant from "./Plant.svelte";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  // A phone shows x 360 to 960 of the café and a desktop 240 to 960: the window table,
  // the bar and its back wall stand inside the phone's part, and nothing straddles 240 or 360.
  const LAMPS = [468, 640, 766];
  const BACK = { left: 784, right: 948, shelf: 120, top: 168 };

  function chairPath(x: number, back: 1 | -1): string {
    const outer = x - back * 14;
    return `M${outer} 206Q${outer - back * 6} 182 ${outer - back * 2} 168Q${outer + back * 3} 162 ${outer + back * 6} 170Q${outer + back * 4} 186 ${outer + back * 2} 206M${x - 10} 210L${x - 13} 240M${x + 10} 210L${x + 13} 240`;
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

<path d="M50 204V112A88 88 0 0 1 226 112V204Z" class="fill-portrait-bib" />
<path d="M60 200V112A78 78 0 0 1 216 112V200Z" class="fill-scene-sky" />
<path d="M60 200V150H94V132H140V154H174V142H216V200Z" class="fill-scene-clay" />
<path d="M136 34h4v166h-4ZM60 126h156v4H60Z" class="fill-portrait-bib" />
<rect x="42" y="200" width="192" height="9" rx="3" class="fill-scene-wood" />
<ellipse cx="138" cy="241" rx="40" ry="3.5" class="fill-scene-line/12" />
<rect x="136" y="206" width="4" height="32" class="fill-scene-line/70" />
<ellipse cx="138" cy="238" rx="13" ry="2.6" class="fill-scene-line/70" />
<ellipse cx="138" cy="205" rx="32" ry="5" class="fill-portrait-bib" />

<rect x="268" y="52" width="64" height="48" class="fill-scene-wood" />
<rect x="274" y="58" width="52" height="36" class="fill-scene-sky" />
<path d="M274 94L290 74L302 84L312 76L326 94Z" class="fill-scene-leaf" />
<Plant plant={PARTS.cafe.plant} />

<rect x="376" y="36" width="184" height="148" rx="2" class="fill-portrait-bib" />
<rect x="388" y="48" width="160" height="124" class="fill-scene-sky" />
<path d="M388 172V124H420V104H460V128H500V112H548V172Z" class="fill-scene-clay/80" />
<path d="M500 172V140H548V172ZM420 172V136H460V172Z" class="fill-scene-honey/80" />
<path
  d="M428 112h8v10h-8ZM444 112h8v10h-8ZM508 120h8v10h-8ZM528 120h8v10h-8ZM430 146h8v10h-8ZM512 150h8v10h-8ZM530 150h8v10h-8Z"
  class="fill-portrait-bib/80"
/>
<path d="M428 48v124M508 48v124M388 104h160" class="stroke-portrait-bib" stroke-width="4" />
<path d="M396 64l22-14M396 82l34-24" class="stroke-white/70" stroke-width="2" />
<path d="M384 126h168" class="stroke-scene-line/60" stroke-width="1.6" />
<path d="M388 126H548V170Q536 174 524 170Q512 174 500 170Q488 174 476 170Q464 174 452 170Q440 174 428 170Q416 174 404 170Q396 173 388 170Z" class="fill-white/70" />
<path d="M404 128v40M428 128v40M452 128v40M476 128v40M500 128v40M524 128v40" class="stroke-scene-line/10" stroke-width="1.2" />
<rect x="370" y="178" width="196" height="7" rx="2" class="fill-scene-wood" />

<ellipse cx="468" cy="241" rx="62" ry="3.5" class="fill-scene-line/12" />
<g class="stroke-scene-coffee" fill="none" stroke-width="3">
  <path d={chairPath(420, 1)} />
  <path d={chairPath(516, -1)} />
</g>
<rect x="406" y="204" width="28" height="5" rx="2" class="fill-scene-coffee" />
<rect x="502" y="204" width="28" height="5" rx="2" class="fill-scene-coffee" />
<rect x="466" y="200" width="4" height="38" class="fill-scene-line/70" />
<ellipse cx="468" cy="238" rx="14" ry="2.8" class="fill-scene-line/70" />
<ellipse cx="468" cy="198" rx="36" ry="5" class="fill-scene-edge" />
<ellipse cx="468" cy="196" rx="36" ry="5" class="fill-portrait-bib" />
<path d="M442 195h14M480 195h14" class="stroke-scene-line/40" stroke-width="1.6" />
<path d="M444 194v-6h10v6ZM482 194v-6h10v6Z" class="fill-white" />
<path d="M454 189q4 0 4 2.5t-4 2.5M492 189q4 0 4 2.5t-4 2.5" class="stroke-white" fill="none" stroke-width="1.4" />
<path d="M444 188h10M482 188h10" class="stroke-scene-coffee" stroke-width="1.2" />
<rect x="465" y="186" width="6" height="8" rx="2" class="fill-scene-sky" />
<path d="M468 186v-10" class="stroke-scene-leaf" stroke-width="1.2" />
<circle cx="468" cy="175" r="3" class="fill-scene-red-mid" />

{#each LAMPS as x (x)}
  <path d="M{x} -10V38" class="stroke-scene-line/40" stroke-width="1.2" />
  <path d="M{x - 18} 56Q{x - 18} 38 {x} 38Q{x + 18} 38 {x + 18} 56Z" class="fill-scene-green" />
  <ellipse cx={x} cy="56" rx="18" ry="2.6" class="fill-scene-line/15" />
  <ellipse cx={x} cy="57" rx="6" ry="3" class="fill-portrait-bib" />
{/each}

<WallClock clock={PARTS.cafe.clock} {hour} />

<rect x="694" y="22" width="52" height="64" class="fill-scene-line/10" />
<rect x="690" y="18" width="52" height="64" class="fill-scene-coffee" />
<rect x="695" y="23" width="42" height="54" class="fill-scene-honey" />
<path d="M698 74V56l6-4v-8l4-4 4 4v8l6 4v4h8v-6l5-3 5 3v20Z" class="fill-scene-clay" />
<circle cx="726" cy="34" r="5" class="fill-white/70" />

<Chalkboard x={794} y={6} width={140} height={54}>
  <text x="70" y="13" text-anchor="middle" font-size="13">Menu</text>
  <text x="8" y="27" font-size="10.5">Káva</text>
  <text x="132" y="27" text-anchor="end" font-size="10.5">2,50&nbsp;€</text>
  <text x="8" y="39" font-size="10.5">Čaj</text>
  <text x="132" y="39" text-anchor="end" font-size="10.5">2,00&nbsp;€</text>
  <text x="8" y="51" font-size="10.5">Koláč</text>
  <text x="132" y="51" text-anchor="end" font-size="10.5">3,00&nbsp;€</text>
</Chalkboard>

<rect x={BACK.left} y={BACK.shelf} width={BACK.right - BACK.left} height="4" rx="1" class="fill-scene-coffee" />
<path
  d="M788 {BACK.shelf + 4}l8 8v-8ZM944 {BACK.shelf + 4}l-8 8v-8Z"
  class="fill-scene-coffee"
/>
{#each [798, 812] as x (x)}
  <rect {x} y={BACK.shelf - 18} width="12" height="18" rx="2" class="fill-white/60" />
  <rect x={x + 1.5} y={BACK.shelf - 13} width="9" height="12" rx="1" class="fill-scene-coffee" />
  <rect {x} y={BACK.shelf - 21} width="12" height="4" rx="1" class="fill-scene-line/60" />
{/each}
<g transform="translate(910 {BACK.shelf})">
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

<g transform="translate(-63 {BACK.shelf - 146})">
<rect x="913.5" y="139" width="3" height="7" class="fill-scene-edge" />
<ellipse cx="915" cy="139" rx="24" ry="2.6" class="fill-portrait-bib" />
<path d="M897 137V124Q915 119 933 124V137Z" class="fill-scene-honey" />
<path d="M897 124Q915 119 933 124V128Q924 132 915 127Q906 132 897 128Z" class="fill-portrait-bib" />
<path d="M915 137V122" class="stroke-scene-coffee/30" stroke-width="1" />
<path d="M893 139V117A22 22 0 0 1 937 117V139Z" class="fill-portrait-bib/35" />
<path d="M898 118a17 17 0 0 1 9 -12" class="stroke-white/80" fill="none" stroke-width="2" />
</g>

<rect x={BACK.left} y={BACK.top + 4} width={BACK.right - BACK.left} height={226 - BACK.top - 4} class="fill-scene-coffee/70" />
<rect x={BACK.left - 2} y={BACK.top} width={BACK.right - BACK.left + 4} height="5" rx="1.5" class="fill-scene-edge" />

<g transform="translate(0 {BACK.top - 146})">
<rect x="792" y="112" width="64" height="34" rx="3" class="fill-scene-steel" />
<rect x="792" y="112" width="64" height="7" rx="3" class="fill-scene-steel-dark" />
<rect x="798" y="122" width="52" height="7" rx="1" class="fill-scene-steel-light" />
<circle cx="824" cy="125.5" r="2.4" class="fill-white" />
{#each [806, 842] as x (x)}
  <rect x={x - 4} y="129" width="8" height="5" rx="1" class="fill-scene-steel-dark" />
  <path d="M{x} 136h{x < 824 ? -12 : 12}" class="stroke-portrait-vest" stroke-width="2.4" />
{/each}
<rect x="802" y="138" width="8" height="6" rx="1" class="fill-white" />
<rect x="796" y="144" width="56" height="2" class="fill-scene-steel-dark" />
<path d="M800 112v-5h8v5ZM812 112v-5h8v5ZM828 112v-5h8v5Z" class="fill-white" />
<path d="M856 124h4v14" class="stroke-scene-steel-dark" fill="none" stroke-width="1.6" />
{#each [892, 904, 916] as x (x)}
  <path d="M{x} 146l1 -8h8l1 8Z" class="fill-white" />
  <path d="M{x + 1} 138l0.6 -6h6.8l0.6 6Z" class="fill-white" />
{/each}
<rect x="866" y="128" width="16" height="18" rx="2" class="fill-portrait-vest" />
<path d="M864 128l4 -18h12l4 18Z" class="fill-white/50" />
<path d="M866 126l3 -12h10l3 12Z" class="fill-scene-coffee" />
</g>
