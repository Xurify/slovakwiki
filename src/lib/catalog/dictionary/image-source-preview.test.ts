import { describe, expect, it } from "vitest";

import { pickWinner, type ImageSourceHit } from "./image-source-preview";

const hit = (fileTitle: string): ImageSourceHit => ({
  fileTitle,
  thumbUrl: `https://example.com/${fileTitle}`,
});

describe("pickWinner", () => {
  it("follows order and skips empty sources", () => {
    const hits = { sk: null, en: hit("en.jpg"), commons: hit("c.jpg") };
    expect(pickWinner(hits, ["sk", "en", "commons"])).toBe("en");
    expect(pickWinner(hits, ["commons", "en", "sk"])).toBe("commons");
    expect(pickWinner({ sk: null, en: null }, ["sk", "en", "commons"])).toBeUndefined();
  });
});
