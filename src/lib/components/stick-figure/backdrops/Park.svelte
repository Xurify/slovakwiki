<script lang="ts">
  import Cloud from "./Cloud.svelte";
  import FloorShade from "./FloorShade.svelte";
</script>

<!-- By the Danube, with Bratislava Castle on its hill. -->
<rect x="-10" y="-10" width="980" height="236" class="fill-scene-sky" />
<Cloud x={250} y={62} />
<Cloud x={470} y={46} size={0.6} />
<path d="M-10 226V176Q90 136 220 152Q300 162 380 196V226Z" class="fill-scene-cool" />

<!-- The castle is drawn before its hill, so the hill hides the foot of the walls. -->
<path d="M646 112V60H714V112Z" class="fill-white" />
<path d="M638 112V50H652V112ZM708 112V50H722V112Z" class="fill-white" />
<path d="M636 50L645 38L654 50ZM706 50L715 38L724 50Z" class="fill-scene-clay" />
<path d="M658 68h6v6h-6ZM677 68h6v6h-6ZM696 68h6v6h-6Z" class="fill-scene-sky" />
<path d="M646 60h68v4h-68Z" class="fill-scene-line/8" />
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
<path d="M-10 310V264Q480 236 970 264V310Z" class="fill-scene-sand" />

{#each [{ x: 96, r: 34 }, { x: 878, r: 38 }] as tree (tree.x)}
  <ellipse cx={tree.x} cy="223" rx={tree.r * 1.1} ry="4" class="fill-scene-line/12" />
  <rect x={tree.x - 5} y="150" width="10" height="72" class="fill-scene-wood" />
  <circle cx={tree.x - 24} cy="150" r={tree.r * 0.66} class="fill-scene-leaf" />
  <circle cx={tree.x + 24} cy="148" r={tree.r * 0.7} class="fill-scene-leaf" />
  <circle cx={tree.x} cy="124" r={tree.r} class="fill-scene-leaf" />
  <circle cx={tree.x - 10} cy="114" r={tree.r * 0.42} class="fill-white/15" />
{/each}
