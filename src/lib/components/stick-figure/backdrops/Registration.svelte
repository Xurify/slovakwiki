<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Plant from "./Plant.svelte";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  // A phone shows x 180 to 780 of the drawing and a desktop 120 to 840: the waiting
  // corner and the whole front desk stand inside the phone's part, and nothing straddles an edge.
  const SEATS = [214, 258, 302];
  // The desk stands out from the wall, room behind it for whoever is on duty.
  const DESK = { left: 618, right: 772, ledge: 166, top: 176, floor: 250 };
  const PANELS = [626, 662, 698, 734];

  const HOLES = Array.from({ length: 10 }, (_, index) => ({
    x: 650 + (index % 5) * 20,
    y: 62 + Math.floor(index / 5) * 17,
    key: [0, 3, 6, 9].includes(index),
    post: [2, 7].includes(index),
  }));

  const NOTICES = [
    { x: 212, y: 74, width: 30, height: 38, paint: "fill-white", pin: "fill-scene-red" },
    { x: 248, y: 70, width: 26, height: 22, paint: "fill-scene-honey", pin: "fill-scene-blue" },
    { x: 280, y: 74, width: 30, height: 40, paint: "fill-white", pin: "fill-scene-green" },
    { x: 248, y: 98, width: 26, height: 26, paint: "fill-scene-sage", pin: "fill-scene-red" },
  ];
</script>

<Room wall="fill-scene-cool" floor="fill-scene-sand" />

