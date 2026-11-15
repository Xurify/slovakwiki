<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import { TRAM, type TramState } from "$lib/stick-figure/street";
  import Bench from "./Bench.svelte";
  import Cloud from "./Cloud.svelte";
  import Facades, { type Facade } from "./Facades.svelte";
  import FloorShade from "./FloorShade.svelte";
  import StreetLamp from "./StreetLamp.svelte";
  import Tree from "./Tree.svelte";

  let { tram }: { tram: TramState } = $props();

  /** Town houses along the far side of the street; neighbours never share a paint. */
  const houses: Facade[] = [
    { x: -10, width: 150, top: 104, gable: false, door: true, paint: "fill-scene-warm" },
    { x: 140, width: 100, top: 100, gable: true, door: true, flowers: true, paint: "fill-scene-sage" },
    { x: 240, width: 130, top: 110, gable: false, door: true, shop: "Potraviny", paint: "fill-scene-honey" },
    { x: 370, width: 110, top: 98, gable: true, door: true, paint: "fill-scene-clay" },
    { x: 480, width: 150, top: 108, gable: false, door: false, shop: "Kvetinárstvo", awning: "fill-scene-sage", paint: "fill-scene-warm" },
    { x: 630, width: 110, top: 102, gable: true, door: true, flowers: true, paint: "fill-scene-sage" },
    { x: 740, width: 120, top: 112, gable: false, door: true, shop: "Trafika", paint: "fill-scene-clay" },
    { x: 860, width: 110, top: 100, gable: true, door: true, paint: "fill-scene-honey" },
  ];

  /** The trolley wire the tram's pantograph runs under, held out over the track from poles on the far pavement. */
  const WIRE = 114;
  const POLES = [150, 470, 790];
  /** The rails' tops: the near one is what the wheels stand on. */
  const RAILS = [244, 253];
  /** The tram, as it stands at the stop: its cab at the left end, its first door at TRAM.door. */
  const FRONT = 540;
  const SIDE_WINDOWS = [652, 694, 818, 860, 902];
  const BOGIES = [580, 720, 900];

  const shift = $derived(tram === "away" ? TRAM.away : 0);
</script>

<Cloud x={420} y={50} />
<Cloud x={760} y={62} size={0.7} />

<Facades {houses} />

