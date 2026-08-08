import { describe, expect, it } from "vitest";

import {
  buildBrowseQueryHref,
  browseStateNeedsIndex,
  buildPageItems,
  buildWikiViewFromEntries,
  filterBrowseEntries,
  parseBrowseSearchParams,
} from "./dictionary-browse-utils";
import { getDictionaryIndexEntries, buildDictionaryIndexSidecar } from "./dictionary-browse";

describe("dictionary browse helpers", () => {
  it("builds query-string browse hrefs", () => {
    expect(buildBrowseQueryHref("all", "all", 1)).toBe("/dictionary");
    expect(buildBrowseQueryHref("all", "all", 2)).toBe("/dictionary?page=2");
    expect(buildBrowseQueryHref("nouns", "all", 1)).toBe("/dictionary?topic=nouns");
    expect(buildBrowseQueryHref("nouns", "all", 3)).toBe(
      "/dictionary?topic=nouns&page=3",
    );
    expect(buildBrowseQueryHref("all", "B", 1)).toBe("/dictionary?letter=b");
    expect(buildBrowseQueryHref("nouns", "B", 2)).toBe(
      "/dictionary?topic=nouns&letter=b&page=2",
    );
    expect(
      new URL(
        buildBrowseQueryHref("verbs", "Č", 1),
        "https://slovak.wiki",
      ).searchParams.get("letter"),
    ).toBe("č");
  });

  it("parses browse query params", () => {
    expect(
      parseBrowseSearchParams(new URLSearchParams("topic=nouns&letter=B&page=2")),
    ).toEqual({
      topic: "nouns",
      letter: "B",
      page: 2,
    });
    expect(
      parseBrowseSearchParams(new URLSearchParams("topic=nouns&letter=b&page=2")),
    ).toEqual({
      topic: "nouns",
      letter: "B",
      page: 2,
    });
    expect(parseBrowseSearchParams(new URLSearchParams(""))).toEqual({
      topic: "all",
      letter: "all",
      page: 1,
    });
    expect(parseBrowseSearchParams(new URLSearchParams("topic=invalid"))).toEqual({
      topic: "all",
      letter: "all",
      page: 1,
    });
  });

  it("filters by topic and letter", () => {
    const entries = getDictionaryIndexEntries();
    const nouns = filterBrowseEntries(entries, "nouns", "all");
    const nounB = filterBrowseEntries(entries, "nouns", "B");

    expect(nouns.length).toBeGreaterThan(0);
    expect(nounB.length).toBeGreaterThan(0);
    expect(nounB.length).toBeLessThanOrEqual(nouns.length);
    expect(nounB.every((entry) => entry.category === "Nouns")).toBe(true);
    expect(
      nounB.every((entry) => entry.slovak.at(0)?.toLocaleUpperCase("sk") === "B"),
    ).toBe(true);
  });

  it("builds paginated views from entries", () => {
    const entries = getDictionaryIndexEntries();
    const view = buildWikiViewFromEntries(entries, "nouns", "B", 1);

    expect(view.visibleEntries.length).toBeGreaterThan(0);
    expect(view.visibleEntries.length).toBeLessThanOrEqual(50);
    expect(view.topic).toBe("nouns");
    expect(view.letter).toBe("B");
  });

  it("builds compact pager windows", () => {
    expect(buildPageItems(1, 3)).toEqual([1, 2, 3]);
    expect(buildPageItems(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
  });

  it("detects when browse state needs the index sidecar", () => {
    expect(browseStateNeedsIndex({ topic: "all", letter: "all", page: 1 })).toBe(false);
    expect(browseStateNeedsIndex({ topic: "verbs", letter: "all", page: 1 })).toBe(true);
    expect(browseStateNeedsIndex({ topic: "all", letter: "B", page: 1 })).toBe(true);
    expect(browseStateNeedsIndex({ topic: "all", letter: "all", page: 2 })).toBe(true);
  });

  it("includes conjugated forms on dictionary index sidecar entries", () => {
    const byt = buildDictionaryIndexSidecar().find((entry) => entry.slug === "byt");
    expect(byt?.forms).toContain("som");
  });
});
