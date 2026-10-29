<script lang="ts" module>
  export type SceneIconName =
    | "ask"
    | "book"
    | "captions"
    | "close"
    | "find"
    | "gauge"
    | "globe"
    | "hold"
    | "listen"
    | "mic"
    | "moon"
    | "next"
    | "pause"
    | "people"
    | "person"
    | "play"
    | "previous"
    | "replay"
    | "settings"
    | "stop"
    | "transcript"
    | "translate"
    | "volume-high"
    | "volume-low"
    | "volume-off"
    | "wind";
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
  {#if name === "ask"}
    <path
      d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6a2.5 2.5 0 0 1-2.5 2.5H12l-4.25 4.25V15H6.5A2.5 2.5 0 0 1 4 12.5Z"
    />
    <path d="M10.1 8.6a2 2 0 1 1 2.7 1.85c-.55.22-.8.55-.8 1.05" />
    <circle cx="12" cy="12.9" r="0.9" fill="currentColor" stroke="none" />
  {:else if name === "book"}
    <path
      d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5ZM12 6.5v13"
    />
  {:else if name === "captions"}
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M7 13.75h4M13 13.75h4M7 16.75h10" />
  {:else if name === "close"}
    <path d="m6 6 12 12M18 6 6 18" />
  {:else if name === "find"}
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.4-4.4" />
  {:else if name === "gauge"}
    <path d="M4.5 19a7.5 7.5 0 1 1 15 0" />
    <path d="m12 19-3.2-3.6" />
    <circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none" />
  {:else if name === "globe"}
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path
      d="M12 3.5c2.35 2.3 3.6 5.2 3.6 8.5s-1.25 6.2-3.6 8.5c-2.35-2.3-3.6-5.2-3.6-8.5S9.65 5.8 12 3.5Z"
    />
  {:else if name === "hold"}
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10 9.25v5.5M14 9.25v5.5" />
  {:else if name === "listen"}
    <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
    <path d="M4 15h3v5H5a1 1 0 0 1-1-1ZM20 15h-3v5h2a1 1 0 0 0 1-1Z" />
  {:else if name === "mic"}
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  {:else if name === "moon"}
    <path d="M19.5 13.75A8 8 0 1 1 10.25 4.5a6.5 6.5 0 0 0 9.25 9.25Z" />
  {:else if name === "next"}
    <path d="M6 5.5v13l9.5-6.5Z" fill="currentColor" stroke="none" />
    <path d="M18 5.5v13" />
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
  {:else if name === "people"}
    <circle cx="9" cy="8.25" r="3.25" />
    <path d="M3.25 19.5a5.75 5.75 0 0 1 11.5 0" />
    <path d="M15.25 5.4a3.25 3.25 0 0 1 0 5.7" />
    <path d="M16.75 14.4a5.75 5.75 0 0 1 4 5.1" />
  {:else if name === "person"}
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  {:else if name === "play"}
    <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" stroke="none" />
  {:else if name === "previous"}
    <path d="M18 5.5v13L8.5 12Z" fill="currentColor" stroke="none" />
    <path d="M6 5.5v13" />
  {:else if name === "replay"}    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
    <path d="M4.5 4v4h4" />
  {:else if name === "settings"}
    <path
      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
    />
    <circle cx="12" cy="12" r="3" />
  {:else if name === "transcript"}
    <path d="M4.5 6h15M4.5 10.33h15M4.5 14.67h15M4.5 19h9" />
  {:else if name === "translate"}
    <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1" />
    <path d="m22 22-5-10-5 10M14 18h6" />
  {:else if name === "volume-high" || name === "volume-low" || name === "volume-off"}    <path d="m11 5-5 4H3v6h3l5 4Z" />

    {#if name === "volume-off"}
      <path d="m16 9 5 6m0-6-5 6" />
    {:else}
      <path d="M15 8.5a5 5 0 0 1 0 7" />

      {#if name === "volume-high"}
        <path d="M18 5.5a9 9 0 0 1 0 13" />
      {/if}
    {/if}
  {:else if name === "wind"}
    <path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h5a2 2 0 1 1-2 2" />
  {:else}
    <rect
      x="6.5"
      y="6.5"
      width="11"
      height="11"
      rx="1.5"
      fill="currentColor"
      stroke="none"
    />
  {/if}
</svg>
