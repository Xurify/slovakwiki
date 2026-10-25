import { describe, expect, it } from "vitest";

import { practiceItemHref } from "../practice";
import { segmentsFromMarks } from "$lib/learning/marked-text";
import { grammarEntries } from "./grammar";
import { grammarExamples } from "./grammar-pattern";

const contrastTopics = grammarEntries.filter((topic) => topic.contrasts);

const allFrames = (topic: (typeof contrastTopics)[number]) => [
  ...topic.contrasts!.frames,
  ...(topic.contrasts!.more ?? []),
];

describe("grammar contrast cards", () => {
  it("covers the topics where the choice is the hard part", () => {
    expect(contrastTopics.map((topic) => topic.slug).toSorted()).toEqual([
      "aspect",
      "conditional",
      "demonstratives",
      "future-tense",
      "imperative",
      "motion-verbs",
      "past-tense",
      "possessives",
      "reflexive-verbs",
      "telling-time",
      "ty-vs-vy",
    ]);
  });

  it("says one sentence two or three ways, with the changing word marked", () => {
    for (const topic of contrastTopics) {
      for (const frame of allFrames(topic)) {
        expect(frame.choices.length, frame.question).toBeGreaterThanOrEqual(2);
        expect(new Set(frame.choices.map((choice) => choice.slovak.text)).size).toBe(
          frame.choices.length,
        );

        for (const choice of frame.choices) {
          const marked = segmentsFromMarks(choice.slovak.text, choice.slovak.marks);
          expect(
            marked.some((segment) => segment.role),
            choice.slovak.text,
          ).toBe(true);
        }
      }
    }
  });

  it("lights a different part of the scene for each sentence", () => {
    for (const topic of contrastTopics) {
      for (const frame of allFrames(topic)) {
        const cues = frame.choices.map((choice) => choice.at);
        if (!frame.scene) {
          expect(cues, frame.question).toEqual(cues.map(() => undefined));
          continue;
        }
        expect(cues, frame.question).not.toContain(undefined);
        expect(new Set(cues).size, frame.question).toBe(cues.length);
      }
    }
  });

  it("keeps each situation to a few lowercase words", () => {
    for (const topic of contrastTopics) {
      for (const choice of allFrames(topic).flatMap((frame) => frame.choices)) {
        expect(choice.when, choice.slovak.text).not.toMatch(/[.!?]$/);
        expect(choice.when.length, choice.slovak.text).toBeLessThanOrEqual(48);
      }
    }
  });
});

describe("grammar example practice links", () => {
  it("point at practice items that exist", () => {
    const missing = grammarEntries.flatMap((topic) =>
      grammarExamples(topic)
        .filter((example) => example.practiceItemId)
        .filter((example) => !practiceItemHref(example.practiceItemId!))
        .map((example) => `${topic.slug}:${example.practiceItemId}`),
    );

    expect(missing).toEqual([]);
  });
});
