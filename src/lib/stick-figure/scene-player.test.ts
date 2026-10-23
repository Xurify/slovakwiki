import { describe, expect, it } from "vitest";

import { markedText } from "$lib/learning/marked-text";
import { captionRuns, lineTiles, shuffledTiles } from "./caption";
import { planLine } from "./line-plan";
import { wordAt } from "./performance";
import {
  accusativeOf,
  accusativeRule,
  findAsks,
  findEnglish,
  findPrompt,
  findWhy,
  thatIs,
} from "./scene-find";
import { PLACES } from "./places";
import type { SceneThing } from "./thing-words";

const thingsById = new Map(
  Object.values(PLACES)
    .flatMap((place) => place.things)
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
    expect(findPrompt(thing("torta"), "point")).toMatchObject({
      english: "Point at that layer cake.",
      marks: [
        { start: 8, end: 10, role: "demonstrative" },
        { start: 15, end: 16, role: "ending" },
      ],
      slovak: "Ukáž na tú tortu.",
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

  it("puts a man into the accusative: toho muža", () => {
    expect(findPrompt(thing("muz"), "point")).toMatchObject({
      marks: [
        { start: 8, end: 12, role: "demonstrative" },
        { start: 16, end: 17, role: "ending" },
      ],
      slovak: "Ukáž na toho muža.",
    });
    expect(findPrompt(thing("zena"), "point").slovak).toBe("Ukáž na tú ženu.");
    expect(findWhy(thing("muz"), "point")).toContain("**muž** → **muža**");
  });

  it("keeps plurals plural", () => {
    expect(accusativeOf(thing("jahody"))).toBe("jahody");
    expect(findPrompt(thing("jahody"), "where")).toMatchObject({
      english: "Where are the strawberries?",
      slovak: "Kde sú jahody?",
    });
    expect(findPrompt(thing("jahody"), "point")).toMatchObject({
      english: "Point at those strawberries.",
      slovak: "Ukáž na tie jahody.",
    });
    expect(findPrompt(thing("dvere"), "point").slovak).toBe("Ukáž na tie dvere.");
    expect(thatIs(thing("jahody"))).toBe("To sú jahody.");
    expect(findWhy(thing("jahody"), "point")).toContain("plural things keep their form");
  });

  it("names what was tapped and says why the form changed", () => {
    expect(thatIs(thing("okno"))).toBe("To je okno.");
    expect(thatIs(thing("hodiny"))).toBe("To sú hodiny.");
    expect(findWhy(thing("torta"), "point")).toContain("**torta** → **tortu**");
    expect(findWhy(thing("kolac"), "point")).toContain("keeps its form");
    expect(findWhy(thing("torta"), "where")).toBeUndefined();
  });

  it("says each thing's name in English and how the accusative treats it", () => {
    expect(findEnglish(thing("okno"), "wrong")).toBe("That is the window.");
    expect(findEnglish(thing("jahody"), "shown")).toBe("Here are the strawberries.");
    expect(accusativeRule(thing("torta"))).toBe("feminine in -a: -a becomes -u");
    expect(accusativeRule(thing("muz"))).toBe("a man or an animal: adds -a");
    expect(accusativeRule(thing("jahody"))).toBe("plural: stays the same");
    expect(accusativeRule(thing("okno"))).toBe("neuter: stays the same");
    expect(accusativeRule(thing("kolac"))).toBe("masculine thing: stays the same");
  });

  it("mixes both forms in one round, always pointing where the form changes", () => {
    expect(
      findAsks(["kolac", "torta", "okno", "muz", "jahody", "dvere"].map(thing)),
    ).toEqual(["where", "point", "point", "point", "where", "point"]);
  });
});
