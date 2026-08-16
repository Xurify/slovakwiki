import { describe, expect, it } from "vitest";

import { absoluteSiteUrl, canonicalPathFromUrl } from "./site";

describe("seo site helpers", () => {
  it("builds absolute URLs without double slashes", () => {
    expect(absoluteSiteUrl("/dictionary/ahoj")).toBe(
      "https://www.slovak.wiki/dictionary/ahoj",
    );
    expect(absoluteSiteUrl("/dictionary/malo#adverb")).toBe(
      "https://www.slovak.wiki/dictionary/malo#adverb",
    );
  });

  it("canonical path drops query string", () => {
    expect(
      canonicalPathFromUrl(new URL("https://slovak.wiki/dictionary?topic=nouns&page=2")),
    ).toBe("/dictionary");
  });
});
