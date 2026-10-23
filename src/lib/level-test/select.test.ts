import { describe, expect, it } from "vitest";

import { seededRandom } from "./plan";
import { pickFillBlank, pickListenLength } from "./select";
import type { FillBlankItem, ListenLengthItem, StudyArea, WordClass } from "./types";

function item(id: string, wordClass: WordClass, difficulty = 30): FillBlankItem {
  return {
    id,
    format: "fillBlank",
    difficulty,
    before: "",
    prefix: "",
    missing: "",
    after: "",
    english: "",
    tag: { class: wordClass },
  };
}

describe("pickFillBlank", () => {
  const items = [
    item("n1", "noun"),
    item("n2", "noun"),
    item("v1", "verb"),
    item("a1", "adjective", 34),
  ];

  it("picks the word class with the least evidence so far", () => {
    const coverage = new Map<StudyArea, number>([
      ["nouns", 12],
      ["conjugation", 9],
      ["adjectives", 1],
    ]);
    const picked = pickFillBlank(items, 30, new Set(), coverage, seededRandom(1));
    expect(picked?.id).toBe("a1");
  });

  it("falls back to the nearest items once every class has enough", () => {
    const coverage = new Map<StudyArea, number>([
      ["nouns", 12],
      ["conjugation", 9],
      ["adjectives", 6],
    ]);
    const picked = pickFillBlank(items, 30, new Set(), coverage, seededRandom(1));
    expect(picked).toBeDefined();
  });
});

describe("pickListenLength", () => {
  const pairs = [
    ["mala", "malá"],
    ["dobre", "dobré"],
    ["rad", "rád"],
    ["pas", "pás"],
    ["veci", "vecí"],
    ["deti", "detí"],
    ["slova", "slová"],
  ];
  const items: ListenLengthItem[] = pairs.flatMap(([short = "", long = ""]) =>
    [short, long].map((word) => ({
      id: `ll-${word}`,
      format: "listenLength" as const,
      difficulty: 25,
      word,
      short,
      long,
      audio: "",
    })),
  );

  it("never plays both words of one pair", () => {
    const grid = pickListenLength(items, 25, new Set(), seededRandom(5));
    expect(grid).toHaveLength(6);
    expect(new Set(grid.map((item) => item.short)).size).toBe(6);
  });

  it("mixes short and long words", () => {
    const grid = pickListenLength(items, 25, new Set(), seededRandom(6));
    const long = grid.filter((item) => item.word === item.long).length;
    expect(long).toBe(3);
  });
});
