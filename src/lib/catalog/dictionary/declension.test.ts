import { describe, expect, it } from "vitest";

import { words } from "../entries";
import { declensionRows, splitFormFromLemma } from "./declension";

describe("splitFormFromLemma", () => {
  it("marks the ending added to the lemma", () => {
    expect(splitFormFromLemma("priateľovi", "priateľ")).toEqual({
      stem: "priateľ",
      ending: "ovi",
    });
  });

  it("marks the changed letters when the stem changes", () => {
    expect(splitFormFromLemma("priatelia", "priateľ")).toEqual({
      stem: "priate",
      ending: "lia",
    });
  });

  it("leaves the lemma itself unmarked", () => {
    expect(splitFormFromLemma("priateľ", "priateľ")).toEqual({
      stem: "priateľ",
      ending: "",
    });
  });
});

describe("declensionRows", () => {
  it("uses person questions for masculine animate nouns", () => {
    const rows = declensionRows(
      "priateľ",
      {
        singular: [
          "priateľ",
          "priateľa",
          "priateľovi",
          "priateľa",
          "priateľovi",
          "priateľom",
        ],
        plural: [
          "priatelia",
          "priateľov",
          "priateľom",
          "priateľov",
          "priateľoch",
          "priateľmi",
        ],
      },
      "masculine-animate",
    );

    expect(rows.map((row) => row.question)).toEqual([
      "Kto?",
      "Koho?",
      "Komu?",
      "Koho?",
      "O kom?",
      "S kým?",
    ]);
  });

  it("every hand-authored declension has six forms per number", () => {
    for (const word of words) {
      if (!word.declension) continue;

      expect(word.category).toBe("Nouns");
      expect(word.declension.singular).toHaveLength(6);
      expect(word.declension.plural).toHaveLength(6);
      expect(word.declension.singular[0]).toBe(word.slovak);
    }
  });
});
