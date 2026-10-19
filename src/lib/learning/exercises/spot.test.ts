import { describe, expect, it } from "vitest";

import type { SpotExercise } from "$lib/learning/types";
import { canCheckSpot, gradeSpot, spotAttempt, spotFeedbackWhy, spotWord } from "./spot";

function task(overrides: Partial<SpotExercise> = {}): SpotExercise {
  return {
    id: "spot",
    type: "spot",
    practiceItemId: "grammar/demonstrative-spot",
    prompt: "Where is that suitcase?",
    words: ["Kde", "je", "tá", "kufor?"],
    wrongIndex: 2,
    answer: "ten",
    feedback: { correction: "Kde je ten kufor?", why: "**Kufor** is masculine." },
    ...overrides,
  };
}

const clean = task({
  words: ["Kde", "je", "ten", "kufor?"],
  wrongIndex: null,
  answer: "",
});

describe("spot exercise", () => {
  it("strips punctuation from a word", () => {
    expect(spotWord(["Kde", "je", "ten", "kufor?"], 3)).toBe("kufor");
    expect(spotWord(["„Ahoj,“"], 0)).toBe("Ahoj");
  });

  it("needs a pick, and a fix when a word is picked", () => {
    expect(canCheckSpot(null, "")).toBe(false);
    expect(canCheckSpot("none", "")).toBe(true);
    expect(canCheckSpot(2, "  ")).toBe(false);
    expect(canCheckSpot(2, "ten")).toBe(true);
  });

  it("grades the pick and the fix", () => {
    expect(gradeSpot(task(), 2, "ten")).toBe("correct");
    expect(gradeSpot(task(), 2, "Ten")).toBe("correct");
    expect(gradeSpot(task(), 2, "to")).toBe("incorrect");
    expect(gradeSpot(task(), 3, "kufra")).toBe("incorrect");
    expect(gradeSpot(task(), "none", "")).toBe("incorrect");
    expect(gradeSpot(clean, "none", "")).toBe("correct");
    expect(gradeSpot(clean, 2, "tá")).toBe("incorrect");
  });

  it("treats an accent slip in the fix as almost right", () => {
    const feminine = task({
      words: ["Kde", "je", "ten", "taška?"],
      answer: "tá",
      feedback: { correction: "Kde je tá taška?", why: "**Taška** is feminine." },
    });
    expect(gradeSpot(feminine, 2, "ta")).toBe("accents");
  });

  it("rebuilds the sentence the learner ends up with", () => {
    expect(spotAttempt(task(), 2, "to")).toBe("Kde je to kufor?");
    expect(spotAttempt(task(), 3, "kufra")).toBe("Kde je tá kufra?");
    expect(spotAttempt(task(), "none", "")).toBe("Kde je tá kufor?");
    expect(spotAttempt(task(), 2, " ")).toBeUndefined();
    expect(spotAttempt(task(), null, "")).toBeUndefined();
  });

  it("points at the wrong word when the learner looked elsewhere", () => {
    const why = "**Kufor** is masculine.";
    expect(spotFeedbackWhy(task(), 3, why)).toBe(
      "**Kufor** is fine here. The wrong word is **tá**. **Kufor** is masculine.",
    );
    expect(spotFeedbackWhy(task(), "none", why)).toBe(
      "One word is wrong: **tá**. **Kufor** is masculine.",
    );
    expect(spotFeedbackWhy(task(), 2, why)).toBe(why);
    expect(spotFeedbackWhy(clean, 2, why)).toBe(`Nothing was wrong here. ${why}`);
  });
});
