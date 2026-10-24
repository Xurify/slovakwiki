import { describe, expect, it } from "vitest";

import { grammarEntries } from "./grammar";
import {
  grammarNeighbors,
  grammarReadingOrder,
  grammarTopicsInGroup,
} from "./grammar-path";

describe("grammarReadingOrder", () => {
  it("lists every topic once", () => {
    expect(grammarReadingOrder).toHaveLength(grammarEntries.length);
    expect(new Set(grammarReadingOrder.map((topic) => topic.slug)).size).toBe(
      grammarEntries.length,
    );
  });

  it("sorts topics inside an area by order", () => {
    expect(grammarTopicsInGroup("Nouns").map((topic) => topic.slug)).toEqual([
      "grammatical-gender",
      "cases-overview",
      "demonstratives",
      "possessives",
    ]);
  });

  it("walks the verbs from tenses to moods", () => {
    expect(grammarTopicsInGroup("Verbs").map((topic) => topic.slug)).toEqual([
      "present-tense",
      "byt-present",
      "mat-present",
      "past-tense",
      "aspect",
      "future-tense",
      "motion-verbs",
      "imperative",
      "conditional",
      "reflexive-verbs",
    ]);
  });
});

describe("grammarNeighbors", () => {
  it("crosses area boundaries", () => {
    const { previous, next } = grammarNeighbors("possessives");
    expect(previous?.slug).toBe("demonstratives");
    expect(next?.slug).toBe("present-tense");
  });

  it("has no previous topic at the start and no next topic at the end", () => {
    expect(grammarNeighbors(grammarReadingOrder[0]!.slug).previous).toBeUndefined();
    expect(grammarNeighbors(grammarReadingOrder.at(-1)!.slug).next).toBeUndefined();
  });

  it("returns nothing for unknown slugs", () => {
    expect(grammarNeighbors("nope")).toEqual({});
  });
});
