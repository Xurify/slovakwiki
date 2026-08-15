import { describe, expect, it } from "vitest";

import { glossGrammarTermFor, splitGlossGrammarTerms } from "./gloss-grammar-terms";

describe("gloss grammar terms", () => {
  it("resolves aspect and gender parentheticals", () => {
    expect(glossGrammarTermFor("imperfective")?.href).toBe(
      "/grammar/aspect#imperfective",
    );
    expect(glossGrammarTermFor("Perfective")?.href).toBe("/grammar/aspect#perfective");
    expect(glossGrammarTermFor("habitually")?.href).toBe("/grammar/aspect#habitual");
    expect(glossGrammarTermFor("f.")?.href).toBe("/grammar/grammatical-gender");
  });

  it("leaves sense disambiguators plain", () => {
    expect(glossGrammarTermFor("sports")).toBeUndefined();
    expect(glossGrammarTermFor("given name")).toBeUndefined();
  });

  it("splits glosses into linked term segments", () => {
    const segments = splitGlossGrammarTerms("to admit (imperfective)");
    expect(segments).toEqual([
      { type: "text", value: "to admit " },
      {
        type: "term",
        value: "(imperfective)",
        term: expect.objectContaining({
          key: "imperfective",
          href: "/grammar/aspect#imperfective",
        }),
      },
    ]);

    const mixed = splitGlossGrammarTerms("goal (sports); to score (perfective)");
    expect(mixed.filter((segment) => segment.type === "term")).toHaveLength(1);
    expect(
      mixed.some(
        (segment) => segment.type === "text" && segment.value.includes("(sports)"),
      ),
    ).toBe(true);
  });
});
