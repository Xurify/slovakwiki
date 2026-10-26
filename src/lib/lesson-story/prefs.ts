/** Lesson story playback prefs — localStorage, mirrors sfx preference pattern. */

export type StoryBoolPreference = "on" | "off";

export const STORY_AUTO_ADVANCE_KEY = "slovak.wiki.story-auto-advance";
export const STORY_SHOW_ENGLISH_KEY = "slovak.wiki.story-show-english";
export const STORY_PLACE_SOUND_KEY = "slovak.wiki.story-place-sound";
export const STORY_SUBTITLES_KEY = "slovak.wiki.story-subtitles";
export const LISTEN_PLAY_ALONG_KEY = "slovak.wiki.listen-play-along";
export const STORY_PREFS_CHANGE_EVENT = "slovak-story-prefs-change";

/**
 * Defaults match common story/dialogue apps (Duolingo Stories, etc.):
 * auto-advance through lines after audio; English gloss opt-in for immersion.
 */
export const STORY_AUTO_ADVANCE_DEFAULT: StoryBoolPreference = "on";
export const STORY_SHOW_ENGLISH_DEFAULT: StoryBoolPreference = "off";
/** A podcast segment plays over the sound of its place unless the learner turns it off. */
export const STORY_PLACE_SOUND_DEFAULT: StoryBoolPreference = "on";
/** The line being said shows under the stage unless the learner turns it off. */
export const STORY_SUBTITLES_DEFAULT: StoryBoolPreference = "on";
/** A podcast stops for the listener's guess when the hosts ask for one, unless they turn it off. */
export const LISTEN_PLAY_ALONG_DEFAULT: StoryBoolPreference = "on";

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

  if (typeof document !== "undefined" && key === STORY_SHOW_ENGLISH_KEY) {
    document.documentElement.dataset.storyShowEnglish = value;
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
  if (!storage && typeof document !== "undefined") {
    const fromDom = document.documentElement.dataset.storyShowEnglish;
    if (isStoryBoolPreference(fromDom)) return fromDom;
  }

  return readPreference(STORY_SHOW_ENGLISH_KEY, STORY_SHOW_ENGLISH_DEFAULT, storage);
}

export function setStoryShowEnglish(
  value: StoryBoolPreference,
  storage?: StorageLike,
): void {
  writePreference(STORY_SHOW_ENGLISH_KEY, value, storage);
}

export function getStoryPlaceSound(storage?: StorageLike): StoryBoolPreference {
  return readPreference(STORY_PLACE_SOUND_KEY, STORY_PLACE_SOUND_DEFAULT, storage);
}

export function setStoryPlaceSound(
  value: StoryBoolPreference,
  storage?: StorageLike,
): void {
  writePreference(STORY_PLACE_SOUND_KEY, value, storage);
}

export function getStorySubtitles(storage?: StorageLike): StoryBoolPreference {
  return readPreference(STORY_SUBTITLES_KEY, STORY_SUBTITLES_DEFAULT, storage);
}

export function setStorySubtitles(
  value: StoryBoolPreference,
  storage?: StorageLike,
): void {
  writePreference(STORY_SUBTITLES_KEY, value, storage);
}

export function getListenPlayAlong(storage?: StorageLike): StoryBoolPreference {
  return readPreference(LISTEN_PLAY_ALONG_KEY, LISTEN_PLAY_ALONG_DEFAULT, storage);
}

export function setListenPlayAlong(
  value: StoryBoolPreference,
  storage?: StorageLike,
): void {
  writePreference(LISTEN_PLAY_ALONG_KEY, value, storage);
}

export function toggleStoryBool(value: StoryBoolPreference): StoryBoolPreference {
  return value === "on" ? "off" : "on";
}
