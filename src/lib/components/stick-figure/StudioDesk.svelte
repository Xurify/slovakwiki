<script lang="ts">
  import { GROUND_Y, SEAT_Y, STICK_BOX } from "$lib/stick-figure/rig";
  import { DESK_MIC, DESK_REACH } from "$lib/stick-figure/set-pieces";
  import { FLOOR, type StageFrame } from "$lib/stick-figure/stage-frame";

  /**
   * The podcast desk the hosts sit behind, in the cast's own drawing space so
   * a mic stays at a seated mouth on any stage. `behind` is each host's chair;
   * `front` is the desk, the boom arms and the mics, drawn over the cast.
   */
  let {
    height,
    layer,
    mugs = true,
    seats,
    unit,
    width,
  }: {
    height: number;
    layer: "behind" | "front";
    /** A mug by each host's near hand, unless the set has its own cups on the desk. */
    mugs?: boolean;
    seats: StageFrame["seats"];
    /** Stage px per rig unit. */
    unit: number;
    width: number;
  } = $props();

  /** Lower than a real desk's elbow height: the figures' short torsos would sink behind one. */
  const TOP = GROUND_Y - 28;
  const { at: MIC, mouth: MOUTH } = DESK_MIC;
  const ELBOW = { x: 34, y: 56 };

  /** Rig y 136, the bottom of a figure's box, stands on the stage's floor padding. */
  const base = $derived(height - FLOOR - (STICK_BOX.y + STICK_BOX.height) * unit);
  const left = $derived(seats.length ? seats[0].x / unit - DESK_REACH : 0);
  const right = $derived(
    seats.length ? seats[seats.length - 1].x / unit + DESK_REACH : 0,
  );
  const middle = $derived((left + right) / 2);
  const aim = (Math.atan2(MOUTH.y - MIC.y, MOUTH.x - MIC.x) * 180) / Math.PI;
</script>

