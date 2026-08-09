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

  it("skips redundant whyWrong when base already teaches the same point", () => {
    const choices = [
      {
        id: "informal",
        label: "Ahoj!",
        whyWrong: "**Ahoj** is informal — use **Dobrý deň** with someone new.",
      },
    ];

    expect(
      choiceFeedbackWhy(
        "Use **Dobrý deň**; **Ahoj** is informal.",
        "informal",
        choices,
        "formal",
      ),
    ).toBe("Use **Dobrý deň**; **Ahoj** is informal.");
  });

  it("always appends select-all wrong notes", () => {
    const choices = [
      { id: "a", correct: true },
      {
        id: "b",
        correct: false,
        whyWrong: "**O poludní** means noon, not midnight.",
      },
    ];

    expect(augmentFeedbackWhy("Base.", new Set(["b"]), choices)).toBe(
      "Base. **O poludní** means noon, not midnight.",
    );
  });
});
