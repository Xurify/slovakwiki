import { describe, expect, it } from "vitest";

import { words } from "$lib/catalog/entries";

import variantForms from "../../../../content/dictionary/variant-forms.json";

const bySlug = new Map(words.map((word) => [word.slug, word]));
const variantSlugs = new Set(
  words.filter((word) => word.variantOf).map((word) => word.slug),
);

describe("variant spellings", () => {
  it("point at a base lemma of the same category that is not itself a variant", () => {
    for (const [variant, base] of Object.entries(variantForms)) {
      const variantEntry = bySlug.get(variant);
      const baseEntry = bySlug.get(base);

      expect(variantEntry, variant).toBeDefined();
      expect(baseEntry, base).toBeDefined();
      expect(baseEntry?.variantOf, base).toBeUndefined();
      expect(variantEntry?.variantOf, variant).toBe(base);
      expect(variantEntry?.category, variant).toBe(baseEntry?.category);
    }
  });

  it("never lists a variant as a related word", () => {
    for (const word of words) {
      for (const slug of word.related) {
        expect(variantSlugs.has(slug), `${word.slug} → ${slug}`).toBe(false);
      }
    }
  });

  it("gives each variant the related words of its base", () => {
    for (const [variant, base] of Object.entries(variantForms)) {
      expect(bySlug.get(variant)?.related, variant).toEqual(bySlug.get(base)?.related);
    }
  });

  it("relates zase to its synonyms, not to its own spellings", () => {
    const related = bySlug.get("zase")?.related ?? [];

    expect(related).toEqual(expect.arrayContaining(["znova", "opatovne"]));
    expect(related).not.toContain("zas");
    expect(related).not.toContain("zasa");
  });
});
