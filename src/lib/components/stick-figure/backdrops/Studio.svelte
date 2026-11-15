<script lang="ts">
  import { PARTS } from "$lib/stick-figure/backdrop-parts";
  import { DOORS, HANDLE, doorPoint } from "$lib/stick-figure/door";
  import FloorShade from "./FloorShade.svelte";
  import WallClock from "./WallClock.svelte";

  /** `open`: how far the door has swung in, from 0 shut to 1 wide open against the wall. */
  let { hour, open = 0 }: { hour: number; open?: number } = $props();

  const id = $props.id();
  const door = DOORS.studio!;
  const clock = PARTS.studio.clock;

  function on(u: number, v: number): string {
    const { x, y } = doorPoint(door, open, u, v);
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  function quad(u0: number, u1: number, v0: number, v1: number): string {
    return `M${on(u0, v0)}L${on(u1, v0)}L${on(u1, v1)}L${on(u0, v1)}Z`;
  }
  /** The round window, squeezed across as the door turns. */
  const pane = $derived.by(() => {
    const { x, y } = doorPoint(door, open, 0.5, 38 / 180);
    const squeeze =
      Math.abs(doorPoint(door, open, 1, 0).x - door.hinge) / (door.edge - door.hinge);
    return { x, y, rx: Math.max(0.5, squeeze) };
  });

  const CEILING = 12;
  const SKIRTING = 214;
  const FLOOR_Y = 226;
  const WALL = { left: 340, right: 620, top: 26, bottom: SKIRTING - 6 };
  const slats = Array.from(
    { length: Math.floor((WALL.right - WALL.left - 4) / 9) + 1 },
    (_, index) => WALL.left + 3 + index * 9,
  );
  const boards = [-6, 70, 158, 236, 330, 418, 512, 600, 688, 772, 858, 946];
  /** Wedge-foam tiles beside the door and past the shelf, out where a phone's stage ends, each turned across its neighbours. */
  const foam = [126, 794].flatMap((x) =>
    [50, 70, 90, 110, 130, 150].flatMap((y, row) =>
      [0, 20].map((dx, column) => ({ x: x + dx, y, across: (row + column) % 2 === 0 })),
    ),
  );
  const books = [
    { x: 654, w: 7, h: 26, c: "#c23b35" },
    { x: 662, w: 6, h: 30, c: "#22385c" },
    { x: 669, w: 8, h: 24, c: "#ecc77f" },
    { x: 678, w: 5, h: 28, c: "#45614f" },
    { x: 684, w: 7, h: 22, c: "#6f5b8e", lean: true },
  ];
  const SHELF_Y = 116;
</script>

<defs>
  <radialGradient id="{id}-glow">
    <stop offset="0" stop-color="#ff6a5c" stop-opacity="0.42" />
    <stop offset="0.55" stop-color="#ff6a5c" stop-opacity="0.14" />
    <stop offset="1" stop-color="#ff6a5c" stop-opacity="0" />
  </radialGradient>
  <radialGradient id="{id}-pool">
    <stop offset="0" stop-color="#ffd98a" stop-opacity="0.34" />
    <stop offset="1" stop-color="#ffd98a" stop-opacity="0" />
  </radialGradient>
  <linearGradient id="{id}-felt" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a221d" />
    <stop offset="1" stop-color="#3a2f28" />
  </linearGradient>
</defs>

<!-- Wall, ceiling and floor. -->
<rect x="-10" y="-10" width="980" height={FLOOR_Y + 10} fill="#ebe5da" />
<rect x="-10" y="-10" width="980" height={CEILING + 10} fill="#ddd4c6" />
<rect x="-10" y={CEILING} width="980" height="4" fill="#f6f2ea" />
<path d="M-10 {CEILING + 4.5}H970" stroke="#cfc5b5" stroke-width="1" />

<rect x="-10" y={FLOOR_Y} width="980" height="84" fill="#b5875c" />
<path
  d="M-10 {FLOOR_Y + 14}H970M-10 {FLOOR_Y + 32}H970M-10 {FLOOR_Y + 54}H970M-10 {FLOOR_Y +
    78}H970"
  stroke="#a37850"
  stroke-width="1"
