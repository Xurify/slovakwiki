import { describe, expect, it } from "vitest";
import {
  feedbackFooterClass,
  isMissFeedback,
  missCompareClass,
  splitEmphasis,
} from "./practice-feedback-ui";

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

describe("feedbackFooterClass", () => {
  it("uses neutral footer on miss so cards carry tone", () => {
    expect(feedbackFooterClass("incorrect")).toBe(
      "border-t border-slate-200 bg-paper/70",
    );
    expect(isMissFeedback("incorrect", false)).toBe(true);
    expect(isMissFeedback("accents", false)).toBe(true);
    expect(isMissFeedback("correct", false)).toBe(false);
  });
});

describe("missCompareClass", () => {
  it("frames the compare panel with inset tint rows", () => {
    expect(missCompareClass).toContain("border border-slate-200");
    expect(missCompareClass).toContain("shadow-(--shadow-border)");
    expect(missCompareClass).toContain("p-1");
    expect(missCompareClass).not.toContain("ring-inset");
  });
});
