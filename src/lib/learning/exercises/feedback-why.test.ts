import { describe, expect, it } from "vitest";

import { gradeChoice } from "$lib/learning/exercises/choice";
import {
  augmentFeedbackWhy,
  choiceFeedbackWhy,
  pickTrapFeedbackEnglish,
  pickTrapFeedbackWhy,
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

  it("omits english gloss for pickTrap feedback", () => {
    expect(pickTrapFeedbackEnglish("At half past 11.")).toBeUndefined();
  });

  it("returns trap whyWrong on pickTrap success", () => {
    const choices = [
      {
        id: "fit",
        label: "Je pol tretej.",
        fits: true,
        whyWrong: "**Pol tretej** means half past two.",
      },
      {
        id: "trap",
        label: "Je pol druhej.",
        whyWrong: "**Pol druhej** is **1:30**.",
      },
    ];

    expect(pickTrapFeedbackWhy("Base.", "trap", choices)).toBe(
      "**Pol druhej** is **1:30**.",
    );
    expect(pickTrapFeedbackWhy("Base.", "fit", choices)).toMatch(/means half past two/);
  });

  it("grades any trap as correct in pickTrap mode", () => {
    const exercise = {
      answerId: "trap-a",
      choiceMode: "pickTrap" as const,
      choices: [
        { id: "fit", label: "Fit.", fits: true },
        { id: "trap-a", label: "Trap A." },
        { id: "trap-b", label: "Trap B." },
      ],
    };

    expect(gradeChoice("trap-a", exercise)).toBe(true);
    expect(gradeChoice("trap-b", exercise)).toBe(true);
    expect(gradeChoice("fit", exercise)).toBe(false);
  });
});