/>
{#each boards as x, index (x)}
  {@const row = index % 4}
  <path
    d="M{x + row * 23} {FLOOR_Y + [0, 14, 32, 54][row]}v{[14, 18, 22, 24][row]}"
    stroke="#a37850"
    stroke-width="1"
  />
{/each}
<FloorShade y={FLOOR_Y} />

<!-- A skirting board along the whole room. -->
<rect x="-10" y={SKIRTING} width="980" height={FLOOR_Y - SKIRTING} fill="#f6f2ea" />
<path d="M-10 {SKIRTING + 1.5}H970" stroke="#d6cdbd" stroke-width="1" />
<path d="M-10 {FLOOR_Y - 0.5}H970" stroke="#8f6744" stroke-width="1" />

<!-- A low-pile rug under the desk, its border and fringe in front. -->
<path d="M250 250H710L734 296H226Z" fill="#7d4a3a" />
<path d="M258 254H702L722 291H238Z" fill="#a8604a" />
<path
  d="M270 259H690L704 286H256Z"
  fill="none"
  stroke="#e8c98f"
  stroke-width="1.2"
  stroke-dasharray="6 4"
/>
<path
  d="M228 297H732"
  stroke="#e8dcc4"
  stroke-width="2.4"
  stroke-dasharray="1.2 2.2"
  stroke-linecap="butt"
/>

<!-- Acoustic foam, the wedges of each tile running across its neighbours'. -->
{#each foam as tile (`${tile.x} ${tile.y}`)}
  <rect x={tile.x} y={tile.y} width="20" height="20" fill="#3c4652" />
  {#each [2.5, 7.5, 12.5, 17.5] as at (at)}
    <path
      d={tile.across
        ? `M${tile.x + 1} ${tile.y + at}h18`
        : `M${tile.x + at} ${tile.y + 1}v18`}
      stroke="#56636f"
      stroke-width="2.2"
      stroke-linecap="butt"
    />
  {/each}
{/each}

<!-- Oak slats on black felt, framed like a built-in panel: the acoustic wall the hosts sit against. -->
<rect x={WALL.left - 4} y={WALL.top - 4} width={WALL.right - WALL.left + 8} height={WALL.bottom - WALL.top + 10} fill="#5a3826" />
<rect
  x={WALL.left}
  y={WALL.top}
  width={WALL.right - WALL.left}
  height={WALL.bottom - WALL.top}
  fill="url(#{id}-felt)"
/>
{#each slats as x, index (x)}
  <rect
    {x}
    y={WALL.top}
    width="6"
    height={WALL.bottom - WALL.top}
    fill={index % 2 ? "#c99a6a" : "#bd8d5e"}
  />
  <path d="M{x + 0.6} {WALL.top}V{WALL.bottom}" stroke="#d9b083" stroke-width="0.8" />
{/each}
<rect x={WALL.left - 6} y={WALL.top - 6} width={WALL.right - WALL.left + 12} height="5" rx="1" fill="#7a4e33" />
<rect x={WALL.left - 4} y={WALL.bottom} width={WALL.right - WALL.left + 8} height="6" fill="#2a221d" />

<!-- An outlet by the panel, a cable from it running behind. -->
<rect x="302" y="196" width="10" height="13" rx="1.5" fill="#f6f2ea" stroke="#cfc5b5" stroke-width="0.8" />
<circle cx="305.4" cy="202.5" r="0.9" fill="#8a8f96" />
<circle cx="308.6" cy="202.5" r="0.9" fill="#8a8f96" />
<path d="M307 207Q314 214 330 211" stroke="#2a2f37" stroke-width="1.4" />

<!-- Pendant lamps, each on a cord from a ceiling rose. -->
{#each [380, 580] as x (x)}
  <rect x={x - 6} y={CEILING + 4} width="12" height="3" rx="1" fill="#2a2f37" />
  <path d="M{x} {CEILING + 7}V36" stroke="#2a2f37" stroke-width="1.2" />
  <rect x={x - 3} y="34" width="6" height="4" rx="1" fill="#2a2f37" />
  <path d="M{x - 17} 52Q{x - 16} 38 {x} 38Q{x + 16} 38 {x + 17} 52Z" fill="#2a2f37" />
  <path d="M{x - 13} 44Q{x - 6} 40 {x} 40" stroke="#4a525d" stroke-width="1" />
  <ellipse cx={x} cy="53" rx="9" ry="3" fill="#ffd98a" />
  <ellipse cx={x} cy="78" rx="44" ry="34" fill="url(#{id}-pool)" />
{/each}

<!-- The on-air sign, lit, on two wires from the ceiling. -->
<ellipse cx="480" cy="44" rx="118" ry="44" fill="url(#{id}-glow)" />
<path d="M418 {CEILING + 4}V27M542 {CEILING + 4}V27" stroke="#3a3f47" stroke-width="0.9" />
<rect x="404" y="26" width="152" height="38" rx="6" fill="#1f2328" />
<rect x="410" y="31" width="140" height="28" rx="4" fill="#e0453c" />
<rect x="412" y="32.5" width="136" height="9" rx="3" fill="#ff7a6e" fill-opacity="0.45" />
<text
  x="480"
  y="51"
  text-anchor="middle"
  fill="#fff4ef"
  font-size="16"
  font-weight="700"
  class="font-sans">Vysielame</text
>

<!-- The door the hosts came in by, in a painted frame. -->
<rect x={door.hinge - 10} y={door.top - 8} width={door.edge - door.hinge + 20} height={FLOOR_Y - door.top + 8} rx="1.5" fill="#f9f6f0" />
<path
  d="M{door.hinge - 10} {door.top - 8}H{door.edge + 10}"
  stroke="#d6cdbd"
  stroke-width="1"
/>
<rect x={door.hinge - 4} y={door.top - 2} width={door.edge - door.hinge + 8} height={FLOOR_Y - door.top + 2} fill="#d9d0c1" />
{#if open > 0}
  <!-- The dim hall beyond the open door. -->
  <rect x={door.hinge} y={door.top} width={door.edge - door.hinge} height={door.height} fill="#3a2f28" fill-opacity="0.7" />
{/if}
<path d={quad(0, 1, 0, 1)} fill="#8a5a3b" />
<path d={quad(0.1, 0.9, 0.456, 0.933)} fill="#7a4e33" />
<path d={quad(0.1, 0.9, 0.456, 0.47)} fill="#6e4630" />
<ellipse cx={pane.x} cy={pane.y} rx={12.5 * pane.rx} ry="12.5" fill="#c9ced4" />
<ellipse cx={pane.x} cy={pane.y} rx={10 * pane.rx} ry="10" fill="#d8e8ef" />
<path
  d="M{pane.x - 5 * pane.rx} {pane.y - 3}l{6 * pane.rx} -4"
  stroke="#ffffff"
  stroke-opacity="0.7"
  stroke-width="1.4"
/>
<path d={quad(0.02, 0.06, 0.1, 0.14)} fill="#c9ced4" />
<path d={quad(0.02, 0.06, 0.84, 0.88)} fill="#c9ced4" />
<path d={quad(HANDLE.u - 0.025, HANDLE.u + 0.025, HANDLE.v - 0.03, HANDLE.v + 0.06)} fill="#6e4630" />
<path
  d={quad(HANDLE.u - 0.14, HANDLE.u + 0.02, HANDLE.v - 0.009, HANDLE.v + 0.009)}
  fill="#e2e6ea"
/>
<path d={quad(HANDLE.u - 0.008, HANDLE.u + 0.008, HANDLE.v + 0.035, HANDLE.v + 0.048)} fill="#2a2f37" />

<!-- The clock on its nail. -->
<circle cx={clock.x} cy={clock.y - clock.r - 2} r="1.6" fill="#8a8f96" />
<WallClock {clock} {hour} />

<!-- The framed record on a wire from its nail. -->
<circle cx="686" cy="22" r="1.6" fill="#8a8f96" />
<path d="M686 22L656 34M686 22L716 34" stroke="#8a8f96" stroke-width="0.7" />
<rect x="650" y="30" width="72" height="54" rx="2" fill="#2a2f37" />
<rect x="655" y="35" width="62" height="44" fill="#e8b04c" />
<circle cx="686" cy="57" r="15" fill="#1f2328" />
<circle cx="686" cy="57" r="10.5" fill="none" stroke="#3a3f47" stroke-width="0.6" />
<circle cx="686" cy="57" r="5" fill="#c23b35" />
<circle cx="686" cy="57" r="1.2" fill="#e8b04c" />

<!-- A shelf on two brackets: books, a monitor speaker and a little plant. -->
{#each [664, 736] as x (x)}
  <path d="M{x} {SHELF_Y + 4}V{SHELF_Y + 18}M{x} {SHELF_Y + 5}L{x + (x < 700 ? 10 : -10)} {SHELF_Y + 4}" stroke="#3a3f47" stroke-width="2" />
  <circle cx={x} cy={SHELF_Y + 15} r="0.8" fill="#8a8f96" />
{/each}
<rect x="648" y={SHELF_Y} width="104" height="5" rx="1" fill="#8a5a3b" />
<path d="M648 {SHELF_Y + 5}H752" stroke="#5a3826" stroke-width="1" />
{#each books as book (book.x)}
  <rect
    x={book.x}
    y={SHELF_Y - book.h}
    width={book.w}
    height={book.h}
    rx="1"
    fill={book.c}
    transform={book.lean ? `rotate(14 ${book.x} ${SHELF_Y})` : undefined}
  />
{/each}
<rect x="700" y={SHELF_Y - 26} width="18" height="26" rx="2" fill="#2a2f37" />
<circle cx="709" cy={SHELF_Y - 9} r="5.5" fill="#14181d" />
<circle cx="709" cy={SHELF_Y - 9} r="2.2" fill="#3a3f47" />
<circle cx="709" cy={SHELF_Y - 20} r="2.4" fill="#14181d" />
<path d="M724 {SHELF_Y}l1.5 -10h11l1.5 10Z" fill="#e0b39f" />
<ellipse cx="727" cy={SHELF_Y - 16} rx="4.5" ry="8" fill="#84ab92" transform="rotate(-20 727 {SHELF_Y - 16})" />
<ellipse cx="735" cy={SHELF_Y - 15} rx="4" ry="7.5" fill="#bed3c4" transform="rotate(25 735 {SHELF_Y - 15})" />
<ellipse cx="731" cy={SHELF_Y - 19} rx="3.5" ry="8" fill="#84ab92" />
<!-- The hosts' plant is the set's, drawn at the cast's scale so it can be watered (StickSet.svelte). -->
