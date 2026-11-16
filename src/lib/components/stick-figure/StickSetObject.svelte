<script lang="ts" module>
  import type { Fill, ObjectKind } from "$lib/stick-figure/acts";

  /** How an object looks right now: what is in it, how hot, how chopped, how thirsty. */
  export interface ObjectLook {
    kind: ObjectKind;
    /** A fruit (apple) with a bite taken out of it. */
    bitten?: boolean;
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
    /** Tipped to pour: what lies on it slides off its far end. */
    sliding?: boolean;
    /** A lead clipped to the dog's collar: StickLeash runs from its handle to the collar. */
    clipped?: boolean;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { Tween } from "svelte/motion";
  import Self from "./StickSetObject.svelte";
  import StickHeadphones from "./StickHeadphones.svelte";

  /**
   * One object of a set, drawn up from its base at 0,0 in rig units, in the
   * props' ink-outlined style: the same drawing on the stove and in a hand.
   */
  let {
    bitten = false,
    bits = false,
    clipped = false,
    cut = 0,
    fill,
    flat = false,
    hang = false,
    heat = 0,
    kind,
    on = [],
    open,
    rattle = false,
    sliding = false,
    wilt = 0,
  }: ObjectLook = $props();

  const wisps = $derived(heat > 0 ? (open ? [-6, 0, 6] : [-9, 9]) : []);
  const soup = $derived(fill === "soup");

  /**
   * A floor plant's stems, from the soil: each leans `up` degrees from
   * upright and carries a leaf at its tip. Thirsty, each stem sags at the soil
   * and arches over past its `knee` towards `side`, the leaf hanging from it,
   * so a dry plant stays about as narrow as a watered one (the studio's
   * stands between the desk and the stage's edge).
   */
  const STEMS = [
    { x: -3, up: -38, side: -1, knee: 12, tip: 7, leaf: 16, width: 5.4 },
    { x: 3, up: 36, side: 1, knee: 13, tip: 7, leaf: 16, width: 5.4 },
    { x: -2, up: -18, side: -1, knee: 19, tip: 8, leaf: 19, width: 6 },
    { x: 2, up: 16, side: 1, knee: 20, tip: 8, leaf: 19, width: 6 },
    { x: -0.5, up: -4, side: -1, knee: 25, tip: 8, leaf: 20, width: 6.2 },
    { x: 1, up: 6, side: 1, knee: 23, tip: 8, leaf: 18, width: 5.8 },
  ];
  const SOIL = -24.6;
  /** Degrees a thirsty stem sags at the soil, bends at its knee, and its leaf hangs on past that. */
  const DROOP = { sag: 10, bend: 95, leaf: 40 };
  /** Watered, the plant lifts over this long, each stem a beat after the one before. */
  const LIFT_MS = 4000;
  const STAGGER_MS = 200;
  const GREEN = { leaf: ["#6f9e80", "#84ab92"], rib: "#4f7a60", stem: "#5f8c6a" };
  const THIRSTY = { leaf: ["#c9b45e", "#d8c06c"], rib: "#97803f", stem: "#8f9a58" };

  function mix(from: string, to: string, by: number): string {
    const channel = (hex: string, at: number) => parseInt(hex.slice(at, at + 2), 16);
    return `rgb(${[1, 3, 5].map((at) => Math.round(channel(from, at) + (channel(to, at) - channel(from, at)) * by)).join(" ")})`;
  }
  function toward(degrees: number, length: number): { x: number; y: number } {
    const radians = (degrees * Math.PI) / 180;
    return { x: Math.sin(radians) * length, y: -Math.cos(radians) * length };
  }

  const THIRST_MS = LIFT_MS + STAGGER_MS * (STEMS.length - 1);
  const thirst = new Tween(untrack(() => wilt), { duration: THIRST_MS });
  $effect(() => {
    thirst.target = wilt;
  });
  const stems = $derived(
    STEMS.map((stem, index) => {
      const spread = (STAGGER_MS * index) / THIRST_MS;
      const share = LIFT_MS / THIRST_MS;
      const eased = Math.min(1, Math.max(0, (thirst.current - spread) / share));
      const w = eased * eased * (3 - 2 * eased);
      const lean = stem.up + stem.side * DROOP.sag * w;
      const bent = lean + stem.side * DROOP.bend * w;
      const base = { x: stem.x, y: SOIL };
      const knee = toward(lean, stem.knee);
      const bend = { x: base.x + knee.x, y: base.y + knee.y };
      const reach = toward(bent, stem.tip);
      const end = { x: bend.x + reach.x, y: bend.y + reach.y };
      const n = (value: number) => value.toFixed(2);
      return {
        stem: `M${n(base.x)} ${n(base.y)}Q${n(bend.x)} ${n(bend.y)} ${n(end.x)} ${n(end.y)}`,
        leaf: `translate(${n(end.x)} ${n(end.y)}) rotate(${n(bent + stem.side * DROOP.leaf * w)})`,
        length: stem.leaf,
        width: stem.width,
        fill: mix(GREEN.leaf[index % 2], THIRSTY.leaf[index % 2], w),
        rib: mix(GREEN.rib, THIRSTY.rib, w),
        stroke: mix(GREEN.stem, THIRSTY.stem, w),
      };
    }),
  );
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
  transform={hang && kind !== "lid" && kind !== "towel" && kind !== "lead"
    ? "rotate(180)"
    : undefined}
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
    <!-- A beech chopping board lying flat: its top catching the light, its thick front edge. -->
    <rect x="-11" y="-2.6" width="22" height="2.6" rx="0.8" class="fill-scene-wood" />
    <rect x="-11" y="-2.6" width="22" height="1" rx="0.5" class="fill-white/35" />
    <path d="M-10 -0.8H10" class="stroke-scene-coffee/40" stroke-width="0.6" />
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
    {#if fill === "kibble"}
      <!-- Pet food dish: flared non-tip base, wider rim, distinct from soup bowl -->
      <path d="M-6 -4.5H6L8 0H-8Z" class="fill-scene-clay" />
      <path d="M-7.6 -0.6H7.6" class="stroke-scene-line" stroke-width="0.7" />
      <ellipse
        cx="0"
        cy="-4.5"
        rx="6"
        ry="1.1"
        class="fill-scene-wood"
        stroke-width="0.5"
      />
      {#each [-3.8, -1.9, 0, 1.9, 3.8] as x (x)}
        <circle cx={x} cy="-4.8" r="0.9" class="fill-scene-wood" stroke="none" />
        <circle cx={x + 0.8} cy="-4.1" r="0.7" class="fill-scene-clay" stroke="none" />
      {/each}
    {:else}
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
    <!-- A soup spoon lying by the bowl: a long handle and a round bowl. -->
    <path d="M-5.6 -0.7H1.4" stroke-width="1.8" />
    <path d="M-5.6 -0.7H1.4" class="stroke-scene-steel-light" stroke-width="0.8" />
    <ellipse cx="3.6" cy="-1" rx="2.6" ry="1.3" class="fill-scene-steel-light" />
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
  {:else if kind === "ball"}
    <circle cx="0" cy="-4.2" r="4.2" class="fill-scene-apple" />
    <path
      d="M-3.6 -6.2q3.6 2.4 7.2 0"
      class="stroke-white/70"
      stroke-width="0.9"
      fill="none"
    />
  {:else if kind === "suitcase"}
    <!-- A wheeled case for a flight, pulled by its handle drawn out: the wheels on the floor. -->
    <path d="M-4 -29V-47M4 -29V-47" class="stroke-scene-steel-dark" stroke-width="1.3" />
    <path d="M-5 -47.6h10" class="stroke-portrait-ink" stroke-width="2.2" />
    <rect
      x="-9"
      y="-30"
      width="18"
      height="27"
      rx="2.4"
      class="fill-portrait-suit stroke-portrait-ink"
      stroke-width="0.9"
    />
    <path d="M-4.5 -28v23M0 -28v23M4.5 -28v23" class="stroke-white/20" stroke-width="0.9" />
    <path d="M-3 -30.6h6" class="stroke-portrait-ink" stroke-width="1.4" />
    <circle cx="-5.6" cy="-1.8" r="1.8" class="fill-portrait-ink" />
    <circle cx="5.6" cy="-1.8" r="1.8" class="fill-portrait-ink" />
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
      <rect
        x="-2.4"
        y="-8.6"
        width="4.8"
        height="8.6"
        rx="0.9"
        class="fill-portrait-vest"
      />
      <rect
        x="-1.7"
        y="-7.8"
        width="3.4"
        height="6.6"
        rx="0.4"
        class="fill-scene-sky"
        stroke="none"
      />
    {/if}
  {:else if kind === "keys" && flat}
    <circle cx="-1.6" cy="-0.8" r="1.3" fill="none" stroke-width="0.7" />
    <path d="M-0.4 -0.7H3.2M2.2 -0.7V-0.1" class="stroke-scene-honey" stroke-width="1" />
  {:else if kind === "keys"}
    <!-- Held by the ring, the bunch hanging below the fist: a ring with a stub of key under it hid behind the hand. -->
    <circle cx="0" cy="-6.4" r="1.6" fill="none" stroke-width="0.7" />
    <path
      d="M0.5 -4.9V-0.6M0.5 -2h1.2M0.5 -0.9h0.9M-0.6 -4.9L-2.4 -1.6"
      stroke-width="2.1"
    />
    <path
      d="M0.5 -4.9V-0.6M0.5 -2h1.2M0.5 -0.9h0.9M-0.6 -4.9L-2.4 -1.6"
      class="stroke-scene-honey"
      stroke-width="1.1"
    />
  {:else if kind === "lead"}
    <!-- Red like the dog's collar: the handle's loop over the hook or round the hand, and the strap hanging to its clip. -->
    <ellipse cx="0" cy="3" rx="2" ry="3.2" fill="none" stroke-width="2.2" />
    <ellipse
      cx="0"
      cy="3"
      rx="2"
      ry="3.2"
      fill="none"
      class="stroke-scene-red"
      stroke-width="1.1"
    />
    {#if clipped}
      <circle
        cx="0"
        cy="6"
        r="0.5"
        class="fill-scene-red"
        stroke="none"
        data-leash-end="hand"
      />
    {:else}
      <path d="M0 6Q-1.2 14 1.4 20Q2.8 23 1.6 26" fill="none" stroke-width="2.2" />
      <path
        d="M0 6Q-1.2 14 1.4 20Q2.8 23 1.6 26"
        fill="none"
        class="stroke-scene-red"
        stroke-width="1.1"
      />
      <rect x="0.4" y="25.6" width="2.4" height="3" rx="0.6" class="fill-scene-edge" />
    {/if}
  {:else if kind === "mic"}
    <!-- Silver, so it shows in a hand against a dark jumper or the desk mic. -->
    <rect x="-2" y="-8.6" width="4" height="8.6" rx="0.9" fill="#c9ced4" />
    <circle cx="0" cy="-10.2" r="2.5" class="fill-scene-line" />
    <path d="M-1.7 -10.2H1.7M0 -11.9V-8.5" class="stroke-white/40" stroke-width="0.45" />
    <circle cx="0" cy="-5.6" r="0.6" class="fill-scene-red" stroke="none" />
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
    <path d="M-13 0.2H13" class="stroke-scene-line/25" stroke-width="1.6" />
    <path d="M-10 -21H10L7.8 -1Q7.6 0 6.6 0H-6.6Q-7.6 0 -7.8 -1Z" class="fill-scene-clay" />
    <path d="M-11.6 -25H11.6V-20H-11.6Z" class="fill-scene-clay" />
    <path d="M-9.8 -20H9.8L9.6 -18.4H-9.6Z" class="fill-scene-line/15" stroke="none" />
    <ellipse cx="0" cy={SOIL} rx="10" ry="1.3" fill="#5a3f2e" stroke="none" />
    {#each stems as stem, index (index)}
      <path d={stem.stem} stroke={stem.stroke} stroke-width="1.5" fill="none" />
      <g transform={stem.leaf}>
        <path
          d="M0 0.5C{stem.width * 1.2} {-stem.length * 0.25} {stem.width * 0.9} {-stem.length *
            0.75} 0 {-stem.length}C{-stem.width * 0.9} {-stem.length * 0.75} {-stem.width *
            1.2} {-stem.length * 0.25} 0 0.5Z"
          fill={stem.fill}
          stroke="none"
        />
        <path d="M0 0V{-stem.length * 0.85}" stroke={stem.rib} stroke-width="0.5" />
      </g>
    {/each}
  {:else if kind === "headphones"}
    <StickHeadphones far={{ x: -6, y: -4.5 }} near={{ x: 6, y: -4.5 }} />
  {:else if kind === "apple"}
    <path d="M0 -8.6q.4-2 1.8-2.8" fill="none" />
    <ellipse
      cx="2.6"
      cy="-10.6"
      rx="1.8"
      ry="0.9"
      transform="rotate(-25 2.6 -10.6)"
      class="fill-scene-leaf"
    />
    {#if bitten}
      <!-- Bitten apple: curved bite taken out of right cheek, pale inner flesh showing -->
      <path
        d="M0 -8.4q-4.6-1.6-4.6 3q0 4.6 4.6 5q3.2-.3 4.2-2.2a2.6 2.6 0 0 0-.2-3.8q.6-1 0-2q0-4.6-4-2Z"
        class="fill-scene-leaf"
      />
      <path
        d="M3.6 -2.6a2.6 2.6 0 0 1 .2-3.8l.6-.2a2.8 2.8 0 0 0-.2 4.2Z"
        class="fill-amber-100/90"
        stroke="none"
      />
    {:else}
      <path
        d="M0 -8.4q-4.6-1.6-4.6 3q0 4.6 4.6 5q4.6-.4 4.6-5q0-4.6-4.6-3Z"
        class="fill-scene-leaf"
      />
      <circle cx="-2" cy="-5.6" r="1" class="fill-white/60" stroke="none" />
    {/if}
  {:else if kind === "bag"}
    <path d="M-4 -14Q-4 -20 0 -20Q4 -20 4 -14" fill="none" stroke-width="1.1" />
    <path d="M-7 -14h14l-1 12a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2Z" class="fill-scene-clay" />
    <path d="M-6.6 -10h13.2" class="stroke-white/50" stroke-width="1.2" />
  {:else if kind === "basket"}
    <path d="M-6 -8Q-6 -15 0 -15Q6 -15 6 -8" fill="none" stroke-width="1.1" />
    <circle cx="-3.6" cy="-8.6" r="2.2" class="fill-scene-red-mid" />
    <circle cx="0.4" cy="-9.2" r="2.2" class="fill-scene-red-mid" />
    <circle cx="4" cy="-8.4" r="2.2" class="fill-scene-red-mid" />
    <path d="M-8 -8h16l-2 8.5h-12Z" class="fill-scene-wood" />
    <path d="M-7 -5h14M-6.4 -2h12.8" class="stroke-scene-line/40" stroke-width="0.7" />
  {:else if kind === "plate"}
    <ellipse cx="0" cy="-1.2" rx="7.5" ry="1.9" class="fill-white" />
    <ellipse
      cx="0"
      cy="-1.5"
      rx="4.5"
      ry="0.9"
      class="stroke-scene-line/30"
      fill="none"
      stroke-width="0.5"
    />
    <circle cx="-2" cy="-1.5" r="0.45" class="fill-scene-line/60" stroke="none" />
    <circle cx="1.2" cy="-1.2" r="0.35" class="fill-scene-line/60" stroke="none" />
    <circle cx="2.6" cy="-1.7" r="0.4" class="fill-scene-line/60" stroke="none" />
  {:else if kind === "cheese"}
    <!-- A small oštiepok, as the ones hanging over the stall: spindle-shaped, smoked, stamped round the middle, its cord tied on top. -->
    <path
      d="M0 -11C2.6 -10.4 3.4 -7.6 3.4 -5.4C3.4 -2.4 2 -0.6 0 0C-2 -0.6 -3.4 -2.4 -3.4 -5.4C-3.4 -7.6 -2.6 -10.4 0 -11Z"
      class="fill-scene-onion"
      stroke-width="0.6"
    />
    <path d="M1.2 -10.2C3.2 -8 3.2 -2.6 1 -0.6" class="stroke-scene-coffee/30" stroke-width="1" fill="none" />
    <path
      d="M-2.6 -7.2l0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2M-2.8 -4.4l0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2"
      class="stroke-scene-coffee/50"
      stroke-width="0.45"
      fill="none"
    />
    <path d="M-1.2 -10.4l1.2 -1.6 1.2 1.6" class="stroke-scene-coffee/70" stroke-width="0.5" fill="none" />
  {:else if kind === "book"}
    <rect x="-4" y="-11.5" width="9" height="11.5" rx="1" class="fill-scene-honey" />
    <path d="M-2.2 -11.5V0" stroke-width="0.6" />
    <path d="M0 -8.7h3M0 -6.9h2" class="stroke-portrait-bib" stroke-width="0.7" />
  {:else if kind === "clipboard"}
    <rect x="-5" y="-13" width="10" height="13" rx="0.8" class="fill-scene-wood" />
    <rect x="-4" y="-11.5" width="8" height="10" rx="0.4" class="fill-white" />
    <path d="M-2.5 -13.5h5v2h-5Z" class="fill-scene-edge" />
    <path
      d="M-2.5 -8h5M-2.5 -5h5M-2.5 -2h3"
      class="stroke-scene-line/40"
      stroke-width="0.6"
    />
  {:else if kind === "umbrella"}
    <!-- Put down, a folded umbrella lies on its side, the crook up: stood on end, the crook went through the desk. -->
    <!-- Half again as long as a hand's span, so it reads as an umbrella and not a bottle: a hooked crook, the furled canopy with its ribs and strap, the tip. -->
    <g transform={flat ? "translate(-14 -3.6) rotate(90)" : undefined}>
      <path d="M0 0V-31" stroke-width="1.6" class="stroke-portrait-ink" />
      <path
        d="M0 0Q0 4.2 -3.4 4.2Q-6.6 4.2 -6.6 0.8"
        fill="none"
        stroke-width="1.8"
        class="stroke-scene-coffee"
      />
      <path d="M-1 -31L0 -34.5L1 -31Z" class="fill-scene-steel-dark" />
      <path
        d="M-1.2 -30Q-4.4 -19 -2.2 -5H2.2Q4.4 -19 1.2 -30Z"
        class="fill-scene-blue stroke-portrait-ink"
        stroke-width="0.7"
      />
      <path
        d="M0 -30Q-2.2 -18 -1 -5M0 -30Q2.2 -18 1 -5"
        class="stroke-portrait-ink/40"
        stroke-width="0.5"
        fill="none"
      />
      <path d="M-3.4 -15.4l6.8 1.4" class="stroke-portrait-ink" stroke-width="1" />
      <circle cx="2.6" cy="-14.2" r="0.7" class="fill-white" />
    </g>
  {/if}
  {#each on as { dx, dy, ...look }, index (index)}
    <g transform="translate({dx} {dy})">
      <g class={sliding ? "animate-slide-off" : undefined}>
        <Self {...look} />
      </g>
    </g>
  {/each}
</g>
