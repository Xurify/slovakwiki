<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Bench from "./Bench.svelte";
  import Cloud from "./Cloud.svelte";
  import Facades, { type Facade } from "./Facades.svelte";
  import FloorShade from "./FloorShade.svelte";
  import StreetLamp from "./StreetLamp.svelte";
  import Tree from "./Tree.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  /** Old-town facades left to right; neighbours never share a paint, as nothing outlines them. */
  const houses: Facade[] = [
    { x: -10, width: 120, top: 92, gable: true, door: true, paint: "fill-scene-clay" },
    { x: 110, width: 70, top: 116, gable: false, door: false, paint: "fill-scene-sage" },
    { x: 180, width: 70, top: 104, gable: true, door: false, paint: "fill-scene-honey" },
    { x: 316, width: 158, top: 124, gable: false, door: true, paint: "fill-scene-warm" },
    { x: 474, width: 124, top: 112, gable: true, door: false, paint: "fill-scene-clay" },
    { x: 598, width: 112, top: 98, gable: false, door: true, paint: "fill-scene-sage" },
    { x: 710, width: 112, top: 118, gable: true, door: false, paint: "fill-scene-honey" },
    { x: 822, width: 148, top: 90, gable: false, door: true, paint: "fill-scene-warm" },
  ];
</script>

<Cloud x={560} y={60} />
<Cloud x={860} y={64} size={0.7} />
<Cloud x={110} y={56} size={0.8} />

<Facades {houses} />

<!-- Michael's Gate: the old-town tower with a green copper roof. -->
<rect x="250" y="104" width="66" height="122" class="fill-portrait-bib" />
<rect x="258" y="82" width="50" height="22" class="fill-portrait-bib" />
<rect x="258" y="98" width="50" height="6" class="fill-scene-line/8" />
<path d="M256 82Q256 64 283 60Q310 64 310 82Z" class="fill-scene-sage" />
<path d="M283 60Q310 64 310 82H283Z" class="fill-scene-line/10" />
<path d="M270 60Q270 48 283 42Q296 48 296 60Z" class="fill-scene-sage" />
<path d="M282 42h2v-12h-2Z" class="fill-scene-line/50" />
<circle cx="283" cy="29" r="2.6" class="fill-scene-honey" />
<WallClock clock={PARTS.plaza.clock} {hour} />
<path d="M272 226V190A11 11 0 0 1 294 190V226Z" class="fill-scene-line/25" />

<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<FloorShade />

<Bench bench={PARTS.plaza.bench} />
<StreetLamp lamp={PARTS.plaza.lamp} />
<Tree tree={PARTS.plaza.tree} />
