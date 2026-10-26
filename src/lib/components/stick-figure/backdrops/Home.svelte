<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Castle from "./Castle.svelte";
  import Plant from "./Plant.svelte";
  import Room from "./Room.svelte";

  let { taken = [] }: { taken?: readonly string[] } = $props();
</script>

<Room wall="fill-scene-warm" floor="fill-scene-wood" />
<ellipse cx="480" cy="277" rx="250" ry="18" class="fill-scene-sage" />
<ellipse cx="480" cy="277" rx="226" ry="12" class="fill-white/20" />
<ellipse cx="480" cy="277" rx="212" ry="9.5" class="fill-scene-sage" />

<rect x="96" y="44" width="150" height="120" class="fill-portrait-bib" />
<rect x="106" y="54" width="130" height="100" class="fill-scene-sky" />
<path d="M106 154V128Q140 108 172 124Q204 104 236 120V154Z" class="fill-scene-sage" />
<!-- Pán Novák and his sister on the street outside, back from the shop. -->
<g class="stroke-scene-line/40" stroke-width="0.6" stroke-linejoin="round">
  <ellipse
    cx="152"
    cy="151.6"
    rx="10"
    ry="1.4"
    class="fill-scene-line/15"
    stroke="none"
  />
  <rect x="146.9" y="140.6" width="2.8" height="9" class="fill-portrait-suit" />
  <rect x="152.3" y="140.6" width="2.8" height="9" class="fill-portrait-suit" />
  <ellipse cx="148" cy="150.2" rx="2.6" ry="1.2" class="fill-portrait-vest" />
  <ellipse cx="154.2" cy="150.2" rx="2.6" ry="1.2" class="fill-portrait-vest" />
  <path
    d="M157.9 134.6q0-2 1.8-2q1.8 0 1.8 2V151"
    class="stroke-scene-line"
    fill="none"
    stroke-width="1.1"
    stroke-linecap="round"
  />
  <path
    d="M144.4 122.6Q144.6 121 146.4 120.8H155.6Q157.4 121 157.6 122.6L159.2 141.4H142.8Z"
    class="fill-scene-wood"
  />
  <path d="M151 122.6V141.2" fill="none" />
  {#each [126.5, 131, 135.5] as y (y)}
    <circle cx="152.3" cy={y} r="0.5" class="fill-scene-line/50" stroke="none" />
  {/each}
  <rect
    x="-1.4"
    y="0"
    width="2.8"
    height="12"
    rx="1.4"
    transform="translate(144.6 122.4) rotate(10)"
    class="fill-scene-wood"
  />
  <rect
    x="-1.4"
    y="0"
    width="2.8"
    height="12"
    rx="1.4"
    transform="translate(157.4 122.4) rotate(-10)"
    class="fill-scene-wood"
  />
  <circle cx="142.5" cy="134.4" r="1.4" class="fill-portrait-skin" />
  <circle cx="159.6" cy="134.4" r="1.4" class="fill-portrait-skin" />
  <rect x="148" y="119.4" width="6" height="2.8" rx="1.2" class="fill-scene-clay" />
  <path d="M153 121.8l1.2 5h-1.9Z" class="fill-scene-clay" />
  <circle cx="151" cy="116.4" r="4.6" class="fill-portrait-skin" />
  <path
    d="M146.6 114Q146.2 116 146.9 117.8L148 117.4Q147.5 115.7 147.9 114ZM155.4 114Q155.8 116 155.1 117.8L154 117.4Q154.5 115.7 154.1 114Z"
    class="fill-portrait-hair-grey"
  />
  <circle cx="149.4" cy="116" r="0.45" class="fill-portrait-ink" stroke="none" />
  <circle cx="152.6" cy="116" r="0.45" class="fill-portrait-ink" stroke="none" />
  <path
    d="M148.6 118.7q1.2-.9 2.4 0q1.2-.9 2.4 0q-1.2 1.1-2.4.3q-1.2.8-2.4-.3Z"
    class="fill-portrait-hair-grey"
    stroke="none"
  />
  <path
    d="M146.9 114L147.5 109.6Q147.8 108.2 149.3 108.4L151 109.2L152.7 108.4Q154.2 108.2 154.5 109.6L155.1 114Z"
    class="fill-portrait-suit"
  />
  <path d="M147.2 112.2H154.8L155 113.8H147Z" class="fill-portrait-vest" stroke="none" />
  <path
    d="M143.6 114Q151 112.6 158.4 114Q151 115.4 143.6 114Z"
    class="fill-portrait-suit"
  />

  <ellipse
    cx="195"
    cy="151.6"
    rx="11"
    ry="1.4"
    class="fill-scene-line/15"
    stroke="none"
  />
  <rect x="190.4" y="140" width="2.2" height="9.6" class="fill-portrait-suit" />
  <rect x="195.2" y="140" width="2.2" height="9.6" class="fill-portrait-suit" />
  <ellipse cx="191.3" cy="150.2" rx="2.2" ry="1.1" class="fill-scene-clay" />
  <ellipse cx="196.5" cy="150.2" rx="2.2" ry="1.1" class="fill-scene-clay" />
  <path
    d="M187.6 124Q187.8 122.2 189.6 122H196.4Q198.2 122.2 198.4 124L201 141.4H185Z"
    class="fill-scene-honey"
  />
  <path d="M191 122.2l2 3l2-3Z" class="fill-portrait-bib" />
  <rect
    x="186.6"
    y="130.2"
    width="12.8"
    height="1.4"
    class="fill-scene-line/25"
    stroke="none"
  />
  <rect
    x="-1.3"
    y="0"
    width="2.6"
    height="11.5"
    rx="1.3"
    transform="translate(188.4 123.4) rotate(10)"
    class="fill-scene-honey"
  />
  <rect
    x="-1.3"
    y="0"
    width="2.6"
    height="11.7"
    rx="1.3"
    transform="translate(197.6 123.4) rotate(-22)"
    class="fill-scene-honey"
  />
  <path d="M199.8 137.4l-1.4-5.6a1 1 0 0 1 1.8-.4l1 6Z" class="fill-scene-wood" />
  <path d="M204.6 137.4l1.6-5.2l1.2.4l-1.4 4.8Z" class="fill-scene-leaf" />
  <path
    d="M200.2 137.2Q200.6 133.8 202.5 133.8Q204.4 133.8 204.8 137.2"
    class="stroke-scene-line/60"
    fill="none"
    stroke-width="0.7"
  />
  <rect x="198.8" y="137" width="7.4" height="7.4" rx="1" class="fill-portrait-ground" />
  <circle cx="186.4" cy="134.4" r="1.3" class="fill-portrait-skin" />
  <circle cx="202.4" cy="134.2" r="1.3" class="fill-portrait-skin" />
  <path
    d="M188 121.4C187.2 116.6 188 112 193 112C198 112 198.8 116.6 198 121.4C197.4 122 196.6 122 196.2 121.4L196.4 120C195 121.8 191 121.8 189.6 120L189.8 121.4C189.4 122 188.6 122 188 121.4Z"
    class="fill-portrait-hair-grey"
  />
  <circle cx="193" cy="117.6" r="4.4" class="fill-portrait-skin" />
  <path
    d="M188.6 117.6C188.4 114 190.6 112.4 193.2 112.4C196 112.4 197.6 114.2 197.5 117C196.4 115.4 194.6 114.6 192.8 115C191.2 115.4 189.8 116.4 188.6 117.6Z"
    class="fill-portrait-hair-grey"
  />
  <circle cx="191.5" cy="117.9" r="0.45" class="fill-portrait-ink" stroke="none" />
  <circle cx="194.5" cy="117.9" r="0.45" class="fill-portrait-ink" stroke="none" />
  <path
    d="M192.2 119.9q.8.7 1.6 0"
    class="stroke-portrait-ink/70"
    fill="none"
    stroke-width="0.5"
    stroke-linecap="round"
  />
</g>
<!-- The glass catches the light in the upper panes, so the street reads as outside. -->
<path d="M112 98L132 58H142L122 98ZM180 98L200 58H206L186 98Z" class="fill-white/20" />
<path d="M169 54h4v100h-4ZM106 102h130v4H106Z" class="fill-portrait-bib" />
<rect x="88" y="160" width="166" height="8" rx="2" class="fill-portrait-bib" />
<rect x="92" y="168" width="158" height="4" class="fill-scene-line/10" />
<rect x="78" y="34" width="186" height="4" rx="2" class="fill-scene-line/40" />
<path d="M84 36Q78 100 92 178H112Q100 112 110 36Z" class="fill-scene-clay" />
<path d="M258 36Q264 100 250 178H230Q242 112 232 36Z" class="fill-scene-clay" />
<path d="M100 36Q98 100 104 178H112Q100 112 110 36Z" class="fill-scene-line/8" />
<path d="M242 36Q240 100 246 178H250Q242 112 232 36Z" class="fill-scene-line/8" />

<rect x="424" y="36" width="50" height="40" class="fill-scene-wood" />
<rect x="430" y="42" width="38" height="28" class="fill-scene-sky" />
<path d="M430 70V61Q446 50 468 58V70Z" class="fill-scene-sage" />
<circle cx="456" cy="51" r="4" class="fill-scene-honey" />
<rect x="488" y="42" width="40" height="34" class="fill-scene-wood" />
<rect x="494" y="48" width="28" height="22" class="fill-scene-clay" />
<circle cx="508" cy="59" r="6" class="fill-white/40" />

<rect x="742" y="50" width="104" height="72" class="fill-scene-wood" />
<rect x="750" y="58" width="88" height="56" class="fill-scene-sky" />
<Castle x={794} y={97} size={0.42} />
<path d="M750 114V100Q776 86 794 92Q816 82 838 98V114Z" class="fill-scene-sage" />
<path d="M750 58h88v3h-88ZM750 61h3v53h-3Z" class="fill-scene-line/15" />

<ellipse cx="792" cy="240" rx="128" ry="5" class="fill-scene-line/12" />
<rect x="686" y="152" width="214" height="58" rx="10" class="fill-portrait-ground" />
<rect x="676" y="196" width="234" height="30" rx="8" class="fill-portrait-ground" />
<rect x="676" y="216" width="234" height="10" rx="4" class="fill-scene-line/10" />
<rect x="666" y="174" width="28" height="52" rx="10" class="fill-portrait-ground" />
<rect x="892" y="174" width="28" height="52" rx="10" class="fill-portrait-ground" />
<path d="M682 226h5v12h-5ZM899 226h5v12h-5Z" class="fill-scene-line/60" />
<rect
  x="708"
  y="166"
  width="40"
  height="32"
  rx="8"
  transform="rotate(-8 728 182)"
  class="fill-scene-honey"
/>
<rect
  x="838"
  y="166"
  width="40"
  height="32"
  rx="8"
  transform="rotate(8 858 182)"
  class="fill-scene-clay"
/>

<ellipse cx="944" cy="242" rx="14" ry="3" class="fill-scene-line/15" />
<rect x="942.5" y="98" width="3" height="142" class="fill-scene-line/50" />
<rect x="934" y="238" width="20" height="5" rx="2" class="fill-scene-line/50" />
<path d="M928 98h32l-6-28h-20Z" class="fill-scene-honey" />
<path d="M928 98h32l-1-4h-30Z" class="fill-scene-line/12" />

<!-- A peg rail by the window, where the dog's lead hangs until someone takes it. -->
<rect x="282" y="92" width="44" height="6" rx="2" class="fill-scene-wood" />
<circle cx="292" cy="101" r="2.4" class="fill-scene-potato" />
<circle cx="316" cy="101" r="2.4" class="fill-scene-potato" />
{#if !taken.includes("leash")}
  <g fill="none" stroke-linecap="round">
    <ellipse
      cx="292"
      cy="108"
      rx="4"
      ry="6"
      class="stroke-scene-red"
      stroke-width="2.2"
    />
    <path
      d="M292 114Q290 130 296 140Q300 146 297 152"
      class="stroke-scene-red"
      stroke-width="2.2"
    />
    <rect x="294.6" y="151" width="4.6" height="6" rx="1.2" class="fill-scene-edge" />
  </g>
{/if}

<!-- One bag by the far wall and one at the front by the cast: tamtá and táto taška. -->
{#each [{ paint: "fill-scene-clay", scale: 1, x: 171, y: 227 }, { paint: "fill-scene-honey", scale: 1.25, x: 534, y: 288 }] as bag (bag.x)}
  <g transform="translate({bag.x} {bag.y}) scale({bag.scale})">
    <ellipse cx="0" cy="0" rx="22" ry="3" class="fill-scene-line/15" />
    <path
      d="M-10 -23Q-10 -37 0 -37Q10 -37 10 -23"
      class="stroke-scene-line/60"
      fill="none"
      stroke-width="2.4"
    />
    <path d="M-17 -25h34l-2 22a3 3 0 0 1-3 3h-24a3 3 0 0 1-3-3Z" class={bag.paint} />
    <path d="M-16 -17h32" class="stroke-white/40" stroke-width="2" />
  </g>
{/each}

<Plant plant={PARTS.home.plant} />
