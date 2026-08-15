import { describe, expect, it } from "vitest";
import {
  AUDIO_VOLUME_DEFAULT,
  AUDIO_VOLUME_STORAGE_KEY,
  clampAudioVolume,
  getAudioVolume,
  setAudioVolume,
  type StorageLike,
} from "./audio-volume";

function memoryStorage(seed: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(seed));

  return {
    getItem(key) {
      return map.has(key) ? (map.get(key) ?? null) : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

describe("audio volume", () => {
  it("defaults to full volume", () => {
    expect(getAudioVolume(memoryStorage())).toBe(AUDIO_VOLUME_DEFAULT);
    expect(AUDIO_VOLUME_DEFAULT).toBe(1);
  });

  it("clamps to 0–1", () => {
    expect(clampAudioVolume(-0.2)).toBe(0);
    expect(clampAudioVolume(1.4)).toBe(1);
    expect(clampAudioVolume(Number.NaN)).toBe(AUDIO_VOLUME_DEFAULT);
  });

  it("persists slovak.wiki.audio-volume", () => {
    const storage = memoryStorage();
    expect(setAudioVolume(0.4, storage)).toBe(0.4);
    expect(storage.getItem(AUDIO_VOLUME_STORAGE_KEY)).toBe("0.4");
    expect(getAudioVolume(storage)).toBe(0.4);
  });

  it("treats junk stored values as default", () => {
    expect(getAudioVolume(memoryStorage({ [AUDIO_VOLUME_STORAGE_KEY]: "loud" }))).toBe(
      AUDIO_VOLUME_DEFAULT,
    );
  });
});
