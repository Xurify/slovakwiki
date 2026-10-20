<script lang="ts">
  import type { GrammarCue } from "$lib/catalog/types";

  let { cue, class: className = "size-4" }: { cue: GrammarCue; class?: string } =
    $props();
</script>

<svg
  class="{className} shrink-0 fill-none stroke-current"
  viewBox="0 0 24 24"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if cue === "me" || cue === "friend"}
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6" />
  {:else if cue === "them"}
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.8 3.4-6 6.5-6s5.7 2.2 6.5 6" />
    <path d="M17 7.5h4M19.5 5l2 2.5-2 2.5" />
  {:else if cue === "far"}
    <path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2" />
  {:else if cue === "before"}
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <path d="M3 3.5V8h4.5M12 8v4l2.5 2" />
  {:else if cue === "now"}
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2.5" class="fill-current" />
  {:else if cue === "later"}
    <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
    <path d="M21 3.5V8h-4.5M12 8v4l2.5 2" />
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
