import { describe, expect, it } from "vitest";

import { words } from "$lib/catalog/entries";
import { foldLine } from "./line-gesture";
import {
  SCENE_THINGS,
  linePoints,
  thingBoxes,
  thingNamed,
  thingWithDemonstrative,
  thingsInView,
} from "./scene-things";

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

describe("this one and that one", () => {
  const market = SCENE_THINGS.market ?? [];
  const home = SCENE_THINGS.home ?? [];
  const targets = (points: ReturnType<typeof linePoints>) =>
    points.map(({ reach, target }) =>
      target.kind === "thing" ? `${target.id}#${target.copy}:${reach ?? "-"}` : "prop",
    );

  it("points tento at the near copy and tamten at the far one", () => {
    expect(targets(linePoints("Koľko stojí tento syr?", market))).toEqual(["syr#0:near"]);
    expect(targets(linePoints("Aha. A tamten syr?", market))).toEqual(["syr#1:far"]);
    expect(
      targets(linePoints("Tieto jahody sú z Rakúska. Tamtie sú zo Slovenska.", market)),
    ).toEqual(["jahody#0:near", "jahody#1:far"]);
  });

  it("points a demonstrative on its own back at the noun it agrees with", () => {
    const syr = [{ copy: 1, id: "syr" }];
    expect(targets(linePoints("Tamten je lacnejší.", market, undefined, syr))).toEqual([
      "syr#1:far",
    ]);
    expect(targets(linePoints("Dobre, dám si tamten.", market, undefined, syr))).toEqual([
      "syr#1:far",
    ]);
    // Tamtie is plural, so it cannot stand for the cheese.
    expect(linePoints("Tamtie sú zo Slovenska.", market, undefined, syr)).toEqual([]);
    // A bare toto is "this", not a noun said before.
    expect(linePoints("A čo je toto?", market, undefined, syr)).toEqual([]);
  });

  it("keeps pointing at the copy named last, and starts on the main one", () => {
    const far = [{ copy: 1, id: "jahody" }];
    expect(
      targets(linePoints("Anna vždy kupuje slovenské jahody.", market, undefined, far)),
    ).toEqual(["jahody#1:-"]);

    const [main] = targets(linePoints("Je v tej taške.", home));
    const bag = home.find((thing) => thing.id === "taska")!;
    expect(main).toBe("taska#0:-");
    expect(bag.box.x).toBeLessThan(bag.more![0].x);
    const bags = [
      { copy: 0, id: "taska" },
      { copy: 1, id: "taska" },
    ];
    expect(
      targets(linePoints("Nie, v tamtej. Pri tom okne.", home, undefined, bags)),
    ).toEqual([`taska#${bag.twins!.far}:far`, "okno#undefined:-"]);
  });

  it("points again at the same thing after a sentence about something else", () => {
    expect(targets(linePoints("Syr. Dobrý deň! Koľko stojí tento syr?", market))).toEqual(
      ["syr#0:-", "syr#0:near"],
    );
  });

  it("points at keys held up only when the line names them", () => {
    const keys = { holder: "marek" as const, prop: "keys" as const };
    expect(linePoints("Toho muža poznáš.", home, keys)).toEqual([]);
    expect(targets(linePoints("A tieto kľúče už nestrácaj!", home, keys))).toEqual([
      "prop",
    ]);
    expect(
      targets(linePoints("Kto je ten muž?", home, { holder: "anna", prop: "camera" })),
    ).toEqual(["prop"]);
  });
});

describe("things in view", () => {
  it("leaves out what a phone slices off", () => {
    const cafe = SCENE_THINGS.cafe ?? [];
    const ids = (width: number, height: number) =>
      thingsInView(cafe, "cafe", width, height).map(({ id }) => id);

    expect(ids(1040, 300)).toEqual(cafe.map(({ id }) => id));
    expect(ids(366, 240)).toContain("kolac");
    expect(ids(366, 240)).not.toContain("okno");
    expect(ids(0, 0)).toHaveLength(cafe.length);
  });

  it("keeps both bags at home and Lucia's whole stall on a phone", () => {
    const at = (setting: "home" | "market") =>
      thingsInView(SCENE_THINGS[setting] ?? [], setting, 366, 240).map(({ id }) => id);

    expect(at("home")).toEqual(expect.arrayContaining(["okno", "taska"]));
    const market = SCENE_THINGS.market ?? [];
    const far = (id: string) => {
      const thing = market.find((candidate) => candidate.id === id)!;
      return thingsInView(
        [{ ...thing, box: thingBoxes(thing)[thing.twins!.far], more: [] }],
        "market",
        366,
        240,
      );
    };
    expect(far("syr")).toHaveLength(1);
    expect(far("jahody")).toHaveLength(1);
  });
});
