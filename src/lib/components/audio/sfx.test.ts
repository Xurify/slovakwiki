import { describe, expect, it } from "vitest";
import {
  SFX_STORAGE_KEY,
  getStoredSfxPreference,
  isSfxPreference,
  setSfxPreference,
  toggleSfxPreference,
  type StorageLike,
} from "$lib/client/sfx";

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

describe("sfx preference", () => {
  it("defaults to on", () => {
    expect(getStoredSfxPreference(memoryStorage())).toBe("on");
    expect(isSfxPreference("on")).toBe(true);
    expect(isSfxPreference("off")).toBe(true);
    expect(isSfxPreference("maybe")).toBe(false);
  });

  it("reads and writes slovak.wiki.sfx-preference", () => {
    const storage = memoryStorage();
    setSfxPreference("off", storage);
    expect(storage.getItem(SFX_STORAGE_KEY)).toBe("off");
    expect(getStoredSfxPreference(storage)).toBe("off");
  });

  it("toggles on ↔ off", () => {
    expect(toggleSfxPreference("on")).toBe("off");
    expect(toggleSfxPreference("off")).toBe("on");
  });
});
