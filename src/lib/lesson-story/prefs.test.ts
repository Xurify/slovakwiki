import { describe, expect, it } from "vitest";
import {
  STORY_AUTO_ADVANCE_DEFAULT,
  STORY_SHOW_ENGLISH_DEFAULT,
  getStoryAutoAdvance,
  getStoryShowEnglish,
  setStoryAutoAdvance,
  setStoryShowEnglish,
  toggleStoryBool,
} from "./lesson-story-prefs";

function memoryStorage(seed: Record<string, string> = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key: string) {
      return map.has(key) ? (map.get(key) ?? null) : null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("lesson story prefs", () => {
  it("defaults auto-advance on and English off (Stories-style immersion)", () => {
    const storage = memoryStorage();
    expect(getStoryAutoAdvance(storage)).toBe(STORY_AUTO_ADVANCE_DEFAULT);
    expect(getStoryShowEnglish(storage)).toBe(STORY_SHOW_ENGLISH_DEFAULT);
    expect(STORY_AUTO_ADVANCE_DEFAULT).toBe("on");
    expect(STORY_SHOW_ENGLISH_DEFAULT).toBe("off");
  });

  it("persists toggles", () => {
    const storage = memoryStorage();
    setStoryAutoAdvance("off", storage);
    setStoryShowEnglish("on", storage);
    expect(getStoryAutoAdvance(storage)).toBe("off");
    expect(getStoryShowEnglish(storage)).toBe("on");
    expect(toggleStoryBool("off")).toBe("on");
  });
});
