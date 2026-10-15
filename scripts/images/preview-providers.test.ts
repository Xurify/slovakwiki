import { describe, expect, it } from "vitest";

import { fluentEmojiUrl, rankEmoji } from "./preview-providers";

describe("fluentEmojiUrl", () => {
  it("builds plain and skin-tone paths", () => {
    expect(fluentEmojiUrl({ label: "red apple" })).toBe(
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Red%20apple/3D/red_apple_3d.png",
    );
    expect(fluentEmojiUrl({ label: "woman", skins: [{}] })).toBe(
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman/Default/3D/woman_3d_default.png",
    );
  });
});

describe("rankEmoji", () => {
  it("puts exact labels before tag matches", () => {
    const entries = [
      { emoji: "🐶", label: "dog face", tags: ["dog", "face", "pet"] },
      { emoji: "🐕", label: "dog", tags: ["pet"] },
    ];
    expect(rankEmoji(entries, "dog").map((entry) => entry.label)).toEqual([
      "dog",
      "dog face",
    ]);
  });

  it("prefers the most specific tag match", () => {
    const entries = [
      { emoji: "🐄", label: "cow", tags: ["animal", "animals", "farm", "milk", "moo"] },
      { emoji: "🥛", label: "glass of milk", tags: ["drink", "glass", "milk"] },
    ];
    expect(rankEmoji(entries, "milk")[0]?.label).toBe("glass of milk");
  });
});
