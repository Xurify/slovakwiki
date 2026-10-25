<script lang="ts">
  import type { GrammarCue, GrammarObject, GrammarScene } from "$lib/catalog/types";

  /**
   * A sketch, 120 units wide, of the situation one sentence of a contrast frame
   * is said in. Every frame of a kind draws the same scene; only the lit part moves,
   * so three rows read as the thing passing from you, to them, to far away.
   * In the space scene the lit figure wears, holds, or stands by the thing.
   */
  let {
    kind,
    at,
    object,
  }: {
    kind: GrammarScene;
    at?: GrammarCue;
    object?: GrammarObject;
  } = $props();

  const lit = "text-blue-700";
  const dim = "text-slate-400";

  function tone(cue: GrammarCue | readonly GrammarCue[]): string {
    const cues = typeof cue === "string" ? [cue] : cue;
    return at !== undefined && cues.includes(at) ? lit : dim;
  }

  /**
   * Top and bottom of what each kind draws, strokes included. The sketch is cut
   * to them, so every scene sits the same distance from the card edge and from
   * its situation, whatever blank space its kind leaves in the 52-unit box.
   */
  const EXTENT: Record<GrammarScene, readonly [number, number]> = {
    space: [11, 52],
    time: [13, 52],
    owner: [11, 43],
    gender: [11, 52],
    address: [6, 43],
    aspect: [13, 52],
    past: [13, 52],
    clock: [9, 46],
  };

  /** The 128px width draws 120 units, so each unit is 16/15 of a pixel. */
  const PX_PER_UNIT = 128 / 120;

  const top = $derived(EXTENT[kind][0]);
  const height = $derived(EXTENT[kind][1] - EXTENT[kind][0]);

  const worn = $derived(object === "shirt" || object === "shoes");
  const held = $derived(object === "book" || object === "keys");
</script>

