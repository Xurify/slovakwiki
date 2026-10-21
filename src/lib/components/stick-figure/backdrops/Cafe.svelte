<script lang="ts">
  import Plant from "./Plant.svelte";
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-warm" stroke="none" />

<path d="M110 176V110A84 84 0 0 1 278 110V176Z" class="fill-portrait-bib" />
<path d="M122 176V110A72 72 0 0 1 266 110V176Z" class="fill-scene-sky" />
<path d="M123 176V136H158V118H198V142H230V126H265V176Z" class="fill-scene-clay" />
<path
  d="M134 146h10v14h-10ZM170 128h10v14h-10ZM170 154h10v14h-10ZM240 136h10v14h-10Z"
  class="fill-portrait-bib"
/>
<path d="M194 38V176M122 126H266" />
<rect x="100" y="172" width="188" height="8" rx="2" class="fill-scene-wood" />

<rect x="-10" y="180" width="980" height="46" class="fill-scene-wood" />
<path d="M-10 187H970" />
<rect x="-10" y="226" width="980" height="84" class="fill-scene-sand" />
<rect x="-10" y="226" width="980" height="7" class="fill-scene-line/15" stroke="none" />

{#each [404, 480, 556] as x (x)}
  <path d="M{x} -10V30" />
  <path
    d="M{x - 17} 48Q{x - 17} 30 {x} 30Q{x + 17} 30 {x + 17} 48Z"
    class="fill-scene-honey"
  />
  <path d="M{x - 5} 48Q{x} 55 {x + 5} 48" class="fill-portrait-bib" />
{/each}

<rect x="636" y="42" width="126" height="92" rx="4" class="fill-scene-wood" />
<rect x="643" y="49" width="112" height="78" rx="2" class="fill-scene-board" />
<g class="fill-portrait-bib font-serif" stroke="none" font-size="13">
  <text x="653" y="73">Káva</text>
  <text x="745" y="73" text-anchor="end">2,50&nbsp;€</text>
  <text x="653" y="95">Čaj</text>
  <text x="745" y="95" text-anchor="end">2,00&nbsp;€</text>
  <text x="653" y="117">Koláč</text>
  <text x="745" y="117" text-anchor="end">3,00&nbsp;€</text>
</g>

<rect x="772" y="158" width="200" height="68" class="fill-scene-wood" />
<rect x="764" y="150" width="210" height="9" rx="2" class="fill-portrait-bib" />
<path d="M819 150V144" />
<ellipse cx="819" cy="143" rx="26" ry="3" class="fill-portrait-bib" />
<path d="M800 140V124Q819 118 838 124V140Z" class="fill-scene-honey" />
<path
  d="M800 124Q819 118 838 124V129Q829 134 819 128Q809 134 800 129Z"
  class="fill-portrait-bib"
/>
<circle cx="819" cy="118" r="3" class="fill-scene-clay" />
<path d="M794 142V117A25 25 0 0 1 844 117V142" class="fill-portrait-bib/40" />
<rect x="878" y="98" width="58" height="52" rx="4" class="fill-scene-cool" />
<rect x="888" y="107" width="38" height="13" rx="2" class="fill-scene-sage" />
<path d="M901 120v7M913 120v7" />
<path d="M899 139h16l-2 11h-12Z" class="fill-portrait-bib" />

<ellipse cx="208" cy="196" rx="42" ry="6" class="fill-portrait-bib" />
<path d="M208 202V224M193 226H223" />
<path d="M190 190h13v-8h-13Z" class="fill-portrait-bib" />
<path d="M203 184q5 2 0 5" />
<path d="M215 190h13v-8h-13Z" class="fill-portrait-bib" />
<path d="M228 184q5 2 0 5" />
<g stroke-width="2.6">
  <path d="M128 226L132 204H162L166 226M132 204Q124 184 130 168Q138 158 146 166" />
  <path d="M288 226L284 204H254L250 226M284 204Q292 184 286 168Q278 158 270 166" />
</g>

<Plant x={60} y={226} />