<g class="stroke-scene-line/10" stroke-width="1">
  <path d="M-10 240H970M-10 258H970M-10 282H970" />
  {#each Array.from({ length: 17 }, (_, index) => -40 + index * 64) as x (x)}
    <path d="M{x} 226L{480 + (x - 480) * 1.35} 310" />
  {/each}
</g>

<rect x="-10" y="164" width="980" height="62" class="fill-scene-sky/60" />
<rect x="-10" y="162" width="980" height="3" class="fill-scene-edge/60" />
<rect x="-10" y="220" width="980" height="6" class="fill-scene-edge/70" />

<rect x="4" y="62" width="92" height="164" class="fill-scene-edge" />
<rect x="10" y="68" width="80" height="158" class="fill-scene-sky" />
<path d="M50 68V226" class="stroke-scene-edge" stroke-width="4" />
<path d="M42 140v18M58 140v18" class="stroke-scene-line/60" stroke-width="2.4" />
<path d="M16 80l20-10M16 96l30-16" class="stroke-white/70" stroke-width="2" />
<rect x="22" y="40" width="56" height="16" rx="2" class="fill-scene-green" />
<text x="50" y="52" text-anchor="middle" class="fill-white font-sans" font-size="10" font-weight="600">
  Vchod
</text>

<g transform="translate(10 0)">
<rect x="204" y="64" width="114" height="70" rx="2" class="fill-scene-line/10" />
<rect x="200" y="60" width="114" height="70" rx="2" class="fill-scene-wood" />
<rect x="204" y="64" width="106" height="62" class="fill-scene-onion/60" />
{#each NOTICES as { x, y, width, height, paint, pin } (`${x} ${y}`)}
  <rect x={x + 1} y={y + 1} {width} {height} class="fill-scene-line/15" />
  <rect {x} {y} {width} {height} class={paint} />
  <path
    d="M{x + 4} {y + 8}h{width - 8}M{x + 4} {y + 13}h{width - 10}M{x + 4} {y + 18}h{width -
      12}"
    class="stroke-scene-line/40"
    stroke-width="1.2"
  />
  <circle cx={x + width / 2} cy={y + 3} r="2" class={pin} />
{/each}

<ellipse cx="258" cy="227" rx="72" ry="3.5" class="fill-scene-line/12" />
<rect x="200" y="190" width="116" height="4" rx="1" class="fill-scene-line/60" />
<path d="M210 194l-6 32M306 194l6 32M258 194v32" class="stroke-scene-line/60" stroke-width="3" />
<path d="M200 226h20M296 226h20M250 226h16" class="stroke-scene-line/60" stroke-width="2" />
{#each SEATS as x (x)}
  <rect x={x - 18} y="148" width="36" height="34" rx="6" class="fill-portrait-ground" />
  <rect x={x - 20} y="180" width="40" height="3" class="fill-scene-line/15" />
  <rect x={x - 20} y="180" width="40" height="11" rx="4" class="fill-portrait-ground" />
{/each}
{#each [192, 236, 280, 324] as x (x)}
  <rect x={x - 2.5} y="168" width="5" height="22" rx="1.5" class="fill-scene-line/70" />
  <rect x={x - 5} y="166" width="10" height="4" rx="2" class="fill-scene-line/70" />
{/each}
</g>

<Plant plant={PARTS.registration.plant} />

<ellipse cx="404" cy="227" rx="18" ry="3" class="fill-scene-line/12" />
<path d="M404 98V224M390 226l14-6 14 6" class="stroke-scene-coffee" stroke-width="3" />
<path
  d="M404 104l-12-6M404 104l12-6M404 114l-10-3M404 114l10-3"
  class="stroke-scene-coffee"
  stroke-width="2"
/>
<circle cx="404" cy="96" r="3" class="fill-scene-coffee" />
<path d="M414 100L408 108L410 176H436L428 108L420 100Z" class="fill-scene-green-mid" />
<path d="M420 100l-4 14 6 -6 6 6 -4 -14" class="fill-scene-green" />
<path d="M422 112V172M410 146h26" class="stroke-scene-green/40" stroke-width="1" />

<WallClock clock={PARTS.registration.clock} {hour} />

<g transform="translate(0 -16)">
<rect x="506" y="38" width="66" height="84" class="fill-scene-line/10" />
<rect x="502" y="34" width="66" height="84" class="fill-white" />
<rect x="508" y="40" width="54" height="34" class="fill-scene-sky" />
<path d="M508 74L524 54L538 66L548 58L562 74Z" class="fill-scene-leaf" />
<circle cx="550" cy="50" r="6" class="fill-scene-honey" />
<text x="535" y="88" text-anchor="middle" class="fill-portrait-ink font-sans" font-size="9" font-weight="700">
  Kurzy
</text>
<text x="535" y="99" text-anchor="middle" class="fill-portrait-ink font-sans" font-size="7">
  slovenčiny
</text>
<path d="M514 108h42" class="stroke-scene-red" stroke-width="2.4" />
</g>

<g transform="translate(-10 0)">
<path d="M650 -10V24M740 -10V24" class="stroke-scene-line/40" stroke-width="1.2" />
<rect x="628" y="26" width="136" height="28" rx="4" class="fill-scene-line/10" />
<rect x="626" y="24" width="136" height="28" rx="4" class="fill-scene-green" />
<text x="694" y="43" text-anchor="middle" class="fill-white font-sans" font-size="14" font-weight="600">
  Registrácia
</text>

<rect x="644" y="56" width="106" height="44" rx="2" class="fill-scene-coffee" />
{#each HOLES as { x, y, key, post } (`${x} ${y}`)}
  <rect {x} {y} width="16" height="13" class="fill-scene-line/50" />
  {#if post}
    <path d="M{x + 2} {y + 13}V{y + 6}l12 -2V{y + 13}Z" class="fill-white" />
  {/if}
  {#if key}
    <circle cx={x + 8} cy={y + 3} r="1" class="fill-scene-steel-light" />
    <path d="M{x + 8} {y + 3}v5" class="stroke-scene-honey" stroke-width="1.6" />
    <rect x={x + 6} y={y + 7.5} width="4" height="4" rx="1" class="fill-scene-red-mid" />
  {/if}
{/each}

<rect x="644" y="128" width="106" height="3" rx="1" class="fill-scene-coffee" />
{#each [648, 655, 662, 669, 676, 683] as x, index (x)}
  <rect
    {x}
    y="110"
    width="6"
    height="18"
    rx="1"
    class={["fill-scene-blue/60", "fill-scene-red-mid", "fill-scene-green-mid"][index % 3]}
  />
{/each}
<path d="M692 128l4 -16h5l-3 16Z" class="fill-scene-honey" />
<rect x="722" y="116" width="22" height="12" rx="1" class="fill-white" />
<rect x="722" y="114" width="22" height="3" class="fill-scene-line/30" />

<!-- The monitor stands on the worktop behind the raised ledge, its foot hidden by it. -->
<rect x="660" y="128" width="50" height="34" rx="3" class="fill-portrait-vest" />
<rect x="664" y="132" width="42" height="25" rx="1" class="fill-scene-sky" />
<path d="M668 138h22M668 143h30M668 148h16" class="stroke-scene-line/40" stroke-width="2" />
<rect x="682" y="160" width="8" height="8" class="fill-portrait-vest" />

<ellipse cx="695" cy={DESK.floor + 1} rx="84" ry="3.5" class="fill-scene-line/15" />
<rect x={DESK.left + 4} y={DESK.top} width={DESK.right - DESK.left - 8} height={DESK.floor - DESK.top} class="fill-scene-wood" />
{#each PANELS as x (x)}
  <rect {x} y={DESK.top + 10} width="30" height={DESK.floor - DESK.top - 22} rx="2" class="fill-scene-line/8" />
{/each}
<rect x={DESK.left + 4} y={DESK.floor - 7} width={DESK.right - DESK.left - 8} height="7" class="fill-scene-coffee/50" />
<rect x={DESK.left + 4} y={DESK.top} width={DESK.right - DESK.left - 8} height="4" class="fill-scene-line/15" />
<rect x={DESK.left} y={DESK.ledge} width={DESK.right - DESK.left} height={DESK.top - DESK.ledge} rx="2" class="fill-portrait-bib" />
<rect x={DESK.left} y={DESK.top - 2} width={DESK.right - DESK.left} height="2" class="fill-scene-line/15" />

<path d="M664 {DESK.ledge}A8 8 0 0 1 680 {DESK.ledge}Z" class="fill-scene-honey" />
<rect x="662" y={DESK.ledge - 1} width="20" height="2" rx="1" class="fill-scene-steel-dark" />
<rect x="671" y={DESK.ledge - 11} width="2" height="3" class="fill-scene-steel-dark" />
<rect x="694" y={DESK.ledge - 5} width="30" height="5" rx="1" class="fill-scene-line/50" />
<path d="M697 {DESK.ledge - 5}l2 -4h22l2 4Z" class="fill-white" />
<path d="M702 {DESK.ledge - 8}l16 -3" class="stroke-portrait-ink" stroke-width="1.4" />
<path d="M742 {DESK.ledge}V{DESK.ledge - 18}h22V{DESK.ledge}Z" class="fill-scene-line/25" />
<rect x="745" y={DESK.ledge - 24} width="7" height="16" class="fill-scene-honey" />
<rect x="754" y={DESK.ledge - 22} width="7" height="14" class="fill-scene-sage" />
</g>

<rect x="866" y="70" width="80" height="156" class="fill-scene-edge" />
<rect x="872" y="76" width="68" height="150" class="fill-scene-wood" />
<rect x="882" y="88" width="48" height="56" rx="2" class="fill-scene-line/8" />
<rect x="882" y="156" width="48" height="56" rx="2" class="fill-scene-line/8" />
<path d="M930 150h-8" class="stroke-scene-line/70" stroke-width="2.4" />
<rect x="888" y="54" width="36" height="10" rx="1" class="fill-white" />
