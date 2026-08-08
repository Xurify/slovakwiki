import { describe, expect, it } from "vitest";

import { words } from "./data";
import {
  canonicalWordSlug,
  dictionaryHrefForSense,
  dictionaryPathForSense,
  dictionaryPathFromIndexFields,
  lemmaSenseGroup,
  relatedSlugsForLemmaPage,
  senseSectionId,
} from "./lemma-senses";

describe("lemma senses", () => {
  it("maps categories to section anchors", () => {
    expect(senseSectionId("Nouns")).toBe("noun");
    expect(senseSectionId("Adjectives")).toBe("adjective");
    expect(senseSectionId("Verbs")).toBe("verb");
    expect(senseSectionId("Adverbs")).toBe("adverb");
  });

  it("groups part-of-speech siblings for domáci and dospelý", () => {
    const adj = words.find((word) => word.slug === "domaci");
    const noun = words.find((word) => word.slug === "dospely");
    expect(adj).toBeDefined();
    expect(noun).toBeDefined();

    expect(lemmaSenseGroup(adj!, words).map((word) => word.slug)).toEqual([
      "domaci-n",
      "domaci",
    ]);
    expect(lemmaSenseGroup(noun!, words).map((word) => word.slug)).toEqual([
      "dospely",
      "dospely-a",
    ]);
  });

  it("picks bare lemma slug as canonical", () => {
    const noun = words.find((word) => word.slug === "domaci-n")!;
    const adj = words.find((word) => word.slug === "dospely-a")!;
    expect(canonicalWordSlug(noun, words)).toBe("domaci");
    expect(canonicalWordSlug(adj, words)).toBe("dospely");
  });

  it("links common-list senses to canonical + hash", () => {
    const noun = words.find((word) => word.slug === "domaci-n")!;
    const adj = words.find((word) => word.slug === "domaci")!;
    expect(dictionaryHrefForSense(noun, words)).toEqual({
      slug: "domaci",
      hash: "noun",
    });
    expect(dictionaryHrefForSense(adj, words)).toEqual({
      slug: "domaci",
      hash: "adjective",
    });
  });

  it("drops part-of-speech siblings from related rail", () => {
    const senses = lemmaSenseGroup(
      words.find((word) => word.slug === "domaci")!,
      words,
    );
    const related = relatedSlugsForLemmaPage(senses);
    expect(related).not.toContain("domaci");
    expect(related).not.toContain("domaci-n");
    expect(related).toEqual(expect.arrayContaining(["dom", "tim"]));
  });

  it("groups Phrases + Adverbs siblings for slovensky", () => {
    const phrases = words.find((word) => word.slug === "slovensky");
    const adverb = words.find((word) => word.slug === "slovensky-adv");
    expect(phrases?.category).toBe("Phrases");
    expect(adverb?.category).toBe("Adverbs");

    const group = lemmaSenseGroup(adverb!, words).map((word) => word.slug);
    expect(group).toEqual(expect.arrayContaining(["slovensky", "slovensky-adv"]));

    expect(dictionaryHrefForSense(adverb!, words)).toEqual({
      slug: "slovensky",
      hash: "adverb",
    });
  });

  it("builds canonical paths for POS sibling senses", () => {
    const maloAdv = words.find((word) => word.slug === "malo-adv")!;
    expect(dictionaryPathForSense(maloAdv, words)).toBe("/dictionary/malo#adverb");
    expect(
      dictionaryPathFromIndexFields({
        slug: "malo-adv",
        hrefSlug: "malo",
        hash: "adverb",
      }),
    ).toBe("/dictionary/malo#adverb");
  });
});
