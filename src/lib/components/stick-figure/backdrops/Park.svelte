<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Bench from "./Bench.svelte";
  import Castle from "./Castle.svelte";
  import Cloud from "./Cloud.svelte";
  import FloorShade from "./FloorShade.svelte";
  import StreetLamp from "./StreetLamp.svelte";

  // Looks the same at every hour; it is handed the props every drawing gets.
  let {}: Record<string, unknown> = $props();
</script>

<!-- By the Danube, with Bratislava Castle on its hill. -->
<Cloud x={250} y={62} />
<Cloud x={470} y={46} size={0.6} />
<path d="M-10 226V176Q90 136 220 152Q300 162 380 196V226Z" class="fill-scene-cool" />

<!-- The castle is drawn before its hill, so the hill hides the foot of the walls. -->
<Castle x={680} y={112} />
<path
  d="M520 226V170Q600 96 680 88Q760 84 880 120Q930 142 970 156V226Z"
  class="fill-scene-sage"
/>

<rect x="-10" y="194" width="980" height="18" class="fill-portrait-ground" />
<path
  d="M90 202h40v2H90ZM300 200h50v2h-50ZM560 203h40v2h-40ZM800 201h56v2h-56Z"
  class="fill-white/70"
/>
<rect x="-10" y="212" width="980" height="98" class="fill-scene-sage" />
<FloorShade y={212} />
<!-- Bushes and flowers on the bank, so the strip reads as a park lawn and not a beach. -->
{#each [{ x: 330, r: 14 }, { x: 452, r: 10 }, { x: 560, r: 13 }] as bush (bush.x)}
  <circle
    cx={bush.x - bush.r * 0.8}
    cy={240 - bush.r * 0.3}
    r={bush.r * 0.75}
    class="fill-scene-leaf"
  />
  <circle
    cx={bush.x + bush.r * 0.8}
    cy={240 - bush.r * 0.3}
    r={bush.r * 0.75}
    class="fill-scene-leaf"
  />
  <circle cx={bush.x} cy={240 - bush.r * 0.7} r={bush.r} class="fill-scene-leaf" />
{/each}
<path
  d="M214 234h4v4h-4ZM276 246h4v4h-4ZM392 228h4v4h-4ZM506 244h4v4h-4ZM612 232h4v4h-4ZM736 240h4v4h-4ZM828 230h4v4h-4Z"
  class="fill-scene-red"
/>
<path
  d="M240 240h4v4h-4ZM418 248h4v4h-4ZM590 246h4v4h-4ZM706 228h4v4h-4ZM800 246h4v4h-4Z"
  class="fill-scene-honey"
/>

<!-- The gravel path the cast walks on, with lawn again in front of it. -->
<path d="M-10 310V264Q480 236 970 264V310Z" class="fill-scene-sand" />
<path d="M-10 310V298Q480 284 970 298V310Z" class="fill-scene-sage" />

<StreetLamp lamp={PARTS.default.lamp} />
<Bench bench={PARTS.default.bench} />

{#each [{ x: 150, r: 36 }, { x: 322, r: 26 }, { x: 836, r: 40 }] as tree (tree.x)}
  <ellipse cx={tree.x} cy="223" rx={tree.r * 1.1} ry="4" class="fill-scene-line/12" />
  <rect x={tree.x - 5} y="150" width="10" height="72" class="fill-scene-wood" />
  <circle cx={tree.x - 24} cy="150" r={tree.r * 0.66} class="fill-scene-leaf" />
  <circle cx={tree.x + 24} cy="148" r={tree.r * 0.7} class="fill-scene-leaf" />
  <circle cx={tree.x} cy="124" r={tree.r} class="fill-scene-leaf" />
  <circle cx={tree.x - 10} cy="114" r={tree.r * 0.42} class="fill-white/15" />
{/each}
