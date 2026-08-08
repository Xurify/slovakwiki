import { describe, expect, it } from "vitest";

import { mergeSearchResults } from "./dictionary-lookup";
import type { PagefindResultData } from "./pagefind-client";

function result(url: string, title: string): PagefindResultData {
  return {
    url,
    excerpt: "",
    meta: { title, kind: "word" },
  };
}

describe("dictionary lookup merge", () => {
  it("prefers dictionary hits ahead of Pagefind fuzzy matches", () => {
    const dictionary = [result("/dictionary/ahoj", "ahoj")];
    const pagefind = [
      result("/dictionary/dakujem", "ďakujem"),
      result("/grammar/cases/nominative", "Nominative"),
    ];

    expect(mergeSearchResults(dictionary, pagefind)).toEqual([
      result("/dictionary/ahoj", "ahoj"),
      result("/dictionary/dakujem", "ďakujem"),
      result("/grammar/cases/nominative", "Nominative"),
    ]);
  });

  it("dedupes by url", () => {
    const hit = result("/dictionary/ahoj", "ahoj");
    expect(mergeSearchResults([hit], [hit])).toEqual([hit]);
  });
});
