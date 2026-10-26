<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  /** The tiles behind the counter, a row of them. */
  const tiles = Array.from({ length: 7 }, (_, index) => 566 + index * 30);
</script>

<!-- Everything sits between x 180 and 780, all a phone's 2:1 stage shows. -->
<Room wall="fill-scene-warm" floor="fill-scene-sand" />

<rect x="190" y="40" width="72" height="186" rx="2" class="fill-portrait-bib" />
<rect x="196" y="46" width="60" height="180" class="fill-scene-wood" />
<rect x="202" y="60" width="48" height="66" rx="2" class="fill-scene-line/10" />
<rect x="202" y="140" width="48" height="74" rx="2" class="fill-scene-line/10" />
<rect x="238" y="136" width="12" height="4" rx="2" class="fill-scene-line/70" />

<ellipse cx="308" cy="227" rx="34" ry="3" class="fill-scene-line/12" />
<rect x="280" y="66" width="56" height="160" rx="6" class="fill-white" />
<rect x="280" y="66" width="56" height="160" rx="6" class="fill-scene-line/5" />
<path d="M280 122H336" class="stroke-scene-line/30" stroke-width="1.6" />
<path d="M328 82v26M328 134v36" class="stroke-scene-line/50" stroke-width="3" />
<rect x="292" y="80" width="12" height="9" rx="1.5" class="fill-scene-apple" />
<circle cx="312" cy="92" r="4" class="fill-scene-honey" />

<rect x="372" y="54" width="104" height="80" class="fill-portrait-bib" />
<rect x="380" y="62" width="88" height="64" class="fill-scene-sky" />
<path d="M380 126V108Q400 96 424 104Q446 94 468 104V126Z" class="fill-scene-sage" />
<path d="M422 62h4v64h-4Z" class="fill-portrait-bib" />
<rect x="366" y="132" width="116" height="6" rx="2" class="fill-portrait-bib" />

<WallClock clock={PARTS.kitchen.clock} {hour} />

{#each tiles as x (x)}
  <rect x={x + 1} y="112" width="28" height="38" class="fill-scene-cool" />
{/each}
<rect x="560" y="40" width="214" height="58" rx="3" class="fill-scene-wood" />
<path d="M631 40V98M702 40V98" class="stroke-scene-line/25" stroke-width="1.6" />
<path
  d="M620 64v12M642 64v12M713 64v12"
  class="stroke-scene-line/50"
  stroke-width="2.4"
/>

<rect x="560" y="156" width="214" height="70" class="fill-scene-wood" />
<path d="M631 156V226M702 156V226" class="stroke-scene-line/25" stroke-width="1.6" />
<path
  d="M620 168h12M642 168h12M713 168h12"
  class="stroke-scene-line/50"
  stroke-width="2.4"
/>
<rect x="554" y="148" width="226" height="10" rx="2" class="fill-scene-edge" />

<!-- The sink, left; the stove and its pot, right. -->
<rect x="582" y="144" width="54" height="6" rx="2" class="fill-scene-line/40" />
<path
  d="M610 144V124Q610 116 618 116H624"
  class="stroke-scene-line/70"
  fill="none"
  stroke-width="3"
/>
<rect x="684" y="142" width="80" height="7" rx="2" class="fill-scene-line/70" />
<path d="M694 142h24M730 142h24" class="stroke-scene-red/70" stroke-width="2" />
<path d="M698 112h46l-3 30h-40Z" class="fill-scene-line" />
<path d="M694 112h54" class="stroke-scene-line" stroke-width="4" />
<path d="M690 120h6M746 120h6" class="stroke-scene-line" stroke-width="3" />
<path
  d="M710 104q4-6 0-12M722 102q4-6 0-12M734 104q4-6 0-12"
  class="stroke-white/80"
  fill="none"
  stroke-width="2"
/>
