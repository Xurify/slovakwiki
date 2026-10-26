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

describe("pickFillBlank for a strong learner", () => {
  it("reaches an easier item for a part with too few answers", () => {
    const items = [item("n1", "noun", 80), item("p1", "pronoun", 55)];
    const coverage = new Map<StudyArea, number>([
      ["nouns", 4],
      ["pronouns", 1],
    ]);
    expect(pickFillBlank(items, 80, new Set(), coverage, seededRandom(2))?.id).toBe("p1");
  });

  it("stays near the target once that part has enough", () => {
    const items = [item("n1", "noun", 80), item("p1", "pronoun", 55)];
    const coverage = new Map<StudyArea, number>([
      ["nouns", 4],
      ["pronouns", 3],
    ]);
    expect(pickFillBlank(items, 80, new Set(), coverage, seededRandom(2))?.id).toBe("n1");
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

  it("does not play the partner of a clip from an earlier screen", () => {
    const used = new Set(["ll-mala", "ll-dobré"]);
    const grid = pickListenLength(items, 25, used, seededRandom(5));
    expect(grid.map((item) => item.short)).not.toContain("mala");
    expect(grid.map((item) => item.short)).not.toContain("dobre");
  });

  it("mixes short and long words", () => {
    const grid = pickListenLength(items, 25, new Set(), seededRandom(6));
    const long = grid.filter((item) => item.word === item.long).length;
    expect(long).toBe(3);
  });
});
