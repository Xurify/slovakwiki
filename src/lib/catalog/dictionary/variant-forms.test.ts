import { describe, expect, it } from "vitest";

import { words } from "$lib/catalog/entries";

import variantFormGroups from "../../../../content/dictionary/variant-forms.json";
import { canonicalWordSlug, dictionaryPathForSense } from "./lemma-senses";

const bySlug = new Map(words.map((word) => [word.slug, word]));
const variantSlugs = new Set(
  words.filter((word) => word.variantOf).map((word) => word.slug),
);

describe("variant forms", () => {
  it("list existing words of one category, headed by the most frequent", () => {
    for (const group of variantFormGroups) {
      const members = group.map((slug) => {
        const word = bySlug.get(slug);
        expect(word, slug).toBeDefined();
        return word!;
      });
      expect(new Set(members.map((word) => word.category)).size, group.join()).toBe(1);

      const heads = members.filter((word) => !word.variantOf);
      expect(heads, group.join()).toHaveLength(1);

      const head = heads[0]!;
      for (const word of members) {
        expect(head.frequency?.rank ?? Infinity, word.slug).toBeLessThanOrEqual(
          word.frequency?.rank ?? Infinity,
        );
        if (word !== head) expect(word.variantOf).toBe(head.slug);
      }
    }
  });

  it("have no page of their own and link to their head's page", () => {
    for (const slug of variantSlugs) {
      const word = bySlug.get(slug)!;
      const head = bySlug.get(word.variantOf!)!;

      expect(canonicalWordSlug(word, words), slug).not.toBe(slug);
      expect(dictionaryPathForSense(word, words), slug).toBe(
        dictionaryPathForSense(head, words),
      );
    }
  });

  it("are never listed as related words", () => {
    for (const word of words) {
      for (const slug of word.related) {
        expect(variantSlugs.has(slug), `${word.slug} → ${slug}`).toBe(false);
      }
    }
  });

  it("put zas and zase on the zasa page", () => {
    expect(bySlug.get("zas")?.variantOf).toBe("zasa");
    expect(bySlug.get("zase")?.variantOf).toBe("zasa");
    expect(bySlug.get("zasa")?.related).toContain("znova");
  });
});
