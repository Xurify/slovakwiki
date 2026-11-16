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
    cups = [],
    seats,
    unit,
    width,
  }: {
    height: number;
    layer: "behind" | "front";
    /** Where the set's own cups stand on the desk, in rig units: the host nearest each has it in place of the desk's mug. */
    cups?: readonly number[];
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
  const nearestSeat = (x: number) =>
    seats.reduce(
      (best, seat, index) =>
        Math.abs(seat.x / unit - x) < Math.abs(seats[best].x / unit - x) ? index : best,
      0,
    );
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
      <!-- An office chair: five-star base on casters, a gas lift, a mesh back behind the sitter. -->
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
        <!-- The back, a little wider than the sitter's shoulders: a dark shell round a mesh panel. -->
        <rect x="-19" y={SEAT_Y - 40} width="27" height="34" rx="7" fill="#2a2f37" />
        <rect x="-16.5" y={SEAT_Y - 37.5} width="22" height="28" rx="5" fill="#4a5461" />
        {#each [-31, -26, -21, -16] as dy (dy)}
          <path d="M-15 {SEAT_Y + dy}H4" stroke="#3a424d" stroke-width="0.6" />
        {/each}
      </g>
    {/each}
  {:else}
    <g transform="translate(0 {base}) scale({unit})" data-set-id="studio-desk">
      <ellipse
        cx={middle}
        cy={GROUND_Y + 1.5}
        rx={(right - left) / 2 + 5}
        ry="2.6"
        fill="#142a38"
        fill-opacity="0.18"
      />
      <!-- A walnut desk: an end panel at each side down to the floor, a fabric modesty panel between them over a kickboard that hides chair and shoes, the show's plaque on it. -->
      <rect
        x={left + 8}
        y={TOP + 2}
        width={right - left - 16}
        height={GROUND_Y - TOP - 6}
        fill="#5a3826"
      />
      <rect
        x={left + 10}
        y={TOP + 4}
        width={right - left - 20}
        height={GROUND_Y - TOP - 10}
        fill="#6e4630"
      />
      {#each Array.from({ length: Math.floor((right - left - 24) / 6) }, (_, index) => left + 13 + index * 6) as x (x)}
        <path d="M{x} {TOP + 6}V{GROUND_Y - 7}" stroke="#634029" stroke-width="0.6" />
      {/each}
      <rect
        x={left + 8}
        y={GROUND_Y - 5}
        width={right - left - 16}
        height="7"
        fill="#2a1d15"
      />
      {#each [left + 1.5, right - 9.5] as x (x)}
        <rect {x} y={TOP + 1} width="8" height={GROUND_Y + 2 - TOP - 1} rx="0.8" fill="#7a4e33" />
        <path d="M{x + 1.2} {TOP + 3}V{GROUND_Y + 1}" stroke="#946240" stroke-width="0.8" />
        <rect x={x - 0.3} y={GROUND_Y} width="8.6" height="2" rx="0.6" fill="#2a1d15" />
      {/each}
      <rect
        x={middle - 27}
        y={TOP + 10}
        width="54"
        height="15"
        rx="2.5"
        fill="#2a1d15"
        fill-opacity="0.55"
      />
      {@render logo(middle - 24.5, TOP + 13, 9)}
      <text
        x={middle + 5}
        y={TOP + 19.9}
        text-anchor="middle"
        font-size="6.4"
        font-weight="700"
        fill="#f1d3a3"
        class="font-sans">slovak.wiki</text
      >
      <!-- The top: an oak surface seen a little from above, a darker front edge. -->
      <rect x={left} y={TOP - 3.2} width={right - left} height="6.4" rx="1.2" fill="#8a5a3b" />
      <rect x={left} y={TOP - 3.2} width={right - left} height="4.6" rx="1" fill="#d2a77a" />
      <path d="M{left + 1} {TOP + 3.2}H{right - 1}" stroke="#3a2a20" stroke-opacity="0.5" stroke-width="0.8" />

      <!-- At the left end, the laptop running the recording, its screen to the room; a notebook and pen at the other. -->
      {#if seats.length}
        {@const lap = seats[0].x / unit - 31}
        <g data-set-id="studio-laptop">
        <path d="M{lap - 10} {TOP - 3}L{lap - 8.6} {TOP - 4.4}H{lap + 8.6}L{lap + 10} {TOP - 3}Z" fill="#9aa6b0" stroke="#3a3f47" stroke-width="0.4" />
        <rect x={lap - 8} y={TOP - 16.6} width="16" height="12.2" rx="1" fill="#3a3f47" />
        <rect x={lap - 7} y={TOP - 15.6} width="14" height="9.6" rx="0.4" fill="#1d2a3a" />
        <path
          d="M{lap - 6} {TOP - 10.8}l1 -1.4l1 2.6l1 -3.8l1 3.4l1 -2l1 1.4l1 -0.6l1 1.8l1 -2.8l1 2.4l1 -0.8"
          stroke="#5fd3c8"
          stroke-width="0.5"
        />
        <circle cx={lap - 5.4} cy={TOP - 14} r="0.8" fill="#e0453c" />
        </g>
        {@const book = seats[seats.length - 1].x / unit + 32}
        <rect x={book - 8} y={TOP - 5.6} width="15" height="2.6" rx="0.4" fill="#22385c" />
        <rect x={book - 7.4} y={TOP - 7.8} width="13.6" height="2.2" rx="0.4" fill="#c23b35" />
        <path d="M{book - 6.6} {TOP - 8.6}h11" stroke="#ecc77f" stroke-width="0.9" />
      {/if}

      <!-- The mixer between the first two hosts: a sloped deck of channel strips, knobs over faders, a level meter. -->
      {#if seats.length > 1}
        {@const mix = (seats[0].x + seats[1].x) / 2 / unit}
        <g data-set-id="studio-mixer">
        <path
          d="M{mix - 10.5} {TOP - 3}V{TOP - 5.4}L{mix - 9.4} {TOP - 10.6}H{mix +
            9.4}L{mix + 10.5} {TOP - 5.4}V{TOP - 3}Z"
          fill="#22272e"
        />
        <path d="M{mix - 9.4} {TOP - 10.6}H{mix + 9.4}" stroke="#4a525d" stroke-width="0.6" />
        {#each [-7, -3.5, 0, 3.5] as dx (dx)}
          <circle cx={mix + dx} cy={TOP - 9.1} r="0.75" fill="#c9ced4" />
          <path d="M{mix + dx} {TOP - 7.6}V{TOP - 4.6}" stroke="#0d1013" stroke-width="0.6" />
          <rect
            x={mix + dx - 0.9}
            y={TOP - 6.9 + (dx === -3.5 ? 1.2 : dx === 3.5 ? 0.6 : 0)}
            width="1.8"
            height="1"
            rx="0.3"
            fill={dx < 0 ? "#e8e2d6" : "#ecc77f"}
          />
        {/each}
        {#each [0, 1, 2, 3] as row (row)}
          <rect
            x={mix + 6.8}
            y={TOP - 5 - row * 1.25}
            width="1.6"
            height="0.8"
            fill={row === 3 ? "#e0453c" : row === 2 ? "#ecc77f" : "#5fd3c8"}
          />
        {/each}
        </g>
      {/if}

      {#each seats as seat, index (index)}
        {@const x = seat.x / unit + seat.facing * 14}
        {#if !cups.some((cup) => nearestSeat(cup) === index)}
        {@const mug = index % 2 ? "#f4f1ea" : "#d9675b"}
        <g data-set-id="studio-mug-{index}">
          <path
            d="M{x + seat.facing * 2.8} {TOP - 8.4}q{seat.facing * 2.6} 0 {seat.facing *
              2.6} 2.2t{-seat.facing * 2.6} 2.2"
            stroke="#142a38"
            stroke-width="1.6"
          />
          <path
            d="M{x + seat.facing * 2.8} {TOP - 8.4}q{seat.facing * 2.6} 0 {seat.facing *
              2.6} 2.2t{-seat.facing * 2.6} 2.2"
            stroke={mug}
            stroke-width="0.8"
          />
          <rect
            x={x - 2.8}
            y={TOP - 10}
            width="5.6"
            height="7"
            rx="1"
            fill={mug}
            stroke="#142a38"
            stroke-width="0.6"
          />
          <ellipse cx={x} cy={TOP - 9.9} rx="2.2" ry="0.5" fill="#6b4a33" />
        </g>
        {/if}
      {/each}
    </g>
    {#each seats as seat, index (index)}
      {@const mix = seats.length > 1 ? (seats[0].x + seats[1].x) / 2 / unit : undefined}
      <!-- A broadcast boom clamped to the desk's back edge: a riser, two spring-loaded arms, the mic on its yoke at the chin behind a pop filter, its lead taped along the arm and run to the mixer. -->
      <g transform="translate({seat.x} {base}) scale({unit}) scale({seat.facing} 1)">
        {#if mix !== undefined && index < 2}
          {@const to = (mix - seat.x / unit) * seat.facing}
          <path
            d="M24.5 {TOP - 4.6}Q{(24.5 + to) / 2} {TOP - 3.4} {to - 9.6} {TOP - 4.4}"
            stroke="#14181d"
            stroke-width="0.7"
          />
        {/if}
        <rect x="21" y={TOP - 6.2} width="7" height="3.2" rx="0.8" fill="#2a2f37" />
        <rect x="23.3" y={TOP - 12} width="2.4" height="6" rx="0.6" fill="#3a3f47" />
        <path
          d="M24.5 {TOP - 10}L{ELBOW.x} {ELBOW.y}L{MIC.x + 3} {MIC.y - 7}L{MIC.x + 1} {MIC.y}"
          stroke="#2a2f37"
          stroke-width="2.2"
        />
        <path
          d="M26.3 {TOP - 10}L{ELBOW.x + 1.6} {ELBOW.y + 1.2}"
          stroke="#9aa6b0"
          stroke-width="0.8"
        />
        <path
          d="M{MIC.x - 4} {MIC.y + 2.6}Q{MIC.x + 5} {MIC.y + 3} {MIC.x + 4.4} {MIC.y -
            6}L{ELBOW.x + 1.4} {ELBOW.y + 0.6}L26 {TOP - 9}L25.8 {TOP - 4.6}"
          stroke="#14181d"
          stroke-width="0.6"
        />
        <circle cx={ELBOW.x} cy={ELBOW.y} r="1.9" fill="#2a2f37" />
        <g transform="translate({MIC.x} {MIC.y}) rotate({aim})" data-set-id="studio-mic-{index}">
          <rect x="-9" y="-3.6" width="16" height="7.2" rx="3.4" fill="#5b636e" />
          <path d="M-6 -3.4V3.4" stroke="#9aa6b0" stroke-width="1.1" />
          <rect x="1.5" y="-4" width="7" height="8" rx="3.8" fill="#14181d" />
          <path d="M9.6 -5.2V5.2" stroke="#9aa6b0" stroke-width="0.5" />
          <ellipse cx="9.6" cy="0" rx="0.9" ry="5.2" fill="#1f2328" fill-opacity="0.35" stroke="#2a2f37" stroke-width="0.6" />
          <path d="M9.6 5.2Q6 9 -2 5" stroke="#2a2f37" stroke-width="0.5" />
        </g>
      </g>
    {/each}
  {/if}
</svg>
