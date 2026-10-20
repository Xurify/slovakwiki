import { describe, expect, it } from "vitest";

import { DEFAULT_PRIOR, estimateAbility } from "./estimate";
import { cefrForScore, probabilityCorrect, progressWithinLevel } from "./scale";

describe("probabilityCorrect", () => {
  it("is one half when ability meets difficulty", () => {
    expect(probabilityCorrect(40, 40)).toBeCloseTo(0.5);
  });

  it("gives about 88% one CEFR step above the item", () => {
    expect(probabilityCorrect(60, 40)).toBeCloseTo(0.881, 3);
  });

  it("never drops below the guessing floor", () => {
    expect(probabilityCorrect(0, 100, 0.5)).toBeGreaterThanOrEqual(0.5);
  });
});

describe("cefrForScore", () => {
  it("puts band edges halfway between anchors", () => {
    expect(cefrForScore(9.9)).toBe("A1");
    expect(cefrForScore(10)).toBe("A2");
    expect(cefrForScore(49)).toBe("B1");
    expect(cefrForScore(95)).toBe("C2");
    expect(cefrForScore(-5)).toBe("A1");
  });

  it("measures progress through the band", () => {
    expect(progressWithinLevel(10)).toBe(0);
    expect(progressWithinLevel(20)).toBeCloseTo(0.5);
  });
});

describe("estimateAbility", () => {
  it("returns the prior, cut off at the bottom of the scale, with no responses", () => {
    const estimate = estimateAbility([]);
    expect(estimate.theta).toBeGreaterThan(DEFAULT_PRIOR.mean);
    expect(estimate.theta).toBeLessThan(DEFAULT_PRIOR.mean + DEFAULT_PRIOR.sd / 2);
    expect(estimate.count).toBe(0);
  });

  it("rises with right answers and falls with wrong ones", () => {
    const right = estimateAbility([
      { difficulty: 40, score: 1 },
      { difficulty: 50, score: 1 },
    ]);
    const wrong = estimateAbility([
      { difficulty: 40, score: 0 },
      { difficulty: 50, score: 0 },
    ]);
    expect(right.theta).toBeGreaterThan(DEFAULT_PRIOR.mean);
    expect(wrong.theta).toBeLessThan(DEFAULT_PRIOR.mean);
  });

  it("stays finite when every answer is right", () => {
    const estimate = estimateAbility(
      Array.from({ length: 20 }, () => ({ difficulty: 90, score: 1 })),
    );
    expect(Number.isFinite(estimate.theta)).toBe(true);
    expect(estimate.theta).toBeGreaterThan(85);
  });

  it("recovers a simulated learner's level", () => {
    const trueTheta = 55;
    const observations = Array.from({ length: 40 }, (_, index) => {
      const difficulty = 30 + (index % 9) * 6;
      return { difficulty, score: probabilityCorrect(trueTheta, difficulty) };
    });
    const estimate = estimateAbility(observations);
    expect(Math.abs(estimate.theta - trueTheta)).toBeLessThan(4);
    expect(estimate.se).toBeLessThan(DEFAULT_PRIOR.sd);
  });

  it("treats a lucky guess as weaker evidence", () => {
    const withGuess = estimateAbility([{ difficulty: 60, score: 1, guess: 0.5 }]);
    const withoutGuess = estimateAbility([{ difficulty: 60, score: 1 }]);
    expect(withGuess.theta).toBeLessThan(withoutGuess.theta);
  });
});