<!-- The far pavement, its kerb, and the road with the track set into it. -->
<rect x="-10" y="226" width="980" height="6" class="fill-white/35" />
<rect x="-10" y="232" width="980" height="2" class="fill-scene-line/20" />
<rect x="-10" y="234" width="980" height="24" class="fill-scene-pale" />
<rect x="-10" y="234" width="980" height="24" class="fill-scene-line/10" />
<rect x="-10" y="241" width="980" height="15" class="fill-scene-line/6" />
{#each RAILS as y (y)}
  <rect x="-10" {y} width="980" height="2.5" class="fill-scene-steel-light" />
  <rect x="-10" y={y + 2.5} width="980" height="1" class="fill-scene-line/35" />
{/each}
<FloorShade y={234} />

{#each POLES as x (x)}
  <rect x={x - 2} y="92" width="4" height="138" class="fill-scene-steel-dark" />
  <rect x={x - 3.5} y="222" width="7" height="8" rx="1" class="fill-scene-steel-dark" />
  <circle cx={x} cy="91" r="2.5" class="fill-scene-steel-dark" />
  <path d="M{x} 104H{x + 26}M{x} 96L{x + 22} 104M{x + 22} 104V{WIRE}" class="stroke-scene-steel-dark" stroke-width="1.6" fill="none" />
{/each}
<path d="M-10 {WIRE}H970" class="stroke-scene-line/50" stroke-width="1.2" />

<!-- A Bratislava tram: white over red, its cab at the left. It pulls in from the right and stops with its door at the stop. -->
<g
  class="transition-transform ease-out"
  style:transform="translateX({shift}px)"
  style:transition-duration="{tram === 'coming' ? TRAM.ms : 0}ms"
>
  <!-- The pantograph, pressed up against the wire. -->
  <path d="M676 136L690 124L704 136M690 124L682 {WIRE + 2}M690 124L698 {WIRE + 2}M678 {WIRE + 1}H702" class="stroke-scene-line/60" stroke-width="1.4" fill="none" />
  <rect x="668" y="133" width="44" height="5" rx="1" class="fill-scene-steel" />
  <rect x="800" y="132" width="60" height="6" rx="2" class="fill-scene-steel" />

  {#each BOGIES as x (x)}
    <rect x={x - 22} y="236" width="44" height="12" rx="2" class="fill-scene-line/70" />
    <circle cx={x - 12} cy="247.5" r="6" class="fill-scene-line/80" />
    <circle cx={x + 12} cy="247.5" r="6" class="fill-scene-line/80" />
    <circle cx={x - 12} cy="247.5" r="2" class="fill-scene-steel" />
    <circle cx={x + 12} cy="247.5" r="2" class="fill-scene-steel" />
  {/each}

  <path
    d="M{FRONT + 4} 240L{FRONT} 200Q{FRONT} 158 {FRONT + 16} 146Q{FRONT + 26} 138 {FRONT + 44} 138H1010V240Z"
    class="fill-portrait-bib"
  />
  <path d="M{FRONT + 1} 204H1010V240H{FRONT + 4}Z" class="fill-scene-red-mid" />
  <rect x={FRONT + 2} y="202" width="470" height="3" class="fill-scene-red" />
  <rect x={FRONT + 4} y="236" width="470" height="4" class="fill-scene-line/25" />
  <rect x={FRONT + 40} y="138" width="430" height="3" class="fill-scene-line/8" />

  <!-- The cab: a raked windscreen under the route display, a headlight low down. -->
  <path d="M{FRONT + 4} 196Q{FRONT + 4} 164 {FRONT + 20} 156H{FRONT + 46}V196Z" class="fill-scene-line/50" />
  <path d="M{FRONT + 7} 194Q{FRONT + 7} 166 {FRONT + 21} 159H{FRONT + 43}V194Z" class="fill-scene-sky" />
  <path d="M{FRONT + 10} 186Q{FRONT + 12} 168 {FRONT + 24} 162H{FRONT + 30}L{FRONT + 12} 192Z" class="fill-white/40" />
  <rect x={FRONT + 14} y="142" width="44" height="11" rx="1.5" class="fill-scene-line/85" />
  <text
    x={FRONT + 18}
    y="150.6"
    font-size="8"
    font-weight="700"
    class="fill-scene-honey font-sans">4</text
  >
  <text x={FRONT + 25} y="150.4" font-size="6.2" class="fill-scene-honey font-sans">Dúbravka</text>
  <ellipse cx={FRONT + 8} cy="222" rx="3" ry="4" class="fill-scene-honey" />
  <rect x={FRONT + 4} y="230" width="24" height="5" rx="1.5" class="fill-scene-line/30" />

  <!-- Doors: two glazed leaves each, low to the kerb. -->
  {#each [TRAM.door, 781, 960] as door (door)}
    <rect x={door - 22} y="150" width="44" height="88" rx="2" class="fill-scene-line/45" />
    <rect x={door - 20} y="152" width="19" height="84" rx="1.5" class="fill-scene-sky" />
    <rect x={door + 1} y="152" width="19" height="84" rx="1.5" class="fill-scene-sky" />
    <rect x={door - 20} y="196" width="40" height="40" class="fill-scene-line/12" />
    <path d="M{door - 18} 182L{door - 6} 156H{door - 3}L{door - 18} 190Z" class="fill-white/35" />
  {/each}
  <circle cx={TRAM.door + 28} cy="214" r="3.5" class="fill-scene-honey" />

  {#each SIDE_WINDOWS as x (x)}
    <rect {x} y="152" width="38" height="44" rx="3" class="fill-scene-line/40" />
    <rect x={x + 2} y="154" width="34" height="40" rx="2" class="fill-scene-sky" />
    <rect x={x + 2} y="154" width="34" height="8" class="fill-scene-line/12" />
    <path d="M{x + 4} 186L{x + 22} 156H{x + 27}L{x + 6} 192Z" class="fill-white/30" />
  {/each}
</g>

<!-- The platform: a granite kerb, a strip of studded paving along its edge, then slabs. -->
<rect x="-10" y="257" width="980" height="53" class="fill-scene-sand" />
<rect x="-10" y="256" width="980" height="5" class="fill-white/70" />
<rect x="-10" y="261" width="980" height="1.5" class="fill-scene-line/15" />
<rect x="-10" y="264" width="980" height="7" class="fill-white/45" />
{#each Array.from({ length: 98 }, (_, index) => index * 10 - 6) as x (x)}
  <circle cx={x} cy="267.5" r="1.4" class="fill-scene-line/15" />
{/each}
<path d="M-10 271.5H970M-10 286H970M-10 304H970" class="stroke-scene-line/10" stroke-width="1" />
{#each Array.from({ length: 33 }, (_, index) => index * 30 - 10) as x, index (x)}
  <path d="M{x} 271.5V286M{x + 15} 286V304" class="stroke-scene-line/10" stroke-width="1" />
{/each}

<Tree tree={PARTS.street.tree} />

<!-- The shelter: a glass back on two posts under a flat roof, an advert at one end and the timetable at the other. -->
<ellipse cx="274" cy="276" rx="84" ry="4" class="fill-scene-line/12" />
<rect x="202" y="158" width="144" height="110" class="fill-white/30" />
<path d="M202 212H346M274 158V268" class="stroke-scene-line/30" stroke-width="1.5" />
<rect x="206" y="166" width="40" height="80" rx="1" class="fill-scene-line/50" />
<rect x="208" y="168" width="36" height="76" class="fill-scene-sky" />
<circle cx="226" cy="190" r="10" class="fill-scene-honey" />
<path d="M208 244V220Q226 206 244 220V244Z" class="fill-scene-leaf" />
<rect x="212" y="228" width="28" height="8" rx="1" class="fill-white/85" />
<path d="M216 232h20" class="stroke-scene-line/40" stroke-width="1.5" />
<rect x="196" y="152" width="6" height="124" class="fill-scene-steel-dark" />
<rect x="346" y="152" width="6" height="124" class="fill-scene-steel-dark" />
<rect x="190" y="144" width="168" height="9" rx="1" class="fill-scene-steel-dark" />
<rect x="190" y="144" width="168" height="2.5" class="fill-white/30" />
<rect x="320" y="186" width="24" height="36" rx="1" class="fill-white" />
<rect x="320" y="186" width="24" height="6" class="fill-scene-red-mid" />
<path d="M323 197h18M323 202h14M323 207h18M323 212h12M323 217h16" class="stroke-scene-line/40" stroke-width="1" />
<Bench bench={PARTS.street.bench} />

<!-- The stop's sign on its own post: a tram, the lines that stop here. -->
<ellipse cx="376" cy="276" rx="9" ry="2.5" class="fill-scene-line/15" />
<rect x="374" y="120" width="4" height="156" class="fill-scene-steel-dark" />
<rect x="358" y="116" width="36" height="34" rx="2" class="fill-white" />
<rect x="358" y="116" width="36" height="34" rx="2" class="fill-scene-red/10" />
<rect x="360.5" y="118.5" width="31" height="29" rx="1.5" class="fill-white" />
<rect x="367" y="122" width="18" height="12" rx="2.5" class="fill-scene-red-mid" />
<rect x="369.5" y="124.5" width="5.5" height="5" rx="1" class="fill-white" />
<rect x="377" y="124.5" width="5.5" height="5" rx="1" class="fill-white" />
<path d="M370 136h12M376 122l-3-4h6" class="stroke-scene-line/60" stroke-width="1.2" fill="none" />
<text x="376" y="145" text-anchor="middle" font-size="7" font-weight="700" class="fill-scene-line font-sans"
  >ZASTÁVKA</text
>
<rect x="362" y="152" width="13" height="10" rx="1" class="fill-scene-line/80" />
<text x="368.5" y="160" text-anchor="middle" font-size="8" font-weight="700" class="fill-white font-sans">4</text>
<rect x="377" y="152" width="13" height="10" rx="1" class="fill-scene-line/80" />
<text x="383.5" y="160" text-anchor="middle" font-size="8" font-weight="700" class="fill-white font-sans">9</text>

<!-- A litter bin beside the sign. -->
<ellipse cx="404" cy="276" rx="9" ry="2" class="fill-scene-line/15" />
<rect x="402.5" y="250" width="3" height="26" class="fill-scene-steel-dark" />
<path d="M396 240h16l-1.5 22h-13Z" class="fill-scene-steel" />
<rect x="395" y="238" width="18" height="3" rx="1" class="fill-scene-steel-dark" />

<StreetLamp lamp={PARTS.street.lamp} />
