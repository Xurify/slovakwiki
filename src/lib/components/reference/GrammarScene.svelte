<script lang="ts">
  import type { GrammarCue, GrammarScene } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  /**
   * A 96×44 sketch of the situation one sentence of a contrast frame is said
   * in. Every frame of a kind draws the same scene; only the lit part moves,
   * so three rows read as the thing moving from you, to them, to far away.
   */
  let { kind, at }: { kind: GrammarScene; at?: GrammarCue } = $props();

  const lit = "text-blue-700";
  const dim = "text-slate-400";

  function tone(cue: GrammarCue | readonly GrammarCue[]): string {
    const cues = typeof cue === "string" ? [cue] : cue;
    return at !== undefined && cues.includes(at) ? lit : dim;
  }
</script>

{#snippet person(x: number, y: number, scale: number, className: string)}
  <g class={className} transform="translate({x} {y}) scale({scale})">
    <circle cx="0" cy="0" r="3.2" />
    <path d="M-5.5 13c.5-3.6 2.8-5.6 5.5-5.6s5 2 5.5 5.6" />
  </g>
{/snippet}

{#snippet box(x: number, y: number, size: number, className: string)}
  <rect
    class={className}
    x={x - size / 2}
    y={y - size / 2}
    width={size}
    height={size}
    rx="1.5"
    fill="currentColor"
    stroke="none"
  />
{/snippet}

{#snippet nowMark(x: number, className: string)}
  <g class={className}>
    <path d="M{x} 12v22" stroke-dasharray="2 2" />
    <text
      {x}
      y="42"
      text-anchor="middle"
      class="text-[6.5px] font-sans"
      fill="currentColor"
      stroke="none"
    >
      now
    </text>
  </g>
{/snippet}

<svg
  class="h-12 w-26 shrink-0 fill-none stroke-current"
  viewBox="0 0 96 44"
  stroke-width="1.6"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if kind === "space"}
    <path d="M4 34h88" class="text-slate-300" />

    {@render person(14, 15, 1, tone("me"))}
    <text
      x="14"
      y="42"
      text-anchor="middle"
      class="text-[6.5px] font-sans {dim}"
      fill="currentColor"
      stroke="none"
    >
      you
    </text>

    {@render person(50, 15, 1, tone("them"))}
    {@render person(84, 22, 0.62, tone("far"))}

    {#if at === "me"}
      {@render box(26, 29, 7, lit)}
    {:else if at === "them"}
      {@render box(38, 29, 7, lit)}
    {:else if at === "far"}
      {@render box(76, 31, 5, lit)}
    {/if}
  {:else if kind === "time"}
    <path d="M6 24h84" class="text-slate-300" />

    {#each [20, 34, 48, 76] as tick (tick)}
      <path d="M{tick} 21v6" class="text-slate-300" />
    {/each}

    {@render nowMark(62, tone("now"))}

    {#if at === "now"}
      <rect
        x="55"
        y="18"
        width="14"
        height="12"
        rx="2"
        class={lit}
        fill="currentColor"
        stroke="none"
      />
    {:else if at === "before"}
      <rect
        x="27"
        y="18"
        width="14"
        height="12"
        rx="2"
        class={lit}
        fill="currentColor"
        stroke="none"
      />
    {/if}
  {:else if kind === "owner"}
    <path d="M4 34h88" class="text-slate-300" />

    {@render person(16, 15, 1, tone("own"))}
    {@render person(80, 15, 1, tone("other"))}
    {@render box(48, 29, 8, tone(["own", "other"]))}

    {#if at === "own"}
      <path d="M24 21c6 1 12 3 18 6" class={lit} />
      <path d="M38 23l4 4-5.5 1" class={lit} />
    {:else if at === "other"}
      <path d="M72 21c-6 1-12 3-18 6" class={lit} />
      <path d="M58 23l-4 4 5.5 1" class={lit} />
    {/if}
  {:else if kind === "address"}
    <path d="M4 34h88" class="text-slate-300" />

    {@render person(14, 15, 1, dim)}
    <path
      d="M22 8h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-7l-3 3v-3h-2a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z"
      class={dim}
    />

    {#if at === "friend"}
      {@render person(50, 15, 1, lit)}
    {:else if at === "formal"}
      {@render person(78, 15, 1, lit)}
    {:else if at === "group"}
      {@render person(56, 15, 1, lit)}
      {@render person(70, 15, 1, lit)}
      {@render person(84, 15, 1, lit)}
    {/if}
  {:else if kind === "aspect"}
    <path d="M6 24h84" class="text-slate-300" />

    {@render nowMark(40, tone("now"))}

    {#if at === "now"}
      <path d="M28 24c3-5 6-5 9 0s6 5 9 0 6-5 9 0" class={lit} stroke-width="2" />
    {:else if at === "ongoing"}
      <path d="M50 24c3-5 6-5 9 0s6 5 9 0 6-5 9 0 6 5 9 0" class={lit} stroke-width="2" />
    {:else if at === "done"}
      <circle cx="72" cy="24" r="5.5" class={lit} fill="currentColor" stroke="none" />
      <path d="M69.5 24l2 2 3.5-4" class="text-paper" stroke-width="1.8" />
    {:else if at === "habit"}
      {#each [14, 27, 53, 66, 79] as x (x)}
        <circle cx={x} cy="24" r="3" class={lit} fill="currentColor" stroke="none" />
      {/each}
      <circle cx="40" cy="24" r="3" class={lit} fill="currentColor" stroke="none" />
    {/if}
  {:else if kind === "clock"}
    <g class={tone("clock")}>
      <circle cx="24" cy="22" r="13" />
      <path d="M24 12v10h8" stroke-width="2" />
    </g>

    <g class={tone("span")}>
      <path d="M50 22h38" stroke-width="2" />
      <path d="M50 17v10M88 17v10" />
      <path d="M58 22v-3M69 22v-3M80 22v-3" />
      <text
        x="50"
        y="38"
        text-anchor="middle"
        class="text-[6.5px] font-sans"
        fill="currentColor"
        stroke="none"
      >
        now
      </text>
      <text
        x="69"
        y="38"
        text-anchor="middle"
        class="text-[6.5px] font-sans"
        fill="currentColor"
        stroke="none"
      >
        3 h
      </text>
    </g>
  {/if}
</svg>
