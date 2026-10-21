<script lang="ts">
  import FloorShade from "./FloorShade.svelte";
  import Plant from "./Plant.svelte";

  const stripes = Array.from({ length: 33 }, (_, index) => index * 30);
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-warm" stroke="none" />
{#each stripes as x (x)}
  <path d="M{x} -10V226" class="stroke-scene-clay/15" stroke-width="6" />
{/each}

<rect x="-10" y="226" width="980" height="84" class="fill-scene-wood" stroke="none" />
<FloorShade seams />
<ellipse cx="480" cy="277" rx="250" ry="18" class="fill-scene-sage" stroke="none" />
<ellipse
  cx="480"
  cy="277"
  rx="232"
  ry="11"
  class="stroke-portrait-bib"
  stroke-width="2"
/>

<rect x="96" y="44" width="150" height="120" class="fill-portrait-bib" />
<rect x="106" y="54" width="130" height="100" class="fill-scene-sky" />
<path
  d="M107 153V128Q140 108 172 124Q204 104 235 120V153Z"
  class="fill-scene-sage"
  stroke="none"
/>
<path d="M171 54V154M106 104H236" />
<rect x="88" y="160" width="166" height="8" rx="2" class="fill-portrait-bib" />
<path d="M78 36H264" stroke-width="3" />
<path d="M84 36Q78 100 92 178H112Q100 112 110 36Z" class="fill-scene-clay" />
<path d="M258 36Q264 100 250 178H230Q242 112 232 36Z" class="fill-scene-clay" />

<rect x="424" y="36" width="50" height="40" class="fill-scene-wood" />
<rect x="430" y="42" width="38" height="28" class="fill-scene-sky" />
<path d="M431 69V60Q446 50 467 58V69Z" class="fill-scene-sage" stroke="none" />
<circle cx="456" cy="51" r="4" class="fill-scene-honey" stroke="none" />
<rect x="488" y="42" width="40" height="34" class="fill-scene-wood" />
<rect x="494" y="48" width="28" height="22" class="fill-scene-clay" />

<rect x="686" y="142" width="214" height="58" rx="10" class="fill-portrait-ground" />
<rect x="676" y="186" width="234" height="28" rx="8" class="fill-portrait-ground" />
<rect x="666" y="164" width="28" height="50" rx="10" class="fill-portrait-ground" />
<rect x="892" y="164" width="28" height="50" rx="10" class="fill-portrait-ground" />
<path d="M684 214v9M902 214v9" stroke-width="3" />
<rect
  x="708"
  y="156"
  width="40"
  height="32"
  rx="8"
  transform="rotate(-8 728 172)"
  class="fill-scene-honey"
/>
<rect
  x="838"
  y="156"
  width="40"
  height="32"
  rx="8"
  transform="rotate(8 858 172)"
  class="fill-scene-clay"
/>

<rect x="742" y="50" width="104" height="72" class="fill-scene-wood" />
<rect x="750" y="58" width="88" height="56" class="fill-scene-sky" />
<path d="M751 113V100Q776 84 794 92Q816 82 837 98V113Z" class="fill-scene-sage" />
<g stroke-width="1">
  <path d="M778 90V76H808V90Z" class="fill-portrait-bib" />
  <path d="M775 90V72H781V90ZM805 90V72H811V90Z" class="fill-portrait-bib" />
  <path d="M774 72L778 66L782 72ZM804 72L808 66L812 72Z" class="fill-scene-clay" />
</g>

<path d="M944 226V98" stroke-width="2.6" />
<path d="M936 226h16" stroke-width="3" />
<path d="M928 98h32l-6-28h-20Z" class="fill-scene-honey" />

<Plant x={40} y={226} />
