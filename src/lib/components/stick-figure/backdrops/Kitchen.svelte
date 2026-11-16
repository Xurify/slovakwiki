<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import { DOORS, HANDLE, doorPoint } from "$lib/stick-figure/door";
  import { isDark, type SceneMood } from "$lib/stick-figure/scene-mood";
  import Room from "./Room.svelte";
  import WallClock from "./WallClock.svelte";

  /** `open`: how far the door has swung in, from 0 shut to 1 wide open against the wall. */
  let { hour, mood, open = 0 }: { hour: number; mood?: SceneMood; open?: number } =
    $props();

  const dark = $derived(mood ? isDark(mood.time) : false);
  const night = $derived(mood?.time === "night");

  const door = DOORS.kitchen!;

  function on(u: number, v: number): string {
    const { x, y } = doorPoint(door, open, u, v);
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  function quad(u0: number, u1: number, v0: number, v1: number): string {
    return `M${on(u0, v0)}L${on(u1, v0)}L${on(u1, v1)}L${on(u0, v1)}Z`;
  }

  /**
   * Floor tiles in a checker, their joints running back to a point high over
   * the middle of the room, so the floor reads as lying flat.
   */
  const ROWS = [226, 235, 246, 259, 275, 300];
  const COLUMNS = Array.from({ length: 27 }, (_, index) => -40 + index * 40);
  const across = (x: number, y: number) => 480 + ((x - 480) * (y + 380)) / 606;
  const floorTiles = ROWS.slice(0, -1).flatMap((top, row) =>
    COLUMNS.slice(0, -1).flatMap((left, column) =>
      (row + column) % 2
        ? []
        : [
            `M${across(left, top)} ${top}H${across(left + 40, top)}L${across(left + 40, ROWS[row + 1])} ${ROWS[row + 1]}H${across(left, ROWS[row + 1])}Z`,
          ],
    ),
  );

  /** The tiled wall the counter and stove stand against, the top row painted. */
  const TILE = 32;
  const tileColumns = Array.from({ length: 8 }, (_, index) => 514 + index * TILE);
  const tileRows = [100, 132, 164, 196];
</script>

<Room wall="fill-scene-warm" floor="fill-scene-sand" />

<!-- The floor: big tiles in a checker. -->
<path d={floorTiles.join("")} class="fill-scene-line/8" />
<g class="stroke-scene-line/12" stroke-width="0.8" fill="none">
  {#each ROWS as y (y)}
    <path d="M-10 {y}H970" />
  {/each}
  {#each COLUMNS as x (x)}
    <path d="M{across(x, 226)} 226L{across(x, 300)} 300" />
  {/each}
</g>

<!-- Skirting along the wall's foot and a plaster cornice at the top. -->
<rect x="-10" y="218" width="980" height="8" class="fill-portrait-bib" />
<rect x="-10" y="218" width="980" height="1.2" class="fill-scene-line/12" />
<rect x="-10" y="0" width="980" height="5" class="fill-portrait-bib" />
<rect x="-10" y="5" width="980" height="1.2" class="fill-scene-line/10" />

<!-- The pantry door, far left, for the widest stages. -->
<rect x="36" y="56" width="62" height="170" class="fill-portrait-bib" />
<rect x="41" y="61" width="52" height="165" class="fill-scene-wood" />
<path d="M48 70h38v62h-38ZM48 142h38v74h-38Z" class="fill-scene-line/8" />
<rect x="83" y="136" width="8" height="2.6" rx="1.3" class="fill-scene-line/70" />

<!-- Painted plates from Modra on the wall by the door: white glaze, a blue rim, flowers. -->
{#each [72, 104, 136] as y, index (y)}
  <circle cx="146" cy={y} r="13" class="fill-white" />
  <circle cx="146" cy={y} r="13" class="stroke-scene-blue/60" stroke-width="1.4" fill="none" />
  <circle cx="146" cy={y} r="8.6" class="stroke-scene-blue/25" stroke-width="0.8" fill="none" />
  <circle cx="146" cy={y} r="2.6" class={index === 1 ? "fill-scene-red-mid" : "fill-scene-honey"} />
  {#each [0, 72, 144, 216, 288] as turn (turn)}
    <ellipse
      cx="146"
      cy={y - 5.4}
      rx="1.4"
      ry="2.6"
      transform="rotate({turn} 146 {y})"
      class={index === 1 ? "fill-scene-honey" : "fill-scene-blue/60"}
    />
  {/each}
  <path d="M146 {y - 13}v-3" class="stroke-scene-line/50" stroke-width="0.8" />
{/each}

<rect x="190" y="40" width="72" height="186" rx="2" class="fill-portrait-bib" />
<rect x="190" y="40" width="72" height="186" rx="2" class="fill-scene-line/5" />
{#if open > 0}
  <!-- The dim hall beyond the open door. -->
  <rect x="196" y="46" width="60" height="180" class="fill-scene-line/55" />
{/if}
<path d={quad(0, 1, 0, 1)} class="fill-scene-wood" />
<path
  d="{quad(0.1, 0.9, 0.078, 0.444)}{quad(0.1, 0.9, 0.522, 0.933)}"
  class="fill-scene-line/10"
/>
<path
  d={quad(HANDLE.u - 0.1, HANDLE.u + 0.1, HANDLE.v - 0.011, HANDLE.v + 0.011)}
  class="fill-scene-line/70"
/>

<!-- The light switch by the door. -->
<rect x="266" y="118" width="8" height="11" rx="1.4" class="fill-white" />
<path d="M266 118h8v11h-8Z" class="stroke-scene-line/20" stroke-width="0.6" fill="none" />
<rect x="268.2" y="120.4" width="3.6" height="6" rx="0.8" class="fill-scene-line/10" />

<!-- Her old kredenc, painted pale green: one dresser, plates and cups behind the glass, tins in its open niche, cupboards below. -->
<ellipse cx="310" cy="233" rx="40" ry="3" class="fill-scene-line/15" />
<rect x="276" y="58" width="68" height="174" rx="1" class="fill-scene-green-mid" />
<rect x="276" y="58" width="68" height="174" rx="1" class="fill-white/25" />
<rect x="273" y="54" width="74" height="6" rx="1" class="fill-scene-green-mid" />
<rect x="273" y="54" width="74" height="2" class="fill-white/30" />
<rect x="282" y="66" width="56" height="78" class="fill-scene-green" />
<rect x="285" y="69" width="24" height="72" class="fill-scene-sky" />
<rect x="311" y="69" width="24" height="72" class="fill-scene-sky" />
<path d="M285 105h50" class="stroke-scene-green-mid" stroke-width="2.4" />
{#each [291, 298, 305] as x (x)}
  <ellipse cx={x} cy="95" rx="3.2" ry="9" class="fill-white" />
  <ellipse cx={x} cy="95" rx="1.6" ry="5" class="fill-scene-blue/30" />
{/each}
{#each [317, 325] as x (x)}
  <path d="M{x - 3} 97h6l-0.6 6h-4.8Z" class="fill-white" />
  <path d="M{x + 3} 98q2 0 2 2t-2 2" class="stroke-white" stroke-width="1" fill="none" />
{/each}
<path d="M330 103v-8h4v8Z" class="fill-scene-honey" />
{#each [291, 302, 317, 328] as x, index (x)}
  <path d="M{x - 3.5} 139h7l-0.8 -8h-5.4Z" class={index % 2 ? "fill-scene-red-mid" : "fill-white"} />
{/each}
<path d="M290 116l10-12M314 124l14-16" class="stroke-white/60" stroke-width="1.6" />
<path d="M307.4 100v8M312.6 100v8" class="stroke-portrait-ink/50" stroke-width="1.4" />
<rect x="280" y="144" width="60" height="22" class="fill-scene-green/50" />
<path d="M288 166v-12h10v12Z" class="fill-scene-red" />
<path d="M288 157h10" class="stroke-white/70" stroke-width="1.4" />
<path d="M302 166v-10h9v10Z" class="fill-scene-steel" />
<path d="M318 166q0-8 8-8t8 8Z" class="fill-scene-onion" />
<path d="M321 162l4-3M326 164l4-4" class="stroke-scene-coffee/50" stroke-width="0.8" />
<rect x="273" y="166" width="74" height="5" rx="1" class="fill-scene-green-mid" />
<rect x="273" y="166" width="74" height="1.6" class="fill-white/30" />
<rect x="280" y="174" width="60" height="10" class="fill-white/15" />
<path d="M280 184h60M310 184v42" class="stroke-scene-green/50" stroke-width="1" />
<rect x="284" y="188" width="22" height="34" rx="1" class="stroke-scene-green/40" stroke-width="1" fill="none" />
<rect x="314" y="188" width="22" height="34" rx="1" class="stroke-scene-green/40" stroke-width="1" fill="none" />
<path d="M296 179h8M316 179h8M304 200v8M316 200v8" class="stroke-portrait-ink/50" stroke-width="1.6" />
<path d="M278 228h5v5h-5ZM337 228h5v5h-5Z" class="fill-scene-green" />

<!-- The window over the table: a lace curtain across its top, geraniums on the sill, the radiator under it. -->
<rect x="364" y="150" width="80" height="42" rx="3" class="fill-portrait-bib" />
<g class="stroke-scene-line/20" stroke-width="1">
  {#each Array.from({ length: 12 }, (_, index) => 369 + index * 6.4) as x (x)}
    <path d="M{x} 153V189" />
  {/each}
</g>
<path d="M438 192v34" class="stroke-portrait-bib" stroke-width="3" />
<rect x="352" y="54" width="104" height="80" class="fill-portrait-bib" />
<rect
  x="360"
  y="62"
  width="88"
  height="64"
  class={dark ? (night ? "fill-portrait-suit" : "fill-scene-blue/40") : "fill-scene-sky"}
/>
<path
  d="M360 126V108Q380 96 404 104Q426 94 448 104V126Z"
  class={dark ? "fill-scene-line/70" : "fill-scene-sage"}
/>
<path d="M402 62h4v64h-4Z" class="fill-portrait-bib" />
<path d="M366 120l18-40h6l-18 40ZM414 120l18-40h4l-18 40Z" class="fill-white/25" />
<path
  d="M360 62h88v28q-5.5 5-11 0q-5.5 5-11 0q-5.5 5-11 0q-5.5 5-11 0q-5.5 5-11 0q-5.5 5-11 0q-5.5 5-11 0q-5.5 5-11 0Z"
  class="fill-white/80"
/>
<g class="fill-scene-line/10">
  {#each [371, 393, 415, 437] as x (x)}
    <circle cx={x} cy="76" r="4" />
    <circle cx={x - 11} cy="84" r="1.6" />
  {/each}
</g>
<rect x="346" y="132" width="116" height="6" rx="2" class="fill-portrait-bib" />
<rect x="350" y="138" width="108" height="3" class="fill-scene-line/10" />
{#each [372, 404, 436] as x, index (x)}
  <path d="M{x - 13} 120q4-10 13-8q10-2 13 8q-6 5-13 3q-7 2-13-3Z" class="fill-scene-leaf" />
  <path d="M{x - 6} 117q6-6 12 0" class="stroke-scene-board/40" stroke-width="1" fill="none" />
  {#each [-7, 0, 7] as dx (dx)}
    <circle cx={x + dx} cy={110 - Math.abs(dx) * 0.4 - (index === 1 && dx === 0 ? 3 : 0)} r="3.6" class="fill-scene-red" />
    <circle cx={x + dx - 1} cy={109 - Math.abs(dx) * 0.4 - (index === 1 && dx === 0 ? 3 : 0)} r="1.4" class="fill-white/30" />
  {/each}
  <path d="M{x - 8} 122h16l-2 10h-12Z" class="fill-scene-clay" />
  <path d="M{x - 9} 121h18v3h-18Z" class="fill-scene-clay" />
  <path d="M{x - 9} 124h18" class="stroke-scene-line/20" stroke-width="0.8" />
{/each}
<rect x="340" y="46" width="128" height="3" rx="1.5" class="fill-scene-line/40" />
<path d="M342 48Q338 92 348 140H356Q350 96 356 48Z" class="fill-scene-red-mid" />
<path d="M466 48Q470 92 460 140H452Q458 96 452 48Z" class="fill-scene-red-mid" />
<path d="M346 52v84M462 52v84" class="stroke-white/40" stroke-width="1.2" stroke-dasharray="3 3" />

<!-- The light over the middle of the table: an enamel shade on a cord, hanging in front of the window. -->
<path d="M370 0V62" class="stroke-scene-line/60" stroke-width="1" />
<rect x="367" y="60" width="6" height="4" rx="1" class="fill-scene-line/50" />
<path d="M362 64h16l10 14h-36Z" class="fill-scene-green-mid" />
<path d="M362 64h16l1.4 2h-18.8Z" class="fill-white/40" />
<path d="M352 78h36" class="stroke-white/70" stroke-width="1.4" />
<ellipse cx="370" cy="79" rx="5" ry="1.6" class="fill-scene-honey" />

<WallClock clock={PARTS.kitchen.clock} {hour} />

<!-- An embroidered kitchen hanging under the clock, red cross-stitch on white linen, high enough to stay out of the close shot at the stove. -->
<path d="M475 75h32" class="stroke-scene-coffee/70" stroke-width="2" />
<circle cx="491" cy="73.4" r="1.1" class="fill-scene-line/60" />
<path d="M477 76h28v24q-14 4-28 0Z" class="fill-white" />
<path d="M477 76h28v24q-14 4-28 0Z" class="stroke-scene-red/60" stroke-width="1" fill="none" stroke-dasharray="1.6 1.2" />
<path d="M481 82h20M483 86.4h16" class="stroke-scene-red/70" stroke-width="1.2" stroke-dasharray="2 1" />
<path d="M491 98q-4-2.8-4-5.4a2 2 0 0 1 4-0.8a2 2 0 0 1 4 0.8q0 2.6-4 5.4Z" class="fill-scene-red/80" />
<path d="M481 93l2-2 2 2-2 2ZM497 93l2-2 2 2-2 2Z" class="fill-scene-green-mid" />

<!-- The wall cupboards over the counter, a pot and a basket kept on top. -->
<path d="M552 32v-16q0 -4 4 -4h24q4 0 4 4v16Z" class="fill-scene-steel" />
<path d="M548 18h40" class="stroke-scene-steel-dark" stroke-width="2.2" />
<path d="M564 12q4 -4 8 0" class="stroke-scene-steel-dark" stroke-width="1.6" fill="none" />
<path d="M692 32l-4 -14h40l-4 14Z" class="fill-scene-onion" />
<path d="M690 22h36M691 27h34" class="stroke-scene-coffee/40" stroke-width="0.8" />
<rect x="514" y="32" width="256" height="60" rx="2" class="fill-scene-wood" />
<path d="M578.5 32V92M643 32V92M707.5 32V92" class="stroke-scene-line/25" stroke-width="1.6" />
<rect x="520" y="38" width="52" height="48" class="fill-scene-coffee/10" />
<rect x="585" y="38" width="52" height="48" class="fill-scene-sky/70" />
<rect x="649" y="38" width="52" height="48" class="fill-scene-sky/70" />
<rect x="714" y="38" width="52" height="48" class="fill-scene-coffee/10" />
{#each [592, 601, 610] as x (x)}
  <path d="M{x} 62h7l-1 9h-5Z" class="fill-white" />
  <path d="M{x + 7} 64q2.4 0 2.4 2t-2.4 2" class="stroke-white" stroke-width="1" fill="none" />
{/each}
<path d="M622 71v-12h6v12Z" class="fill-scene-honey" />
<path d="M585 72h52M649 72h52" class="stroke-scene-wood" stroke-width="2" />
{#each [656, 664, 672, 680] as x (x)}
  <ellipse cx={x} cy="63" rx="3" ry="8.4" class="fill-white" />
{/each}
<path d="M656 80h40v-4h-40Z" class="fill-scene-red-mid" />
<path d="M590 44l12 -6M656 44l12 -6" class="stroke-white/60" stroke-width="1.6" />
<path d="M572 74v10M585 74v10M701 74v10M714 74v10" class="stroke-scene-line/50" stroke-width="2.4" />
<rect x="514" y="88" width="256" height="4" class="fill-scene-coffee/30" />

<!-- The tiled wall the counter and stove stand against; they are the set's, drawn at the cast's scale (StickSet.svelte). -->
{#each tileColumns as x (x)}
  {#each tileRows as y, row (y)}
    <rect x={x + 1} {y} width={TILE - 2} height={Math.min(TILE - 2, 226 - y)} class="fill-scene-cool" />
    {#if row === 0}
      <path
        d="M{x + TILE / 2} {y + 6}l4 9-4 9-4-9Z"
        class="fill-scene-blue/30"
      />
      <circle cx={x + TILE / 2} cy={y + TILE / 2 - 1} r="2" class="fill-scene-honey" />
      <path d="M{x + 4} {y + 15}h6M{x + TILE - 10} {y + 15}h6" class="stroke-scene-blue/30" stroke-width="1.4" />
    {/if}
  {/each}
{/each}

<!-- A little spice shelf on the tiles, and a socket for the kettle. -->
<rect x="520" y="146" width="52" height="3" rx="1" class="fill-scene-wood" />
<path d="M524 149l4 5M568 149l-4 5" class="stroke-scene-wood" stroke-width="1.6" />
{#each [{ x: 526, paint: "fill-scene-apple" }, { x: 537, paint: "fill-scene-onion" }, { x: 548, paint: "fill-scene-leaf" }, { x: 559, paint: "fill-scene-carrot" }] as jar (jar.x)}
  <rect x={jar.x} y="134" width="8" height="12" rx="1.4" class="fill-white" />
  <rect x={jar.x + 1} y="138" width="6" height="7" rx="1" class={jar.paint} />
  <rect x={jar.x} y="132" width="8" height="3" rx="1" class="fill-scene-red-mid" />
{/each}
<rect x="600" y="176" width="10" height="10" rx="1.5" class="fill-white" />
<path d="M600 176h10v10h-10Z" class="stroke-scene-line/25" stroke-width="0.6" fill="none" />
<circle cx="603.4" cy="181" r="0.9" class="fill-scene-line/50" />
<circle cx="606.6" cy="181" r="0.9" class="fill-scene-line/50" />

<!-- Her small fridge at the end of the run, past where a phone's stage stops, a radio on top. -->
<ellipse cx="803" cy="233" rx="21" ry="3" class="fill-scene-line/15" />
<rect x="784" y="136" width="38" height="94" rx="5" class="fill-white" />
<rect x="784" y="136" width="38" height="94" rx="5" class="fill-scene-line/5" />
<path d="M784 164H822" class="stroke-scene-line/30" stroke-width="1.4" />
<path d="M815 142v14M815 172v26" class="stroke-scene-line/50" stroke-width="2.6" />
<rect x="792" y="143" width="9" height="7" rx="1.4" class="fill-scene-apple" />
<circle cx="805" cy="152" r="3" class="fill-scene-honey" />
<rect x="792" y="168" width="15" height="19" class="fill-white" />
<path d="M794 174h11M794 178h9M794 182h11" class="stroke-scene-line/30" stroke-width="0.8" />
<circle cx="799.5" cy="168" r="1.6" class="fill-scene-red" />
<path d="M786 228h4v3h-4ZM816 228h4v3h-4Z" class="fill-scene-line/40" />
<rect x="787" y="124" width="32" height="12" rx="2" class="fill-scene-red-mid" />
<circle cx="795" cy="130" r="3.6" class="fill-scene-line/40" />
<rect x="803" y="128" width="12" height="3" rx="1" class="fill-white/70" />
