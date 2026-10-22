<script lang="ts">
  import Castle from "./Castle.svelte";
  import FloorShade from "./FloorShade.svelte";
  import Plant from "./Plant.svelte";
</script>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-warm" />
<rect x="-10" y="226" width="980" height="84" class="fill-scene-wood" />
<FloorShade />
<ellipse cx="480" cy="277" rx="250" ry="18" class="fill-scene-sage" />
<ellipse cx="480" cy="277" rx="226" ry="12" class="fill-white/20" />
<ellipse cx="480" cy="277" rx="212" ry="9.5" class="fill-scene-sage" />

<rect x="96" y="44" width="150" height="120" class="fill-portrait-bib" />
<rect x="106" y="54" width="130" height="100" class="fill-scene-sky" />
<path d="M106 154V128Q140 108 172 124Q204 104 236 120V154Z" class="fill-scene-sage" />
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

<Plant x={40} y={244} />
