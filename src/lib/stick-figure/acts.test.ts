import { describe, expect, it } from "vitest";
import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";

import { listeningEpisodes } from "$lib/catalog/listening";
import { DARK_MS, REACT_MS, scheduleCues, type LineTimes } from "./act-schedule";
import {
  CueError,
  applyCue,
  cueActor,
  heldBy,
  setUp,
  startWorld,
  worlds,
  type Cue,
} from "./acts";
import { PLACES } from "./places";
import { episodeStages } from "./scene-sources";
import { foldLine } from "./slovak-text";

const KITCHEN = PLACES.kitchen.set!;

describe("the world the cues leave", () => {
  it("has a host who comes in late out of their seat until they sit down", () => {
    const start = { ...startWorld(), seated: ["anna", "marek"] as LessonCharacterId[] };
    const after = worlds(
      [
        { characterId: "anna", act: [] },
        {
          characterId: "marek",
          act: [
            { do: "enter", to: "inside", on: "before" },
            { do: "sit", to: "desk-right", on: "start" },
          ],
        },
      ],
      PLACES.studio.set,
      start,
    );

    expect(after[0].out).toEqual(["marek"]);
    expect(after[0].seated).toEqual(["anna"]);
    expect(after[2].out ?? []).toEqual([]);
    expect(after[2].seated).toEqual(["anna", "marek"]);
  });

  it("keeps what someone took in their hand until a cue puts it down or passes it on", () => {
    const after = worlds(
      [
        { characterId: "maria", act: [{ do: "take", what: "spoon" }] },
        { characterId: "anna", act: [] },
        { characterId: "marek", act: [{ do: "take", what: "spoon" }] },
      ],
      KITCHEN,
    );

    expect(heldBy(after[1], "maria")).toEqual({ lead: "spoon" });
    expect(heldBy(after[2], "maria")).toEqual({ lead: "spoon" });
    expect(heldBy(after[3], "maria")).toEqual({});
    expect(heldBy(after[3], "marek")).toEqual({ lead: "spoon" });
  });

  it("carries a board in both hands, so nothing else fits", () => {
    expect(() =>
      worlds(
        [
          {
            characterId: "anna",
            act: [
              { do: "take", what: "board" },
              { do: "take", what: "knife" },
            ],
          },
        ],
        KITCHEN,
      ),
    ).toThrow(CueError);
  });

  it("refuses an object the set does not have, so nothing comes from nowhere", () => {
    expect(() =>
      worlds([{ characterId: "marek", act: [{ do: "take", what: "card" }] }], KITCHEN),
    ).toThrow(CueError);
  });

  it("refuses to give or put down what is not in hand", () => {
    expect(() =>
      worlds(
        [{ characterId: "marek", act: [{ do: "give", what: "spoon", to: "anna" }] }],
        KITCHEN,
      ),
    ).toThrow(CueError);
    expect(() =>
      worlds(
        [{ characterId: "marek", act: [{ do: "put", what: "ladle", to: "pot" }] }],
        KITCHEN,
      ),
    ).toThrow(CueError);
  });

  it("slides only what stands on a surface, and only along it", () => {
    const studio = PLACES.studio.set;
    const start = setUp(startWorld(studio.objects), {
      objects: [{ id: "bag", kind: "bag", start: { where: { on: "desk", dx: 30 } } }],
    });
    const slid = applyCue(
      start,
      "marek",
      { do: "slide", what: "bag", to: "desk", dx: -20 },
      studio,
    );
    expect(slid.objects.bag.where).toEqual({ on: "desk", dx: -20 });

    const held = applyCue(start, "marek", { do: "take", what: "bag" }, studio);
    expect(() =>
      applyCue(held, "marek", { do: "slide", what: "bag", to: "desk", dx: -20 }, studio),
    ).toThrow(CueError);
    expect(() =>
      applyCue(start, "marek", { do: "slide", what: "bag", to: "corner" }, studio),
    ).toThrow(CueError);
  });
});

