import { describe, expect, it } from "vitest";

import { words } from "$lib/catalog/entries";
import { foldLine } from "./line-gesture";
import { SCENE_THINGS, thingNamed, thingWithDemonstrative } from "./scene-things";

const all = Object.values(SCENE_THINGS).flat();

describe("scene things", () => {
  it("gives each thing the gender the dictionary does", () => {
    for (const thing of all) {
      const entry = words.find((word) => word.slovak === thing.word && word.gender);
      if (entry) expect([thing.word, entry.gender]).toEqual([thing.word, thing.gender]);
    }
  });

  it("knows each thing by its own nominative", () => {
    for (const [setting, things] of Object.entries(SCENE_THINGS)) {
      for (const thing of things ?? []) {
        expect([setting, thingNamed(foldLine(thing.word), things ?? [])?.id]).toEqual([
          setting,
          thing.id,
        ]);
      }
    }
  });

  it("keeps a table apart from a chair, and a tower apart from taking", () => {
    const cafe = SCENE_THINGS.cafe ?? [];
    const plaza = SCENE_THINGS.plaza ?? [];

    expect(thingNamed("stolicku", cafe)?.id).toBe("stolicka");
    expect(thingNamed("stole", cafe)?.id).toBe("stol");
    expect(thingNamed("vezmem", plaza)).toBeUndefined();
  });

  it("stays inside the backdrop", () => {
    for (const { box, id } of all) {
      expect([id, box.x >= 0 && box.x + box.width <= 982 && box.y >= 0]).toEqual([
        id,
        true,
      ]);
    }
  });

  it("shows the gender with the demonstrative", () => {
    const cafe = SCENE_THINGS.cafe ?? [];
    const named = (id: string) =>
      thingWithDemonstrative(cafe.find((thing) => thing.id === id)!);

    expect(["kolac", "torta", "okno"].map(named)).toEqual([
      "ten koláč",
      "tá torta",
      "to okno",
    ]);
    expect(thingWithDemonstrative(SCENE_THINGS.plaza![1])).toBe("tie hodiny");
  });
});
