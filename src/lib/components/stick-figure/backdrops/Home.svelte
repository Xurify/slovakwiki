<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import { DOORS, HANDLE, doorPoint } from "$lib/stick-figure/door";
  import { isDark, type SceneMood } from "$lib/stick-figure/scene-mood";
  import Castle from "./Castle.svelte";
  import Plant from "./Plant.svelte";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  /** `open`: how far the hall door has swung in, from 0 shut. */
  let { hour = 12, mood, open = 0 }: { hour?: number; mood?: SceneMood; open?: number } =
    $props();

  const door = DOORS.home!;
  function on(u: number, v: number): string {
    const { x, y } = doorPoint(door, open, u, v);
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  function quad(u0: number, u1: number, v0: number, v1: number): string {
    return `M${on(u0, v0)}L${on(u1, v0)}L${on(u1, v1)}L${on(u0, v1)}Z`;
  }
  const dark = $derived(mood ? isDark(mood.time) : false);
  const night = $derived(mood?.time === "night");

  /** A small sprig printed on the wallpaper, row by row, every other row shifted half a step. */
  const WALLPAPER = Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 34 }, (_, column) => {
      const x = column * 30 + (row % 2) * 15 - 6;
      const y = 22 + row * 24;
      return `M${x} ${y}l2.4 4-2.4 4-2.4-4Z`;
    }).join(""),
  ).join("");

  /** Floorboard rows, closer together toward the wall, and their joints staggered row by row. */
  const BOARD_ROWS = [234, 243, 254, 267, 283];
  const joints = (row: number) =>
    Array.from({ length: 9 }, (_, index) => index * 118 + ((row * 53) % 118) - 40);

  /**
   * The rug, a trapezoid seen from the room's height: its far edge
   * narrower than the near one, which runs off the bottom of the stage.
   */
  const RUG = { far: 248, near: 300, farLeft: 290, farRight: 598, nearLeft: 256, nearRight: 616 };
  function rugX(y: number, side: 0 | 1): number {
    const t = (y - RUG.far) / (RUG.near - RUG.far);
    return side === 0
      ? RUG.farLeft + (RUG.nearLeft - RUG.farLeft) * t
      : RUG.farRight + (RUG.nearRight - RUG.farRight) * t;
  }
  function rugBand(inset: number, top: number, bottom: number): string {
    const [a, b] = [RUG.far + top, RUG.near - bottom];
    return `M${rugX(a, 0) + inset} ${a}H${rugX(a, 1) - inset}L${rugX(b, 1) - inset} ${b}H${rugX(b, 0) + inset}Z`;
  }
  /** Lozenges down the rug's middle, as on a woven folk runner. */
  const LOZENGES = Array.from({ length: 5 }, (_, index) => 336 + index * 50);

  /** The bookcase's shelves, each with its books: width and height from the shelf, paint. */
  const SHELVES: { y: number; books: [number, number, string][] }[] = [
    {
      y: 100,
      books: [
        [5, 22, "fill-scene-red-mid"],
        [4, 24, "fill-portrait-suit"],
        [6, 20, "fill-scene-honey"],
        [4, 23, "fill-scene-leaf"],
        [5, 21, "fill-scene-clay"],
        [4, 25, "fill-scene-line"],
      ],
    },
    {
      y: 136,
      books: [
        [6, 24, "fill-scene-board"],
        [4, 22, "fill-scene-pale"],
        [5, 25, "fill-scene-beet"],
        [4, 21, "fill-scene-honey"],
      ],
    },
  ];
  const spines = (books: [number, number, string][], from: number) =>
    books.map(([width, height, paint], index) => ({
      x: from + books.slice(0, index).reduce((sum, [w]) => sum + w + 0.6, 0),
      width,
      height,
      paint,
    }));
</script>

<Room wall="fill-scene-warm" floor="fill-scene-wood" />
<path d={WALLPAPER} class="fill-scene-clay/15" />

