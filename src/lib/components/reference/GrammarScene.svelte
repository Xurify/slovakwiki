<script lang="ts">
  import type { GrammarCue, GrammarObject, GrammarScene } from "$lib/catalog/types";

  /**
   * A 120×52 sketch of the situation one sentence of a contrast frame is said
   * in. Every frame of a kind draws the same scene; only the lit part moves,
   * so three rows read as the thing passing from you, to them, to far away.
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
</script>

{#snippet person(x: number, y: number, scale: number, className: string)}
  <g class={className} transform="translate({x} {y}) scale({scale})">
    <circle cx="0" cy="0" r="3.6" />
    <path d="M-6.5 15c.6-4.2 3.3-6.5 6.5-6.5s5.9 2.3 6.5 6.5" />
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

<!-- Filled silhouettes read at this size where outlines would not. Cut-outs use the paper colour. -->
{#snippet thing(x: number, y: number, scale: number)}
  <g
    class={lit}
    transform="translate({x} {y}) scale({scale})"
    fill="currentColor"
    stroke="none"
  >
    {#if object === "shirt"}
      <path
        d="M-8 -5L-3.5 -7.5A3.5 3.5 0 0 0 3.5 -7.5L8 -5l2.5 4.5L6.5 1v7h-13V1l-4-1.5Z"
      />
    {:else if object === "book"}
      <path d="M-7 -8h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H-7Z" />
      <path d="M-3.5 -6v12" class="text-paper" stroke="currentColor" stroke-width="1.5" />
    {:else if object === "shoes"}
      <path d="M-10 4V0c0-2 2-3 5-3h5c2 0 3-3 6-4h4v11Z" />
    {:else if object === "people"}
      <circle cx="-4.5" cy="-4" r="3" />
      <circle cx="4.5" cy="-4" r="3" />
      <path d="M-10 8c0-5 2.5-7.5 5.5-7.5S1 3 1 8ZM-1 8c0-5 2.5-7.5 5.5-7.5S10 3 10 8Z" />
    {:else if object === "children"}
      <g transform="translate(0 2) scale(0.75)">
        <circle cx="-4.5" cy="-4" r="3" />
        <circle cx="4.5" cy="-4" r="3" />
        <path
          d="M-10 8c0-5 2.5-7.5 5.5-7.5S1 3 1 8ZM-1 8c0-5 2.5-7.5 5.5-7.5S10 3 10 8Z"
        />
      </g>
    {:else if object === "dog"}
      <rect x="-7" y="-2" width="11" height="6" rx="3" />
      <circle cx="6" cy="-4" r="3.2" />
      <path d="M5 -7l-2.5-3.5 3.5 1Z" />
      <path
        d="M-5 3v5M-1 3v5M2 3v5M-7 -1l-3.5-4"
        stroke="currentColor"
        stroke-width="2"
      />
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
  </g>
{/snippet}

<svg
  class="h-14 w-32 shrink-0 fill-none stroke-current"
  viewBox="0 0 120 52"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if kind === "space"}
    <path d="M4 42h112" class="text-slate-300" />

    {@render person(16, 16, 1, tone("me"))}
    {@render caption(16, 50, "you", dim)}
    {@render person(62, 16, 1, tone("them"))}
    {@render person(104, 24, 0.62, tone("far"))}

    {#if at === "me"}
      {@render thing(30, 31, 1)}
    {:else if at === "them"}
      {@render thing(48, 31, 1)}
    {:else if at === "far"}
      {@render thing(92, 35, 0.65)}
    {/if}
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

    {@render person(18, 16, 1, tone("own"))}
    {@render person(102, 16, 1, tone("other"))}
    {@render thing(60, 33, 1)}

    {#if at === "own"}
      <path d="M28 24c8 1 15 4 22 8" class={lit} />
      <path d="M45 28l5 4-6.5 1.5" class={lit} />
    {:else if at === "other"}
      <path d="M92 24c-8 1-15 4-22 8" class={lit} />
      <path d="M75 28l-5 4 6.5 1.5" class={lit} />
    {/if}
  {:else if kind === "address"}
    <path d="M4 42h112" class="text-slate-300" />

    {@render person(16, 16, 1, dim)}
    <path
      d="M27 7h14a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 41 18h-8l-3.5 3.5V18H27a2.5 2.5 0 0 1-2.5-2.5v-6A2.5 2.5 0 0 1 27 7Z"
      class={dim}
    />

    {#if at === "friend"}
      {@render person(60, 16, 1, lit)}
    {:else if at === "formal"}
      {@render person(102, 16, 1, lit)}
    {:else if at === "group"}
      {@render person(70, 16, 1, lit)}
      {@render person(87, 16, 1, lit)}
      {@render person(104, 16, 1, lit)}
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
