<script lang="ts">
  import { onMount } from "svelte";
  import {
    THEME_CHANGE_EVENT,
    applyTheme,
    cycleThemePreference,
    getBootThemePreference,
    getStoredThemePreference,
    subscribeSystemTheme,
    themePreferenceLabel,
    type ThemePreference,
  } from "$lib/theme";

  let {
    class: className = "",
  }: {
    class?: string;
  } = $props();

  let preference = $state<ThemePreference>(getBootThemePreference());

  onMount(() => {
    preference = getBootThemePreference();

    function onThemeChange(): void {
      preference = getBootThemePreference();
    }

    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);

    const unsubscribe = subscribeSystemTheme(() => {
      if (getStoredThemePreference() === "system") {
        applyTheme("system");
      }
    });

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
      unsubscribe();
    };
  });

  function onToggle(): void {
    preference = cycleThemePreference(preference);
    applyTheme(preference);
  }

  const label = $derived(
    `Theme: ${themePreferenceLabel(preference)}. Click to cycle.`,
  );
</script>

<button
  class="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-(--control-radius) border-0 bg-transparent text-(--muted-strong) transition-colors hover:text-(--ink) {className}"
  type="button"
  aria-label={label}
  title={label}
  onclick={onToggle}
>
  {#if preference === "light"}
    <svg
      class="h-5 w-5 fill-none stroke-current stroke-2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </svg>
  {:else if preference === "dark"}
    <svg
      class="h-5 w-5 fill-none stroke-current stroke-2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4 7 7 0 0 0 20 13.5Z" />
    </svg>
  {:else}
    <svg
      class="h-5 w-5 fill-none stroke-current stroke-2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 20h8M12 18v2" />
    </svg>
  {/if}
</button>
