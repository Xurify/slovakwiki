import { describe, expect, it } from "vitest";

import { highlightLemmaInText } from "./highlight-lemma";

function hitText(parts: ReturnType<typeof highlightLemmaInText>): string | undefined {
  return parts.find((part) => part.hit)?.text;
}

describe("highlightLemmaInText", () => {
  it("bolds exact lemma token", () => {
    expect(
      hitText(
        highlightLemmaInText(
          "Tom bol príliš hrdý priznať, že Mária mala pravdu.",
          "priznať",
          "Verbs",
        ),
      ),
    ).toBe("priznať");
  });

  it("bolds conjugated past form", () => {
    expect(
      hitText(highlightLemmaInText("Tom priznal, že má strach.", "priznať", "Verbs")),
    ).toBe("priznal");
    expect(hitText(highlightLemmaInText("Tom to priznal.", "priznať", "Verbs"))).toBe(
      "priznal",
    );
  });

  it("bolds feminine past", () => {
    expect(
      hitText(highlightLemmaInText("Mária to priznala.", "priznať", "Verbs")),
    ).toBe("priznala");
  });

  it("does not bold unrelated short words from other verbs", () => {
    const parts = highlightLemmaInText(
      "Tom bol príliš hrdý priznať, že Mária mala pravdu.",
      "priznať",
      "Verbs",
    );
    expect(hitText(parts)).toBe("priznať");
    expect(parts.some((part) => part.hit && part.text === "bol")).toBe(false);
    expect(parts.some((part) => part.hit && part.text === "mala")).toBe(false);
  });

  it("skips dangerous short irregular forms like je/si", () => {
    expect(hitText(highlightLemmaInText("Ona je doma.", "byť", "Verbs"))).toBeUndefined();
    expect(hitText(highlightLemmaInText("Ty si doma.", "byť", "Verbs"))).toBeUndefined();
  });

  it("still bolds safe irregular forms", () => {
    expect(hitText(highlightLemmaInText("Tom bol doma.", "byť", "Verbs"))).toBe("bol");
    expect(hitText(highlightLemmaInText("Oni boli doma.", "byť", "Verbs"))).toBe(
      "boli",
    );
  });

  it("requires whole-word match", () => {
    expect(
      hitText(highlightLemmaInText("nepriznal nič.", "priznať", "Verbs")),
    ).toBeUndefined();
  });

  it("falls back to lemma-only when category has no forms", () => {
    expect(
      hitText(highlightLemmaInText("Hovoríme o priznať dnes.", "priznať", "Particles")),
    ).toBe("priznať");
    expect(
      hitText(highlightLemmaInText("Tom priznal pravdu.", "priznať", "Particles")),
    ).toBeUndefined();
  });

  it("bolds noun case forms", () => {
    expect(hitText(highlightLemmaInText("Vidím školu.", "škola", "Nouns"))).toBe(
      "školu",
    );
  });
});
