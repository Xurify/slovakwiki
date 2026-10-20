<script lang="ts">
  import type { GrammarCue } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    stops,
    at,
  }: {
    stops: readonly GrammarCue[];
    at?: GrammarCue;
  } = $props();

  const label: Record<GrammarCue, string> = {
    me: "near you",
    them: "near them",
    far: "over there",
    before: "before",
    now: "now",
    later: "later",
    own: "their own",
    other: "someone else's",
    friend: "a friend",
    formal: "formal / group",
  };
</script>

{#snippet icon(cue: GrammarCue)}
  <svg
    class="size-4 fill-none stroke-current"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    {#if cue === "me" || cue === "them" || cue === "friend"}
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6" />
    {:else if cue === "far"}
      <path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2" />
    {:else if cue === "before"}
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l-2.5 2.5" />
    {:else if cue === "now"}
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" class="fill-current" />
    {:else if cue === "later"}
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2.5" />
    {:else if cue === "own"}
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3 20c.8-3.8 3.6-6 7-6 1.6 0 3 .5 4.2 1.3" />
      <path d="M17 14a3 3 0 1 1-1 5.8M16 22l-1-2.2 2.3-.9" />
    {:else}
      <circle cx="8.5" cy="8.5" r="3" />
      <circle cx="16" cy="9.5" r="2.5" />
      <path d="M2.5 20c.7-3.3 3-5.3 6-5.3s5.3 2 6 5.3M15 14.6c3 .1 5.5 2 6 5.4" />
    {/if}
  </svg>
{/snippet}

<!-- The situation line under the sentence says the same thing in words. -->
<ol class="m-0 flex list-none items-start p-0" aria-hidden="true">
  {#each stops as stop, index (stop)}
    {@const on = stop === at}

    <li class="relative flex w-[5.5rem] flex-col items-center gap-1">
      {#if index > 0}
        <span class="absolute top-3.5 right-1/2 h-px w-full bg-slate-300"></span>
      {/if}

      <span
        class={cx(
          "relative grid size-7 place-items-center rounded-full",
          on
            ? "bg-blue-600 text-paper"
            : "bg-surface text-slate-400 ring-1 ring-slate-300",
        )}
      >
        {@render icon(stop)}
      </span>

      <span
        class={cx(
          "text-center text-[0.7rem] leading-tight",
          on ? "font-semibold text-slate-900" : "text-slate-500",
        )}
      >
        {label[stop]}
      </span>
    </li>
  {/each}
</ol>
