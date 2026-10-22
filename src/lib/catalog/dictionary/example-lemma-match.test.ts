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

  it("uses the noun gender to find case forms", () => {
    expect(
      exampleContainsLemma("Kúpil som nové náplne.", "náplň", "Nouns", "feminine"),
    ).toBe(true);
    expect(exampleContainsLemma("Spadol do studne.", "studňa", "Nouns", "feminine")).toBe(
      true,
    );
    expect(exampleContainsLemma("Slnko zapadá na západe.", "západ", "Nouns")).toBe(true);
  });

  it("rejects another word that only looks like a case form", () => {
    expect(
      exampleContainsLemma("Dnes je streda.", "stred", "Nouns", "masculine-inanimate"),
    ).toBe(false);
    expect(
      exampleContainsLemma(
        "Praha je hlavné mesto Česka.",
        "prah",
        "Nouns",
        "masculine-inanimate",
      ),
    ).toBe(false);
    expect(exampleContainsLemma("Dáte si kávu?", "dáta", "Nouns", "plural-only")).toBe(
      false,
    );
  });
});
