<script lang="ts" module>
  import type { Fill, ObjectKind } from "$lib/stick-figure/acts";

  /** How an object looks right now: what is in it, how hot, how chopped, how thirsty. */
  export interface ObjectLook {
    kind: ObjectKind;
    fill?: Fill;
    heat?: number;
    cut?: number;
    wilt?: number;
    /** A pot with its lid off, what is in it showing. */
    open?: boolean;
    /** Carrots in a pot of soup, as bits in it. */
    bits?: boolean;
    /** A lid lifting and dropping on a pot at the boil. */
    rattle?: boolean;
    /** Lying on a surface rather than held up: a phone face down, keys. */
    flat?: boolean;
    /** Hanging from a hook by its end: a ladle head down, a lid seen face on. */
    hang?: boolean;
    /** What lies on it, carried with it: the carrots on a board. `dx`, `dy` from its base. */
    on?: Array<ObjectLook & { dx: number; dy: number }>;
  }
</script>

<script lang="ts">
  import Self from "./StickSetObject.svelte";

  /**
   * One object of a set, drawn up from its base at 0,0 in rig units, in the
   * props' ink-outlined style: the same drawing on the stove and in a hand.
   */
  let {
    bits = false,
    cut = 0,
    fill,
    flat = false,
    hang = false,
    heat = 0,
    kind,
    on = [],
    open,
    rattle = false,
    wilt = 0,
  }: ObjectLook = $props();

  const wisps = $derived(heat > 0 ? (open ? [-6, 0, 6] : [-9, 9]) : []);
  const soup = $derived(fill === "soup");

  /**
   * A floor plant's leaves, from its rim: each leans `up` degrees from
   * upright and, thirsty, folds over past its middle towards `side`, its tip
   * hanging, so a dry plant stays as narrow as a watered one (the studio's
   * stands between the desk and the stage's edge).
   */
  const LEAVES = [
    {
      x: -5,
      up: -34,
      side: -1,
      length: 34,
      width: 4.2,
      tint: "fill-scene-leaf",
      dry: "fill-scene-honey",
    },
    {
      x: 5,
      up: 30,
      side: 1,
      length: 36,
      width: 4.2,
      tint: "fill-scene-leaf",
      dry: "fill-scene-honey",
    },
    {
      x: -2.5,
      up: -13,
      side: -1,
      length: 46,
      width: 5,
      tint: "fill-scene-sage",
      dry: "fill-scene-wood",
    },
    {
      x: 2.5,
      up: 15,
      side: 1,
      length: 46,
      width: 5,
      tint: "fill-scene-sage",
      dry: "fill-scene-wood",
    },
    {
      x: 0,
      up: 1,
      side: 1,
      length: 56,
      width: 5.5,
      tint: "fill-scene-leaf",
      dry: "fill-scene-honey",
    },
  ];
  /** Carrot chunks: big for a first go, small once shown how. */
  const CHUNKS = [-5.5, -1.8, 1.8, 5.5];
  const PIECES = [-6, -4.4, -2.8, -1.2, 0.4, 2, 3.6, 5.2, -5.2, -2, 1.2, 4.4];
</script>

