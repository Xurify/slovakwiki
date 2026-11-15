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
    { x: 370, width: 110, top: 98, gable: true, door: true, paint: "fill-scene-clay" },
    { x: 480, width: 150, top: 108, gable: false, door: false, shop: "Kvetinárstvo", awning: "fill-scene-sage", paint: "fill-scene-warm" },
    { x: 630, width: 110, top: 102, gable: true, door: true, flowers: true, paint: "fill-scene-sage" },
    { x: 740, width: 120, top: 112, gable: false, door: true, balcony: true, paint: "fill-scene-clay" },
    { x: 860, width: 110, top: 100, gable: true, door: true, paint: "fill-scene-honey" },
  ];

  /**
   * The tram is drawn small and scaled up about the foot of its first door's
   * wheels on the near rail, to stand beside the cast as a tram stands beside
   * people: doors taller than they are, its roof near the top of the frame.
   * The door stays at TRAM.door.
   */
  const SCALE = 1.9;
  const PIVOT = { x: TRAM.door, y: 253.5 };
  /** The near rail's top on the stage, where the wheels stand, and the far rail's. */
  const NEAR_RAIL = 258;
  const FAR_RAIL = 246;
  /** The pantograph's collector in the tram's own drawing, and the trolley wire it touches on the stage. */
  const PANTOGRAPH_TOP = 124;
  const WIRE = NEAR_RAIL - (PIVOT.y - PANTOGRAPH_TOP) * SCALE;
  /** Poles on the far pavement, each holding the wire out over the track on an arm and a hanger. */
  const POLES = [150, 470, 790];
  /** Where the platform starts: its kerb, the ribbed warning strip, then the paving everything stands on. */
  const KERB = 261;
  const PAVING = 276;
  /** The tram, as it stands at the stop: its cab at the left end, its first door at TRAM.door. */
  const FRONT = 540;
  const SIDE_WINDOWS = [652, 694, 818, 860, 902];
  const BOGIES = [580, 720, 900];

  const shift = $derived(tram === "away" ? TRAM.away : 0);
</script>

<Cloud x={330} y={50} />
<Cloud x={760} y={62} size={0.7} />

<Facades {houses} />

