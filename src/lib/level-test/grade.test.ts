import { describe, expect, it } from "vitest";

import {
  ACCENT_ONLY_CREDIT,
  gradeDictation,
  gradeHighlight,
  gradeIdeaGap,
  gradeLetters,
  gradeReadAloud,
  gradeYesNo,
} from "./grade";

describe("gradeLetters", () => {
  it("needs the exact letters for full credit", () => {
    expect(gradeLetters("ave", "ave")).toBe(1);
    expect(gradeLetters("ave", "AVE ")).toBe(1);
    expect(gradeLetters("ave", "avu")).toBe(0);
    expect(gradeLetters("ave", "")).toBe(0);
  });

  it("gives part credit when only diacritics are off", () => {
    expect(gradeLetters("áva", "ava")).toBe(ACCENT_ONLY_CREDIT);
  });
});

describe("gradeYesNo", () => {
  it("marks a timeout wrong", () => {
    expect(gradeYesNo(true, null)).toBe(0);
    expect(gradeYesNo(false, false)).toBe(1);
  });
});

describe("gradeDictation", () => {
  const sentence = "Zajtra pôjdeme do kina s kamarátmi.";

  it("ignores case and punctuation", () => {
    expect(gradeDictation(sentence, "zajtra pôjdeme do kina s kamarátmi")).toBe(1);
  });

  it("charges less for a missing accent than for a wrong word", () => {
    const accents = gradeDictation(sentence, "Zajtra pojdeme do kina s kamarátmi.");
    const wrongWord = gradeDictation(sentence, "Zajtra pôjdeme do mesta s kamarátmi.");
    expect(accents).toBeGreaterThan(wrongWord);
    expect(accents).toBeLessThan(1);
  });

  it("gives partial credit for half a sentence", () => {
    const half = gradeDictation(sentence, "Zajtra pôjdeme do");
    expect(half).toBeGreaterThan(0.3);
    expect(half).toBeLessThan(0.7);
  });

  it("gives nothing for an empty answer", () => {
    expect(gradeDictation(sentence, "")).toBe(0);
  });
});

describe("gradeReadAloud", () => {
  it("does not charge for diacritics the recogniser dropped", () => {
    expect(gradeReadAloud("Dobrý deň, ako sa máte?", "dobry den ako sa mate")).toBe(1);
  });
});

describe("gradeIdeaGap", () => {
  it("accepts any listed phrasing and ignores spelling", () => {
    expect(
      gradeIdeaGap(["skúšku z dejepisu", "test z dejepisu"], "skusku z dejepisu"),
    ).toBe(1);
  });

  it("gives partial credit for part of the idea", () => {
    expect(gradeIdeaGap(["skúšku z dejepisu"], "skúšku")).toBeCloseTo(1 / 3);
  });

  it("discounts rambling answers", () => {
    const rambling =
      "skúšku z dejepisu a potom ešte niečo úplne iné o ktorom nevieme nič";
    expect(gradeIdeaGap(["skúšku z dejepisu"], rambling)).toBeLessThan(1);
  });
});

describe("gradeHighlight", () => {
  it("scores overlap as F1", () => {
    expect(gradeHighlight({ start: 3, end: 6 }, { start: 3, end: 6 })).toBe(1);
    expect(gradeHighlight({ start: 3, end: 6 }, null)).toBe(0);
    expect(gradeHighlight({ start: 3, end: 6 }, { start: 10, end: 12 })).toBe(0);
    expect(gradeHighlight({ start: 3, end: 6 }, { start: 3, end: 10 })).toBeCloseTo(
      (2 * (4 / 8) * 1) / (4 / 8 + 1),
    );
  });
});