{#snippet wisp(x: number, y: number, index: number, size = 1)}
  <!-- Each wisp rises and fades on its own beat; held still, it simply hangs there. -->
  <path
    d="M{x} {y}q{2 * size}-{3 * size} 0-{6 * size}q-{2 * size}-{3 * size} 0-{6 * size}"
    class="animate-steam stroke-white/90 [transform-box:fill-box] origin-bottom"
    stroke-width={open ? 1.6 : 1.1}
    style:animation-delay="{index * 0.7}s"
    style:animation-duration="{open ? 1.8 : 2.6}s"
  />
{/snippet}

<g
  class="stroke-portrait-ink"
  stroke-width="0.8"
  transform={hang && kind !== "lid" && kind !== "towel" ? "rotate(180)" : undefined}
>
  {#if hang && kind === "lid"}
    <circle cx="0" cy="13" r="12.5" class="fill-scene-line" />
    <circle cx="0" cy="13" r="9" class="stroke-white/20" fill="none" />
    <circle cx="0" cy="13" r="1.8" class="fill-portrait-vest" />
  {:else if kind === "pot"}
    <path d="M-15.5 -11.5h3.5M12 -11.5h3.5" stroke-width="2.2" />
    <path d="M-12 -15h24v11a4 4 0 0 1-4 4h-16a4 4 0 0 1-4-4Z" class="fill-scene-line" />
    <path d="M-12 -12h24" class="stroke-white/25" stroke-width="1" />
    {#if open}
      <!-- The open top, seen a little from above, and what is in it: empty, it is dark inside. -->
      <ellipse cx="0" cy="-15" rx="12" ry="2.2" class="fill-scene-line" />
      <ellipse
        cx="0"
        cy="-14.8"
        rx="10.4"
        ry="1.5"
        class={!fill
          ? "fill-portrait-vest"
          : soup
            ? "fill-scene-carrot"
            : "fill-scene-water"}
        stroke="none"
      />
      {#if fill && bits}
        {#each [-7, -3, 1, 5, 8] as x (x)}
          <circle cx={x} cy="-14.7" r="0.7" class="fill-scene-honey" stroke="none" />
        {/each}
      {/if}
    {/if}
    {#each wisps as x, index (x)}
      {@render wisp(x, -18, index)}
    {/each}
  {:else if kind === "lid"}
    <g class={rattle ? "animate-rattle" : ""}>
      <path d="M-13 0Q-12 -5 0 -5Q12 -5 13 0Z" class="fill-scene-line" />
      <circle cx="0" cy="-5.6" r="1.6" class="fill-portrait-vest" />
    </g>
  {:else if kind === "crock"}
    <path
      d="M-4.5 -11h9l-0.6 10a1 1 0 0 1-1 1h-5.8a1 1 0 0 1-1-1Z"
      class="fill-scene-clay"
    />
    <path d="M-4.2 -8.5h8.4" class="stroke-white/40" stroke-width="0.8" />
  {:else if kind === "spoon"}
    <path d="M0 0V-10.5" stroke-width="2.6" />
    <path d="M0 0V-10.5" class="stroke-scene-wood" stroke-width="1.3" />
    <ellipse cx="0" cy="-13" rx="2.3" ry="3" class="fill-scene-wood" />
    {#if fill}
      <ellipse
        cx="0"
        cy="-13.2"
        rx="1.4"
        ry="1.9"
        class="fill-scene-carrot"
        stroke="none"
      />
    {/if}
    {#if fill && heat > 0}
      <path
        d="M0 -17q1.4-2 0-4q-1.4-2 0-4"
        class="animate-steam stroke-white/90 [transform-box:fill-box] origin-bottom"
        stroke-width="0.9"
        style:animation-duration="1.6s"
      />
    {/if}
  {:else if kind === "board"}
    <rect x="-11" y="-2.4" width="22" height="2.4" rx="1" class="fill-scene-sand" />
    <circle cx="-8.6" cy="-1.2" r="0.6" class="fill-scene-line" stroke="none" />
  {:else if kind === "knife"}
    <path d="M-1 -0.3H8.2Q8 -2.4 5 -2.7H-1Z" class="fill-scene-cool" />
    <rect x="-6" y="-2.6" width="5" height="2.3" rx="0.8" class="fill-portrait-vest" />
  {:else if kind === "carrot"}
    {#if cut >= 3}
      {#each PIECES as x, index (index)}
        <ellipse
          cx={x}
          cy={index < 8 ? -0.8 : -2.1}
          rx="0.9"
          ry="0.8"
          class="fill-scene-carrot"
          stroke-width="0.4"
        />
      {/each}
    {:else if cut === 2}
      {#each CHUNKS as x (x)}
        <rect
          x={x - 1.5}
          y="-3"
          width="3"
          height="3"
          rx="0.9"
          class="fill-scene-carrot"
        />
      {/each}
    {:else}
      <path
        d="M-7 -1.5Q-7 -3.2 -5.2 -3.2L6.4 -1.9Q7.4 -1.5 6.4 -1.1L-5.2 0Q-7 0.1 -7 -1.5Z"
        class={cut === 1 ? "fill-scene-honey" : "fill-scene-carrot"}
      />
      {#if cut === 0}
        <path
          d="M-7 -1.6l-3 -2.2M-7 -1.6l-3.3 -0.4M-7 -1.6l-2.6 1.4"
          class="stroke-scene-leaf"
          stroke-width="1"
        />
      {/if}
    {/if}
  {:else if kind === "salt"}
    <rect x="-2.5" y="-7" width="5" height="7" rx="1" class="fill-portrait-bib" />
    <path d="M-2.5 -7Q-2.5 -9 0 -9Q2.5 -9 2.5 -7Z" class="fill-scene-line" />
    <path d="M-1 -8.1h0.01M1 -8.1h0.01" class="stroke-white" stroke-width="0.7" />
  {:else if kind === "jug"}
    <path d="M-5 -6Q-9 -6 -8 -3Q-7 -1 -5 -2" fill="none" stroke-width="1.6" />
    <path
      d="M-5 -11L-4.6 -1Q-4.5 0 -3.5 0H3.5Q4.5 0 4.6 -1L5 -10L7 -12H-5Z"
      class="fill-scene-cool/90"
    />
    {#if fill === "water"}
      <path
        d="M-4.7 -7H4.8L4.6 -1Q4.5 -0.5 3.5 -0.5H-3.5Q-4.5 -0.5 -4.6 -1Z"
        class="fill-scene-water"
        stroke="none"
      />
    {/if}
  {:else if kind === "bowl"}
    <path d="M-7 -5H7Q6.4 0 0 0Q-6.4 0 -7 -5Z" class="fill-portrait-bib" />
    <path d="M-6.6 -3.6H6.6" class="stroke-scene-blue" stroke-width="0.9" />
    {#if fill}
      <ellipse
        cx="0"
        cy="-5"
        rx="6.3"
        ry="1"
        class="fill-scene-carrot"
        stroke-width="0.5"
      />
      {#each [-3, 0.5, 3.5] as x (x)}
        <circle cx={x} cy="-5" r="0.5" class="fill-scene-honey" stroke="none" />
      {/each}
    {/if}
    {#if fill && heat > 0}
      {@render wisp(0, -7, 0, 0.7)}
    {/if}
  {:else if kind === "ladle"}
    <path d="M0 0V-15" stroke-width="2.2" />
    <path d="M0 0V-15" class="stroke-scene-edge" stroke-width="1" />
    <path d="M-3.4 -19Q-3.4 -14.6 0 -14.6Q3.4 -14.6 3.4 -19Z" class="fill-scene-edge" />
    {#if fill}
      <ellipse
        cx="0"
        cy="-19"
        rx="3"
        ry="0.8"
        class="fill-scene-carrot"
        stroke-width="0.4"
      />
    {/if}
  {:else if kind === "cutlery"}
    <path d="M-5 -0.6H1.6" stroke-width="1.6" />
    <path d="M-5 -0.6H1.6" class="stroke-scene-edge" stroke-width="0.6" />
    <ellipse cx="3.4" cy="-0.8" rx="2" ry="0.9" class="fill-scene-edge" />
  {:else if kind === "towel"}
    <!-- A tea towel folded over its hook: the fold at the top, two stripes near the hem. -->
    <path
      d="M-3.4 0.6Q0 -1.6 3.4 0.6L3.9 15Q0.2 16.4 -3.6 14.8Z"
      class="fill-scene-red-mid"
    />
    <path
      d="M-3.3 3Q0 1.6 3.5 3"
      class="stroke-portrait-ink/40"
      stroke-width="0.5"
      fill="none"
    />
    <path
      d="M-3.5 11Q0.1 12 3.8 11M-3.5 12.6Q0.1 13.6 3.8 12.6"
      class="stroke-white/80"
      stroke-width="0.7"
      fill="none"
    />
  {:else if kind === "phone"}
    {#if flat}
      <rect
        x="-3.6"
        y="-1.2"
        width="7.2"
        height="1.2"
        rx="0.5"
        class="fill-portrait-vest"
      />
    {:else}
      <rect x="-2" y="-7" width="4" height="7" rx="0.8" class="fill-portrait-vest" />
      <rect
        x="-1.3"
        y="-6.2"
        width="2.6"
        height="5"
        rx="0.3"
        class="fill-scene-sky"
        stroke="none"
      />
    {/if}
  {:else if kind === "keys"}
    <circle
      cx={flat ? -1.6 : 0}
      cy={flat ? -0.8 : -3.4}
      r="1.3"
      fill="none"
      stroke-width="0.7"
    />
    <path
      d={flat ? "M-0.4 -0.7H3.2M2.2 -0.7V-0.1" : "M0 -2.1V1.4M0 0.6H0.9"}
      class="stroke-scene-honey"
      stroke-width="1"
    />
  {:else if kind === "mic"}
    <rect x="-1.8" y="-7" width="3.6" height="7" rx="0.8" class="fill-portrait-vest" />
    <circle cx="0" cy="-8.6" r="2.2" class="fill-scene-line" />
    <path d="M-1.4 -8.6H1.4M0 -10V-7.2" class="stroke-white/40" stroke-width="0.4" />
    <circle cx="0" cy="-4.6" r="0.5" class="fill-scene-red" stroke="none" />
  {:else if kind === "cup"}
    <path
      d="M3.5 -5.6Q6.6 -5.6 6.2 -3.4Q5.8 -1.6 3.5 -2"
      fill="none"
      stroke-width="1.3"
    />
    <path
      d="M-3.5 -7H3.5V-1Q3.5 0 2.5 0H-2.5Q-3.5 0 -3.5 -1Z"
      class="fill-portrait-bib"
    />
    {#if fill}
      <ellipse
        cx="0"
        cy="-7"
        rx="3.2"
        ry="0.6"
        class="fill-scene-coffee"
        stroke-width="0.4"
      />
    {/if}
    {#if fill && heat > 0}
      {@render wisp(0, -9, 0, 0.6)}
    {/if}
  {:else if kind === "can"}
    <path d="M-6 -11Q-1 -18 4 -11" fill="none" stroke-width="1.8" />
    <path d="M4.5 -4L12 -11.5" stroke-width="2.2" />
    <path d="M4.5 -4L12 -11.5" class="stroke-scene-green-mid" stroke-width="1" />
    <!-- The rose across the spout's end: a flat cap, where a point read as an arrow. -->
    <ellipse
      cx="12.6"
      cy="-12.1"
      rx="1.1"
      ry="2.6"
      transform="rotate(-45 12.6 -12.1)"
      class="fill-scene-green-mid"
      stroke-width="0.9"
    />
    <path
      d="M-7 -11H5.6L6.4 -1Q6.4 0 5.4 0H-6Q-7 0 -7 -1Z"
      class="fill-scene-green-mid"
    />
    <path d="M-6.8 -8H5.8" class="stroke-white/30" stroke-width="0.8" />
  {:else if kind === "plant"}
    {#each LEAVES as leaf, index (index)}
      {@const lower = leaf.length * 0.55}
      {@const upper = leaf.length - lower}
      {@const tint = wilt > 0.5 ? leaf.dry : leaf.tint}
      <!-- Watered, each leaf lifts back up and greens over a second or two, one after another. -->
      <g
        class="transition-transform duration-1500 ease-out"
        style:transform="translate({leaf.x}px, -23px) rotate({leaf.up +
          leaf.side * 10 * wilt}deg)"
        style:transition-delay="{index * 140}ms"
      >
        <path
          d="M0 2Q{-leaf.width} {-lower *
            0.45} {-leaf.width} {-lower}H{leaf.width}Q{leaf.width} {-lower * 0.45} 0 2Z"
          class="transition-colors duration-1500 {tint}"
          style:transition-delay="{index * 140}ms"
          stroke="none"
        />
        <path d="M0 0V{-lower}" class="stroke-scene-line/15" stroke-width="0.6" />
        <g
          class="transition-transform duration-1500 ease-out"
          style:transform="translate(0px, -{lower}px) rotate({leaf.side * 125 * wilt}deg)"
          style:transition-delay="{index * 140}ms"
        >
          <!-- The fold, rounded so a bent leaf has no notch on its outside. -->
          <circle
            r={leaf.width}
            class="transition-colors duration-1500 {tint}"
            style:transition-delay="{index * 140}ms"
            stroke="none"
          />
          <path
            d="M{-leaf.width} 0Q{-leaf.width} {-upper *
              0.6} 0 {-upper}Q{leaf.width} {-upper * 0.6} {leaf.width} 0Z"
            class="transition-colors duration-1500 {tint}"
            style:transition-delay="{index * 140}ms"
            stroke="none"
          />
          <path d="M0 0V{-upper * 0.8}" class="stroke-scene-line/15" stroke-width="0.6" />
        </g>
      </g>
    {/each}
    <path
      d="M-11 -21H11L8.4 -1Q8.2 0 7.2 0H-7.2Q-8.2 0 -8.4 -1Z"
      class="fill-scene-clay"
    />
    <path d="M-12.4 -25H12.4V-20H-12.4Z" class="fill-scene-clay" />
    <path
      d="M-10.6 -20H10.6L10.4 -18.4H-10.4Z"
      class="fill-scene-line/15"
      stroke="none"
    />
  {:else if kind === "headphones"}
    <path d="M-5 -2.2Q-5 -8 0 -8Q5 -8 5 -2.2" fill="none" stroke-width="1.4" />
    <rect x="-6.6" y="-4" width="3.2" height="4" rx="1.2" class="fill-portrait-vest" />
    <rect x="3.4" y="-4" width="3.2" height="4" rx="1.2" class="fill-portrait-vest" />
  {/if}
  {#each on as { dx, dy, ...look }, index (index)}
    <g transform="translate({dx} {dy})">
      <Self {...look} />
    </g>
  {/each}
</g>
