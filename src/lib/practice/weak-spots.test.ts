import { describe, expect, it } from "vitest";

import { DEMONSTRATIVE_KINDS } from "$lib/learning/demonstratives/session";
import { practiceRulesForGrammarTopic } from "./grammar-practice-rules";
import type { ReviewMemory } from "./review-memory";
import { weakSpotsWorstFirst, type PracticeRule } from "./weak-spots";

const rules: PracticeRule[] = ["agreement", "plural", "cases", "untouched"].map(
  (formId) => ({ formId, label: formId, practiceHref: `/practice/x?at=${formId}` }),
);

const memory: ReviewMemory = {
  version: 1,
  forms: {
    agreement: { seen: 5, missed: 3, gapIndex: 0, dueDay: "2026-03-10" },
    plural: { seen: 1, missed: 1, gapIndex: 1, dueDay: "2026-03-13" },
    cases: { seen: 4, missed: 0, gapIndex: 0 },
  },
};

describe("weakSpotsWorstFirst", () => {
  it("lists only practised rules, most missed share first", () => {
    const spots = weakSpotsWorstFirst(memory, rules, "2026-03-10");

    expect(spots.map((spot) => spot.formId)).toEqual(["plural", "agreement", "cases"]);
  });

  it("counts the days until each rule comes back", () => {
    const spots = weakSpotsWorstFirst(memory, rules, "2026-03-11");
    const byId = new Map(spots.map((spot) => [spot.formId, spot.daysUntilReview]));

    expect(byId.get("agreement")).toBe(0);
    expect(byId.get("plural")).toBe(2);
    expect(byId.get("cases")).toBeNull();
  });
});

describe("practiceRulesForGrammarTopic", () => {
  it("covers every demonstratives kind with a practice link", () => {
    const demonstrativeRules = practiceRulesForGrammarTopic("demonstratives");

    expect(demonstrativeRules.map((rule) => rule.formId).sort()).toEqual(
      [...DEMONSTRATIVE_KINDS].sort(),
    );
    for (const rule of demonstrativeRules) {
      expect(rule.practiceHref).toBe(
        `/practice/demonstratives?at=${encodeURIComponent(rule.formId)}`,
      );
    }
  });

  it("has nothing for topics without generated practice", () => {
    expect(practiceRulesForGrammarTopic("word-order")).toEqual([]);
  });
});
