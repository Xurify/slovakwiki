import { describe, expect, it } from "vitest";

import { buildSitemapGroups } from "./sitemap-urls";
import { renderSitemapIndex, renderUrlset } from "./sitemap-xml";

describe("sitemap", () => {
  it("groups URLs by section without trailing slashes or search", () => {
    const groups = buildSitemapGroups();
    const byName = Object.fromEntries(groups.map((group) => [group.label, group.urls]));

    expect(groups.map((group) => group.filename)).toEqual([
      "sitemap-pages.xml",
      "sitemap-dictionary.xml",
      "sitemap-grammar.xml",
      "sitemap-lessons.xml",
      "sitemap-practice.xml",
      "sitemap-pronunciation.xml",
    ]);

    expect(byName.pages).toContain("https://slovak.wiki/dictionary");
    expect(byName.dictionary?.length).toBeGreaterThan(6500);
    expect(byName.grammar?.length).toBe(18);
    expect(byName.lessons?.length).toBe(11);
    expect(byName.practice?.length).toBe(10);
    expect(byName.pronunciation?.length).toBe(5);

    const all = groups.flatMap((group) => group.urls);
    const nonRoot = all.filter((url) => url !== "https://slovak.wiki/");
    expect(nonRoot.some((url) => url.endsWith("/"))).toBe(false);
    expect(all.some((url) => url.includes("/search"))).toBe(false);
    expect(all.some((url) => url.includes("/dictionary/a/"))).toBe(false);
  });

  it("renders readable multiline XML", () => {
    const xml = renderUrlset(["https://slovak.wiki/dictionary/ahoj"]);
    expect(xml).toContain("\n  <url>");
    expect(xml).toContain("<loc>https://slovak.wiki/dictionary/ahoj</loc>");

    const index = renderSitemapIndex([
      "https://slovak.wiki/sitemap-pages.xml",
      "https://slovak.wiki/sitemap-dictionary.xml",
    ]);
    expect(index).toContain("<sitemapindex");
    expect(index).toContain("sitemap-dictionary.xml");
  });
});