describe("cooking with the kitchen's set", () => {
  it("carries the big pot in both hands, fills it and makes soup of it", () => {
    const played = worlds(
      [
        {
          characterId: "marek",
          act: [
            { do: "go", to: "cupboard" },
            { do: "take", what: "pot" },
            { do: "put", what: "pot", to: "basin" },
            { do: "fill", what: "pot" },
            { do: "take", what: "pot" },
            { do: "go", to: "hob-near" },
            { do: "put", what: "pot", to: "hob" },
          ],
        },
        {
          characterId: "anna",
          act: [
            { do: "take", what: "knife" },
            { do: "chop", what: "carrot" },
            { do: "put", what: "knife", to: "knife-place" },
            { do: "take", what: "board" },
            { do: "pour", what: "board", to: "pot" },
          ],
        },
        {
          characterId: "maria",
          act: [
            { do: "switch", what: "stove", to: "on" },
            { do: "skip", minutes: 60 },
          ],
        },
      ],
      KITCHEN,
    );

    expect(heldBy(played[1], "marek")).toEqual({});
    expect(played[1].objects.pot).toMatchObject({
      where: { on: "stove", dx: 2 },
      fill: "water",
    });
    expect(played[2].objects.carrot.where).toEqual({ in: "pot" });
    expect(played[3].objects.pot).toMatchObject({ fill: "soup", heat: 1 });
    expect(played[3].minutes).toBe(60);
  });

  it("fills the pot only stood in the sink, where the water is seen going in", () => {
    expect(() =>
      worlds(
        [
          {
            characterId: "marek",
            act: [
              { do: "take", what: "pot" },
              { do: "fill", what: "pot" },
            ],
          },
        ],
        KITCHEN,
      ),
    ).toThrow(/sink/);
  });

  it("needs both hands free for the pot, and fills both with it", () => {
    const [, holding] = worlds(
      [{ characterId: "marek", act: [{ do: "take", what: "pot" }] }],
      KITCHEN,
    );
    expect(heldBy(holding, "marek")).toEqual({ lead: "pot", rear: "pot" });
    expect(() =>
      worlds(
        [
          {
            characterId: "marek",
            act: [
              { do: "take", what: "spoon" },
              { do: "take", what: "pot" },
            ],
          },
        ],
        KITCHEN,
      ),
    ).toThrow(CueError);
  });

  it("keeps someone out until they come in, and on their chair until they stand", () => {
    const lines = [
      { characterId: "anna" as const, act: [{ do: "enter", to: "inside" }] as Cue[] },
      { characterId: "anna" as const, act: [{ do: "sit", to: "seat-l" }] as Cue[] },
    ];
    const played = worlds(lines, KITCHEN);
    expect(played[0].out).toEqual(["anna"]);
    expect(played[1].spots.anna).toBe("inside");
    expect(played[2].seated).toEqual(["anna"]);
    expect(() =>
      worlds(
        [...lines, { characterId: "anna", act: [{ do: "go", to: "sink" }] }],
        KITCHEN,
      ),
    ).toThrow(CueError);
  });

  it("refuses a spot the set does not have, and sitting where there is no chair", () => {
    expect(() =>
      worlds([{ characterId: "anna", act: [{ do: "go", to: "garden" }] }], KITCHEN),
    ).toThrow(CueError);
    expect(() =>
      worlds([{ characterId: "anna", act: [{ do: "sit", to: "sink" }] }], KITCHEN),
    ).toThrow(CueError);
  });

  it("takes a phone in the other hand, so the ear gets it and the free hand can wave", () => {
    const start = setUp(startWorld(KITCHEN.objects), {
      objects: [{ id: "phone", kind: "phone", start: { where: { pocket: "marek" } } }],
    });
    const [, after] = worlds(
      [
        {
          characterId: "marek",
          act: [
            { do: "take", what: "phone" },
            { do: "call", what: "phone" },
          ],
        },
      ],
      KITCHEN,
      start,
    );
    expect(heldBy(after, "marek")).toEqual({ rear: "phone" });
    expect(after.objects.phone.call).toBe(true);
  });
});

describe("leaving the flat with a dog", () => {
  const HOME = PLACES.home.set!;
  const withLead = setUp(startWorld(HOME.objects), {
    objects: [{ id: "lead", kind: "lead", start: { where: { on: "pegs", dx: 0 } } }],
  });

  it("walks someone out by an edge, off their spot, and back in only by entering", () => {
    const [, gone] = worlds(
      [{ characterId: "marek", act: [{ do: "leave", to: "left" }] }],
      HOME,
      withLead,
    );
    expect(gone.out).toEqual(["marek"]);
    expect(gone.spots.marek).toBeUndefined();
    expect(() =>
      worlds(
        [{ characterId: "marek", act: [{ do: "leave", to: "pegs" }] }],
        HOME,
        withLead,
      ),
    ).toThrow(CueError);
  });

  it("clips a lead in hand to the dog, and nothing else", () => {
    const [, , clipped] = worlds(
      [
        { characterId: "robo", act: [{ do: "take", what: "lead" }] },
        { characterId: "robo", act: [{ do: "leash", what: "lead", to: "bobik" }] },
      ],
      HOME,
      withLead,
    );
    expect(clipped.objects.lead.clipped).toBe(true);
    expect(heldBy(clipped, "robo")).toEqual({ lead: "lead" });
    expect(() =>
      worlds(
        [{ characterId: "robo", act: [{ do: "leash", what: "lead", to: "bobik" }] }],
        HOME,
        withLead,
      ),
    ).toThrow(CueError);
  });
});

