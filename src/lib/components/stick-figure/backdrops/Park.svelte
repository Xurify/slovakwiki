<!-- By the Danube, with Bratislava Castle on its hill. -->
<rect x="-10" y="-10" width="980" height="236" class="fill-scene-sky" stroke="none" />
<path d="M-10 226V176Q90 136 220 152Q300 162 380 196V226Z" class="fill-scene-cool" />
<path
  d="M520 226V170Q600 90 700 86Q800 84 880 120Q930 142 970 156V226Z"
  class="fill-scene-sage"
/>

<path d="M646 86V60H714V86Z" class="fill-portrait-bib" />
<path d="M638 86V50H652V86ZM708 86V50H722V86Z" class="fill-portrait-bib" />
<path d="M636 50L645 38L654 50ZM706 50L715 38L724 50Z" class="fill-scene-clay" />
<g stroke-width="1.2">
  <path d="M658 68h6v6h-6ZM677 68h6v6h-6ZM696 68h6v6h-6Z" class="fill-scene-sky" />
</g>

<rect x="-10" y="194" width="980" height="18" class="fill-portrait-ground" />
<path d="M90 203h40M300 201h50M560 204h40M800 202h56" class="stroke-portrait-bib" />
<rect x="-10" y="212" width="980" height="98" class="fill-scene-sage" />
<path d="M-10 310V264Q480 236 970 264V310Z" class="fill-scene-sand" />

{#each [{ x: 96, r: 34 }, { x: 878, r: 38 }] as tree (tree.x)}
  <rect x={tree.x - 5} y="150" width="10" height="72" class="fill-scene-wood" />
  <circle cx={tree.x - 24} cy="150" r={tree.r * 0.66} class="fill-scene-leaf" />
  <circle cx={tree.x + 24} cy="148" r={tree.r * 0.7} class="fill-scene-leaf" />
  <circle cx={tree.x} cy="124" r={tree.r} class="fill-scene-leaf" />
{/each}
