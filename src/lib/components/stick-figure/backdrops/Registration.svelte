<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import Plant from "./Plant.svelte";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  // A phone shows x 180 to 780 of the drawing and a desktop 120 to 840: the door, the
  // waiting corner and the desk stand inside the phone's part, and nothing straddles an edge.
  // The desk itself is the cast's (StickSet.svelte), so Mária stands behind it.
  const SEATS = [290, 332, 374];
  const KEYS = Array.from({ length: 12 }, (_, index) => ({
    x: 660 + (index % 6) * 14,
    y: 66 + Math.floor(index / 6) * 18,
    number: index + 1,
    out: [3, 8].includes(index),
  }));
  const BINDERS = [
    { paint: "fill-scene-blue/60", label: "2024" },
    { paint: "fill-scene-blue/60", label: "2025" },
    { paint: "fill-scene-red-mid", label: "A1" },
    { paint: "fill-scene-red-mid", label: "A2" },
    { paint: "fill-scene-green-mid", label: "B1" },
    { paint: "fill-scene-green-mid", label: "B2" },
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

<!-- Only a desktop shows the coat stand: it hangs from a hook by its collar. -->
<ellipse cx="148" cy="227" rx="16" ry="3" class="fill-scene-line/12" />
<path d="M148 92V224M136 226l12 -6 12 6" class="stroke-scene-coffee" stroke-width="3" />
<path d="M148 98l-10 -5M148 98l10 -5" class="stroke-scene-coffee" stroke-width="2" />
<circle cx="148" cy="90" r="3" class="fill-scene-coffee" />
<path d="M158 97L146 106L144 160H172L170 106Z" class="fill-scene-green-mid" />
<path d="M146 106l-4 40h5l1 -34ZM170 106l4 40h-5l-1 -34Z" class="fill-scene-green-mid" />
<path d="M146 106l-4 40h5M170 106l4 40h-5" class="stroke-scene-green/40" stroke-width="0.8" fill="none" />
<path d="M153 100l5 11 5 -11Z" class="fill-scene-green" />
<path d="M158 111V158" class="stroke-scene-green/40" stroke-width="1" />
{#each [120, 132, 144] as y (y)}
  <circle cx="160.5" cy={y} r="1" class="fill-scene-green" />
{/each}

<!-- The way in. -->
<rect x="200" y="58" width="48" height="11" rx="2" class="fill-scene-green" />
<text x="224" y="66.5" text-anchor="middle" class="fill-white font-sans" font-size="7.5" font-weight="700">
  Vchod
</text>
<rect x="192" y="74" width="64" height="152" class="fill-scene-edge" />
<rect x="198" y="80" width="52" height="146" class="fill-scene-wood" />
<rect x="206" y="88" width="36" height="58" rx="1" class="fill-scene-sky" />
<path d="M212 98l14 -8M212 110l22 -14" class="stroke-white/70" stroke-width="2" />
<rect x="206" y="156" width="36" height="58" rx="1" class="fill-scene-line/8" />
<path d="M243 150h-8" class="stroke-scene-steel-dark" stroke-width="2.6" />

<rect x="276" y="64" width="122" height="70" rx="2" class="fill-scene-line/10" />
<rect x="272" y="60" width="122" height="70" rx="2" class="fill-scene-wood" />
<rect x="276" y="64" width="114" height="62" class="fill-scene-onion/60" />
<rect x="281" y="69" width="48" height="50" class="fill-white" />
<text x="305" y="77" text-anchor="middle" class="fill-portrait-ink font-sans" font-size="6" font-weight="700">
  Rozvrh
</text>
<g class="stroke-scene-line/40" stroke-width="0.6">
  <path d="M284 80h42M284 89h42M284 98h42M284 107h42M284 116h42M296 80v36M306 80v36M316 80v36" />
</g>
<rect x="297" y="81" width="9" height="8" class="fill-scene-sage" />
<rect x="317" y="90" width="9" height="8" class="fill-scene-honey" />
<rect x="307" y="99" width="9" height="8" class="fill-scene-red-mid/60" />
<rect x="297" y="108" width="9" height="8" class="fill-scene-sage" />
<circle cx="305" cy="70" r="1.8" class="fill-scene-red" />
<rect x="336" y="68" width="26" height="30" class="fill-scene-honey" />
<text x="349" y="76" text-anchor="middle" class="fill-portrait-ink font-sans" font-size="5" font-weight="700">
  Úrovne
</text>
{#each ["A1", "A2", "B1", "B2"] as level, index (level)}
  <text x="342" y={83 + index * 4.6} class="fill-portrait-ink font-sans" font-size="4">{level}</text>
  <path d="M350 {82 + index * 4.6}h8" class="stroke-scene-line/40" stroke-width="0.8" />
{/each}
<circle cx="349" cy="69.5" r="1.8" class="fill-scene-blue" />
<rect x="366" y="70" width="22" height="44" class="fill-white" />
<path d="M369 76h16M369 81h16M369 86h12" class="stroke-scene-line/40" stroke-width="1.2" />
{#each [367, 372, 377, 382] as x (x)}
  <rect {x} y="96" width="4" height="17" class="fill-white" />
  <path d="M{x + 2} 98v13" class="stroke-scene-line/40" stroke-width="0.6" />
{/each}
<path d="M366 95h22" class="stroke-scene-line/25" stroke-width="0.6" stroke-dasharray="1 1" />
<circle cx="377" cy="71.5" r="1.8" class="fill-scene-green" />

<ellipse cx="332" cy="227" rx="72" ry="3.5" class="fill-scene-line/12" />
<rect x="276" y="190" width="112" height="4" rx="1" class="fill-scene-line/60" />
<path d="M286 194l-6 32M378 194l6 32M332 194v32" class="stroke-scene-line/60" stroke-width="3" />
<path d="M276 226h20M374 226h20M324 226h16" class="stroke-scene-line/60" stroke-width="2" />
{#each SEATS as x (x)}
  <rect x={x - 18} y="148" width="36" height="34" rx="6" class="fill-portrait-ground" />
  <rect x={x - 20} y="180" width="40" height="11" rx="4" class="fill-portrait-ground" />
  <rect x={x - 20} y="180" width="40" height="3" class="fill-scene-line/15" />
{/each}
{#each [269, 311, 353, 395] as x (x)}
  <rect x={x - 2.5} y="168" width="5" height="22" rx="1.5" class="fill-scene-line/70" />
  <rect x={x - 5} y="166" width="10" height="4" rx="2" class="fill-scene-line/70" />
{/each}

<ellipse cx="422" cy="227" rx="20" ry="3" class="fill-scene-line/12" />
<path d="M408 206v20M436 206v20" class="stroke-scene-line/60" stroke-width="2.4" />
<rect x="404" y="202" width="36" height="5" rx="1" class="fill-scene-wood" />
<path d="M410 202l2 -3h12l2 3Z" class="fill-white" />
<path d="M412 199l2 -2h10l2 2Z" class="fill-scene-honey" />
<rect x="426" y="196" width="10" height="6" rx="1" class="fill-scene-sage" />

<WallClock clock={PARTS.registration.clock} {hour} />

<rect x="508" y="16" width="42" height="56" class="fill-scene-line/10" />
<rect x="504" y="12" width="42" height="56" class="fill-white" />
<rect x="508" y="16" width="34" height="7" class="fill-white" />
<rect x="508" y="23" width="34" height="7" class="fill-scene-blue/70" />
<rect x="508" y="30" width="34" height="7" class="fill-scene-red" />
<path d="M508 16h34v21h-34Z" class="stroke-scene-line/20" stroke-width="0.6" fill="none" />
<path d="M514 19h11v9q0 5 -5.5 7q-5.5 -2 -5.5 -7Z" class="fill-white" />
<path d="M515 20h9v8q0 4 -4.5 5.8q-4.5 -1.8 -4.5 -5.8Z" class="fill-scene-red" />
<path d="M515.6 30q1.6 -2 3 0q1.5 -2 3 0q1.5 -2 2.8 0q-0.6 3 -4.4 4q-3.8 -1 -4.4 -4Z" class="fill-scene-blue" />
<path d="M519.5 21.5v8.5M517.6 24h3.8M517 26.6h5" class="stroke-white" stroke-width="0.9" />
<text x="525" y="46" text-anchor="middle" class="fill-portrait-ink font-sans" font-size="6" font-weight="700">
  Kurzy
</text>
<text x="525" y="53" text-anchor="middle" class="fill-portrait-ink font-sans" font-size="5">
  slovenčiny
</text>
<text x="525" y="62" text-anchor="middle" class="fill-scene-red font-sans" font-size="6" font-weight="700">
  A1 – C1
</text>

<path d="M610 -10V20M694 -10V20" class="stroke-scene-line/40" stroke-width="1.2" />
<rect x="594" y="22" width="116" height="24" rx="4" class="fill-scene-line/10" />
<rect x="592" y="20" width="116" height="24" rx="4" class="fill-scene-green" />
<text x="650" y="36.5" text-anchor="middle" class="fill-white font-sans" font-size="12" font-weight="600">
  Registrácia
</text>

<rect x="652" y="54" width="92" height="46" rx="2" class="fill-scene-coffee" />
<rect x="656" y="58" width="84" height="38" rx="1" class="fill-scene-wood" />
{#each KEYS as { x, y, number, out } (number)}
  <circle cx={x} cy={y} r="1.1" class="fill-scene-steel-dark" />
  {#if !out}
    <circle cx={x} cy={y + 2.4} r="1.6" class="stroke-scene-steel-dark" fill="none" stroke-width="0.6" />
    <path d="M{x} {y + 4}v4h1.2M{x} {y + 6}h1" class="stroke-scene-steel-dark" stroke-width="0.7" fill="none" />
    <rect x={x - 3} y={y + 7.6} width="6" height="5" rx="1" class="fill-white" />
    <text x={x} y={y + 11.6} text-anchor="middle" class="fill-portrait-ink font-sans" font-size="3.6" font-weight="700">
      {number}
    </text>
  {/if}
{/each}

<rect x="652" y="132" width="92" height="3" rx="1" class="fill-scene-coffee" />
<path d="M658 135l6 6v-6ZM738 135l-6 6v-6Z" class="fill-scene-coffee" />
{#each BINDERS as { paint, label }, index (label)}
  {@const x = 658 + index * 10}
  <rect {x} y="108" width="9" height="24" rx="1" class={paint} />
  <rect x={x + 1.5} y="111" width="6" height="8" rx="0.6" class="fill-white" />
  <text x={x + 4.5} y="117" text-anchor="middle" class="fill-portrait-ink font-sans" font-size="3">
    {label}
  </text>
  <circle cx={x + 4.5} cy="126" r="1.3" class="fill-white/80" />
{/each}

<rect x="640" y="172" width="72" height="54" class="fill-scene-wood" />
<rect x="638" y="168" width="76" height="5" rx="1" class="fill-scene-coffee" />
<rect x="644" y="178" width="34" height="42" rx="1" class="fill-scene-line/8" />
<rect x="682" y="178" width="26" height="42" rx="1" class="fill-scene-line/8" />
<path d="M675 196v6M685 196v6" class="stroke-scene-line/50" stroke-width="1.4" />
<rect x="684" y="152" width="30" height="16" rx="2" class="fill-scene-steel-light" />
<rect x="688" y="148" width="22" height="5" rx="1" class="fill-scene-steel" />
<path d="M688 160h22" class="stroke-scene-line/40" stroke-width="1.2" />
<rect x="690" y="144" width="18" height="5" class="fill-white" />

<Plant plant={PARTS.registration.plant} />

<!-- Right of what a desktop shows: the office door. -->
<rect x="866" y="70" width="80" height="156" class="fill-scene-edge" />
<rect x="872" y="76" width="68" height="150" class="fill-scene-wood" />
<rect x="882" y="88" width="48" height="56" rx="2" class="fill-scene-line/8" />
<rect x="882" y="156" width="48" height="56" rx="2" class="fill-scene-line/8" />
<path d="M930 150h-8" class="stroke-scene-line/70" stroke-width="2.4" />
<rect x="888" y="54" width="36" height="10" rx="1" class="fill-white" />
