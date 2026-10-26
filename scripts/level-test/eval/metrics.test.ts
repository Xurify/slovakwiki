import { describe, expect, it } from "vitest";

import type { AiScore } from "../../../src/lib/level-test/types";
import { placeMutations } from "./build";
import { fixesError, matchIssue, summarize } from "./metrics";
import type { EvalCase, EvalResult } from "./types";

const clean = "Bývam v Košiciach. Páči sa mi tu.";
const { text, placed } = placeMutations(clean, [
  { topic: "nounEndings", from: "v Košiciach", to: "v Košice" },
  { topic: "wordOrder", from: "Páči sa mi", to: "Sa mi páči" },
]);

function score(overrides: Partial<AiScore>): AiScore {
  return {
    score: 20,
    level: "A2",
    criteria: { content: 20, coherence: 20, grammar: 20, lexis: 20 },
    feedback: "",
    issues: [],
    usage: {},
    ...overrides,
  };
}

const cases: EvalCase[] = [
  {
    id: "a/clean",
    group: "a",
    variant: "clean",
    split: "test",
    source: "claude",
    targetLevel: "A2",
    request: { kind: "writingSample", prompt: "p", response: clean },
    errors: [],
    expect: { noIssues: true },
  },
  {
    id: "a/errors-2",
    group: "a",
    variant: "errors",
    split: "test",
    source: "claude",
    targetLevel: "A2",
    request: { kind: "writingSample", prompt: "p", response: text },
    errors: placed,
    expect: {},
  },
  {
    id: "adv",
    group: "adv",
    variant: "adversarial",
    split: "test",
    source: "claude",
    request: { kind: "writingSample", prompt: "p", response: "neviem" },
    errors: [],
    expect: { maxScore: 10 },
  },
];

describe("matchIssue", () => {
  it("finds the error the quote overlaps, ignoring case, quotes and ellipses", () => {
    const issue = {
      topic: "nounEndings" as const,
      wrote: "„v košice…“",
      correct: "v Košiciach",
    };
    expect(matchIssue(text, issue, placed)?.from).toBe("v Košiciach");
    expect(matchIssue(text, { ...issue, wrote: "Bývam" }, placed)).toBeNull();
  });
});

describe("fixesError", () => {
  it("accepts a correction that restores the original words", () => {
    expect(fixesError("Páči sa mi tu.", placed[1]!)).toBe(true);
    expect(fixesError("v Košiciach", placed[0]!)).toBe(true);
    expect(fixesError("v Košiciam", placed[0]!)).toBe(false);
  });
});

describe("summarize", () => {
  it("scores false corrections, recall, rules and Czech in one pass", () => {
    const results: EvalResult[] = [
      {
        caseId: "a/clean",
        model: "m",
        repeat: 0,
        ms: 1,
        score: score({ issues: [{ topic: "vocabulary", wrote: "tu", correct: "tu" }] }),
      },
      {
        caseId: "a/errors-2",
        model: "m",
        repeat: 0,
        ms: 1,
        score: score({
          criteria: { content: 20, coherence: 20, grammar: 30, lexis: 20 },
          issues: [
            { topic: "nounEndings", wrote: "v Košice", correct: "v Košiciach" },
            { topic: "vocabulary", wrote: "Bývam", correct: "Já bydlím" },
          ],
          usage: { nounEndings: { right: 0, wrong: 1 } },
        }),
      },
      { caseId: "adv", model: "m", repeat: 0, ms: 1, score: score({ score: 30 }) },
    ];
    const [summary] = summarize(cases, results);
    const value = (name: string) =>
      summary!.checks.find((check) => check.name.startsWith(name))?.value;
    expect(value("False corrections")).toBe(1);
    expect(value("Recall of known errors")).toBe(0.5);
    expect(value("Usage counts")).toBe(0.5);
    expect(value("Rule cases")).toBe(0);
    expect(value("More errors, higher grammar")).toBe(1);
    expect(value("Czech in corrections")).toBe(1);
    expect(summary!.misses.map((miss) => miss.caseId)).toEqual(["a/clean", "adv"]);
  });
});
