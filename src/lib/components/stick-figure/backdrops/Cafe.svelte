<script lang="ts">
  import FloorShade from "./FloorShade.svelte";
  import Plant from "./Plant.svelte";
</script>

<g stroke="none">
  <rect x="-10" y="-10" width="980" height="236" class="fill-scene-warm" />
  <rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
</g>
<FloorShade seams />

<path d="M100 204V112A88 88 0 0 1 276 112V204Z" class="fill-portrait-bib" />
<g stroke="none">
  <path d="M112 204V112A76 76 0 0 1 264 112V204Z" class="fill-scene-sky" />
  <path d="M112 204V150H146V132H192V154H226V142H264V204Z" class="fill-scene-clay" />
  <path
    d="M124 162h9v13h-9ZM160 144h9v13h-9ZM160 170h9v13h-9ZM238 154h9v13h-9Z"
    class="fill-portrait-bib"
  />
</g>
<path d="M188 36V204M112 128H264" />
<rect x="92" y="200" width="192" height="9" rx="3" class="fill-scene-wood" />

{#each [380, 480, 580] as x (x)}
  <path d="M{x} -10V38" />
  <path
    d="M{x - 18} 56Q{x - 18} 38 {x} 38Q{x + 18} 38 {x + 18} 56Z"
    class="fill-scene-honey"
  />
{/each}

<rect x="640" y="50" width="122" height="88" rx="5" class="fill-scene-wood" />
<rect
  x="647"
  y="57"
  width="108"
  height="74"
  rx="3"
  class="fill-scene-board"
  stroke="none"
/>
<g class="fill-portrait-bib font-serif" stroke="none" font-size="13">
  <text x="657" y="81">Káva</text>
  <text x="745" y="81" text-anchor="end">2,50&nbsp;€</text>
  <text x="657" y="102">Čaj</text>
  <text x="745" y="102" text-anchor="end">2,00&nbsp;€</text>
  <text x="657" y="123">Koláč</text>
  <text x="745" y="123" text-anchor="end">3,00&nbsp;€</text>
</g>

<rect x="780" y="160" width="200" height="66" class="fill-scene-wood" />
<path d="M820 170V216M860 170V216M900 170V216M940 170V216" class="stroke-scene-line/15" />
<rect x="772" y="150" width="210" height="11" rx="3" class="fill-portrait-bib" />
<path d="M822 150V144" />
<ellipse cx="822" cy="143" rx="26" ry="3" class="fill-portrait-bib" />
<path d="M803 140V124Q822 118 841 124V140Z" class="fill-scene-honey" stroke="none" />
<path
  d="M803 124Q822 118 841 124V129Q832 134 822 128Q812 134 803 129Z"
  class="fill-portrait-bib"
  stroke="none"
/>
<circle cx="822" cy="118" r="3" class="fill-scene-clay" stroke="none" />
<path d="M797 142V117A25 25 0 0 1 847 117V142" class="fill-portrait-bib/40" />
<rect x="880" y="98" width="58" height="52" rx="5" class="fill-scene-cool" />
<rect
  x="890"
  y="107"
  width="38"
  height="13"
  rx="2"
  class="fill-scene-sage"
  stroke="none"
/>
<path d="M903 120v7M915 120v7" />
<path d="M901 139h16l-2 11h-12Z" class="fill-portrait-bib" />

<ellipse cx="190" cy="214" rx="40" ry="6" class="fill-portrait-bib" />
<path d="M190 220V250M174 252h32" class="stroke-scene-wood" stroke-width="3.2" />
<path d="M174 208h11v-7h-11ZM196 208h11v-7h-11Z" class="fill-portrait-bib" />
<g class="stroke-scene-wood" stroke-width="3.2">
  <path d="M120 256L125 232H150L154 256M125 232Q117 212 122 198Q129 188 137 196" />
  <path d="M260 256L255 232H230L226 256M255 232Q263 212 258 198Q251 188 243 196" />
</g>

<Plant x={44} y={246} />
