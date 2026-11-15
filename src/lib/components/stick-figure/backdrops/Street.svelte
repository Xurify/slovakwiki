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
    { x: 240, width: 130, top: 110, gable: false, door: true, shutters: true, paint: "fill-scene-honey" },
    // The grocer's sign starts right of the lamp, so neither the lamp nor the shelter crosses its lettering.
    { x: 370, width: 110, top: 98, gable: true, door: true, shop: "Potraviny", paint: "fill-scene-clay" },
    { x: 480, width: 150, top: 108, gable: false, door: false, shop: "Kvetinárstvo", awning: "fill-scene-sage", paint: "fill-scene-warm" },
    { x: 630, width: 110, top: 102, gable: true, door: true, flowers: true, paint: "fill-scene-sage" },
    { x: 740, width: 120, top: 112, gable: false, door: true, balcony: true, paint: "fill-scene-clay" },
    { x: 860, width: 110, top: 100, gable: true, door: true, paint: "fill-scene-honey" },
  ];

  /**
   * The tram is drawn small and scaled up about its first door on the near
   * rail, to stand about twice a person's height beside the cast: its floor at
   * their knees, its roof above their heads. The door stays at TRAM.door.
   */
  const SCALE = 1.7;
  const PIVOT = { x: TRAM.door, y: 253 };
  /** The trolley wire as the tram's unscaled drawing reaches it, and where it hangs on the stage. */
  const PANTOGRAPH_TOP = 114;
  const WIRE = PIVOT.y - (PIVOT.y - PANTOGRAPH_TOP) * SCALE;
  /** Poles on the far pavement, each with an arm out over the track that the wire hangs from. */
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
  <rect x={x - 6} y="223" width="12" height="7" rx="1.5" class="fill-scene-steel-dark" />
  <path d="M{x - 2.5} 224L{x - 1.5} 6H{x + 1.5}L{x + 2.5} 224Z" class="fill-scene-steel-dark" />
  <circle cx={x} cy="5" r="2.5" class="fill-scene-steel-dark" />
  <path d="M{x} 10H{x + 34}M{x} 22L{x + 28} 10M{x + 30} 10V{WIRE}" class="stroke-scene-steel-dark" stroke-width="1.8" fill="none" />
{/each}
<path d="M-10 {WIRE}H970" class="stroke-scene-line/60" stroke-width="1.4" />

<!-- A Bratislava tram: white over red, its cab at the left. It pulls in from the right and stops with its door at the stop. -->
<g
  class="transition-transform ease-out"
  style:transform="translateX({shift}px)"
  style:transition-duration="{tram === 'coming' ? TRAM.ms : 0}ms"
