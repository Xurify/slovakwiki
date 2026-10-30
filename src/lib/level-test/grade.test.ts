import { describe, expect, it } from "vitest";

import {
  ACCENT_ONLY_CREDIT,
  cardinalValue,
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

  it("accepts digits and % for the numbers said", () => {
    expect(gradeDictation("Vlak odíde o päť minút.", "Vlak odíde o 5 minút.")).toBe(1);
    expect(gradeDictation("Zľava je desať percent.", "Zľava je 10 %.")).toBe(1);
    expect(gradeDictation("Zľava je desať percent.", "Zľava je 10%.")).toBe(1);
    expect(
      gradeDictation(
        "Polícia vzniesla obvinenie proti dvom mužom.",
        "Polícia vzniesla obvinenie proti 2 mužom.",
      ),
    ).toBe(1);
    expect(gradeDictation("Vlak odíde o päť minút.", "Vlak odíde o 6 minút.")).toBe(0.8);
  });

  it("charges ä said as e like a missing accent", () => {
    const heard = gradeDictation("Vlak odíde o päť minút.", "Vlak odíde o peť minút.");
    const noAccent = gradeDictation("Vlak odíde o päť minút.", "Vlak odíde o pat minút.");
    expect(heard).toBe(noAccent);
    expect(heard).toBeGreaterThan(0.9);
  });

  it("counts a word typed in two parts as one word with a typo", () => {
    const split = gradeDictation("Odmalička rád kreslí.", "Od malička rád kreslí.");
    const joined = gradeDictation("Od malička rád kreslí.", "Odmalička rád kreslí.");
    expect(split).toBeCloseTo(1 - 0.5 / 3);
    expect(joined).toBeCloseTo(1 - 0.5 / 4);
  });

  it("keeps a mid-word slip a typo but a wrong ending or another word a miss", () => {
    const words = (typed: string) => gradeDictation("Mám pekný byt.", typed);
    expect(words("Mám pekné byt.")).toBeCloseTo(2 / 3);
    expect(gradeDictation("Hľadám miesto.", "Hľadám mesto.")).toBe(0.5);
    expect(gradeDictation(sentence, "Zajtra pôjdeme do kina s kamarámi.")).toBeCloseTo(
      1 - 0.5 / 6,
    );
    expect(gradeDictation("Mám pekný byt.", "Mám pekni byt.")).toBeCloseTo(1 - 0.5 / 3);
  });
});

describe("cardinalValue", () => {
  it("reads cardinals written as one word", () => {
    expect(cardinalValue("päť")).toBe(5);
    expect(cardinalValue("dve")).toBe(2);
    expect(cardinalValue("dvaja")).toBe(2);
    expect(cardinalValue("štyridsať")).toBe(40);
    expect(cardinalValue("šesťdesiat")).toBe(60);
    expect(cardinalValue("dvadsaťpäť")).toBe(25);
    expect(cardinalValue("stodvadsaťpäť")).toBe(125);
    expect(cardinalValue("dvetisícdvadsaťšesť")).toBe(2026);
    expect(cardinalValue("piatich")).toBe(5);
  });

  it("leaves other words alone", () => {
    expect(cardinalValue("stolička")).toBeNull();
    expect(cardinalValue("dvere")).toBeNull();
    expect(cardinalValue("tisícka")).toBeNull();
  });
});

describe("gradeReadAloud", () => {
  it("does not charge for diacritics the recogniser dropped", () => {
    expect(gradeReadAloud("Dobrý deň, ako sa máte?", "dobry den ako sa mate")).toBe(1);
  });

  it("does not charge for digits or word breaks the recogniser chose", () => {
    expect(gradeReadAloud("Účet vyšiel na štyridsať eur.", "účet vyšiel na 40 eur")).toBe(
      1,
    );
    expect(gradeReadAloud("Odmalička rád kreslí.", "od malička rád kreslí")).toBe(1);
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
