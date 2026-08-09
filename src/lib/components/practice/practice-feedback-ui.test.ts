import { describe, expect, it } from "vitest";
import {
  feedbackFooterClass,
  isMissFeedback,
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
});

describe("feedbackFooterClass", () => {
  it("uses rose footer on miss", () => {
    expect(feedbackFooterClass("incorrect")).toBe("border-t border-rose-200 bg-rose-50");
    expect(isMissFeedback("incorrect", false)).toBe(true);
    expect(isMissFeedback("accents", false)).toBe(true);
    expect(isMissFeedback("correct", false)).toBe(false);
  });
});
