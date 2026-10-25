import { describe, expect, it } from "vitest";

import { exampleParts } from "./grammar-example";

function lit(slovak: string, note?: string, forms: string[] = []): string[] {
  return exampleParts(slovak, new Set(forms), note)
    .filter((part) => part.highlighted)
    .map((part) => part.text);
}

describe("exampleParts", () => {
  it("lights the forms the table shows", () => {
    expect(lit("Som v obchode.", undefined, ["v", "obchode", "do"])).toEqual([
      "v",
      "obchode",
    ]);
  });

  it("lights the conjugated form of an infinitive the note bolds", () => {
    expect(lit("Bežím na autobus.", "One run, right now: **bežať**.")).toEqual(["Bežím"]);
    expect(
      lit(
        "Vošiel do obchodu a kúpil chlieb.",
        "One event after another: perfective **vojsť**, then **kúpiť**.",
      ),
    ).toEqual(["Vošiel", "kúpil"]);
  });

  it("lights a bolded phrase only where the sentence says all of it", () => {
    expect(
      lit("Chcel by som kávu, prosím.", "A polite way to ask: **Chcel by som**."),
    ).toEqual(["Chcel", "by", "som"]);
    expect(
      lit(
        "Idem do kina so svojou sestrou.",
        "With **ja** as the owner, **mojou** works too: **s mojou sestrou**.",
      ),
    ).toEqual([]);
  });

  it("keeps a reflexive verb lit when sa stands elsewhere", () => {
    expect(lit("Volám sa Peter.", "**Volať sa**: to be called.")).toEqual([
      "Volám",
      "sa",
    ]);
    expect(
      lit(
        "Začal som sa učiť slovenčinu.",
        "After **začať**, the imperfective: **učiť sa**.",
      ),
    ).toEqual(["Začal", "učiť"]);
  });

  it("ignores a bolded ending", () => {
    expect(lit("Je to tvoj kufor?", "**tento** adds **-to**")).toEqual([]);
  });
});
