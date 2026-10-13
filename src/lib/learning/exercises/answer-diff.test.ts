import { describe, expect, it } from "vitest";

import { containsAnswerWords, diffAnswerWords } from "./answer-diff";

function marked<Mark extends string>(words: Array<{ mark: Mark; word: string }>) {
  return words
    .filter((word) => word.mark !== "same")
    .map(({ mark, word }) => [word, mark]);
}

describe("diffAnswerWords", () => {
  it("marks the wrong form and an accent slip separately", () => {
    const diff = diffAnswerWords("Anna hľadá svoj kľuče", "Anna hľadá svoje kľúče.");

    expect(diff).not.toBeNull();
    expect(marked(diff!.attempt)).toEqual([
      ["svoj", "wrong"],
      ["kľuče", "accent"],
    ]);
    expect(marked(diff!.correction)).toEqual([
      ["svoje", "fixed"],
      ["kľúče", "accent"],
    ]);
  });

  it("keeps edge punctuation outside the word and ignores case", () => {
    const diff = diffAnswerWords("to je môj sestra", "To je moja sestra.");

    expect(marked(diff!.correction)).toEqual([["moja", "fixed"]]);
    expect(diff!.correction.at(-1)).toMatchObject({ trail: ".", word: "sestra" });
  });

  it("marks a moved word in a built sentence", () => {
    const diff = diffAnswerWords("To je môjho brata auto.", "To je auto môjho brata.");

    expect(marked(diff!.attempt)).toHaveLength(1);
    expect(marked(diff!.correction)).toHaveLength(1);
  });

  it("returns null when nothing differs but punctuation", () => {
    expect(diffAnswerWords("Ich auto je červené", "Ich auto je červené.")).toBeNull();
  });

  it("returns null for a different sentence, where marks would point at nothing", () => {
    expect(diffAnswerWords("Dobrý deň", "Ich auto je červené.")).toBeNull();
  });
});

describe("containsAnswerWords", () => {
  it("matches whole consecutive words, ignoring case and accents", () => {
    expect(containsAnswerWords("Anna hľadá svoj kľuče", "svoj")).toBe(true);
    expect(containsAnswerWords("Anna hľadá svoje kľúče.", "svoj")).toBe(false);
    expect(containsAnswerWords("Idem do kina so mojou sestrou", "so mojou")).toBe(true);
    expect(containsAnswerWords("Idem do kina s mojou sestrou", "so mojou")).toBe(false);
    expect(containsAnswerWords("TO JE MOJ BRAT", "môj brat")).toBe(true);
  });
});
