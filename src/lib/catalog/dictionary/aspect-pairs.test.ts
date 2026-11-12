import { describe, expect, it } from "vitest";

import { words } from "$lib/catalog/entries";

import { dictionaryPagePropsForSlug } from "./detail-page";

import aspectPairs from "../../../../content/dictionary/aspect-pairs.json";
import dictionaryWords from "../../../../content/dictionary/words.json";

const dictionarySlugs = new Map(dictionaryWords.map((word) => [word.slug, word]));
const bySlug = new Map(words.map((word) => [word.slug, word]));

describe("aspect pairs", () => {
  it("list existing verbs in words.json, imperfective first", () => {
    for (const [imperfective, perfective] of aspectPairs) {
      for (const slug of [imperfective, perfective]) {
        const word = dictionarySlugs.get(slug);
        expect(word, slug).toBeDefined();
        expect(word!.category, slug).toBe("Verbs");
      }
    }
  });

  it("use each slug in one pair only", () => {
    const slugs = aspectPairs.flat();
    expect(new Set(slugs).size, slugs.join()).toBe(slugs.length);
  });

  it("set aspect and partner on both members", () => {
    for (const [imperfective, perfective] of aspectPairs) {
      const imperfectiveEntry = bySlug.get(imperfective);
      const perfectiveEntry = bySlug.get(perfective);

      expect(imperfectiveEntry?.aspect, imperfective).toBe("imperfective");
      expect(imperfectiveEntry?.aspectPartner, imperfective).toBe(perfective);
      expect(perfectiveEntry?.aspect, perfective).toBe("perfective");
      expect(perfectiveEntry?.aspectPartner, perfective).toBe(imperfective);
    }
  });

  it("pair only words with a page of their own", () => {
    for (const slug of aspectPairs.flat()) {
      expect(bySlug.get(slug)?.variantOf, slug).toBeUndefined();
    }
  });

  it("do not list the partner again under related words", () => {
    for (const slug of aspectPairs.flat()) {
      const props = dictionaryPagePropsForSlug(slug);
      const partner = bySlug.get(slug)?.aspectPartner;
      const relatedSlugs = props?.relatedEntries.map((related) => related.slug) ?? [];
      expect(relatedSlugs, slug).not.toContain(partner);
    }
  });

  it("link the partner from the dictionary page", () => {
    expect(dictionaryPagePropsForSlug("jest")?.aspectPartner).toMatchObject({
      aspect: "perfective",
      slovak: "zjesť",
      href: "/dictionary/zjest",
    });
  });
});
