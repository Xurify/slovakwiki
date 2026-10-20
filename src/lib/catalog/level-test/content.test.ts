import { describe, expect, it } from "vitest";

import items from "../../../../content/level-test/items.json";
import {
  fullReadingPassage,
  spanOfSubstring,
  tokenizePassage,
} from "$lib/level-test/passage";
import type { CTestPart } from "$lib/level-test/types";

import { listeningSets } from "./listening";
import { ctestPassages } from "./passages";
import { readingSets } from "./reading";

describe("interactive reading content", () => {
  for (const set of readingSets) {
    it(`${set.id}: answer keys point at an option`, () => {
      const questions = [
        ...set.opening.filter((part) => typeof part !== "string"),
        set.missingSentence,
        set.mainIdea,
        set.title,
      ];
      for (const question of questions) {
        expect(question.options[question.answer]).toBeDefined();
        expect(new Set(question.options).size).toBe(question.options.length);
      }
    });

    it(`${set.id}: highlight answers appear in the passage`, () => {
      const passage = fullReadingPassage({ ...set, difficulty: 0 });
      const tokens = tokenizePassage(passage);
      for (const highlight of set.highlights) {
        expect(
          spanOfSubstring(tokens, passage, highlight.answer),
          highlight.answer,
        ).not.toBeNull();
      }
    });
  }
});

describe("interactive listening content", () => {
  for (const set of listeningSets) {
    it(`${set.id}: every turn has one keyed reply`, () => {
      for (const turn of set.turns) {
        expect(turn.options[turn.answer]).toBeDefined();
      }
    });
  }
});

describe("generated items", () => {
  it("rebuild each Read and Complete passage exactly (re-run the bank build if not)", () => {
    for (const passage of ctestPassages) {
      const item = items.readComplete.find((entry) => entry.id === `rc-${passage.id}`);
      expect(item, passage.id).toBeDefined();
      const rebuilt = (item?.parts as CTestPart[])
        .map((part) => (typeof part === "string" ? part : part.prefix + part.missing))
        .join("");
      expect(rebuilt).toBe(passage.text);
    }
  });

  it("never reuses an id", () => {
    const ids = [
      ...items.readSelect,
      ...items.listenSelect,
      ...items.fillBlank,
      ...items.listenType,
      ...items.readComplete,
      ...items.readAloud,
    ].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never shows a pseudoword that is also a real item", () => {
    const words = [...items.readSelect, ...items.listenSelect];
    const real = new Set(words.filter((item) => item.real).map((item) => item.word));
    expect(words.filter((item) => !item.real && real.has(item.word))).toEqual([]);
  });
});
