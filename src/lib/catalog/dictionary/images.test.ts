import { describe, expect, it } from "vitest";

import { imageSourceLabel, manifestImageSrc, type ImageManifestEntry } from "./images";

const base: ImageManifestEntry = { fetchedAt: "2026-10-15T00:00:00.000Z", status: "ok" };

describe("manifestImageSrc", () => {
  it("hotlinks Unsplash picks instead of looking for a stored file", () => {
    expect(
      manifestImageSrc({
        ...base,
        originalUrl: "https://images.unsplash.com/photo-1?w=1080",
        source: "unsplash",
      }),
    ).toBe("https://images.unsplash.com/photo-1?w=1080");
  });

  it("serves stored files and hides entries without one", () => {
    expect(manifestImageSrc({ ...base, file: "pes.jpg" })).toContain(
      "images/dictionary/pes.jpg",
    );
    expect(manifestImageSrc({ ...base, source: "pixabay" })).toBeUndefined();
    expect(
      manifestImageSrc({ ...base, file: "pes.jpg", status: "rejected" }),
    ).toBeUndefined();
  });
});

describe("imageSourceLabel", () => {
  it("names the source, defaulting older entries to Wikimedia", () => {
    expect(imageSourceLabel({ ...base, source: "unsplash" })).toBe("Unsplash");
    expect(imageSourceLabel(base)).toBe("Wikimedia");
  });
});