describe("a ball for the dog", () => {
  const PARK = PLACES.default.set!;
  const start = setUp(startWorld(PARK.objects), {
    objects: [
      { id: "ball", kind: "ball", start: { where: { hand: "robot", side: "lead" } } },
    ],
  });

  it("is with the dog, out of sight, from the throw until it brings the ball back in its mouth", () => {
    const after = worlds(
      [
        { characterId: "robot", act: [{ do: "throw", what: "ball", to: "dog" }] },
        { characterId: "dog", act: [{ do: "take", what: "ball" }] },
      ],
      PARK,
      start,
    );

    expect(heldBy(after[1], "robot")).toEqual({});
    expect(heldBy(after[1], "dog")).toEqual({});
    expect(heldBy(after[2], "dog")).toEqual({ lead: "ball" });
  });

  it("is thrown to someone, and only from the thrower's hand", () => {
    expect(() =>
      worlds(
        [{ characterId: "robot", act: [{ do: "throw", what: "ball" }] }],
        PARK,
        start,
      ),
    ).toThrow(CueError);
    expect(() =>
      worlds(
        [{ characterId: "anna", act: [{ do: "throw", what: "ball", to: "dog" }] }],
        PARK,
        start,
      ),
    ).toThrow(CueError);
  });
});

describe("cues on the clock", () => {
  const times: LineTimes = {
    lead: 0,
    speech: 1000,
    end: 4000,
    word: (folded) => ({ ochutnaj: 2000, horuca: 3500 })[folded],
  };
  const world = worlds([], KITCHEN)[0];

  it("starts a cue on its word, and one with none after the one before it", () => {
    const cues: Cue[] = [
      { do: "take", what: "spoon", on: "ochutnaj" },
      { do: "dip", what: "spoon", to: "pot" },
    ];
    const [take, dip] = scheduleCues(cues, "maria", world, times, () => 0);

    expect(take.start).toBe(2000);
    expect(dip.start).toBeGreaterThanOrEqual(take.end);
  });

  it("tidies up in the dark, the moment the lights are down", () => {
    const cues: Cue[] = [
      { do: "skip", minutes: 60, on: "start" },
      { who: "anna", do: "go", to: "board", on: "dark" },
    ];
    const [skip, tidy] = scheduleCues(cues, "maria", world, times, () => 0, {}, KITCHEN);

    expect(tidy.start).toBe(skip.start + DARK_MS);
    expect(tidy.after.spots.anna).toBe("board");
  });

  it("plays a cue before the voice when asked, and waits for someone still busy", () => {
    const cues: Cue[] = [
      { do: "take", what: "salt", on: "before" },
      { do: "take", what: "spoon", on: "start" },
    ];
    const [salt, spoon] = scheduleCues(cues, "maria", world, times, () => 0, {
      maria: 1500,
    });

    expect(salt.start).toBe(1500);
    expect(spoon.start).toBeGreaterThanOrEqual(salt.end);
  });

  it("has the second of two people waving on the same word answer a beat after", () => {
    const cues: Cue[] = [
      { do: "wave", on: "start" },
      { who: "anna", do: "wave", on: "start" },
    ];
    const [first, second] = scheduleCues(cues, "marek", world, times, () => 0);

    expect(second.start - first.start).toBe(REACT_MS);
  });
});

describe("every acted podcast segment", () => {
  for (const episode of listeningEpisodes) {
    const { scenes } = episodeStages(episode);
    for (const chapter of episode.chapters) {
      const scene = scenes[chapter.id];
      if (!scene.lines.some((line) => line.act?.length)) continue;

      it(`${chapter.id} plays its cues on a set that has what they use`, () => {
        const set = PLACES[scene.setting].set;
        expect(set).toBeDefined();
        expect(() => worlds(scene.lines, set!, scene.world)).not.toThrow();
      });

      it(`${chapter.id} anchors every cue on a word its line says`, () => {
        for (const line of chapter.lines) {
          const words = foldLine(line.slovak).split(" ");
          for (const cue of line.act ?? []) {
            if (!cue.on || ["before", "start", "end", "after", "dark"].includes(cue.on))
              continue;
            expect(words, `${line.id}: on "${cue.on}"`).toContain(foldLine(cue.on));
          }
        }
      });

      it(`${chapter.id} seeking to every line equals playing straight to that line`, () => {
        const set = PLACES[scene.setting].set!;
        const allWorlds = worlds(scene.lines, set, scene.world);
        expect(allWorlds).toHaveLength(scene.lines.length + 1);
        let current = allWorlds[0];
        for (let index = 0; index < scene.lines.length; index += 1) {
          expect(allWorlds[index]).toEqual(current);
          const line = scene.lines[index];
          for (const cue of line.act ?? []) {
            const who = cueActor(cue, line.characterId);
            if (who) current = applyCue(current, who, cue, set);
          }
        }
        expect(allWorlds[scene.lines.length]).toEqual(current);
      });
    }
  }
});
