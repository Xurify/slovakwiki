/** Lesson story playback prefs — localStorage, mirrors sfx preference pattern. */

export type StoryBoolPreference = "on" | "off";

export const STORY_AUTO_ADVANCE_KEY = "slovak.wiki.story-auto-advance";
export const STORY_SHOW_ENGLISH_KEY = "slovak.wiki.story-show-english";
export const STORY_PREFS_CHANGE_EVENT = "slovak-story-prefs-change";

/**
 * Defaults match common story/dialogue apps (Duolingo Stories, etc.):
 * auto-advance through lines after audio; English gloss opt-in for immersion.
 */
export const STORY_AUTO_ADVANCE_DEFAULT: StoryBoolPreference = "on";
export const STORY_SHOW_ENGLISH_DEFAULT: StoryBoolPreference = "off";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function isStoryBoolPreference(
  value: string | null | undefined,
): value is StoryBoolPreference {
  return value === "on" || value === "off";
}

function readPreference(
  key: string,
  fallback: StoryBoolPreference,
  storage?: StorageLike,
): StoryBoolPreference {
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
  if (!store) return fallback;

  try {
    const stored = store.getItem(key);
    return isStoryBoolPreference(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

function writePreference(
  key: string,
  value: StoryBoolPreference,
  storage?: StorageLike,
): void {
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
  if (!store) return;

  try {
    store.setItem(key, value);
  } catch {
    // Ignore quota / private-mode failures.
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORY_PREFS_CHANGE_EVENT));
  }
}

export function getStoryAutoAdvance(storage?: StorageLike): StoryBoolPreference {
  return readPreference(STORY_AUTO_ADVANCE_KEY, STORY_AUTO_ADVANCE_DEFAULT, storage);
}

export function setStoryAutoAdvance(
  value: StoryBoolPreference,
  storage?: StorageLike,
): void {
  writePreference(STORY_AUTO_ADVANCE_KEY, value, storage);
}

export function getStoryShowEnglish(storage?: StorageLike): StoryBoolPreference {
  return readPreference(STORY_SHOW_ENGLISH_KEY, STORY_SHOW_ENGLISH_DEFAULT, storage);
}

export function setStoryShowEnglish(
  value: StoryBoolPreference,
  storage?: StorageLike,
): void {
  writePreference(STORY_SHOW_ENGLISH_KEY, value, storage);
}

export function toggleStoryBool(value: StoryBoolPreference): StoryBoolPreference {
  return value === "on" ? "off" : "on";
}
