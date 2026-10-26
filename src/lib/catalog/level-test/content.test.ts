import { describe, expect, it } from "vitest";

import items from "../../../../content/level-test/items.json";
import {
  fullReadingPassage,
  spanOfSubstring,
  tokenizePassage,
} from "$lib/level-test/passage";
import {
  foldDiacritics,
  gradeDictation,
  numberValue,
  tokenizeWords,
} from "$lib/level-test/grade";
import type { CTestPart } from "$lib/level-test/types";

import { aspectItems } from "./aspect";
import { listeningSets } from "./listening";
import { ctestPassages } from "./passages";
import { readingSets } from "./reading";
import { cliticItems } from "./word-order";
import { tagWord } from "./word-tags";

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

    it(`${set.id}: has an aspect gap and a word-order gap`, () => {
      const areas = set.opening.flatMap((part) =>
        typeof part === "string" ? [] : [part.area],
      );
      expect(areas).toContain("aspect");
      expect(areas).toContain("wordOrder");
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

describe("Choose the Verb content", () => {
  it("offers two different forms and keys one", () => {
    for (const item of aspectItems) {
      expect(item.options[0], item.id).not.toBe(item.options[1]);
      expect([0, 1], item.id).toContain(item.answer);
    }
  });

  it("never repeats an id or a verb pair", () => {
    expect(new Set(aspectItems.map((item) => item.id)).size).toBe(aspectItems.length);
    const pairs = aspectItems.map((item) => item.options.join("/"));
    expect(new Set(pairs).size).toBe(pairs.length);
  });
});

describe("Where Does It Go content", () => {
  it("keys a gap inside the sentence", () => {
    for (const item of cliticItems) {
      expect(item.words.length, item.id).toBeGreaterThan(1);
      expect(item.answer, item.id).toBeGreaterThan(0);
      expect(item.answer, item.id).toBeLessThan(item.words.length + 1);
      expect(
        item.words.every((word) => word && !/\s/u.test(word)),
        item.id,
      ).toBe(true);
    }
  });

  it("never repeats an id", () => {
    expect(new Set(cliticItems.map((item) => item.id)).size).toBe(cliticItems.length);
  });
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
      ...items.listenLength,
      ...items.readComplete,
      ...items.readAloud,
    ].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps both words of every Short or Long pair, one vowel apart in length", () => {
    for (const item of items.listenLength) {
      expect([item.short, item.long]).toContain(item.word);
      expect(foldDiacritics(item.short)).toBe(foldDiacritics(item.long));
      const partner = item.word === item.short ? item.long : item.short;
      expect(
        items.listenLength.some((other) => other.word === partner),
        partner,
      ).toBe(true);
    }
  });

  it("lets digits stand for every number a Listen and Type sentence says", () => {
    for (const item of items.listenType) {
      const words = tokenizeWords(item.text);
      words.forEach((word, index) => {
        if (
          tagWord(word, { previous: words[index - 1], next: words[index + 1] }).class !==
          "numeral"
        )
          return;
        const value = numberValue(word);
        expect(value, `${item.id}: ${word}`).not.toBeNull();
        const typed = item.text.replace(word, String(value));
        expect(gradeDictation(item.text, typed), `${item.id}: ${typed}`).toBe(1);
      });
    }
  });

  it("never shows a pseudoword that is also a real item", () => {
    const words = [...items.readSelect, ...items.listenSelect];
    const real = new Set(words.filter((item) => item.real).map((item) => item.word));
    expect(words.filter((item) => !item.real && real.has(item.word))).toEqual([]);
  });
});