<!-- Filled silhouettes read at this size where outlines would not. Cut-outs use the paper colour. -->
{#snippet silhouette()}
  {#if object === "shirt"}
    <path
      d="M-8 -5L-3.5 -7.5A3.5 3.5 0 0 0 3.5 -7.5L8 -5l2.5 4.5L6.5 1v7h-13V1l-4-1.5Z"
    />
  {:else if object === "book"}
    <path d="M-10 -5c4-1.5 7-1 10 1 3-2 6-2.5 10-1v11c-4-1.5-7-1-10 1-3-2-6-2.5-10-1Z" />
    <path d="M0 -4v11" class="text-paper" stroke="currentColor" stroke-width="1.2" />
  {:else if object === "shoes"}
    <rect x="-9" y="-3" width="8" height="3.5" rx="1.75" />
    <rect x="1" y="-3" width="8" height="3.5" rx="1.75" />
  {:else if object === "people"}
    <circle cx="-4.5" cy="-4" r="3" />
    <circle cx="4.5" cy="-4" r="3" />
    <path d="M-10 8c0-5 2.5-7.5 5.5-7.5S1 3 1 8ZM-1 8c0-5 2.5-7.5 5.5-7.5S10 3 10 8Z" />
  {:else if object === "children"}
    <g transform="translate(0 2) scale(0.75)">
      <circle cx="-4.5" cy="-4" r="3" />
      <circle cx="4.5" cy="-4" r="3" />
      <path d="M-10 8c0-5 2.5-7.5 5.5-7.5S1 3 1 8ZM-1 8c0-5 2.5-7.5 5.5-7.5S10 3 10 8Z" />
    </g>
  {:else if object === "dog"}
    <rect x="-7" y="-2" width="11" height="6" rx="3" />
    <circle cx="6" cy="-4" r="3.2" />
    <path d="M5 -7l-2.5-3.5 3.5 1Z" />
    <path d="M-5 3v5M-1 3v5M2 3v5M-7 -1l-3.5-4" stroke="currentColor" stroke-width="2" />
  {:else if object === "house"}
    <path d="M-9 0 0 -9l9 9v9H-9Z" />
    <rect x="-2" y="3" width="4" height="6" class="text-paper" />
  {:else if object === "keys"}
    <circle cx="-4" cy="-4" r="4" />
    <circle cx="-4" cy="-4" r="1.3" class="text-paper" />
    <path
      d="M-1.5 -1.5 7 7M4.5 4.5 2 7M7 7l-2.5 2.5"
      stroke="currentColor"
      stroke-width="2.5"
    />
  {:else if object === "person"}
    <circle cx="0" cy="-4" r="3.4" />
    <path d="M-6 8c0-6 2.7-8.5 6-8.5S6 2 6 8Z" />
  {:else}
    <rect x="-5" y="-5" width="10" height="10" rx="2" />
  {/if}
{/snippet}

{#snippet thing(x: number, y: number, scale: number)}
  <g
    class={lit}
    transform="translate({x} {y}) scale({scale})"
    fill="currentColor"
    stroke="none"
  >
    {@render silhouette()}
  </g>
{/snippet}

<!-- Feet at the origin, 30 units tall. The thing is worn, held in the right hand, or stands beside. -->
{#snippet figure(
  x: number,
  scale: number,
  className: string,
  withThing: boolean,
  dress = false,
)}
  <g class={className} transform="translate({x} 42) scale({scale})">
    <circle cx="0" cy="-26" r="3.4" />

    {#if dress}
      <path d="M-4.5 -21h9l3.5 11h-16Z" />
    {:else if withThing && object === "shirt"}
      {@render thing(0, -15.5, 0.78)}
    {:else}
      <path d="M-5.5 -21h11l-1.5 11h-8Z" />
    {/if}

    <path d="M-2.5 -10v10M2.5 -10v10" />

    {#if withThing && object === "shoes"}
      {@render thing(0, -0.5, 1)}
    {:else if withThing && held}
      <path d="M5.5 -20l4 7" />
      {@render thing(11, -12, object === "book" ? 0.7 : 0.6)}
    {:else if withThing && object === "dog"}
      {@render thing(13, -4.5, 0.7)}
    {:else if withThing && object === "children"}
      {@render thing(13, -4, 0.65)}
    {:else if withThing && object === "people"}
      {@render thing(14, -5.5, 0.7)}
    {:else if withThing && object === "house"}
      {@render thing(17, -8, 0.9)}
    {:else if withThing && !worn}
      {@render thing(12, -5, 0.8)}
    {/if}
  </g>
{/snippet}

{#snippet caption(x: number, y: number, text: string, className: string)}
  <text
    {x}
    {y}
    text-anchor="middle"
    class="font-sans text-[7px] {className}"
    fill="currentColor"
    stroke="none"
  >
    {text}
  </text>
{/snippet}

{#snippet nowMark(x: number, className: string)}
  <g class={className}>
    <path d="M{x} 14v28" stroke-dasharray="2.5 2.5" />
    {@render caption(x, 50, "now", "")}
  </g>
{/snippet}

<svg
  class="w-32 shrink-0 fill-none stroke-current"
  style:height="{height * PX_PER_UNIT}px"
  viewBox="0 {top} 120 {height}"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if kind === "space"}
    <path d="M4 42h112" class="text-slate-300" />

    {@render figure(14, 1, tone("me"), at === "me")}
    {@render caption(14, 50, "you", dim)}
    {@render figure(58, 1, tone("them"), at === "them")}
    {@render figure(100, 0.62, tone("far"), at === "far")}
  {:else if kind === "time"}
    <path d="M8 28h104" class="text-slate-300" />

    {#each [24, 40, 56, 88, 104] as tick (tick)}
      <path d="M{tick} 25v6" class="text-slate-300" />
    {/each}

    {@render nowMark(72, tone("now"))}

    {#if at === "now"}
      <rect
        x="64"
        y="21"
        width="16"
        height="14"
        rx="2.5"
        class={lit}
        fill="currentColor"
        stroke="none"
      />
    {:else if at === "before"}
      <rect
        x="32"
        y="21"
        width="16"
        height="14"
        rx="2.5"
        class={lit}
        fill="currentColor"
        stroke="none"
      />
    {/if}
  {:else if kind === "owner"}
    <path d="M4 42h112" class="text-slate-300" />

    {@render figure(16, 1, tone("own"), false)}
    {@render figure(104, 1, tone("other"), false)}
    {@render thing(60, 33, 1)}

    {#if at === "own"}
      <path d="M26 24c8 1 15 4 22 8" class={lit} />
      <path d="M43 28l5 4-6.5 1.5" class={lit} />
    {:else if at === "other"}
      <path d="M94 24c-8 1-15 4-22 8" class={lit} />
      <path d="M77 28l-5 4 6.5 1.5" class={lit} />
    {/if}
  {:else if kind === "gender"}
    <path d="M4 42h112" class="text-slate-300" />

    {@render figure(16, 1, tone("his"), false)}
    {@render caption(16, 50, "he", tone("his"))}
    {@render figure(104, 1, tone("hers"), false, true)}
    {@render caption(104, 50, "she", tone("hers"))}
    {@render thing(60, 33, 1)}

    {#if at === "his"}
      <path d="M26 24c8 1 15 4 22 8" class={lit} />
      <path d="M43 28l5 4-6.5 1.5" class={lit} />
    {:else if at === "hers"}
      <path d="M94 24c-8 1-15 4-22 8" class={lit} />
      <path d="M77 28l-5 4 6.5 1.5" class={lit} />
    {/if}
  {:else if kind === "address"}
    <path d="M4 42h112" class="text-slate-300" />

    {@render figure(14, 1, dim, false)}
    <path
      d="M25 7h14a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 39 18h-8l-3.5 3.5V18H25a2.5 2.5 0 0 1-2.5-2.5v-6A2.5 2.5 0 0 1 25 7Z"
      class={dim}
    />

    {#if at === "friend"}
      {@render figure(58, 1, lit, false)}
    {:else if at === "formal"}
      {@render figure(104, 1, lit, false)}
    {:else if at === "group"}
      {@render figure(72, 1, lit, false)}
      {@render figure(88, 1, lit, false)}
      {@render figure(104, 1, lit, false)}
    {/if}
  {:else if kind === "aspect"}
    <path d="M8 28h104" class="text-slate-300" />

    {@render nowMark(50, tone("now"))}

    {#if at === "now"}
      <path
        d="M34 28c3.5-6 7-6 10.5 0s7 6 10.5 0 7-6 10.5 0"
        class={lit}
        stroke-width="2.2"
      />
    {:else if at === "ongoing"}
      <path
        d="M60 28c3.5-6 7-6 10.5 0s7 6 10.5 0 7-6 10.5 0 7 6 10.5 0"
        class={lit}
        stroke-width="2.2"
      />
    {:else if at === "done"}
      <circle cx="90" cy="28" r="7" class={lit} fill="currentColor" stroke="none" />
      <path d="M86.5 28l2.5 2.5 4.5-5" class="text-paper" stroke-width="2" />
    {:else if at === "habit"}
      {#each [18, 34, 50, 66, 82, 98] as x (x)}
        <circle cx={x} cy="28" r="3.5" class={lit} fill="currentColor" stroke="none" />
      {/each}
    {/if}
  {:else if kind === "past"}
    <path d="M8 28h104" class="text-slate-300" />

    {@render nowMark(94, dim)}

    {#if at === "ongoing"}
      <path
        d="M24 28c3.5-6 7-6 10.5 0s7 6 10.5 0 7-6 10.5 0 7 6 10.5 0"
        class={lit}
        stroke-width="2.2"
      />
    {:else if at === "done"}
      <circle cx="50" cy="28" r="7" class={lit} fill="currentColor" stroke="none" />
      <path d="M46.5 28l2.5 2.5 4.5-5" class="text-paper" stroke-width="2" />
    {:else if at === "habit"}
      {#each [16, 30, 44, 58, 72] as x (x)}
        <circle cx={x} cy="28" r="3.5" class={lit} fill="currentColor" stroke="none" />
      {/each}
    {/if}
  {:else if kind === "clock"}
    <g class={tone("clock")}>
      <circle cx="30" cy="26" r="16" />
      <path d="M30 14v12h11" stroke-width="2.2" />
    </g>

    <g class={tone("span")}>
      <path d="M62 26h50" stroke-width="2.2" />
      <path d="M62 20v12M112 20v12M74.5 26v-4M87 26v-4M99.5 26v-4" />
      {@render caption(62, 44, "now", "")}
      {@render caption(87, 44, "3 h", "")}
    </g>
  {/if}
</svg>
