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
    { x: 480, width: 150, top: 108, gable: false, door: true, paint: "fill-scene-sage" },
    { x: 630, width: 110, top: 102, gable: true, door: true, shop: "Kvetinárstvo", wares: "flowers", awning: "fill-scene-red-mid", paint: "fill-scene-warm" },
    { x: 740, width: 120, top: 112, gable: false, door: true, balcony: true, paint: "fill-scene-clay" },
    { x: 860, width: 110, top: 100, gable: true, door: true, paint: "fill-scene-honey" },
  ];

  /**
   * The tram is drawn small and scaled up about the foot of its first door's
   * wheels on the near rail, to stand behind the cast as a tram stands beside
   * people: doors well above their heads, its roof near the top of the frame.
   * Its cab ends behind the shelter, so the cast stand against its side and
   * nobody seems to sit at its windscreen. The door stays at TRAM.door.
   */
  const SCALE = 2;
  const D = TRAM.door;
  const PIVOT = { x: D, y: 253.5 };
  /** The near rail's top on the stage, where the wheels stand, and the far rail's. */
  const NEAR_RAIL = 260;
  const FAR_RAIL = 247;
  /** The pantograph's collector in the tram's own drawing, and the trolley wire it touches on the stage. */
  const PANTOGRAPH_TOP = 129;
  const PANTOGRAPH = D + 40;
  const WIRE = NEAR_RAIL - (PIVOT.y - PANTOGRAPH_TOP) * SCALE;
  /** Masts on the far pavement, each holding the wire out over the track on an arm and a hanger. */
  const POLES = [150, 470, 880];
  /** Where the platform starts: its kerb, the ribbed warning strip, then the paving everything stands on. */
  const KERB = 263;
  const PAVING = 276;
  /** The tram in its own drawing: its nose, its doors and windows, its bogies. */
  const FRONT = D - 180;
  const DOORS = [D - 116, D, D + 170, D + 340];
  /** Side windows as [left, width]; the one before the door stops short so a pier stands behind the cast. */
  const SIDE_WINDOWS = [[D - 92, 28], [D + 30, 38], [D + 72, 38], [D + 114, 38], [D + 200, 38], [D + 242, 38], [D + 284, 38]];
  const BOGIES = [D - 100, D + 60, D + 230];

  const shift = $derived(tram === "away" ? TRAM.away : 0);
  const id = $props.id();
</script>

<Cloud x={150} y={36} size={0.8} />
<Cloud x={600} y={22} size={0.6} />

<Facades {houses} />

<!-- The far pavement and its kerb; the road paved in setts, the masts and the two grooved rails set into it. -->
<defs>
  <pattern id="{id}-setts" x="0" y={FAR_RAIL - 6} width="20" height="6" patternUnits="userSpaceOnUse">
    <rect width="20" height="6" class="fill-scene-steel-dark/55" />
    <rect x="0.7" y="0.6" width="8.6" height="2.3" rx="0.8" class="fill-scene-steel-light" />
    <rect x="10.7" y="0.6" width="8.6" height="2.3" rx="0.8" class="fill-scene-pale" />
    <rect x="-4.3" y="3.6" width="8.6" height="2.3" rx="0.8" class="fill-scene-pale" />
    <rect x="5.7" y="3.6" width="8.6" height="2.3" rx="0.8" class="fill-scene-steel-light" />
    <rect x="15.7" y="3.6" width="8.6" height="2.3" rx="0.8" class="fill-scene-pale" />
  </pattern>
