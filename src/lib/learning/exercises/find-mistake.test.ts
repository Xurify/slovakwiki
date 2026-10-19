import { describe, expect, it } from "vitest";

import type { FindMistakeExercise } from "$lib/learning/types";
import {
  canCheckFindMistake,
  gradeFindMistake,
  findMistakeAttempt,
  findMistakeFeedbackWhy,
  wordWithoutPunctuation,
} from "./find-mistake";

function task(overrides: Partial<FindMistakeExercise> = {}): FindMistakeExercise {
  return {
    id: "find-mistake",
    type: "findMistake",
    practiceItemId: "grammar/demonstrative-find-mistake",
    prompt: "Where is that suitcase?",
    words: ["Kde", "je", "tá", "kufor?"],
    wrongWordIndex: 2,
    answer: "ten",
    feedback: { correction: "Kde je ten kufor?", why: "**Kufor** is masculine." },
    ...overrides,
  };
}

const clean = task({
  words: ["Kde", "je", "ten", "kufor?"],
  wrongWordIndex: null,
  answer: "",
});

describe("find the mistake", () => {
  it("strips punctuation from a word", () => {
    expect(wordWithoutPunctuation(["Kde", "je", "ten", "kufor?"], 3)).toBe("kufor");
    expect(wordWithoutPunctuation(["„Ahoj,“"], 0)).toBe("Ahoj");
  });

  it("needs a pick, and a fix when a word is picked", () => {
    expect(canCheckFindMistake(null, "")).toBe(false);
    expect(canCheckFindMistake("no-mistake", "")).toBe(true);
    expect(canCheckFindMistake(2, "  ")).toBe(false);
    expect(canCheckFindMistake(2, "ten")).toBe(true);
  });

  it("grades the pick and the fix", () => {
    expect(gradeFindMistake(task(), 2, "ten")).toBe("correct");
    expect(gradeFindMistake(task(), 2, "Ten")).toBe("correct");
    expect(gradeFindMistake(task(), 2, "to")).toBe("incorrect");
    expect(gradeFindMistake(task(), 3, "kufra")).toBe("incorrect");
    expect(gradeFindMistake(task(), "no-mistake", "")).toBe("incorrect");
    expect(gradeFindMistake(clean, "no-mistake", "")).toBe("correct");
    expect(gradeFindMistake(clean, 2, "tá")).toBe("incorrect");
  });

  it("treats an accent slip in the fix as almost right", () => {
    const feminine = task({
      words: ["Kde", "je", "ten", "taška?"],
      answer: "tá",
      feedback: { correction: "Kde je tá taška?", why: "**Taška** is feminine." },
    });
    expect(gradeFindMistake(feminine, 2, "ta")).toBe("accents");
  });

  it("rebuilds the sentence the learner ends up with", () => {
    expect(findMistakeAttempt(task(), 2, "to")).toBe("Kde je to kufor?");
    expect(findMistakeAttempt(task(), 3, "kufra")).toBe("Kde je tá kufra?");
    expect(findMistakeAttempt(task(), "no-mistake", "")).toBe("Kde je tá kufor?");
    expect(findMistakeAttempt(task(), 2, " ")).toBeUndefined();
    expect(findMistakeAttempt(task(), null, "")).toBeUndefined();
  });

  it("points at the wrong word when the learner looked elsewhere", () => {
    const why = "**Kufor** is masculine.";
    expect(findMistakeFeedbackWhy(task(), 3, why)).toBe(
      "**Kufor** is fine here. The wrong word is **tá**. **Kufor** is masculine.",
    );
    expect(findMistakeFeedbackWhy(task(), "no-mistake", why)).toBe(
      "One word is wrong: **tá**. **Kufor** is masculine.",
    );
    expect(findMistakeFeedbackWhy(task(), 2, why)).toBe(why);
    expect(findMistakeFeedbackWhy(clean, 2, why)).toBe(`Nothing was wrong here. ${why}`);
  });
});
