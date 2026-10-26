<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import FloorShade from "./FloorShade.svelte";
  import Plant from "./Plant.svelte";
  import WallClock from "./WallClock.svelte";

  let { hour }: { hour: number } = $props();

  const slats = Array.from({ length: 36 }, (_, index) => 322 + index * 9);
  const books = [
    { x: 684, w: 7, h: 26, c: "#c23b35" },
    { x: 692, w: 6, h: 30, c: "#22385c" },
    { x: 699, w: 8, h: 24, c: "#ecc77f" },
    { x: 708, w: 5, h: 28, c: "#45614f" },
    { x: 724, w: 7, h: 22, c: "#6f5b8e", lean: true },
  ];
</script>

<!-- The hosts sit at one long desk in the middle (StudioDesk.svelte), against the slat wall; everything named stays between x 180 and 780, all a phone's stage shows. -->

<rect x="-10" y="-10" width="980" height="236" fill="#ebe5da" />
<rect x="-10" y="226" width="980" height="84" fill="#b5875c" />
<path d="M-10 250H970M-10 276H970" stroke="#a37850" stroke-width="1" />
<FloorShade />
<ellipse cx="480" cy="276" rx="300" ry="22" fill="#6d7f8c" fill-opacity="0.35" />
<ellipse cx="480" cy="276" rx="278" ry="15" fill="#ffffff" fill-opacity="0.12" />

<!-- Oak slats on black felt: the acoustic wall the hosts sit against. -->
<rect x="316" y="0" width="330" height="226" fill="#3a2f28" />
{#each slats as x (x)}
  <rect {x} y="0" width="6" height="226" fill={x % 2 ? "#c99a6a" : "#bd8d5e"} />
{/each}
<rect x="316" y="220" width="330" height="6" fill="#2a221d" />

<!-- Pendant lamps over the desk. -->
{#each [372, 588] as x (x)}
  <path d="M{x} -10V34" stroke="#2a2f37" stroke-width="1.4" />
  <path d="M{x - 16} 50Q{x - 16} 34 {x} 34Q{x + 16} 34 {x + 16} 50Z" fill="#2a2f37" />
  <ellipse cx={x} cy="51" rx="9" ry="3" fill="#ffd98a" />
  <ellipse cx={x} cy="58" rx="22" ry="8" fill="#ffd98a" fill-opacity="0.16" />
{/each}

<!-- The on-air sign, lit. -->
<rect x="402" y="14" width="156" height="44" rx="10" fill="#ff5a4f" fill-opacity="0.22" />
<rect x="410" y="20" width="140" height="32" rx="6" fill="#1f2328" />
<rect x="414" y="24" width="132" height="24" rx="4" fill="#e0453c" />
<text
  x="480"
  y="42"
  text-anchor="middle"
  fill="#fff4ef"
  font-size="16"
  font-weight="700"
  class="font-sans">Vysielame</text
>

<!-- The door the hosts came in by. -->
<rect x="190" y="40" width="72" height="186" rx="2" fill="#f4f1ea" />
<rect x="196" y="46" width="60" height="180" fill="#8a5a3b" />
<rect x="202" y="128" width="48" height="86" rx="2" fill="#6e4630" />
<circle cx="226" cy="84" r="12" fill="#f4f1ea" />
<circle cx="226" cy="84" r="9" fill="#d8e8ef" />
<rect x="238" y="140" width="12" height="4" rx="2" fill="#d9b088" />

<WallClock clock={PARTS.studio.clock} {hour} />

<!-- Shelves: books, a record, a little plant, a framed cover. -->
<rect x="686" y="30" width="70" height="52" rx="2" fill="#2a2f37" />
<rect x="691" y="35" width="60" height="42" fill="#e8b04c" />
<circle cx="721" cy="56" r="14" fill="#c23b35" />
<circle cx="721" cy="56" r="4" fill="#e8b04c" />
<rect x="676" y="120" width="96" height="5" rx="1" fill="#8a5a3b" />
{#each books as book (book.x)}
  <rect
    x={book.x}
    y={120 - book.h}
    width={book.w}
    height={book.h}
    rx="1"
    fill={book.c}
    transform={book.lean ? `rotate(14 ${book.x} 120)` : undefined}
  />
{/each}
<path d="M746 120v-10h14v10Z" fill="#e0b39f" />
<ellipse cx="749" cy="104" rx="5" ry="9" fill="#84ab92" transform="rotate(-20 749 104)" />
<ellipse cx="757" cy="105" rx="4" ry="8" fill="#bed3c4" transform="rotate(25 757 105)" />
<Plant plant={PARTS.studio.plant} />
