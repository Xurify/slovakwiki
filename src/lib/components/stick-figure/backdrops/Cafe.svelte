<script lang="ts">
  import Chalkboard from "./Chalkboard.svelte";
  import FloorShade from "./FloorShade.svelte";
  import Plant from "./Plant.svelte";
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-warm" />
<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<FloorShade />

<path d="M100 204V112A88 88 0 0 1 276 112V204Z" class="fill-portrait-bib" />
<path d="M110 200V112A78 78 0 0 1 266 112V200Z" class="fill-scene-sky" />
<path d="M110 200V150H144V132H190V154H224V142H266V200Z" class="fill-scene-clay" />
<path
  d="M122 162h9v13h-9ZM158 144h9v13h-9ZM158 170h9v13h-9ZM236 154h9v13h-9Z"
  class="fill-portrait-bib"
/>
<path d="M186 34h4v166h-4ZM110 126h156v4H110Z" class="fill-portrait-bib" />
<rect x="92" y="200" width="192" height="9" rx="3" class="fill-scene-wood" />
<rect x="96" y="209" width="184" height="4" class="fill-scene-line/10" />

{#each [380, 480, 580] as x (x)}
  <path d="M{x} -10V38" class="stroke-scene-line/40" stroke-width="1.2" />
  <path
    d="M{x - 18} 56Q{x - 18} 38 {x} 38Q{x + 18} 38 {x + 18} 56Z"
    class="fill-scene-honey"
  />
  <ellipse cx={x} cy="56" rx="18" ry="2.6" class="fill-scene-line/15" />
  <ellipse cx={x} cy="57" rx="6" ry="3" class="fill-portrait-bib" />
{/each}

<Chalkboard x={650} y={50} width={108} height={90}>
  <text x="54" y="24" text-anchor="middle" font-size="21">Menu</text>
  <path
    d="M34 31q20-4 40 0"
    class="stroke-portrait-bib/80"
    fill="none"
    stroke-width="1.4"
  />
  <text x="54" y="51" text-anchor="middle" font-size="15">Káva 2,50&nbsp;€</text>
  <text x="54" y="68" text-anchor="middle" font-size="15">Čaj 2,00&nbsp;€</text>
  <text x="54" y="85" text-anchor="middle" font-size="15">Koláč 3,00&nbsp;€</text>
</Chalkboard>

<rect x="780" y="160" width="200" height="66" class="fill-scene-wood" />
{#each [794, 852, 910] as x (x)}
  <rect {x} y="172" width="46" height="44" rx="3" class="fill-scene-line/8" />
{/each}
<rect x="772" y="150" width="210" height="11" rx="3" class="fill-portrait-bib" />
<rect x="780" y="161" width="200" height="4" class="fill-scene-line/12" />

<rect x="820.5" y="142" width="3" height="8" class="fill-scene-edge" />
<ellipse cx="822" cy="142" rx="26" ry="3" class="fill-portrait-bib" />
<path d="M803 140V124Q822 118 841 124V140Z" class="fill-scene-honey" />
<path
  d="M803 124Q822 118 841 124V129Q832 134 822 128Q812 134 803 129Z"
  class="fill-portrait-bib"
/>
<circle cx="822" cy="118" r="3" class="fill-scene-clay" />
<path d="M797 142V117A25 25 0 0 1 847 117V142Z" class="fill-portrait-bib/35" />
<path
  d="M803 121a19 19 0 0 1 10-13"
  class="stroke-white/80"
  fill="none"
  stroke-width="2"
/>

<rect x="872" y="84" width="98" height="5" rx="1.5" class="fill-scene-wood" />
<rect x="874" y="89" width="94" height="2" class="fill-scene-line/10" />
<path d="M884 89h8l-8 8ZM956 89h-8l8 8Z" class="fill-scene-wood" />
<rect x="893" y="77" width="50" height="3" rx="1.5" class="fill-portrait-bib" />
<rect x="912" y="80" width="12" height="4" rx="1" class="fill-scene-edge" />
<rect x="898" y="56" width="40" height="21" rx="2" class="fill-scene-honey" />
<path d="M898 63h40v2.4h-40ZM898 70h40v2.4h-40Z" class="fill-scene-clay" />
<rect x="897" y="52" width="42" height="7" rx="3" class="fill-portrait-bib" />
{#each [903, 913, 923, 933] as x (x)}
  <circle cx={x} cy="51.5" r="2.7" class="fill-portrait-bib" />
  <circle cx={x} cy="48.8" r="1.8" class="fill-scene-clay" />
{/each}

<rect x="880" y="98" width="58" height="52" rx="5" class="fill-portrait-vest" />
<rect x="890" y="107" width="38" height="12" rx="2" class="fill-scene-sage" />
<path d="M901 119h3v8h-3ZM914 119h3v8h-3Z" class="fill-scene-edge" />
<path d="M901 136h16l-2 10h-12Z" class="fill-portrait-bib" />
<rect x="884" y="146" width="50" height="4" rx="1" class="fill-scene-edge" />

<ellipse cx="190" cy="254" rx="44" ry="4.5" class="fill-scene-line/12" />
<g class="stroke-scene-wood" fill="none" stroke-width="3.2">
  <path d="M120 256L125 232H150L154 256M125 232Q117 212 122 198Q129 188 137 196" />
  <path d="M260 256L255 232H230L226 256M255 232Q263 212 258 198Q251 188 243 196" />
</g>
<ellipse cx="190" cy="217" rx="40" ry="6" class="fill-scene-edge" />
<ellipse cx="190" cy="214" rx="40" ry="6" class="fill-portrait-bib" />
<rect x="188" y="220" width="4" height="31" class="fill-scene-wood" />
<rect x="174" y="250" width="32" height="4" rx="2" class="fill-scene-wood" />
<path d="M174 210h11v-7h-11ZM196 210h11v-7h-11Z" class="fill-portrait-bib" />
<path d="M175 204h9M197 204h9" class="stroke-scene-wood" stroke-width="2" />

<Plant x={44} y={246} />
