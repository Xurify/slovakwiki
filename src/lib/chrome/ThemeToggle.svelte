<script lang="ts">
  import { onMount } from "svelte";
  import {
    THEME_CHANGE_EVENT,
    applyTheme,
    cycleThemePreference,
    getInitialThemePreference,
    getStoredThemePreference,
    subscribeSystemTheme,
    themePreferenceLabel,
    type ThemePreference,
  } from "./theme";

  let {
    class: className = "",
  }: {
    class?: string;
  } = $props();

  // Stay on "system" until mount so SSR and hydration render the same button.
  // The icon itself follows `html[data-theme]`, which the head script sets before paint.
  let preference = $state<ThemePreference>("system");
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
    preference = getInitialThemePreference();

    function onThemeChange(): void {
      preference = getInitialThemePreference();
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
    mounted
      ? `Theme: ${themePreferenceLabel(preference)}. Click to switch.`
      : "Switch color theme",
  );
</script>

<button
  class="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-(--control-radius) border-0 bg-transparent text-(--muted-strong) transition-[color,transform,scale] duration-150 ease-out hover:text-(--ink) active:scale-[0.98] {className}"
  type="button"
  aria-label={label}
  title={label}
  onclick={onToggle}
>
  <svg
    class="h-5 w-5 fill-none stroke-current stroke-2 in-data-[theme=dark]:hidden"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path
      d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
    />
  </svg>

  <svg
    class="hidden h-5 w-5 fill-none stroke-current stroke-2 in-data-[theme=dark]:block"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4 7 7 0 0 0 20 13.5Z" />
  </svg>
</button>
