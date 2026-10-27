<script lang="ts">
  import type { Furniture } from "$lib/stick-figure/places";
  import { GROUND_Y, SEAT_Y, STICK_VIEWBOX } from "$lib/stick-figure/rig";

  /**
   * A chair or table in the cast's own drawing space, so a sitter's hip lands
   * on the seat at any stage size. A chair's back stands behind whoever sits
   * on it: on the left when they face right.
   */
  let {
    id,
    piece,
  }: {
    /** What the backdrop measures to box the thing where it is drawn. */
    id?: string;
    piece: Furniture;
  } = $props();

  /** Table top: about a seated figure's elbow. */
  const TABLE_Y = GROUND_Y - 34;
</script>

<svg
  class="block h-auto w-full overflow-visible"
  viewBox={STICK_VIEWBOX}
  fill="none"
  stroke-linecap="round"
  aria-hidden="true"
>
  {#if piece.kind === "chair"}
    <g transform="scale({piece.facing ?? 1} 1)" data-set-id={id}>
      <ellipse cx="0" cy={GROUND_Y + 0.5} rx="13" ry="2" class="fill-portrait-ink/15" />
      <path
        d="M-11 {GROUND_Y}V{SEAT_Y}M9 {GROUND_Y}V{SEAT_Y}M-11 {SEAT_Y}V{SEAT_Y - 26}"
        class="stroke-scene-line/60"
        stroke-width="2.6"
      />
      <rect
        x="-13"
        y={SEAT_Y - 2}
        width="24"
        height="4"
        rx="1.5"
        class="fill-scene-wood"
      />
      <rect
        x="-13.5"
        y={SEAT_Y - 27}
        width="4"
        height="17"
        rx="1.5"
        class="fill-scene-wood"
      />
      {#if piece.desk}
        <path
          d="M17 {GROUND_Y}V{TABLE_Y + 4}M37 {GROUND_Y}V{TABLE_Y + 4}"
          class="stroke-scene-line/60"
          stroke-width="2.6"
        />
        <rect
          x="13"
          y={TABLE_Y + 1}
          width="28"
          height="5"
          rx="1.5"
          class="fill-scene-wood"
        />
      {/if}
    </g>
  {:else}
    <ellipse cx="0" cy={GROUND_Y + 0.5} rx="30" ry="2.4" class="fill-portrait-ink/15" />
    <path
      d="M-24 {GROUND_Y}V{TABLE_Y}M24 {GROUND_Y}V{TABLE_Y}"
      class="stroke-scene-line/60"
      stroke-width="3"
    />
    <rect
      x="-32"
      y={TABLE_Y - 3}
      width="64"
      height="5"
      rx="1.5"
      class="fill-scene-wood"
    />
  {/if}
</svg>
