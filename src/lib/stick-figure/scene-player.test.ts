import { describe, expect, it } from "vitest";

import { markedText } from "$lib/learning/marked-text";
import { captionRuns, lineTiles, shuffledTiles } from "./caption";
import { planLine } from "./line-plan";
import { wordAt } from "./performance";
import { accusativeOf, findPrompt, findWhy, thatIs } from "./scene-find";
import { SCENE_THINGS, type SceneThing } from "./scene-things";

const thingsById = new Map(
  Object.values(SCENE_THINGS)
    .flat()
    .map((thing) => [thing.id, thing] as const),
);
const thing = (id: string): SceneThing => {
  const found = thingsById.get(id);
  if (!found) throw new Error(`no thing ${id}`);
  return found;
};

describe("captions", () => {
  it("cuts a line at words and marks", () => {
    const line = markedText([
      "A ja si dám ",
      { role: "demonstrative", text: "tamtú" },
      " tortu.",
    ]);
    const runs = captionRuns(line.text, line.marks);

    expect(runs.filter((run) => run.word !== undefined).map((run) => run.text)).toEqual([
      "A",
      "ja",
      "si",
      "dám",
      "tamtú",
      "tortu",
    ]);
    expect(runs.find((run) => run.text === "tamtú")).toMatchObject({
      role: "demonstrative",
      word: 4,
    });
    expect(runs.map((run) => run.text).join("")).toBe(line.text);
  });

  it("times every word and finds the one being said", () => {
    const plan = planLine("Koľko stojí tento koláč?");
    const words = plan.words ?? [];

    expect(words).toHaveLength(4);
    expect(wordAt(plan, words[2].start + 1)).toBe(2);
    expect(wordAt(plan, 0)).toBe(-1);
    expect(wordAt(plan, null)).toBe(-1);
  });

  it("shuffles tiles the same way every time, never into the answer", () => {
    const tiles = lineTiles("Teší ma. Odkiaľ ste?");

    expect(tiles).toEqual(["Teší", "ma.", "Odkiaľ", "ste?"]);
    expect(shuffledTiles(tiles, "line-1")).toEqual(shuffledTiles(tiles, "line-1"));
    expect(shuffledTiles(tiles, "line-1")).not.toEqual(tiles);
    expect([...shuffledTiles(tiles, "line-1")].sort()).toEqual([...tiles].sort());
  });
});

describe("find it", () => {
  it("puts feminine nouns in -a into the accusative and leaves the rest", () => {
    expect(
      ["torta", "lampa", "tabula", "stolicka", "kolac", "okno", "hodiny", "dunaj"].map(
        (id) => accusativeOf(thing(id)),
      ),
    ).toEqual([
      "tortu",
      "lampu",
      "tabuľu",
      "stoličku",
      "koláč",
      "okno",
      "hodiny",
      "Dunaj",
    ]);
  });

  it("asks in three ways", () => {
    expect(findPrompt(thing("torta"), "where").slovak).toBe("Kde je torta?");
    expect(findPrompt(thing("hodiny"), "where").slovak).toBe("Kde sú hodiny?");
    expect(findPrompt(thing("torta"), "find")).toMatchObject({
      english: "Find the layer cake.",
      marks: [{ start: 10, end: 11, role: "ending" }],
      slovak: "Nájdi tortu.",
    });
    expect(findPrompt(thing("okno"), "point").slovak).toBe("Ukáž na to okno.");
    expect(findPrompt(thing("lampa"), "point")).toMatchObject({
      marks: [
        { start: 8, end: 10, role: "demonstrative" },
        { start: 15, end: 16, role: "ending" },
      ],
      slovak: "Ukáž na tú lampu.",
    });
    expect(findPrompt(thing("dunaj"), "point").slovak).toBe("Ukáž na Dunaj.");
  });

  it("names what was tapped and says why the form changed", () => {
    expect(thatIs(thing("okno"))).toBe("To je okno.");
    expect(thatIs(thing("hodiny"))).toBe("To sú hodiny.");
    expect(findWhy(thing("torta"), "find")).toContain("**torta** → **tortu**");
    expect(findWhy(thing("kolac"), "find")).toContain("keeps its form");
    expect(findWhy(thing("torta"), "where")).toBeUndefined();
  });
});
