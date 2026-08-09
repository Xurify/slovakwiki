import { describe, expect, it } from "vitest";

import {
  augmentFeedbackWhy,
  choiceFeedbackWhy,
} from "$lib/learning/exercises/feedback-why";

describe("feedback-why", () => {
  it("appends whyWrong only for selected wrong choice answers", () => {
    const choices = [
      { id: "a", label: "A." },
      {
        id: "b",
        label: "B.",
        whyWrong: "**B** is wrong here.",
      },
    ];

    expect(choiceFeedbackWhy("Base why.", "a", choices, "a")).toBe("Base why.");
    expect(choiceFeedbackWhy("Base why.", "b", choices, "a")).toBe(
      "Base why. **B** is wrong here.",
    );
  });

  it("filters select-all wrong picks by correct flag", () => {
    const choices = [
      { id: "a", correct: true, whyWrong: "Should not show." },
      { id: "b", correct: false, whyWrong: "**B** is wrong." },
    ];

    expect(augmentFeedbackWhy("Base.", new Set(["a"]), choices)).toBe("Base.");
    expect(augmentFeedbackWhy("Base.", new Set(["b"]), choices)).toBe(
      "Base. **B** is wrong.",
    );
  });
});
