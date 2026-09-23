import { describe, expect, it } from "vitest";
import { answerGloss, answeredInputTone, sessionSubtitle } from "./practice-session-ui";

describe("answerGloss", () => {
  it("drops a gloss that repeats the English prompt", () => {
    expect(
      answerGloss("Hello; good day.", "Hello; good day.", undefined),
    ).toBeUndefined();
    expect(answerGloss("I am from Canada", "I am  from Canada.", "en")).toBeUndefined();
  });

  it("keeps the gloss when the prompt differs or is Slovak", () => {
    expect(answerGloss("Hello. My name is Alex.", "Build your reply", "en")).toBe(
      "Hello. My name is Alex.",
    );
    expect(answerGloss("Where are you from?", "Where are you from?", "sk")).toBe(
      "Where are you from?",
    );
    expect(answerGloss(undefined, "Hello; good day.", "en")).toBeUndefined();
  });
});

describe("sessionSubtitle", () => {
  it("names the track and set position", () => {
    expect(
      sessionSubtitle({
        lessonHref: null,
        nextSet: null,
        step: 2,
        stepCount: 5,
        trackTitle: "Everyday Slovak",
      }),
    ).toBe("Everyday Slovak · Set 2 of 5");
    expect(sessionSubtitle(undefined)).toBeUndefined();
  });
});

describe("answeredInputTone", () => {
  it("only tints checked, unrevealed answers", () => {
    expect(answeredInputTone(false, "correct", false)).toBeNull();
    expect(answeredInputTone(true, "accents", false)).toBe("accents");
    expect(answeredInputTone(true, "incorrect", true)).toBeNull();
  });
});
