import { describe, expect, it } from "vitest";

import { exampleContainsLemma } from "./example-lemma-match";

describe("exampleContainsLemma", () => {
  it("keeps vina / chyba examples that use the lemma", () => {
    expect(exampleContainsLemma("Bola to moja vina.", "vina", "Nouns")).toBe(true);
    expect(exampleContainsLemma("Vo vete je chyba.", "chyba", "Nouns")).toBe(true);
    expect(exampleContainsLemma("Bola to jeho chyba.", "chyba", "Nouns")).toBe(true);
  });

  it("rejects diacritic near-misses", () => {
    expect(
      exampleContainsLemma("Jedlo bez vína je ako deň bez slnka.", "vina", "Nouns"),
    ).toBe(false);
    expect(exampleContainsLemma("Tomovi chýba Boston.", "chyba", "Nouns")).toBe(false);
    expect(exampleContainsLemma("Vo vete je chyba.", "chýbať", "Verbs")).toBe(false);
  });

  it("keeps inflected noun and verb forms", () => {
    expect(exampleContainsLemma("Vidím školu.", "škola", "Nouns")).toBe(true);
    expect(exampleContainsLemma("Tomovi chýba Boston.", "chýbať", "Verbs")).toBe(true);
    expect(exampleContainsLemma("Budeš mi chýbať.", "chýbať", "Verbs")).toBe(true);
  });
});
