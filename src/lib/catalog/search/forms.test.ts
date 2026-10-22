import { describe, expect, it } from "vitest";

import { conjugateVerbForTest, formsVerified } from "./forms";

describe("search forms", () => {
  it("shortens the ending after a long syllable", () => {
    expect(conjugateVerbForTest("čítať")).toEqual(
      expect.arrayContaining(["čítam", "čítaš", "číta", "čítajú"]),
    );
    expect(conjugateVerbForTest("čítať")).not.toContain("čítám");
    expect(conjugateVerbForTest("vrátiť")).toContain("vrátim");
    expect(conjugateVerbForTest("pôsobiť")).toContain("pôsobím");
    expect(conjugateVerbForTest("zúčastniť")).toContain("zúčastním");
  });

  it("gives -iam only to c and š stems", () => {
    expect(conjugateVerbForTest("vracať")).toContain("vraciam");
    expect(conjugateVerbForTest("volať")).toContain("volám");
    expect(conjugateVerbForTest("volať")).not.toContain("voliam");
  });

  it("conjugates -núť, -iať and -rieť verbs by their class", () => {
    expect(conjugateVerbForTest("minúť")).toEqual(
      expect.arrayContaining(["miniem", "minul"]),
    );
    expect(conjugateVerbForTest("stretnúť")).toEqual(
      expect.arrayContaining(["stretnem", "stretol", "stretla"]),
    );
    expect(conjugateVerbForTest("smiať")).toContain("smejem");
    expect(conjugateVerbForTest("pozrieť")).toEqual(
      expect.arrayContaining(["pozriem", "pozrú", "pozrel"]),
    );
  });

  it("keeps the irregular tables standard", () => {
    expect(conjugateVerbForTest("smieť")).toContain("smú");
    expect(conjugateVerbForTest("smieť")).not.toContain("smejú");
    expect(conjugateVerbForTest("hnať")).not.toContain("ženem");
  });

  it("verifies only the paradigms it builds correctly", () => {
    expect(formsVerified("kupovať", "Verbs")).toBe(true);
    expect(formsVerified("robiť", "Verbs")).toBe(true);
    expect(formsVerified("brať", "Verbs")).toBe(true);
    expect(formsVerified("čítať", "Verbs")).toBe(false);
    expect(formsVerified("nový", "Adjectives")).toBe(true);
    expect(formsVerified("kniha", "Nouns", "feminine")).toBe(true);
    expect(formsVerified("mesto", "Nouns", "neuter")).toBe(true);
    expect(formsVerified("ulica", "Nouns", "feminine")).toBe(false);
    expect(formsVerified("káva", "Nouns", "feminine")).toBe(false);
    expect(formsVerified("kolega", "Nouns", "masculine-animate")).toBe(false);
    expect(formsVerified("pes", "Nouns", "masculine-animate")).toBe(false);
  });
});
