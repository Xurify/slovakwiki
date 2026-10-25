<script lang="ts">
  import { iconButtonClass, iconButtonToneClass } from "$lib/components/ui/system-ui";
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
    tone = "default",
  }: {
    class?: string;
    /** `inverse` sits on the top bar. */
    tone?: "default" | "inverse";
  } = $props();

  // Stay on "on" until mount so SSR and hydration render the same button. The
  // icon itself follows `html[data-sfx-preference]`, set before first paint.
  let preference = $state<SfxPreference>("on");

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

  const toneClass = $derived(
    tone === "inverse"
      ? "text-panel-inverse-ink/80 hover:bg-panel-inverse-ink/10 hover:text-panel-inverse-ink"
      : iconButtonToneClass,
  );
</script>

<button
  class="{iconButtonClass} {toneClass} size-11 data-muted:text-slate-400 {className}"
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
