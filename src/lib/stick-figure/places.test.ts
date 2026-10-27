import { describe, expect, it } from "vitest";

import { words } from "$lib/catalog/entries";
import { foldLine } from "./slovak-text";
import type { StageSetting } from "./stage-setting";
import { BACKDROP_WIDTH, thingsInView } from "./backdrop-geometry";
import { PLACES, backdropAlign, sunIn, thingsIn } from "./places";
import { linePoints } from "./scene-points";
import {
  thingBoxes,
  thingCenter,
  thingNamed,
  thingWithDemonstrative,
} from "./thing-words";

const all = Object.values(PLACES).flatMap((place) => place.things);

describe("scene things", () => {
  it("gives each thing the gender the dictionary does", () => {
    for (const thing of all) {
      const entry = words.find((word) => word.slovak === thing.word && word.gender);
      if (entry) expect([thing.word, entry.gender]).toEqual([thing.word, thing.gender]);
    }
  });

  it("knows each thing by its own nominative", () => {
    for (const [setting, { things }] of Object.entries(PLACES)) {
      for (const thing of things) {
        expect([setting, thingNamed(foldLine(thing.word), things)?.id]).toEqual([
          setting,
          thing.id,
        ]);
      }
    }
  });

  it("keeps a table apart from a chair, and a tower apart from taking", () => {
    const cafe = PLACES.cafe.things;
    const plaza = PLACES.plaza.things;

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
    const cafe = PLACES.cafe.things;
    const named = (id: string) =>
      thingWithDemonstrative(cafe.find((thing) => thing.id === id)!);

    expect(["kolac", "torta", "okno"].map(named)).toEqual([
      "ten koláč",
      "tá torta",
      "to okno",
    ]);
    expect(thingWithDemonstrative(PLACES.plaza.things[1])).toBe("tie hodiny");
  });
});

describe("this one and that one", () => {
  const market = PLACES.market.things;
  const home = PLACES.home.things;
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
    expect(targets(linePoints("Toho muža poznáš.", home, keys))).toEqual([
      "muz#undefined:-",
    ]);
    expect(linePoints("To je jeho sestra.", home, keys)).toEqual([]);
    expect(targets(linePoints("A tieto kľúče už nestrácaj!", home, keys))).toEqual([
      "prop",
    ]);
    // Over photos the man is in them; at home there is one outside the window.
    const photos = { holder: "anna" as const, prop: "camera" as const };
    expect(targets(linePoints("Kto je ten muž?", PLACES.cafe.things, photos))).toEqual([
      "prop",
    ]);
    expect(targets(linePoints("Kto je ten muž?", home, photos))).toEqual([
      "muz#undefined:-",
    ]);
  });
});

describe("things in view", () => {
  it("leaves out what a phone slices off", () => {
    const cafe = PLACES.cafe.things;
    const ids = (width: number, height: number) =>
      thingsInView(cafe, "cafe", width, height).map(({ id }) => id);

    expect(ids(1040, 300)).toEqual(cafe.map(({ id }) => id));
    expect(ids(366, 240)).toContain("kolac");
    expect(ids(366, 240)).not.toContain("okno");
    expect(ids(0, 0)).toHaveLength(cafe.length);
  });

  it("shows every studio thing on a phone, so the hosts never name what is cut off", () => {
    const studio = PLACES.studio.things;
    expect(thingsInView(studio, "studio", 366, 183)).toHaveLength(studio.length);
  });

  it("keeps both bags at home and Lucia's whole stall on a phone", () => {
    const at = (setting: "home" | "market") =>
      thingsInView(PLACES[setting].things, setting, 366, 240).map(({ id }) => id);

    expect(at("home")).toEqual(expect.arrayContaining(["okno", "taska"]));
    const market = PLACES.market.things;
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

describe("the sun", () => {
  // A 390px phone: a 364px stage, half as tall, shows 600 of the 960.
  const PHONE_SHOWS = 600;
  const RADIUS = 19;

  it("stands in open sky a phone's stage shows, clear of the place's things", () => {
    for (const [place, { sun: spots }] of Object.entries(PLACES)) {
      const setting = place as StageSetting;
      const left = (BACKDROP_WIDTH - PHONE_SHOWS) * backdropAlign(setting);
      for (const { x, y } of Object.values(spots ?? {})) {
        expect(x - RADIUS, setting).toBeGreaterThanOrEqual(left);
        expect(x + RADIUS, setting).toBeLessThanOrEqual(left + PHONE_SHOWS);

        const things = PLACES[setting].things.filter((thing) => thing.id !== "slnko");
        for (const thing of things) {
          for (const box of thingBoxes(thing)) {
            const apart =
              x + RADIUS <= box.x ||
              x - RADIUS >= box.x + box.width ||
              y + RADIUS <= box.y ||
              y - RADIUS >= box.y + box.height;
            expect(apart, `${setting}: ${thing.id}`).toBe(true);
          }
        }
      }
    }
  });
});

describe("the sun as a thing", () => {
  const park = PLACES.default.things;
  const sunThing = (time: "morning" | "day", weather: "clear" | "sunny") =>
    thingsIn(park, "default", { time, weather }).find(({ id }) => id === "slnko");

  it("is there to tap only while the sky shows it", () => {
    expect(sunThing("day", "clear")).toBeUndefined();
    expect(sunThing("day", "sunny")).toBeDefined();
  });

  it("is tapped where it is drawn, in the morning too", () => {
    for (const time of ["morning", "day"] as const) {
      const mood = { time, weather: "sunny" } as const;
      const thing = sunThing(time, "sunny");
      const sun = sunIn("default", mood);
      expect(thing && thingCenter(thing)).toEqual({ x: sun?.x, y: sun?.y });
    }
  });
});

describe("window glass", () => {
  it("sits inside the window a learner taps", () => {
    for (const [place, { glass, things }] of Object.entries(PLACES)) {
      if (!glass) continue;
      const window = things.find(({ id }) => id === "okno");
      expect(window, place).toBeDefined();
      if (!window) continue;
      expect(glass.x, place).toBeGreaterThanOrEqual(window.box.x);
      expect(glass.y, place).toBeGreaterThanOrEqual(window.box.y);
      expect(glass.x + glass.width, place).toBeLessThanOrEqual(
        window.box.x + window.box.width,
      );
      expect(glass.y + glass.height, place).toBeLessThanOrEqual(
        window.box.y + window.box.height,
      );
    }
  });
});