<!-- The site's logo (static/favicon.svg), its top left at `x`, `y`, `size` across. -->
{#snippet logo(x: number, y: number, size: number)}
  <g transform="translate({x} {y}) scale({size / 58}) translate(-3 -3)">
    <rect x="3" y="3" width="58" height="58" rx="13" fill="#2563eb" />
    <path fill="#ffffff" d="M22.5 22.2L32 13.2L41.5 22.2H37.1L32 17.4L26.9 22.2Z" />
    <path
      fill="#ffffff"
      fill-rule="evenodd"
      d="M32 27.5C24.6 27.5 19.2 32.6 19.2 39.6S24.6 51.8 32 51.8 44.8 46.6 44.8 39.6 39.4 27.5 32 27.5ZM32 33.4C36.1 33.4 38.9 36 38.9 39.6S36.1 45.9 32 45.9 25.1 43.2 25.1 39.6 27.9 33.4 32 33.4Z"
    />
  </g>
{/snippet}

<svg
  class="pointer-events-none absolute inset-0 size-full overflow-visible"
  viewBox="0 0 {width} {height}"
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if layer === "behind"}
    {#each seats as seat, index (index)}
      <!-- An office chair: five-star base on casters, a gas lift, a tall back behind the sitter. -->
      <g transform="translate({seat.x} {base}) scale({unit}) scale({seat.facing} 1)">
        <path
          d="M-3 {SEAT_Y + 3}V{GROUND_Y - 6}L-16 {GROUND_Y - 2}M-3 {GROUND_Y -
            6}L10 {GROUND_Y - 2}M-3 {GROUND_Y - 6}V{GROUND_Y - 2}"
          stroke="#7d8893"
          stroke-width="2"
        />
        {#each [-16, -3, 10] as x (x)}
          <circle cx={x} cy={GROUND_Y - 0.5} r="1.6" fill="#16191d" />
        {/each}
        <path
          d="M-15 {SEAT_Y + 1}L-17 {SEAT_Y - 12}"
          stroke="#7d8893"
          stroke-width="2.4"
        />
        <rect x="-17" y={SEAT_Y - 2} width="28" height="5.5" rx="2.5" fill="#2a2f37" />
        <rect x="-22" y={SEAT_Y - 40} width="8" height="30" rx="3.6" fill="#2a2f37" />
      </g>
    {/each}
  {:else}
    <g transform="translate(0 {base}) scale({unit})">
      <ellipse
        cx={middle}
        cy={GROUND_Y + 0.5}
        rx={(right - left) / 2 + 4}
        ry="2.4"
        fill="#142a38"
        fill-opacity="0.15"
      />
      <!-- A walnut desk with a modesty panel to the floor, the show's plaque on it. -->
      <rect
        x={left + 3}
        y={TOP + 2}
        width={right - left - 6}
        height={GROUND_Y - TOP - 2}
        fill="#6e4630"
      />
      <rect
        x={middle - 26}
        y={TOP + 9}
        width="52"
        height="14"
        rx="3"
        fill="#3a2a20"
        fill-opacity="0.5"
      />
      {@render logo(middle - 23.5, TOP + 11.5, 9)}
      <text
        x={middle + 5}
        y={TOP + 18.4}
        text-anchor="middle"
        font-size="6.4"
        font-weight="700"
        fill="#f1d3a3"
        class="font-sans">slovak.wiki</text
      >
      <rect x={left} y={GROUND_Y - 3} width={right - left} height="3" fill="#3a2a20" />
      <rect
        x={left}
        y={TOP - 3}
        width={right - left}
        height="6"
        rx="1.5"
        fill="#8a5a3b"
      />
      <rect
        x={left}
        y={TOP - 3}
        width={right - left}
        height="2.2"
        rx="1.1"
        fill="#a8724c"
      />

      <!-- A small mixer between the hosts, and a mug each by the near hand. -->
      <rect x={middle - 10} y={TOP - 7} width="20" height="4" rx="1" fill="#22272e" />
      {#each [-6, -2, 2, 6] as dx (dx)}
        <circle
          cx={middle + dx}
          cy={TOP - 5}
          r="1.1"
          fill={dx < 0 ? "#e05a4f" : "#5fd3c8"}
        />
      {/each}
      {#each mugs ? seats : [] as seat, index (index)}
        {@const x = seat.x / unit + seat.facing * 15}
        {@const mug = index % 2 ? "#f4f1ea" : "#d9675b"}
        <rect x={x - 2.4} y={TOP - 8} width="4.8" height="5.4" rx="1" fill={mug} />
        <path
          d="M{x + seat.facing * 2.4} {TOP - 7}q{seat.facing * 2} 0 {seat.facing *
            2} 2t{-seat.facing * 2} 2"
          stroke={mug}
          stroke-width="0.9"
        />
      {/each}
    </g>
    {#each seats as seat, index (index)}
      <!-- A broadcast boom clamped to the desk: a riser, two spring-loaded arms, the mic on its yoke at the chin. -->
      <g transform="translate({seat.x} {base}) scale({unit}) scale({seat.facing} 1)">
        <rect x="21" y={TOP - 5} width="7" height="6" rx="1" fill="#2a2f37" />
        <path
          d="M24.5 {TOP - 5}V{TOP - 10}L{ELBOW.x} {ELBOW.y}L{MIC.x + 3} {MIC.y -
            7}L{MIC.x + 1} {MIC.y}"
          stroke="#2a2f37"
          stroke-width="2.2"
        />
        <path
          d="M26.3 {TOP - 10}L{ELBOW.x + 1.6} {ELBOW.y + 1.2}"
          stroke="#9aa6b0"
          stroke-width="0.8"
        />
        <circle cx={ELBOW.x} cy={ELBOW.y} r="1.9" fill="#2a2f37" />
        <g transform="translate({MIC.x} {MIC.y}) rotate({aim})">
          <rect x="-9" y="-3.6" width="16" height="7.2" rx="3.4" fill="#5b636e" />
          <path d="M-6 -3.4V3.4" stroke="#9aa6b0" stroke-width="1.1" />
          <rect x="1.5" y="-4" width="7" height="8" rx="3.8" fill="#14181d" />
        </g>
      </g>
    {/each}
  {/if}
</svg>