<!-- Oak boards, laid along the room. -->
<g class="stroke-scene-line/12" stroke-width="0.8" fill="none">
  {#each BOARD_ROWS as y, row (y)}
    <path d="M-10 {y}H970" />
    {#each joints(row) as x (x)}
      <path d="M{x} {y}V{BOARD_ROWS[row + 1] ?? 300}" />
    {/each}
  {/each}
</g>

<!-- A white skirting board along the foot of the wall, and the cornice at the top. -->
<rect x="-10" y="216" width="980" height="10" class="fill-portrait-bib" />
<rect x="-10" y="216" width="980" height="1.4" class="fill-scene-line/12" />
<rect x="-10" y="0" width="980" height="5" class="fill-portrait-bib" />
<rect x="-10" y="5" width="980" height="1.4" class="fill-scene-line/10" />

<!-- An embroidered picture on the far left wall, for the widest stages. -->
<rect x="10" y="78" width="30" height="40" class="fill-scene-wood" />
<rect x="14" y="82" width="22" height="32" class="fill-portrait-bib" />
<path
  d="M25 88l4 6-4 6-4-6ZM25 100v10M21 106l4-3 4 3"
  class="stroke-scene-red/70"
  stroke-width="1"
  fill="none"
/>

<g transform="translate(10 0)">
<rect x="96" y="44" width="150" height="120" class="fill-portrait-bib" />
<rect
  x="106"
  y="54"
  width="130"
  height="100"
  class={dark ? (night ? "fill-portrait-suit" : "fill-scene-blue/40") : "fill-scene-sky"}
/>
<!-- Across the street, seen from upstairs: house fronts, their windows lit after dark, and the pavement below. -->
{#each [{ x: 106, w: 44, top: 70, paint: "fill-scene-honey" }, { x: 150, w: 50, top: 62, paint: "fill-scene-clay" }, { x: 200, w: 36, top: 76, paint: "fill-scene-sage" }] as house (house.x)}
  <rect x={house.x} y={house.top} width={house.w} height={142 - house.top} class={dark ? "fill-scene-line/70" : house.paint} />
  <path d="M{house.x} {house.top}h{house.w}v3h-{house.w}Z" class="fill-scene-line/20" />
  {#each [house.top + 10, house.top + 30] as y, row (y)}
    {#each [house.x + 7, house.x + house.w - 15] as x, column (x)}
      <rect
        {x}
        {y}
        width="8"
        height="11"
        class={dark && (row + column + house.x) % 3 === 0 ? "fill-scene-honey" : dark ? "fill-portrait-suit/70" : "fill-white/70"}
      />
    {/each}
  {/each}
{/each}
<rect x="106" y="140" width="130" height="14" class={dark ? "fill-scene-line/60" : "fill-scene-sand"} />
<path d="M106 141h130" class="stroke-scene-line/30" stroke-width="1" />

{#if !dark}
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
    <path
      d="M147.2 112.2H154.8L155 113.8H147Z"
      class="fill-portrait-vest"
      stroke="none"
    />
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
    <rect
      x="198.8"
      y="137"
      width="7.4"
      height="7.4"
      rx="1"
      class="fill-portrait-ground"
    />
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
{:else}
  <!-- Evening / night street scene through the window: dark silhouettes and quiet lantern light -->
  {#if night}
    <circle cx="224" cy="64" r="6" class="fill-scene-honey/70" />
    <circle cx="221.6" cy="62.4" r="5" class="fill-portrait-suit" />
  {:else}
    <!-- Dusk: warm street lamp across the street -->
    <path d="M192 148v-26" class="stroke-scene-line" stroke-width="1.2" />
    <circle cx="192" cy="122" r="3" class="fill-scene-honey" />
    <circle cx="192" cy="122" r="7" class="fill-scene-honey/30" />
  {/if}
{/if}

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

</g>

<g transform="translate(10 0)">
<!-- The radiator under the sill, its pipe down into the floor. -->
<rect x="120" y="182" width="102" height="32" rx="3" class="fill-portrait-bib" />
<g class="stroke-scene-line/20" stroke-width="1">
  {#each Array.from({ length: 16 }, (_, index) => 126 + index * 6) as x (x)}
    <path d="M{x} 185V211" />
  {/each}
</g>
<rect x="120" y="210" width="102" height="4" rx="2" class="fill-scene-line/10" />
<path d="M126 178v4M214 178v4" class="stroke-scene-line/40" stroke-width="2" />

</g>
<!-- Bobík's bed on the floor by the radiator, a chewed rope toy in it. -->
<ellipse cx="138" cy="246" rx="31" ry="4" class="fill-scene-line/15" />
<path d="M108 241Q108 230 138 230Q168 230 168 241Q168 247 138 247Q108 247 108 241Z" class="fill-scene-red-mid" />
<ellipse cx="138" cy="237" rx="22" ry="5" class="fill-scene-sand" />
<path d="M116 240Q138 245 160 240" class="stroke-scene-line/20" stroke-width="1" fill="none" />
<path d="M130 236q4 -2 8 0t8 0" class="stroke-scene-honey" stroke-width="2" fill="none" />

<!-- A mirror over the coat hooks, to check yourself on the way out. -->
<rect x="290" y="30" width="44" height="58" rx="2" class="fill-scene-wood" />
<rect x="294" y="34" width="36" height="50" rx="1" class="fill-scene-sky" />
<path d="M298 56l12-18h8l-12 18ZM306 78l18-26h4l-18 26Z" class="fill-white/40" />

<!-- Shoes on the mat under the coat hooks, as anyone coming in leaves them. -->
<path d="M280 226H338L342 236H276Z" class="fill-scene-sage" />
<path d="M282 228H336" class="stroke-scene-line/15" stroke-width="0.8" stroke-dasharray="2 2" />
<g>
  <path d="M286 233V228Q286 225 289 225H292L298 230Q300 231 300 233Z" class="fill-scene-coffee" />
  <path d="M292 234V229Q292 226 295 226H298L304 231Q306 232 306 234Z" class="fill-scene-coffee" />
  <path d="M314 233V229Q314 227 316 227H319L326 231Q328 232 328 233Z" class="fill-portrait-bib" />
  <path d="M314 231.6H328" class="stroke-scene-blue/60" stroke-width="1.2" />
  <path d="M320 234V230Q320 228 322 228H325L332 232Q334 233 334 234Z" class="fill-portrait-bib" />
  <path d="M320 232.6H334" class="stroke-scene-blue/60" stroke-width="1.2" />
</g>

<!-- The door to the hall: white, a frosted pane in its top half; it swings into the room on hinges at its left. -->
<rect x="358" y="48" width="72" height="178" class="fill-portrait-bib" />
<rect x="358" y="48" width="72" height="178" class="fill-scene-line/5" />
{#if open > 0}
  <!-- The dim hall beyond the open door. -->
  <rect x="364" y="54" width="60" height="172" class="fill-scene-line/55" />
{/if}
<path d={quad(0, 1, 0, 1)} class="fill-white" />
<path d={quad(0.133, 0.867, 0.058, 0.465)} class="fill-scene-sky" />
<path d={quad(0.133, 0.867, 0.058, 0.465)} class="fill-white/40" />
<path
  d="M{on(0.5, 0.058)}L{on(0.5, 0.465)}M{on(0.133, 0.262)}L{on(0.867, 0.262)}"
  class="stroke-white"
  stroke-width="2"
/>
<path d={quad(0.133, 0.867, 0.535, 0.919)} class="fill-scene-line/5" />
<path d={quad(0.133, 0.867, 0.535, 0.919)} class="stroke-scene-line/12" stroke-width="1" />
<path
  d={quad(HANDLE.u - 0.1, HANDLE.u + 0.1, HANDLE.v - 0.008, HANDLE.v + 0.008)}
  class="fill-scene-steel-dark"
/>
<path d="M364 70h2M364 204h2" class="stroke-scene-line/40" stroke-width="5" />

<WallClock clock={PARTS.home.clock} {hour} />

<!-- The light switch by the door, and a socket low on the wall. -->
<rect x="436" y="126" width="9" height="12" rx="1.5" class="fill-white" />
<path d="M436 126h9v12h-9Z" class="stroke-scene-line/20" stroke-width="0.6" fill="none" />
<rect x="438.5" y="128.5" width="4" height="7" rx="0.8" class="fill-scene-line/10" />
<rect x="434" y="200" width="10" height="10" rx="1.5" class="fill-white" />
<path d="M434 200h10v10h-10Z" class="stroke-scene-line/20" stroke-width="0.6" fill="none" />
<circle cx="437.4" cy="205" r="0.9" class="fill-scene-line/50" />
<circle cx="440.6" cy="205" r="0.9" class="fill-scene-line/50" />

<!-- The bookcase: books on two shelves, the television on the third, a cupboard below. -->
<ellipse cx="480" cy="233" rx="38" ry="3" class="fill-scene-line/15" />
<rect x="448" y="62" width="64" height="170" rx="1" class="fill-scene-wood" />
<rect x="453" y="67" width="54" height="111" class="fill-scene-coffee/25" />
<rect x="451" y="172" width="58" height="3.4" class="fill-scene-wood" />
{#each SHELVES as shelf (shelf.y)}
  {#each spines(shelf.books, 455) as book (book.x)}
    <rect x={book.x} y={shelf.y - book.height} width={book.width} height={book.height} rx="0.6" class={book.paint} />
    <path d="M{book.x} {shelf.y - book.height + 4}h{book.width}" class="stroke-white/40" stroke-width="0.8" />
  {/each}
  <rect x="451" y={shelf.y} width="58" height="3.4" class="fill-scene-wood" />
  <rect x="451" y={shelf.y + 3.4} width="58" height="1.2" class="fill-scene-coffee/30" />
{/each}
<!-- A photo and a little jug among the books, and books lying flat. -->
<rect x="490" y="84" width="13" height="16" class="fill-scene-coffee/70" />
<rect x="492" y="86" width="9" height="12" class="fill-scene-sky" />
<circle cx="496.5" cy="90.5" r="2.2" class="fill-portrait-skin" />
<path d="M493 98q3.5 -5 7 0Z" class="fill-scene-red-mid" />
<path d="M484 136v-10q0 -4 4 -4h6q4 0 4 4v10Z" class="fill-white" />
<path d="M485 128h12" class="stroke-scene-blue/50" stroke-width="1.6" />
<path d="M498 126q4 0 4 4t-4 3" class="stroke-white" stroke-width="1.6" fill="none" />
<!-- The television in the bookcase's wide bottom shelf, a little speaker beside it. -->
<rect x="456" y="140" width="40" height="27" rx="1.4" class="fill-portrait-vest" />
<rect x="458.4" y="142.4" width="35.2" height="21" class="fill-portrait-suit" />
<path d="M461 160l14-16h4l-14 16Z" class="fill-white/10" />
<path d="M472 167h8l1.6 5h-11.2Z" class="fill-portrait-vest" />
<rect x="499" y="156" width="7" height="16" rx="1" class="fill-scene-line" />
<circle cx="502.5" cy="164" r="2" class="fill-scene-line/50" />
<rect x="453" y="180" width="54" height="44" class="fill-scene-coffee/10" />
<path d="M480 180v44" class="stroke-scene-coffee/40" stroke-width="1" />
<path d="M476 196v8M484 196v8" class="stroke-scene-line/50" stroke-width="1.6" />
<rect x="448" y="226" width="64" height="6" class="fill-scene-coffee/40" />
<!-- On top, a woven box and a trailing plant. -->
<path d="M456 62V50h22v12Z" class="fill-scene-onion" />
<path d="M456 54h22M456 58h22" class="stroke-scene-coffee/30" stroke-width="0.8" />
<path d="M489 50h16l-2 12h-12Z" class="fill-scene-clay" />
<rect x="487.6" y="48" width="18.8" height="4" rx="1" class="fill-scene-clay" />
<path d="M488 52h18" class="stroke-scene-line/20" stroke-width="0.8" />
<path d="M492 48q-4-6 0-10M497 48q2-8 8-9M501 48q-6-6-2-12" class="stroke-scene-leaf" stroke-width="2.4" fill="none" />
<path d="M490 52q-6 4-4 14q1 6-2 12M504 52q6 6 3 15" class="stroke-scene-leaf" stroke-width="2" fill="none" />

<g transform="translate(-6 0)">
<!-- Pictures over the sofa: the castle by the Danube, a meadow and a portrait. -->
<rect x="536" y="62" width="80" height="58" class="fill-scene-wood" />
<rect x="542" y="68" width="68" height="46" class="fill-scene-sky" />
<Castle x={576} y={102} size={0.34} />
<path d="M542 114V103Q560 94 576 99Q592 92 610 101V114Z" class="fill-scene-sage" />
<path d="M542 107q17 -3 34 0t34 0V114H542Z" class="fill-scene-water/30" />
<path d="M542 68h68v2.4h-68ZM542 70.4h2.4v43.6h-2.4Z" class="fill-scene-line/15" />
<rect x="624" y="62" width="28" height="26" class="fill-scene-coffee/70" />
<rect x="628" y="66" width="20" height="18" class="fill-scene-sky" />
<path d="M628 84V77Q638 71 648 77V84Z" class="fill-scene-leaf" />
<circle cx="642" cy="71" r="2.4" class="fill-scene-honey" />
<rect x="624" y="94" width="28" height="26" class="fill-portrait-bib" />
<rect x="624" y="94" width="28" height="26" class="fill-scene-line/10" />
<rect x="628" y="98" width="20" height="18" class="fill-scene-clay/60" />
<circle cx="638" cy="104" r="3.6" class="fill-portrait-skin" />
<path d="M631 116q7 -9 14 0Z" class="fill-portrait-suit" />
<path d="M634.4 103q0 -5 3.6 -5t3.6 5q-1 -2 -3.6 -2t-3.6 2Z" class="fill-portrait-hair-grey" />

<!-- The sofa, a knitted throw over its arm. -->
<ellipse cx="588" cy="233" rx="70" ry="4" class="fill-scene-line/15" />
<rect x="534" y="148" width="108" height="54" rx="10" class="fill-portrait-ground" />
<rect x="534" y="148" width="108" height="6" rx="3" class="fill-white/20" />
<rect x="528" y="194" width="120" height="32" rx="6" class="fill-portrait-ground" />
<rect x="542" y="190" width="46" height="12" rx="4" class="fill-portrait-ground" />
<rect x="588" y="190" width="46" height="12" rx="4" class="fill-portrait-ground" />
<path d="M588 191v10M542 201h92" class="stroke-scene-line/15" stroke-width="1" />
<rect x="528" y="214" width="120" height="12" rx="4" class="fill-scene-line/10" />
<rect x="522" y="170" width="22" height="56" rx="9" class="fill-portrait-ground" />
<rect x="632" y="170" width="22" height="56" rx="9" class="fill-portrait-ground" />
<path d="M526 220v-40M650 220v-40" class="stroke-scene-line/10" stroke-width="2" />
<path d="M532 226h5v6h-5ZM639 226h5v6h-5Z" class="fill-scene-coffee" />
<rect x="548" y="158" width="32" height="29" rx="7" transform="rotate(-8 564 172)" class="fill-scene-honey" />
<path d="M554 165l20 14M574 163l-18 17" class="stroke-white/40" stroke-width="1.2" transform="rotate(-8 564 172)" />
<rect x="596" y="158" width="32" height="29" rx="7" transform="rotate(8 612 172)" class="fill-scene-clay" />
<circle cx="612" cy="172" r="5" class="fill-white/30" transform="rotate(8 612 172)" />
<path d="M626 168Q638 162 653 170V214Q647 220 640 216L638 196Q632 190 626 188Z" class="fill-scene-sage" />
<path d="M630 176Q640 170 651 176M636 190Q644 186 651 190M640 204Q646 202 651 204" class="stroke-white/50" stroke-width="1.6" fill="none" />
<path d="M640 216l-1 5M644 217l0 5M648 216l1 5" class="stroke-scene-sage" stroke-width="1.2" />
</g>

<!-- A reading lamp in the corner past the sofa, plugged in by the skirting. -->
<ellipse cx="690" cy="233" rx="12" ry="2.4" class="fill-scene-line/15" />
<rect x="681" y="228" width="18" height="4" rx="2" class="fill-scene-line/60" />
<rect x="688.8" y="96" width="2.4" height="134" class="fill-scene-line/60" />
<path d="M698 230q10 0 14-10v-10" class="stroke-scene-line/40" stroke-width="1" fill="none" />
<rect x="707" y="200" width="10" height="10" rx="1.5" class="fill-white" />
<path d="M707 200h10v10h-10Z" class="stroke-scene-line/20" stroke-width="0.6" fill="none" />
<path d="M676 100h28l-6-26h-16Z" class="fill-scene-honey" />
<path d="M676 100h28l-0.6-3h-26.8Z" class="fill-scene-line/12" />

<Plant plant={PARTS.home.plant} />

<!-- The far right, for the widest stages: a low sideboard, flowers on it and a picture over it. -->
<ellipse cx="868" cy="233" rx="74" ry="3.4" class="fill-scene-line/15" />
<rect x="798" y="188" width="140" height="40" rx="2" class="fill-scene-wood" />
<path d="M844 192v32M892 192v32M800 200h-2" class="stroke-scene-coffee/40" stroke-width="1" />
<path d="M818 204h8M864 204h8M910 204h8" class="stroke-scene-line/50" stroke-width="1.6" />
<path d="M804 228h4v4h-4ZM928 228h4v4h-4Z" class="fill-scene-coffee" />
<rect x="830" y="92" width="78" height="56" class="fill-scene-wood" />
<rect x="836" y="98" width="66" height="44" class="fill-scene-sky" />
<path d="M836 142V124Q856 112 872 120Q888 110 902 122V142Z" class="fill-scene-leaf" />
<circle cx="888" cy="108" r="4" class="fill-scene-honey" />
<path d="M922 188v-14q0-4 3-4t3 4v14Z" class="fill-scene-clay" />
<path d="M925 170q-6-14-2-22M925 170q4-12 10-18M925 170q0-10 0-24" class="stroke-scene-leaf" stroke-width="1.4" fill="none" />
<circle cx="923" cy="148" r="3" class="fill-scene-red-mid" />
<circle cx="935" cy="152" r="3" class="fill-scene-honey" />
<circle cx="925" cy="146" r="2.4" class="fill-portrait-bib" />

<!-- The light over the middle of the room, hanging from the ceiling. -->
<ellipse cx="410" cy="7" rx="9" ry="2.6" class="fill-portrait-bib" />
<ellipse cx="410" cy="7" rx="9" ry="2.6" class="stroke-scene-line/20" stroke-width="0.8" fill="none" />
<path d="M410 8V24" class="stroke-scene-line/60" stroke-width="1" />
<path d="M400 24h20l8 18h-36Z" class="fill-scene-clay" />
<path d="M400 24h20l1.4 3h-22.8Z" class="fill-scene-line/15" />
<path d="M392 42h36" class="stroke-scene-line/20" stroke-width="1.2" />
<rect x="407" y="20" width="6" height="5" rx="1" class="fill-scene-line/50" />

<!-- A folk-woven rug under the cast, fringed at the near end. -->
<path d={rugBand(0, 0, 0)} class="fill-scene-red-mid" />
<path d={rugBand(7, 4, 6)} class="fill-scene-beet/60" />
<path d={rugBand(11, 7, 9)} class="fill-scene-red-mid" />
<path d={rugBand(18, 13, 15)} class="stroke-portrait-bib/60" stroke-width="1" fill="none" />
{#each LOZENGES as x (x)}
  <path d="M{x} 262l14 11-14 11-14-11Z" class="fill-scene-honey/80" />
  <path d="M{x} 268l6 5-6 5-6-5Z" class="fill-scene-beet/60" />
  <path d="M{x + 25} 270l3 3-3 3-3-3Z" class="fill-portrait-bib/70" />
{/each}
<path d={rugBand(0, 0, 0)} class="fill-scene-line/5" />

<!-- The coffee table in front of the sofa: a mug and a magazine on it. -->
<ellipse cx="582" cy="250" rx="42" ry="3" class="fill-scene-line/15" />
<path d="M548 230v19M616 230v19" class="stroke-scene-coffee" stroke-width="3" />
<rect x="540" y="224" width="84" height="7" rx="2" class="fill-scene-wood" />
<rect x="540" y="229" width="84" height="2" class="fill-scene-coffee/30" />
<path d="M548 224l4-3h18l-2 3Z" class="fill-scene-blue/50" />
<path d="M596 224v-7h7v7Z" class="fill-white" />
<path d="M603 219q3 0 3 2t-3 2" class="stroke-white" stroke-width="1.2" fill="none" />

<!-- Táto taška, set down on the shoe mat by the door; the one by the window is the set's (StickSet.svelte). -->
<g transform="translate(344 230) scale(0.8)">
  <ellipse cx="0" cy="0" rx="20" ry="2.6" class="fill-scene-line/15" />
  <path d="M-10 -23Q-10 -37 0 -37Q10 -37 10 -23" class="stroke-scene-line/60" fill="none" stroke-width="2.4" />
  <path d="M-17 -25h34l-2 22a3 3 0 0 1-3 3h-24a3 3 0 0 1-3-3Z" class="fill-scene-honey" />
  <path d="M-16 -17h32" class="stroke-white/40" stroke-width="2" />
</g>