>
  <g transform="translate({PIVOT.x} {PIVOT.y}) scale({SCALE}) translate({-PIVOT.x} {-PIVOT.y})">
  <!-- The pantograph, pressed up against the wire. -->
  <path d="M676 136L690 124L704 136M690 124L682 {PANTOGRAPH_TOP}M690 124L698 {PANTOGRAPH_TOP}M678 {PANTOGRAPH_TOP}H702" class="stroke-scene-line/60" stroke-width="1.4" fill="none" />
  <rect x="668" y="133" width="44" height="5" rx="1" class="fill-scene-steel" />
  <rect x="800" y="132" width="60" height="6" rx="2" class="fill-scene-steel" />

  {#each BOGIES as x (x)}
    <rect x={x - 22} y="236" width="44" height="12" rx="2" class="fill-scene-steel-dark" />
    <rect x={x - 22} y="236" width="44" height="3" class="fill-scene-line/30" />
    <circle cx={x - 12} cy="247.5" r="6" class="fill-portrait-hair" />
    <circle cx={x + 12} cy="247.5" r="6" class="fill-portrait-hair" />
    <circle cx={x - 12} cy="247.5" r="2" class="fill-scene-steel" />
    <circle cx={x + 12} cy="247.5" r="2" class="fill-scene-steel" />
  {/each}

  <path
    d="M{FRONT + 4} 240L{FRONT} 200Q{FRONT} 158 {FRONT + 16} 146Q{FRONT + 26} 138 {FRONT + 44} 138H1010V240Z"
    class="fill-portrait-bib"
  />
  <path d="M{FRONT + 1} 204H1010V240H{FRONT + 4}Z" class="fill-scene-red-mid" />
  <rect x={FRONT + 2} y="202" width="470" height="3" class="fill-scene-red" />
  <rect x={FRONT + 4} y="236" width="470" height="4" class="fill-scene-steel-dark" />
  <!-- The roof's edge, dark against the houses behind. -->
  <path d="M{FRONT + 16} 146Q{FRONT + 26} 138 {FRONT + 44} 138H1010" class="stroke-scene-line/45" stroke-width="1.6" fill="none" />
  <rect x={FRONT + 40} y="139" width="430" height="3" class="fill-scene-line/10" />

  <!-- The cab: a raked windscreen under the route display, a headlight low down. -->
  <path d="M{FRONT + 4} 196Q{FRONT + 4} 164 {FRONT + 20} 156H{FRONT + 46}V196Z" class="fill-scene-line/50" />
  <path d="M{FRONT + 7} 194Q{FRONT + 7} 166 {FRONT + 21} 159H{FRONT + 43}V194Z" class="fill-scene-steel" />
  <path d="M{FRONT + 7} 194Q{FRONT + 7} 166 {FRONT + 21} 159H{FRONT + 43}V194Z" class="fill-scene-sky/55" />
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
  <!-- Headlights and indicator low on the nose, over a black bumper. -->
  <rect x={FRONT + 3} y="214" width="12" height="9" rx="3" class="fill-scene-line/40" />
  <ellipse cx={FRONT + 8} cy="218.5" rx="3.2" ry="3" class="fill-white" />
  <ellipse cx={FRONT + 8} cy="218.5" rx="2" ry="1.8" class="fill-scene-honey" />
  <rect x={FRONT + 12} y="216.5" width="2.5" height="4" rx="1" class="fill-scene-carrot" />

  <!-- Doors: two glazed leaves each, low to the kerb. -->
  {#each [TRAM.door, 781, 960] as door (door)}
    <rect x={door - 22} y="150" width="44" height="88" rx="2" class="fill-scene-line/45" />
    <rect x={door - 20} y="152" width="19" height="84" rx="1.5" class="fill-scene-steel" />
    <rect x={door + 1} y="152" width="19" height="84" rx="1.5" class="fill-scene-steel" />
    <rect x={door - 20} y="152" width="40" height="84" class="fill-scene-sky/50" />
    <rect x={door - 20} y="200" width="40" height="36" class="fill-scene-steel-dark/35" />
    <path d="M{door - 1} 152V236M{door - 12} 170V214M{door + 12} 170V214" class="stroke-scene-line/45" stroke-width="1" />
    <path d="M{door - 18} 182L{door - 6} 156H{door - 3}L{door - 18} 190Z" class="fill-white/35" />
  {/each}
  <circle cx={TRAM.door + 28} cy="214" r="3.5" class="fill-scene-honey" />

  {#each SIDE_WINDOWS as x (x)}
    <rect {x} y="152" width="38" height="44" rx="3" class="fill-scene-line/40" />
    <rect x={x + 2} y="154" width="34" height="40" rx="2" class="fill-scene-steel" />
    <rect x={x + 2} y="154" width="34" height="40" rx="2" class="fill-scene-sky/55" />
    <rect x={x + 2} y="182" width="34" height="12" class="fill-scene-steel-dark/30" />
    <path d="M{x + 2} 166H{x + 36}" class="stroke-scene-line/30" stroke-width="1" />
    <path d="M{x + 4} 186L{x + 22} 156H{x + 27}L{x + 6} 192Z" class="fill-white/30" />
  {/each}
  </g>
</g>

<!-- The platform: a granite kerb with a white edge line, a ribbed warning strip, then slabs. -->
<rect x="-10" y="257" width="980" height="53" class="fill-scene-sand" />
<rect x="-10" y="254.5" width="980" height="2" class="fill-scene-line/35" />
<rect x="-10" y="256" width="980" height="5" class="fill-scene-steel-light" />
<rect x="-10" y="256" width="980" height="2" class="fill-white" />
<rect x="-10" y="261" width="980" height="1.5" class="fill-scene-line/20" />
<rect x="-10" y="264" width="980" height="8" class="fill-scene-steel-light" />
{#each Array.from({ length: 196 }, (_, index) => index * 5 - 8) as x (x)}
  <rect {x} y="265.5" width="2" height="5" rx="1" class="fill-white/80" />
{/each}
<rect x="-10" y="272" width="980" height="1" class="fill-scene-line/15" />
<path d="M-10 286H970M-10 304H970" class="stroke-scene-line/10" stroke-width="1" />
{#each Array.from({ length: 33 }, (_, index) => index * 30 - 10) as x (x)}
  <path d="M{x} 273V286M{x + 15} 286V304" class="stroke-scene-line/10" stroke-width="1" />
{/each}

<Tree tree={PARTS.street.tree} />

<!--
  The shelter, tall enough to stand under: two posts under a flat roof, its back
  frosted glass so the street behind stays out of it, an advert at one end and
  the timetable at the other, a bin inside.
-->
<g transform="translate(16 0)">
<ellipse cx="274" cy="277" rx="94" ry="4" class="fill-scene-line/12" />
<rect x="198" y="66" width="152" height="202" class="fill-scene-sky/35" />
<rect x="198" y="66" width="152" height="202" class="fill-white/25" />
<path d="M204 140L230 72H240L210 158ZM290 150L320 72H326L296 164Z" class="fill-white/30" />
<path d="M198 172H350M274 66V268" class="stroke-scene-steel-dark" stroke-width="1.5" />
<!-- A lit city map in a steel frame. -->
<rect x="203" y="78" width="58" height="172" rx="1.5" class="fill-scene-steel-dark" />
<rect x="206" y="81" width="52" height="166" class="fill-white" />
<rect x="206" y="81" width="52" height="16" class="fill-scene-red-mid" />
<text x="232" y="92" text-anchor="middle" font-size="7" font-weight="700" class="fill-white font-sans"
  >Bratislava</text
>
<rect x="209" y="100" width="46" height="128" class="fill-scene-warm" />
<path d="M209 196Q228 182 238 196T255 190V228H209Z" class="fill-scene-water/45" />
<path
  d="M209 120H255M209 146H255M209 170H255M222 100V196M240 100V190M209 110L232 140L255 128"
  class="stroke-white"
  stroke-width="2"
  fill="none"
/>
<rect x="224" y="148" width="14" height="20" class="fill-scene-sage" />
<path d="M240 104h12v12h-12Z" class="fill-scene-clay" />
<circle cx="231" cy="158" r="3" class="fill-scene-red" />
<rect x="209" y="232" width="46" height="12" class="fill-scene-line/10" />
<path d="M212 236h28M212 240h20" class="stroke-scene-line/40" stroke-width="1" />
<rect x="314" y="128" width="30" height="48" rx="1" class="fill-white" />
<rect x="314" y="128" width="30" height="7" class="fill-scene-red-mid" />
<path d="M318 141h22M318 147h16M318 153h22M318 159h14M318 165h20M318 171h12" class="stroke-scene-line/40" stroke-width="1" />
<rect x="192" y="62" width="6" height="214" class="fill-scene-steel-dark" />
<rect x="350" y="62" width="6" height="214" class="fill-scene-steel-dark" />
<rect x="184" y="54" width="180" height="10" rx="1" class="fill-scene-steel-dark" />
<rect x="184" y="54" width="180" height="2.5" class="fill-white/30" />
<rect x="304" y="56" width="17" height="7" rx="1" class="fill-white" />
<text x="312.5" y="62" text-anchor="middle" font-size="6.5" font-weight="700" class="fill-scene-line font-sans">4</text>
<rect x="325" y="56" width="17" height="7" rx="1" class="fill-white" />
<text x="333.5" y="62" text-anchor="middle" font-size="6.5" font-weight="700" class="fill-scene-line font-sans">9</text>
<ellipse cx="208" cy="276" rx="9" ry="2" class="fill-scene-line/15" />
<rect x="206.5" y="256" width="3" height="20" class="fill-scene-steel-dark" />
<rect x="203" y="274" width="10" height="2" class="fill-scene-steel-dark" />
<path d="M200 232h16l-1.5 22h-13Z" class="fill-scene-steel" />
<rect x="199" y="230" width="18" height="3" rx="1" class="fill-scene-steel-dark" />

</g>

<Bench bench={PARTS.street.bench} />

<!-- The stop's sign on its own pole beside the shelter: a tram, the stop's name. -->
<g transform="translate(18 0)">
<ellipse cx="392" cy="277" rx="9" ry="2.5" class="fill-scene-line/15" />
<rect x="386" y="270" width="12" height="7" rx="1.5" class="fill-scene-steel-dark" />
<rect x="390" y="40" width="4" height="232" class="fill-scene-steel-dark" />
<rect x="368" y="10" width="48" height="40" rx="2" class="fill-scene-red-mid" />
<rect x="370" y="12" width="44" height="36" rx="1.5" class="fill-white" />
<path d="M386 17l4-3h4l4 3" class="stroke-scene-line/70" stroke-width="1" fill="none" />
<rect x="381" y="17" width="22" height="11" rx="3" class="fill-scene-red-mid" />
<rect x="384" y="19" width="7" height="4.5" rx="1" class="fill-white" />
<rect x="393" y="19" width="7" height="4.5" rx="1" class="fill-white" />
<circle cx="386" cy="30" r="1.8" class="fill-scene-line/70" />
<circle cx="398" cy="30" r="1.8" class="fill-scene-line/70" />
<rect x="370" y="34" width="44" height="14" class="fill-scene-line/80" />
<text x="392" y="43.4" text-anchor="middle" font-size="6" font-weight="700" class="fill-white font-sans"
  >Kamenné nám.</text
>
</g>

<StreetLamp lamp={PARTS.street.lamp} />
