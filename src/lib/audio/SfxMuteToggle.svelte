<script lang="ts">
  import { onMount } from "svelte";
  import {
    SFX_CHANGE_EVENT,
    getInitialSfxPreference,
    setSfxPreference,
    toggleSfxPreference,
    type SfxPreference,
  } from "$lib/audio/sfx";

  /**
   * Ghost icon button, like the theme toggle. Both icons stay in the DOM so
   * the head script's `html[data-sfx-preference]` rules can pick one before
   * hydration; after mount the `hidden` class does the same.
   */
  let {
    class: className = "",
  }: {
    class?: string;
  } = $props();

  let preference = $state<SfxPreference>(getInitialSfxPreference());

  onMount(() => {
    preference = getInitialSfxPreference();

    function onSfxChange(): void {
      preference = getInitialSfxPreference();
    }

    window.addEventListener(SFX_CHANGE_EVENT, onSfxChange);

    return () => {
      window.removeEventListener(SFX_CHANGE_EVENT, onSfxChange);
    };
  });

  function onToggle(): void {
    preference = toggleSfxPreference(preference);
    setSfxPreference(preference);
  }

  const enabled = $derived(preference === "on");
  const label = $derived(
    enabled ? "Sound on. Click to mute." : "Sound muted. Click to unmute.",
  );
</script>

<button
  class="inline-grid size-9 shrink-0 cursor-pointer place-items-center rounded-(--control-radius) border-0 bg-transparent text-slate-600 transition-colors duration-150 ease-out hover:bg-subtle hover:text-slate-900 data-muted:text-slate-400 {className}"
  type="button"
  aria-label={label}
  aria-pressed={enabled}
  title={label}
  data-sfx-toggle
  data-muted={!enabled ? "" : undefined}
  onclick={onToggle}
>
  <svg
    class="size-5 fill-none stroke-current"
    class:hidden={!enabled}
    data-sfx-on-icon
    viewBox="0 0 24 24"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M11 6 7 9.5H4v5h3L11 18V6Z" fill="currentColor" stroke="none" />
    <path d="M15.2 9.2a4.2 4.2 0 0 1 0 5.6" />
    <path d="M18.2 7a7 7 0 0 1 0 10" />
  </svg>

  <svg
    class="size-5 fill-none stroke-current"
    class:hidden={enabled}
    data-sfx-off-icon
    viewBox="0 0 24 24"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M11 6 7 9.5H4v5h3L11 18V6Z" fill="currentColor" stroke="none" />
    <path d="M16 9l5 5M21 9l-5 5" />
  </svg>
</button>
