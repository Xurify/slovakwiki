export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "slovak.wiki.theme-preference";
export const THEME_CHANGE_EVENT = "slovak-theme-change";

const TOGGLE_PREFERENCES: readonly ResolvedTheme[] = ["light", "dark"];

export function isThemePreference(
  value: string | null | undefined,
): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function getStoredThemePreference(): ThemePreference {
  if (typeof localStorage === "undefined") {
    return "system";
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

/** Read preference from FOUC boot (`data-theme-preference`), then localStorage. */
export function getInitialThemePreference(): ThemePreference {
  if (typeof document !== "undefined") {
    const fromDom = document.documentElement.dataset.themePreference;
    if (isThemePreference(fromDom)) {
      return fromDom;
    }
  }

  return getStoredThemePreference();
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "light" || preference === "dark") {
    return preference;
  }

  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function syncThemeColorMeta(theme: ResolvedTheme): void {
  if (typeof document === "undefined") {
    return;
  }

  const canvas = getComputedStyle(document.documentElement)
    .getPropertyValue("--canvas")
    .trim();

  let meta = document.querySelector('meta[name="theme-color"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", canvas || (theme === "dark" ? "#0e1a22" : "#d4e2e8"));
}

export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const theme = resolveTheme(preference);
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = theme;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Ignore quota / private-mode failures.
  }

  syncThemeColorMeta(theme);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return theme;
}

/**
 * Toggle light ↔ dark. If currently following system, flip to the opposite of
 * the resolved OS theme so the first click always changes appearance.
 */
export function cycleThemePreference(preference: ThemePreference): ResolvedTheme {
  const current = resolveTheme(preference);
  const index = TOGGLE_PREFERENCES.indexOf(current);
  return TOGGLE_PREFERENCES[(index + 1) % TOGGLE_PREFERENCES.length] ?? "light";
}

export function subscribeSystemTheme(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function handleChange(): void {
    onChange();
  }

  media.addEventListener("change", handleChange);

  return () => media.removeEventListener("change", handleChange);
}

export function themePreferenceLabel(preference: ThemePreference): string {
  const resolved = resolveTheme(preference);

  if (resolved === "dark") {
    return "Dark";
  }

  return "Light";
}
