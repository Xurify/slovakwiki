<script lang="ts">
  import type { Snippet } from "svelte";

  import { TRAM, type TramState } from "$lib/stick-figure/street";
  import Cloud from "./Cloud.svelte";
  import Facades, { type Facade } from "./Facades.svelte";
  import FloorShade from "./FloorShade.svelte";

  let { sky, tram }: { sky?: Snippet; tram: TramState } = $props();

  /** Town houses along the far side of the street; neighbours never share a paint. */
  const houses: Facade[] = [
    { x: -10, width: 150, top: 100, gable: false, door: true, paint: "fill-scene-warm" },
    { x: 140, width: 90, top: 118, gable: true, door: false, paint: "fill-scene-sage" },
    { x: 230, width: 130, top: 96, gable: false, door: true, paint: "fill-scene-honey" },
    { x: 360, width: 110, top: 124, gable: true, door: false, paint: "fill-scene-clay" },
    { x: 470, width: 160, top: 104, gable: false, door: true, paint: "fill-scene-warm" },
    { x: 630, width: 100, top: 116, gable: true, door: false, paint: "fill-scene-sage" },
    { x: 730, width: 130, top: 94, gable: false, door: true, paint: "fill-scene-clay" },
    { x: 860, width: 110, top: 120, gable: true, door: false, paint: "fill-scene-honey" },
  ];

  const WINDOWS = [656, 700, 744, 788, 832];

  const shift = $derived(tram === "away" ? TRAM.away : 0);
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-sky" />
{@render sky?.()}
<Cloud x={420} y={50} />
<Cloud x={760} y={62} size={0.7} />

<Facades {houses} />

<!-- The overhead wire the tram runs under. -->
<path d="M-10 122H970" class="stroke-scene-line/30" stroke-width="1" />

<rect x="-10" y="226" width="980" height="28" class="fill-scene-line/15" />
<FloorShade />
<path d="M-10 240H970M-10 247H970" class="stroke-scene-line/40" stroke-width="1.5" />

<!-- The tram pulls in from the right and stops with its door at the sign. -->
<g
  class="transition-transform ease-out"
  style:transform="translateX({shift}px)"
  style:transition-duration="{tram === 'coming' ? TRAM.ms : 0}ms"
>
  <path
    d="M708 136L724 122L740 136M716 122H732"
    class="stroke-scene-line/60"
    stroke-width="1.5"
  />
  <rect x="560" y="136" width="320" height="108" rx="12" class="fill-scene-clay" />
  <rect x="566" y="230" width="308" height="12" class="fill-scene-line/30" />
  <rect x="560" y="136" width="320" height="10" rx="5" class="fill-scene-line/10" />

  {#each WINDOWS as x (x)}
    <rect {x} y="152" width="34" height="36" rx="3" class="fill-white/70" />
    <rect x={x + 2} y="154" width="30" height="32" rx="2" class="fill-scene-sky" />
  {/each}

  <rect x="600" y="152" width="42" height="84" rx="3" class="fill-white/70" />
  <rect x="603" y="155" width="17" height="78" rx="2" class="fill-scene-sky" />
  <rect x="622" y="155" width="17" height="78" rx="2" class="fill-scene-sky" />

  <rect x="566" y="156" width="28" height="36" rx="3" class="fill-white/70" />
  <rect x="568" y="158" width="24" height="32" rx="2" class="fill-scene-sky" />
  <rect x="566" y="140" width="28" height="13" rx="2" class="fill-white" />
  <text
    x="580"
    y="150.5"
    text-anchor="middle"
    font-size="11"
    font-weight="700"
    class="fill-scene-line font-sans"
  >
    4
  </text>
  <circle cx="566" cy="222" r="3.5" class="fill-scene-honey" />
</g>

<rect x="-10" y="254" width="980" height="56" class="fill-scene-sand" />
<rect x="-10" y="252" width="980" height="4" class="fill-white/40" />

<ellipse cx="100" cy="258" rx="34" ry="4" class="fill-scene-line/12" />
<rect x="95" y="160" width="10" height="98" class="fill-scene-wood" />
<circle cx="80" cy="160" r="24" class="fill-scene-leaf" />
<circle cx="124" cy="156" r="26" class="fill-scene-leaf" />
<circle cx="100" cy="132" r="32" class="fill-scene-leaf" />
<circle cx="90" cy="124" r="14" class="fill-white/15" />

<ellipse cx="300" cy="257" rx="12" ry="3" class="fill-scene-line/15" />
<rect x="297" y="96" width="6" height="160" class="fill-scene-line/60" />
<rect x="292" y="250" width="16" height="7" rx="2" class="fill-scene-line/60" />
<path d="M288 96h24l-4-22h-16Z" class="fill-scene-honey" />
<path d="M290 74h20l-10-8Z" class="fill-scene-line/60" />

<!-- The stop: a sign on a post, with a tram on it. -->
<ellipse cx="650" cy="256" rx="8" ry="2" class="fill-scene-line/15" />
<rect x="648" y="150" width="4" height="106" class="fill-scene-line/60" />
<rect x="632" y="146" width="36" height="36" rx="6" class="fill-white" />
<rect
  x="634.5"
  y="148.5"
  width="31"
  height="31"
  rx="5"
  class="stroke-scene-clay"
  stroke-width="2"
/>
<rect x="641" y="156" width="18" height="12" rx="2" class="fill-scene-clay" />
<rect x="644" y="158.5" width="5" height="5" rx="1" class="fill-white" />
<rect x="651" y="158.5" width="5" height="5" rx="1" class="fill-white" />
<circle cx="645.5" cy="170.5" r="2" class="fill-scene-clay" />
<circle cx="654.5" cy="170.5" r="2" class="fill-scene-clay" />

<ellipse cx="733" cy="279" rx="70" ry="4" class="fill-scene-line/12" />
<path d="M678 222h5v56h-5ZM783 222h5v56h-5Z" class="fill-scene-wood" />
<rect x="668" y="250" width="130" height="10" rx="2" class="fill-scene-wood" />
<rect x="672" y="222" width="122" height="10" rx="2" class="fill-scene-wood" />
<rect x="668" y="260" width="130" height="3" class="fill-scene-line/12" />