</defs>
<rect x="-10" y="226" width="980" height="5" class="fill-white/50" />
<rect x="-10" y="231" width="980" height="2" class="fill-scene-steel-light" />
<rect x="-10" y="233" width="980" height="1" class="fill-scene-line/35" />
<FloorShade y={235} />
<rect x="-10" y="234" width="980" height={KERB - 234} fill="url(#{id}-setts)" />
{#each [FAR_RAIL, NEAR_RAIL] as y (y)}
  <rect x="-10" y={y - 2.5} width="980" height="3" class="fill-scene-steel-light" />
  <rect x="-10" y={y - 2.5} width="980" height="1" class="fill-white" />
  <rect x="-10" y={y + 0.5} width="980" height="1.5" class="fill-portrait-hair" />
  <rect x="-10" y={y + 2} width="980" height="1" class="fill-scene-steel" />
{/each}

{#each POLES as x (x)}
  <rect x={x - 6} y="234" width="12" height="6" rx="1.5" class="fill-scene-steel-dark" />
  <path d="M{x - 2.5} 235L{x - 1.5} 0H{x + 1.5}L{x + 2.5} 235Z" class="fill-scene-steel-dark" />
  <!-- The arm out over the track, its stay, and the hanger the wire is clamped to. -->
  <path d="M{x} 2H{x + 36}M{x} 20L{x + 30} 2M{x + 32} 2V{WIRE}" class="stroke-scene-steel-dark" stroke-width="1.8" fill="none" />
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
    <!-- The pantograph, folded low on the roof and pressed up against the wire. -->
    <rect x={PANTOGRAPH - 20} y="134" width="40" height="5" rx="1" class="fill-scene-steel-dark" />
    <path
      d="M{PANTOGRAPH - 14} 134L{PANTOGRAPH} {PANTOGRAPH_TOP + 2}L{PANTOGRAPH + 14} 134M{PANTOGRAPH} {PANTOGRAPH_TOP + 2}V{PANTOGRAPH_TOP}"
      class="stroke-portrait-hair"
      stroke-width="1"
      fill="none"
    />
    <rect x={PANTOGRAPH - 10} y={PANTOGRAPH_TOP - 0.8} width="20" height="1.6" rx="0.8" class="fill-portrait-hair" />
    <rect x={D + 100} y="133" width="50" height="6" rx="2" class="fill-scene-steel-dark" />
    <rect x={D - 90} y="134" width="40" height="5" rx="2" class="fill-scene-steel" />

    {#each BOGIES as x (x)}
      <rect x={x - 26} y="232" width="52" height="14" rx="2" class="fill-scene-steel-dark" />
      {#each [x - 13, x + 13] as wheel (wheel)}
        <circle cx={wheel} cy="244.5" r="9" class="fill-portrait-hair" />
        <circle cx={wheel} cy="244.5" r="5.5" class="fill-scene-steel-dark" />
        <circle cx={wheel} cy="244.5" r="2" class="fill-scene-steel" />
      {/each}
    {/each}

    <path
      d="M{FRONT + 6} 241L{FRONT} 202Q{FRONT} 160 {FRONT + 14} 148Q{FRONT + 24} 138 {FRONT + 42} 138H{D + 520}V241Z"
      class="fill-white"
    />
    <path d="M{FRONT + 0.4} 206H{D + 520}V238H{FRONT + 5.5}Z" class="fill-scene-red" />
    <path d="M{FRONT + 0.2} 204H{D + 520}V206H{FRONT + 0.4}Z" class="fill-portrait-hair/80" />
    <!-- The skirt, down close to the rails between the bogies. -->
    <path d="M{FRONT + 5.5} 238H{D + 520}V241H{FRONT + 6}Z" class="fill-portrait-hair" />
    <path d="M{FRONT + 14} 148Q{FRONT + 24} 138 {FRONT + 42} 138H{D + 520}" class="stroke-scene-steel-dark" stroke-width="1.2" fill="none" />

    <!-- The cab: a raked windscreen, a pair of headlights on the nose's curve, a bumper. -->
    <path d="M{FRONT + 3} 198Q{FRONT + 3} 165 {FRONT + 16} 156H{FRONT + 40}V198Z" class="fill-portrait-hair" />
    <path d="M{FRONT + 5.5} 196Q{FRONT + 5.5} 167 {FRONT + 17} 158.5H{FRONT + 38}V196Z" class="fill-scene-steel-dark" />
    <path d="M{FRONT + 5.5} 196Q{FRONT + 5.5} 167 {FRONT + 17} 158.5H{FRONT + 38}V196Z" class="fill-scene-sky/30" />
    <path d="M{FRONT + 8} 186Q{FRONT + 9} 168 {FRONT + 19} 161H{FRONT + 25}L{FRONT + 10} 192Z" class="fill-white/35" />
    <rect x={D - 61} y="140.5" width="36" height="9" rx="1.2" class="fill-portrait-hair" />
    <text x={D - 58.5} y="147.8" font-size="7" font-weight="700" class="fill-scene-honey font-sans">4</text>
    <text x={D - 52.5} y="147.4" font-size="5.2" class="fill-scene-honey font-sans">Dúbravka</text>
    {#each [FRONT + 4.6, FRONT + 11.5] as x, index (x)}
      <ellipse cx={x} cy="225" rx={index === 0 ? 2.6 : 2.2} ry="2.2" class="fill-portrait-hair" />
      <ellipse cx={x} cy="225" rx={index === 0 ? 1.7 : 1.4} ry="1.4" class="fill-scene-honey" />
    {/each}
    <path d="M{FRONT + 5.2} 231H{FRONT + 32}V235H{FRONT + 5.6}Z" class="fill-portrait-hair" />

    <!-- Doors: two glazed leaves each, their sills low to the platform. -->
    {#each DOORS as door (door)}
      <rect x={door - 22} y="150" width="44" height="91" rx="2" class="fill-portrait-hair" />
      <rect x={door - 20} y="152" width="19" height="87" rx="1.5" class="fill-scene-steel-dark" />
      <rect x={door + 1} y="152" width="19" height="87" rx="1.5" class="fill-scene-steel-dark" />
      <rect x={door - 20} y="152" width="40" height="48" class="fill-scene-sky/30" />
      <rect x={door - 22} y="239" width="44" height="2" class="fill-scene-steel-light" />
      <path d="M{door - 12} 170V214M{door + 12} 170V214" class="stroke-scene-steel-light/70" stroke-width="1" />
      <path d="M{door - 18} 182L{door - 6} 156H{door - 3}L{door - 18} 190Z" class="fill-white/30" />
      <circle cx={door + 26} cy="214" r="2.5" class="fill-scene-honey" />
    {/each}

    {#each SIDE_WINDOWS as [x, width] (x)}
      <rect {x} y="152" {width} height="44" rx="3" class="fill-portrait-hair" />
      <rect x={x + 2} y="154" width={width - 4} height="40" rx="2" class="fill-scene-steel-dark" />
      <rect x={x + 2} y="154" width={width - 4} height="28" rx="2" class="fill-scene-sky/30" />
      <path d="M{x + 2} 166H{x + width - 2}" class="stroke-portrait-hair" stroke-width="1" />
      <path d="M{x + 4} 186L{x + width * 0.58} 156H{x + width * 0.71}L{x + 6} 192Z" class="fill-white/25" />
    {/each}
  </g>
</g>

<!-- The platform, raised from the road: its granite kerb, the ribbed warning strip along the edge, the paving. -->
<rect x="-10" y={KERB} width="980" height={310 - KERB} class="fill-scene-sand" />
<rect x="-10" y={KERB - 1.5} width="980" height="2" class="fill-scene-line/40" />
<rect x="-10" y={KERB} width="980" height="5" class="fill-scene-steel-light" />
<rect x="-10" y={KERB} width="980" height="1.5" class="fill-white" />
<rect x="-10" y={KERB + 5} width="980" height="1" class="fill-scene-line/25" />
<rect x="-10" y={KERB + 6} width="980" height={PAVING - KERB - 7} class="fill-scene-honey/45" />
{#each Array.from({ length: 196 }, (_, index) => index * 5 - 8) as x (x)}
  <rect {x} y={KERB + 7} width="2" height={PAVING - KERB - 9} rx="1" class="fill-white/70" />
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
<ellipse cx="278" cy={PAVING + 8} rx="84" ry="4" class="fill-scene-line/12" />
<rect x="214.5" y="66.5" width="131" height={PAVING + 8 - 67} class="fill-white/10 stroke-scene-steel-dark" stroke-width="1" />
<path d="M220 140L246 72H252L223 152ZM300 150L326 72H330L303 160Z" class="fill-white/45" />
<path d="M214 172H346" class="stroke-scene-steel-dark" stroke-width="1.5" />

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
<rect x="346" y="62" width="6" height={PAVING + 8 - 62} class="fill-scene-steel-dark" />
<rect x="200" y="54" width="160" height="10" rx="1" class="fill-scene-steel-dark" />
<rect x="200" y="54" width="160" height="2.5" class="fill-white/30" />
<rect x="300" y="55.5" width="40" height="7.5" rx="1" class="fill-white" />
<path d="M320 56.5v5.5" class="stroke-scene-line/30" stroke-width="1" />
<text x="310" y="61.6" text-anchor="middle" font-size="6.5" font-weight="700" class="fill-scene-line font-sans">4</text>
<text x="330" y="61.6" text-anchor="middle" font-size="6.5" font-weight="700" class="fill-scene-line font-sans">9</text>

<!-- The timetable in a steel frame, clamped to the post. -->
<rect x="314" y="118" width="30" height="56" rx="1" class="fill-scene-steel-dark" />
<rect x="316" y="120" width="26" height="52" class="fill-white" />
<rect x="316" y="120" width="26" height="7" class="fill-scene-red-mid" />
<path d="M319 132h20M319 138h15M319 144h20M319 150h13M319 156h18M319 162h11" class="stroke-scene-line/40" stroke-width="1" />
<rect x="342" y="124" width="6" height="4" class="fill-scene-steel-dark" />
<rect x="342" y="162" width="6" height="4" class="fill-scene-steel-dark" />

<Bench bench={PARTS.street.bench} />

<!-- A litter bin between the shelter and the stop's pole, a step from each. -->
<ellipse cx="367" cy={PAVING + 8} rx="8" ry="2" class="fill-scene-line/15" />
<path d="M361 {PAVING - 22}h12l-1 26h-10Z" class="fill-scene-steel" />
<path d="M360.5 {PAVING - 24}h13v3h-13Z" class="fill-scene-steel-dark" />
<rect x="362" y={PAVING + 4} width="10" height="4" rx="1" class="fill-scene-steel-dark" />

<!-- The departure board, hung from the shelter roof: the next trams and their minutes. -->
<path d="M286 64V70M324 64V70" class="stroke-scene-steel-dark" stroke-width="1.5" />
<rect x="276" y="70" width="58" height="19" rx="1.5" class="fill-scene-steel-dark" />
<rect x="278" y="72" width="54" height="15" class="fill-portrait-hair" />
<text x="280.5" y="78.4" font-size="5" font-weight="700" class="fill-scene-honey font-sans">4 Dúbravka</text>
<text x="329.5" y="78.4" text-anchor="end" font-size="5" class="fill-scene-honey font-sans">2'</text>
<text x="280.5" y="85" font-size="5" font-weight="700" class="fill-scene-honey font-sans">9 Karlova Ves</text>
<text x="329.5" y="85" text-anchor="end" font-size="5" class="fill-scene-honey font-sans">6'</text>

<!-- The stop's sign flying from its own pole beside the shelter: a tram, the stop's name. -->
<ellipse cx="388" cy={PAVING + 8} rx="8" ry="2.5" class="fill-scene-line/15" />
<rect x="383" y={PAVING + 2} width="10" height="6" rx="1.5" class="fill-scene-steel-dark" />
<rect x="386" y="8" width="4" height={PAVING + 3 - 8} class="fill-scene-steel-dark" />
<rect x="390" y="10" width="48" height="40" rx="2" class="fill-scene-red-mid" />
<rect x="392" y="12" width="44" height="36" rx="1.5" class="fill-white" />
<path d="M408 17l4-3h4l4 3" class="stroke-scene-line/70" stroke-width="1" fill="none" />
<rect x="403" y="17" width="22" height="11" rx="3" class="fill-scene-red-mid" />
<rect x="406" y="19" width="7" height="4.5" rx="1" class="fill-white" />
<rect x="415" y="19" width="7" height="4.5" rx="1" class="fill-white" />
<circle cx="408" cy="30" r="1.8" class="fill-scene-line/70" />
<circle cx="420" cy="30" r="1.8" class="fill-scene-line/70" />
<rect x="392" y="34" width="44" height="14" class="fill-scene-line/80" />
<text x="414" y="43.4" text-anchor="middle" font-size="6" font-weight="700" class="fill-white font-sans"
  >Kamenné nám.</text
>

<StreetLamp lamp={PARTS.street.lamp} />
