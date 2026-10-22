<script lang="ts" module>
  export type SceneIconName =
    | "book"
    | "find"
    | "listen"
    | "mic"
    | "pause"
    | "person"
    | "play"
    | "replay"
    | "slower"
    | "stop";
</script>

<script lang="ts">
  let { class: className = "", name }: { class?: string; name: SceneIconName } = $props();
</script>

<svg
  class="size-4 shrink-0 fill-none stroke-current {className}"
  viewBox="0 0 24 24"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === "book"}
    <path
      d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5ZM12 6.5v13"
    />
  {:else if name === "find"}
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.4-4.4" />
  {:else if name === "listen"}
    <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
    <path d="M4 15h3v5H5a1 1 0 0 1-1-1ZM20 15h-3v5h2a1 1 0 0 0 1-1Z" />
  {:else if name === "mic"}
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  {:else if name === "pause"}
    <rect x="7" y="6" width="3.25" height="12" rx="1" fill="currentColor" stroke="none" />
    <rect
      x="13.75"
      y="6"
      width="3.25"
      height="12"
      rx="1"
      fill="currentColor"
      stroke="none"
    />
  {:else if name === "person"}
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  {:else if name === "play"}
    <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" stroke="none" />
  {:else if name === "replay"}
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
    <path d="M4.5 4v4h4" />
  {:else if name === "stop"}
    <rect
      x="6.5"
      y="6.5"
      width="11"
      height="11"
      rx="1.5"
      fill="currentColor"
      stroke="none"
    />
  {:else}
    <path d="M4.5 17a7.5 7.5 0 1 1 15 0" />
    <path d="M12 17l-3.5-4" />
  {/if}
</svg>
