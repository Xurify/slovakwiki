import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import {
  STORY_AUTO_ADVANCE_DEFAULT,
  STORY_SHOW_ENGLISH_DEFAULT,
  getStoryAutoAdvance,
  getStoryShowEnglish,
  getStorySubtitles,
  listenPrefsBootScript,
  setListenShowVoices,
  setStoryAutoAdvance,
  setStoryShowEnglish,
  setStorySubtitles,
  toggleStoryBool,
} from "./prefs";

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

  it("shows subtitles until the learner turns them off", () => {
    const storage = memoryStorage();
    expect(getStorySubtitles(storage)).toBe("on");
    setStorySubtitles("off", storage);
    expect(getStorySubtitles(storage)).toBe("off");
  });
});

describe("listen prefs boot script", () => {
  function boot(localStorage: { getItem(key: string): string | null }) {
    const dataset: Record<string, string> = {};
    runInNewContext(listenPrefsBootScript(), {
      document: { documentElement: { dataset } },
      localStorage,
    });
    return dataset;
  }

  it("shows subtitles and faces when nothing is stored", () => {
    expect(boot(memoryStorage())).toEqual({ storySubtitles: "on", listenVoices: "on" });
  });

  it("reads what the setters stored", () => {
    const storage = memoryStorage();
    setStorySubtitles("off", storage);
    setListenShowVoices("off", storage);
    expect(boot(storage)).toEqual({ storySubtitles: "off", listenVoices: "off" });
  });

  it("keeps the defaults for a stray value or storage that throws", () => {
    const stray = memoryStorage({ "slovak.wiki.story-subtitles": "maybe" });
    expect(boot(stray).storySubtitles).toBe("on");

    const blocked = {
      getItem(): never {
        throw new Error("storage is blocked");
      },
    };
    expect(boot(blocked)).toEqual({ storySubtitles: "on", listenVoices: "on" });
  });
});
