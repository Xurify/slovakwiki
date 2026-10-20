import { describe, expect, it } from "vitest";

import { practiceItemHref } from "../practice";
import { segmentsFromMarks } from "$lib/learning/marked-text";
import { grammarEntries } from "./grammar";

const contrastTopics = grammarEntries.filter((topic) => topic.contrasts);

describe("grammar contrast cards", () => {
  it("covers the topics where the choice is the hard part", () => {
    expect(contrastTopics.map((topic) => topic.slug).toSorted()).toEqual([
      "aspect",
      "demonstratives",
      "possessives",
      "telling-time",
      "ty-vs-vy",
    ]);
  });

  it("pairs two different sentences, each with the word it turns on marked", () => {
    for (const topic of contrastTopics) {
      for (const {
        choices: [left, right],
      } of topic.contrasts!.pairs) {
        expect(left.slovak.text, topic.slug).not.toBe(right.slovak.text);

        for (const choice of [left, right]) {
          const marked = segmentsFromMarks(choice.slovak.text, choice.slovak.marks);
          expect(
            marked.some((segment) => segment.role),
            choice.slovak.text,
          ).toBe(true);
        }
      }
    }
  });

  it("lights a different stop on the scale for each side", () => {
    for (const topic of contrastTopics) {
      for (const { scale, choices } of topic.contrasts!.pairs) {
        if (!scale) {
          expect(choices.some((choice) => choice.at)).toBe(false);
          continue;
        }

        const [left, right] = choices;
        expect(scale, left.slovak.text).toContain(left.at);
        expect(scale, right.slovak.text).toContain(right.at);
        expect(left.at, left.slovak.text).not.toBe(right.at);
      }
    }
  });

  it("writes each situation to follow “If …”", () => {
    for (const topic of contrastTopics) {
      for (const choice of topic.contrasts!.pairs.flatMap((pair) => pair.choices)) {
        expect(choice.when, choice.slovak.text).toMatch(/^\p{Ll}/u);
        expect(choice.when, choice.slovak.text).not.toMatch(/[.!?]$/);
      }
    }
  });
});

describe("grammar example practice links", () => {
  it("point at practice items that exist", () => {
    const missing = grammarEntries.flatMap((topic) =>
      [
        ...topic.examples,
        ...(topic.pattern.examples ?? []),
        ...(topic.morePatterns ?? []).flatMap((pattern) => pattern.examples ?? []),
      ]
        .filter((example) => example.practiceItemId)
        .filter((example) => !practiceItemHref(example.practiceItemId!))
        .map((example) => `${topic.slug}:${example.practiceItemId}`),
    );

    expect(missing).toEqual([]);
  });
});