<!-- The far pavement and its kerb; the road, with the track's two rails set into it. -->
<rect x="-10" y="226" width="980" height="7" class="fill-white/35" />
<rect x="-10" y="233" width="980" height="2" class="fill-scene-line/25" />
<rect x="-10" y="235" width="980" height="{KERB - 235}" class="fill-scene-pale" />
<rect x="-10" y="235" width="980" height="{KERB - 235}" class="fill-scene-line/12" />
<rect x="-10" y={FAR_RAIL - 3} width="980" height={NEAR_RAIL - FAR_RAIL + 6} class="fill-scene-line/15" />
{#each [FAR_RAIL, NEAR_RAIL] as y (y)}
  <rect x="-10" y={y - 2.5} width="980" height="3.5" class="fill-scene-steel" />
  <rect x="-10" y={y - 2.5} width="980" height="1.2" class="fill-white/70" />
  <rect x="-10" y={y + 1} width="980" height="1.5" class="fill-scene-steel-dark" />
{/each}
<FloorShade y={235} />

{#each POLES as x (x)}
  <rect x={x - 6} y="225" width="12" height="7" rx="1.5" class="fill-scene-steel-dark" />
  <path d="M{x - 2.5} 226L{x - 1.5} -10H{x + 1.5}L{x + 2.5} 226Z" class="fill-scene-steel-dark" />
  <!-- The arm out over the track, its stay, and the hanger the wire is clamped to. -->
  <path d="M{x} 3H{x + 36}M{x} 22L{x + 30} 3M{x + 32} 3V{WIRE}" class="stroke-scene-steel-dark" stroke-width="1.8" fill="none" />
  <rect x={x + 29} y={WIRE - 2} width="6" height="4" rx="1" class="fill-scene-steel-dark" />
{/each}
<path d="M-10 {WIRE}H970" class="stroke-scene-line/70" stroke-width="1.4" />

<!-- A Bratislava tram: white over red, its cab at the left. It pulls in from the right and stops with its door at the stop. -->
<g
  class="transition-transform ease-out"
  style:transform="translateX({shift}px)"
  style:transition-duration="{tram === 'coming' ? TRAM.ms : 0}ms"
>
  <g transform="translate({PIVOT.x} {NEAR_RAIL}) scale({SCALE}) translate({-PIVOT.x} {-PIVOT.y})">
  <!-- The pantograph, pressed up against the wire. -->
  <rect x="666" y="133" width="48" height="6" rx="1" class="fill-scene-steel-dark" />
  {#each [672, 708] as foot (foot)}
    <rect x={foot - 2} y="130" width="4" height="4" class="fill-scene-steel" />
  {/each}
  <path
    d="M676 131L690 {PANTOGRAPH_TOP + 4}L704 131M690 {PANTOGRAPH_TOP + 4}L684 {PANTOGRAPH_TOP}M690 {PANTOGRAPH_TOP + 4}L696 {PANTOGRAPH_TOP}"
    class="stroke-scene-steel-dark"
    stroke-width="1.2"
    fill="none"
  />
  <rect x="678" y={PANTOGRAPH_TOP - 0.8} width="24" height="1.6" rx="0.8" class="fill-scene-steel-dark" />
  <rect x="800" y="132" width="60" height="7" rx="2" class="fill-scene-steel-dark" />
  <rect x="580" y="134" width="40" height="5" rx="2" class="fill-scene-steel" />

  {#each BOGIES as x (x)}
    <rect x={x - 26} y="232" width="52" height="14" rx="2" class="fill-scene-steel-dark" />
    {#each [x - 13, x + 13] as wheel (wheel)}
      <circle cx={wheel} cy="244.5" r="9" class="fill-portrait-hair" />
      <circle cx={wheel} cy="244.5" r="5.5" class="fill-scene-steel-dark" />
      <circle cx={wheel} cy="244.5" r="2" class="fill-scene-steel" />
    {/each}
    <rect x={x - 4} y="238" width="8" height="5" rx="1" class="fill-scene-line/60" />
  {/each}

  <path
    d="M{FRONT + 6} 241L{FRONT} 200Q{FRONT} 158 {FRONT + 16} 146Q{FRONT + 26} 138 {FRONT + 44} 138H1010V241Z"
    class="fill-portrait-bib"
  />
  <path d="M{FRONT + 1} 204H1010V241H{FRONT + 6}Z" class="fill-scene-red-mid" />
  <rect x={FRONT + 2} y="202" width="470" height="3" class="fill-scene-red" />
  <!-- The skirt, down close to the rails between the bogies. -->
  <rect x={FRONT + 6} y="238" width="470" height="3" class="fill-scene-steel-dark" />
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
  <!-- The cab's corner: a headlight and indicator low down, a black bumper strip under them. -->
  <rect x={FRONT + 2} y="219" width="14" height="10" rx="3" class="fill-scene-line/45" />
  <ellipse cx={FRONT + 7.5} cy="224" rx="3.6" ry="3.4" class="fill-white" />
  <ellipse cx={FRONT + 7.5} cy="224" rx="2.2" ry="2" class="fill-scene-honey" />
  <rect x={FRONT + 12} y="221.5" width="2.6" height="5" rx="1" class="fill-scene-carrot" />
  <path d="M{FRONT + 4} 233H{FRONT + 30}V237H{FRONT + 5}Z" class="fill-portrait-hair" />

  <!-- Doors: two glazed leaves each, low to the kerb. -->
  {#each [TRAM.door, 781, 960] as door (door)}
    <rect x={door - 22} y="150" width="44" height="91" rx="2" class="fill-scene-line/45" />
    <rect x={door - 20} y="152" width="19" height="87" rx="1.5" class="fill-scene-steel" />
    <rect x={door + 1} y="152" width="19" height="87" rx="1.5" class="fill-scene-steel" />
    <rect x={door - 20} y="152" width="40" height="87" class="fill-scene-sky/50" />
    <rect x={door - 20} y="200" width="40" height="39" class="fill-scene-steel-dark/35" />
    <rect x={door - 22} y="239" width="44" height="2" class="fill-scene-steel-light" />
    <path d="M{door - 1} 152V239M{door - 12} 170V214M{door + 12} 170V214" class="stroke-scene-line/45" stroke-width="1" />
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

<!-- The platform, raised from the road: its granite kerb, the ribbed warning strip along the edge, the paving. -->
<rect x="-10" y={KERB} width="980" height={310 - KERB} class="fill-scene-sand" />
<rect x="-10" y={KERB - 1.5} width="980" height="2" class="fill-scene-line/40" />
<rect x="-10" y={KERB} width="980" height="5" class="fill-scene-steel-light" />
<rect x="-10" y={KERB} width="980" height="1.5" class="fill-white" />
<rect x="-10" y={KERB + 5} width="980" height="1" class="fill-scene-line/25" />
<rect x="-10" y={KERB + 7} width="980" height={PAVING - KERB - 8} class="fill-scene-honey/45" />
{#each Array.from({ length: 196 }, (_, index) => index * 5 - 8) as x (x)}
  <rect {x} y={KERB + 8.5} width="2" height={PAVING - KERB - 11} rx="1" class="fill-white/70" />
{/each}
<rect x="-10" y={PAVING - 1} width="980" height="1" class="fill-scene-line/20" />
<path d="M-10 290H970M-10 304H970" class="stroke-scene-line/10" stroke-width="1" />
{#each Array.from({ length: 33 }, (_, index) => index * 30 - 10) as x (x)}
  <path d="M{x} {PAVING}V290M{x + 15} 290V304" class="stroke-scene-line/10" stroke-width="1" />
{/each}

<Tree tree={PARTS.street.tree} />

<!--
  The shelter, back on the paving and tall enough to stand under: two posts
  under a flat roof with the lines' plate on its beam, clear glass at the back,
  a lit city map in its own frame down to the ground at one end, the timetable
  clamped to the other post, and the bench between.
-->
<ellipse cx="290" cy={PAVING + 8} rx="96" ry="4" class="fill-scene-line/12" />
<rect x="214" y="66" width="152" height={PAVING + 8 - 66} class="fill-scene-sky/35" />
<rect x="214" y="66" width="152" height={PAVING + 8 - 66} class="fill-white/25" />
<path d="M220 140L246 72H256L226 158ZM306 150L336 72H342L312 164Z" class="fill-white/30" />
<path d="M214 172H366" class="stroke-scene-steel-dark" stroke-width="1.5" />

<rect x="218" y="76" width="48" height={PAVING + 8 - 76} rx="1.5" class="fill-scene-steel-dark" />
<rect x="221" y="79" width="42" height="150" class="fill-white" />
<rect x="221" y="79" width="42" height="15" class="fill-scene-red-mid" />
<text x="242" y="89.5" text-anchor="middle" font-size="6.5" font-weight="700" class="fill-white font-sans"
  >Bratislava</text
>
<rect x="224" y="97" width="36" height="128" class="fill-scene-warm" />
<path d="M224 196Q238 184 246 196T260 190V225H224Z" class="fill-scene-water/45" />
<path
  d="M224 118H260M224 142H260M224 166H260M236 97V196M250 97V190M224 108L244 136L260 126"
  class="stroke-white"
  stroke-width="2"
  fill="none"
/>
<rect x="238" y="146" width="10" height="18" class="fill-scene-sage" />
<path d="M252 101h8v10h-8Z" class="fill-scene-clay" />
<circle cx="243" cy="156" r="3" class="fill-scene-red" />
<rect x="221" y="232" width="42" height={PAVING - 228} class="fill-scene-steel" />

<rect x="208" y="62" width="6" height={PAVING + 8 - 62} class="fill-scene-steel-dark" />
<rect x="366" y="62" width="6" height={PAVING + 8 - 62} class="fill-scene-steel-dark" />
<rect x="200" y="54" width="180" height="10" rx="1" class="fill-scene-steel-dark" />
<rect x="200" y="54" width="180" height="2.5" class="fill-white/30" />
<rect x="318" y="55.5" width="40" height="7.5" rx="1" class="fill-white" />
<path d="M338 56.5v5.5" class="stroke-scene-line/30" stroke-width="1" />
<text x="328" y="61.6" text-anchor="middle" font-size="6.5" font-weight="700" class="fill-scene-line font-sans">4</text>
<text x="348" y="61.6" text-anchor="middle" font-size="6.5" font-weight="700" class="fill-scene-line font-sans">9</text>

<!-- The timetable in a steel frame, clamped to the post. -->
<rect x="334" y="118" width="30" height="56" rx="1" class="fill-scene-steel-dark" />
<rect x="336" y="120" width="26" height="52" class="fill-white" />
<rect x="336" y="120" width="26" height="7" class="fill-scene-red-mid" />
<path d="M339 132h20M339 138h15M339 144h20M339 150h13M339 156h18M339 162h11" class="stroke-scene-line/40" stroke-width="1" />
<rect x="362" y="124" width="6" height="4" class="fill-scene-steel-dark" />
<rect x="362" y="162" width="6" height="4" class="fill-scene-steel-dark" />

<Bench bench={PARTS.street.bench} />

<!-- A litter bin on its post between the shelter and the stop's pole. -->
<ellipse cx="390" cy={PAVING + 8} rx="9" ry="2" class="fill-scene-line/15" />
<rect x="388.5" y={PAVING - 10} width="3" height="18" class="fill-scene-steel-dark" />
<rect x="385" y={PAVING + 6} width="10" height="2" class="fill-scene-steel-dark" />
<path d="M382 {PAVING - 34}h16l-1.5 22h-13Z" class="fill-scene-steel" />
<rect x="381" y={PAVING - 36} width="18" height="3" rx="1" class="fill-scene-steel-dark" />

<!-- The stop's sign on its own pole: a tram, the stop's name. -->
<ellipse cx="420" cy={PAVING + 8} rx="9" ry="2.5" class="fill-scene-line/15" />
<rect x="414" y={PAVING + 1} width="12" height="7" rx="1.5" class="fill-scene-steel-dark" />
<rect x="418" y="40" width="4" height={PAVING + 2 - 40} class="fill-scene-steel-dark" />
<rect x="396" y="10" width="48" height="40" rx="2" class="fill-scene-red-mid" />
<rect x="398" y="12" width="44" height="36" rx="1.5" class="fill-white" />
<path d="M414 17l4-3h4l4 3" class="stroke-scene-line/70" stroke-width="1" fill="none" />
<rect x="409" y="17" width="22" height="11" rx="3" class="fill-scene-red-mid" />
<rect x="412" y="19" width="7" height="4.5" rx="1" class="fill-white" />
<rect x="421" y="19" width="7" height="4.5" rx="1" class="fill-white" />
<circle cx="414" cy="30" r="1.8" class="fill-scene-line/70" />
<circle cx="426" cy="30" r="1.8" class="fill-scene-line/70" />
<rect x="398" y="34" width="44" height="14" class="fill-scene-line/80" />
<text x="420" y="43.4" text-anchor="middle" font-size="6" font-weight="700" class="fill-white font-sans"
  >Kamenné nám.</text
>

<StreetLamp lamp={PARTS.street.lamp} />
