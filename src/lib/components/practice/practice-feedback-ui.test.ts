import { describe, expect, it } from "vitest";
import { isMissFeedback, missCompareClass, splitEmphasis } from "./practice-feedback-ui";

describe("splitEmphasis", () => {
  it("returns plain text when there are no markers", () => {
    expect(splitEmphasis("Plain teaching line.")).toEqual([
      { type: "text", value: "Plain teaching line." },
    ]);
  });

  it("splits **term** markers for why emphasis", () => {
    expect(
      splitEmphasis("Use o + the ordinal time form to say when: **o tretej**."),
    ).toEqual([
      { type: "text", value: "Use o + the ordinal time form to say when: " },
      { type: "em", value: "o tretej" },
      { type: "text", value: "." },
    ]);
  });

  it("supports multiple emphasized spans", () => {
    expect(splitEmphasis("**Pol tretej** means **2:30**.")).toEqual([
      { type: "em", value: "Pol tretej" },
      { type: "text", value: " means " },
      { type: "em", value: "2:30" },
      { type: "text", value: "." },
    ]);
  });

  it("splits *italic* markers for Slovak examples", () => {
    expect(splitEmphasis("Use **Sú** + **hodiny**: *Sú dve hodiny.*")).toEqual([
      { type: "text", value: "Use " },
      { type: "em", value: "Sú" },
      { type: "text", value: " + " },
      { type: "em", value: "hodiny" },
      { type: "text", value: ": " },
      { type: "i", value: "Sú dve hodiny." },
    ]);
  });
});

describe("isMissFeedback", () => {
  it("counts wrong, accent slips and reveals as misses", () => {
    expect(isMissFeedback("incorrect", false)).toBe(true);
    expect(isMissFeedback("accents", false)).toBe(true);
    expect(isMissFeedback("correct", false)).toBe(false);
  });
});

describe("missCompareClass", () => {
  // The tinted rows are the frame: a box around them read as a box in a box.
  it("sets the compare rows without a frame of its own", () => {
    expect(missCompareClass).not.toContain("border");
    expect(missCompareClass).not.toContain("shadow");
    expect(missCompareClass).not.toContain("ring");
  });
});
