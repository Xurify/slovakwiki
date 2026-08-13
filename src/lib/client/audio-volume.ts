export const AUDIO_VOLUME_STORAGE_KEY = "slovak.wiki.audio-volume";
export const AUDIO_VOLUME_CHANGE_EVENT = "slovak-audio-volume-change";

export const AUDIO_VOLUME_DEFAULT = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function clampAudioVolume(value: number): number {
  if (!Number.isFinite(value)) return AUDIO_VOLUME_DEFAULT;
  return Math.min(1, Math.max(0, value));
}

export function getAudioVolume(storage?: StorageLike): number {
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
  if (!store) return AUDIO_VOLUME_DEFAULT;

  try {
    const stored = store.getItem(AUDIO_VOLUME_STORAGE_KEY);
    if (stored == null || stored === "") return AUDIO_VOLUME_DEFAULT;
    return clampAudioVolume(Number(stored));
  } catch {
    return AUDIO_VOLUME_DEFAULT;
  }
}

export function setAudioVolume(value: number, storage?: StorageLike): number {
  const next = clampAudioVolume(value);
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);

  if (store) {
    try {
      store.setItem(AUDIO_VOLUME_STORAGE_KEY, String(next));
    } catch {
      // Ignore quota / private-mode failures.
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUDIO_VOLUME_CHANGE_EVENT));
  }

  return next;
}

export function applyAudioVolume(audio: HTMLAudioElement, storage?: StorageLike): void {
  audio.volume = getAudioVolume(storage);
}
