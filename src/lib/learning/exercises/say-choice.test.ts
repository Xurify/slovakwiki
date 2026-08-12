import { describe, expect, it } from "vitest";

import { isSayChoiceCorrect, sayChoiceAnswerIds } from "./say-choice";

describe("sayChoiceAnswerIds", () => {
  it("prefers answerIds when present", () => {
    expect(
      sayChoiceAnswerIds({
        answerId: "a",
        answerIds: ["a", "b"],
        choices: [],
      }),
    ).toEqual(["a", "b"]);
  });

  it("falls back to answerId", () => {
    expect(
      sayChoiceAnswerIds({
        answerId: "a",
        choices: [],
      }),
    ).toEqual(["a"]);
  });
});

describe("isSayChoiceCorrect", () => {
  it("accepts any id in answerIds", () => {
    const gate = {
      answerIds: ["yes-am", "yes-short"],
      choices: [],
    };
    expect(isSayChoiceCorrect("yes-am", gate)).toBe(true);
    expect(isSayChoiceCorrect("yes-short", gate)).toBe(true);
    expect(isSayChoiceCorrect("no", gate)).toBe(false);
  });

  it("uses answerId when answerIds omitted", () => {
    expect(isSayChoiceCorrect("formal", { answerId: "formal", choices: [] })).toBe(true);
    expect(isSayChoiceCorrect("informal", { answerId: "formal", choices: [] })).toBe(
      false,
    );
  });
});
