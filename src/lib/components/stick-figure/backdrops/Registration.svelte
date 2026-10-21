<script lang="ts">
  import FloorShade from "./FloorShade.svelte";
  import Plant from "./Plant.svelte";
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-cool" />
<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<FloorShade />

<path d="M426 -10V30M534 -10V30" class="stroke-scene-line/40" stroke-width="1.2" />
<rect x="402" y="32" width="160" height="34" rx="4" class="fill-scene-line/10" />
<rect x="400" y="30" width="160" height="34" rx="4" class="fill-portrait-ground" />
<text
  x="480"
  y="53"
  text-anchor="middle"
  class="fill-portrait-ink font-sans"
  font-size="15"
  font-weight="600"
>
  Registrácia
</text>

<circle cx="300" cy="72" r="24" class="fill-scene-edge" />
<circle cx="300" cy="72" r="21" class="fill-white" />
<path
  d="M300 54v3M300 87v3M282 72h3M315 72h3"
  class="stroke-scene-line/50"
  fill="none"
  stroke-width="1.6"
/>
<path d="M300 60V72L310 78" class="stroke-scene-line" fill="none" stroke-width="2.2" />

{#each [36, 104, 172] as x (x)}
  <ellipse cx={x + 29} cy="227" rx="30" ry="3" class="fill-scene-line/12" />
  <path d="M{x + 6} 199h3v27h-3ZM{x + 49} 199h3v27h-3Z" class="fill-scene-line/50" />
  <rect x={x + 4} y="156" width="50" height="34" rx="6" class="fill-portrait-ground" />
  <rect {x} y="188" width="58" height="12" rx="3" class="fill-portrait-ground" />
  <rect x={x + 4} y="186" width="50" height="3" class="fill-scene-line/10" />
{/each}

<Plant x={256} y={228} />

<rect x="648" y="150" width="330" height="76" class="fill-scene-wood" />
{#each [662, 744, 826, 908] as x (x)}
  <rect {x} y="164" width="66" height="52" rx="3" class="fill-scene-line/8" />
{/each}
<rect x="640" y="140" width="340" height="12" rx="3" class="fill-portrait-bib" />
<rect x="648" y="152" width="330" height="4" class="fill-scene-line/12" />
<rect x="842" y="86" width="72" height="48" rx="4" class="fill-portrait-vest" />
<rect x="847" y="91" width="62" height="38" rx="2" class="fill-scene-sky" />
<path d="M876 134h4v6h-4ZM864 138h28v3h-28Z" class="fill-portrait-vest" />
<path d="M700 140A9 9 0 0 1 718 140Z" class="fill-scene-honey" />
<rect x="708" y="128" width="2" height="4" class="fill-scene-honey" />
<path d="M756 140l4-6h40l4 6Z" class="fill-white" />
<rect x="762" y="131" width="36" height="3" class="fill-white" />
