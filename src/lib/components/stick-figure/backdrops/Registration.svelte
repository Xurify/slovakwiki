<script lang="ts">
  import Plant from "./Plant.svelte";
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-cool" stroke="none" />
<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<rect x="-10" y="226" width="980" height="7" class="fill-scene-line/15" stroke="none" />

<path d="M426 -10V30M534 -10V30" />
<rect x="400" y="30" width="160" height="34" rx="4" class="fill-portrait-ground" />
<text
  x="480"
  y="53"
  text-anchor="middle"
  class="fill-portrait-ink font-sans"
  stroke="none"
  font-size="15"
  font-weight="600"
>
  Registrácia
</text>

<circle cx="300" cy="72" r="22" class="fill-portrait-bib" />
<path d="M300 53v3M300 88v3M281 72h3M316 72h3" />
<path d="M300 60V72L310 78" stroke-width="2" />

{#each [36, 104, 172] as x (x)}
  <rect x={x + 4} y="156" width="50" height="32" rx="6" class="fill-portrait-ground" />
  <rect {x} y="188" width="58" height="11" rx="3" class="fill-portrait-ground" />
  <path d="M{x + 7} 199V226M{x + 51} 199V226" stroke-width="2.4" />
{/each}

<Plant x={256} y={226} />

<rect x="648" y="150" width="330" height="76" class="fill-scene-wood" />
<path d="M648 172H978" class="stroke-scene-line/40" />
<rect x="640" y="140" width="340" height="12" rx="3" class="fill-portrait-bib" />
<rect x="842" y="86" width="72" height="48" rx="4" class="fill-scene-cool" />
<rect x="848" y="92" width="60" height="36" rx="2" class="fill-scene-sky" />
<path d="M878 134V140M866 140H890" stroke-width="2.4" />
<path d="M700 140A9 9 0 0 1 718 140Z" class="fill-scene-honey" />
<path d="M709 131v-3" />
<path d="M756 140l4-6h40l4 6Z" class="fill-portrait-bib" />
