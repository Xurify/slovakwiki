import { describe, expect, it } from "vitest";

import { tagWord } from "./word-tags";

describe("tagWord", () => {
  it("finds the lemma of an inflected noun", () => {
    expect(tagWord("manželkou")).toMatchObject({ class: "noun", lemma: "manželka" });
  });

  it("keeps a headword over a form of another word", () => {
    expect(tagWord("potom").class).not.toBe("noun");
  });

  it("sends forms of byť to the byť page", () => {
    expect(tagWord("sme")).toMatchObject({ class: "verb", topic: "byt-present" });
  });

  it("knows a demonstrative's cases", () => {
    const tag = tagWord("tohto");
    expect(tag).toMatchObject({ class: "pronoun", topic: "demonstratives" });
    expect(tag.cases).toEqual(expect.arrayContaining(["genitive"]));
  });

  it("keeps function words to prepositions, conjunctions and particles", () => {
    expect(tagWord("na").class).toBe("functionWord");
    expect(tagWord("že").class).toBe("functionWord");
    expect(tagWord("ktorého").class).toBe("pronoun");
    expect(tagWord("štvrtej")).toMatchObject({
      class: "numeral",
      topic: "numbers-and-numerals",
    });
  });
});
