import { describe, expect, it } from "vitest";

import { characterIdForSpeaker } from "$lib/catalog/lessons/character-ids";
import { listeningEpisodes } from "$lib/catalog/listening";
import { scheduleCues, type LineTimes } from "./act-schedule";
import { CueError, heldBy, worlds, type Cue } from "./acts";
import { PLACES } from "./places";
import { foldLine } from "./slovak-text";

const KITCHEN = PLACES.kitchen.set!.objects;

describe("the world the cues leave", () => {
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

  it("takes a lid in the other hand, out of the way", () => {
    const [, after] = worlds(
      [
        {
          characterId: "maria",
          act: [
            { do: "take", what: "lid" },
            { do: "take", what: "spoon" },
          ],
        },
      ],
      KITCHEN,
    );

    expect(heldBy(after, "maria")).toEqual({ lead: "spoon", rear: "lid" });
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
        [{ characterId: "marek", act: [{ do: "put", what: "lid", to: "pot" }] }],
        KITCHEN,
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

  it("plays a cue before the voice when asked, and waits for someone still busy", () => {
    const cues: Cue[] = [
      { do: "take", what: "lid", on: "before" },
      { do: "take", what: "spoon", on: "start" },
    ];
    const [lid, spoon] = scheduleCues(cues, "maria", world, times, () => 0, {
      maria: 1500,
    });

    expect(lid.start).toBe(1500);
    expect(spoon.start).toBeGreaterThanOrEqual(lid.end);
  });
});

describe("every acted podcast segment", () => {
  for (const episode of listeningEpisodes) {
    let start: ReturnType<typeof worlds>[number] | undefined;
    for (const chapter of episode.chapters) {
      const set = PLACES[chapter.stage ?? "studio"].set;
      const lines = chapter.lines.map((line) => ({
        act: line.act,
        characterId: characterIdForSpeaker(line.speaker),
      }));
      if (!lines.some((line) => line.act?.length)) continue;

      it(`${chapter.id} plays its cues on a set that has what they use`, () => {
        expect(set).toBeDefined();
        start = worlds(lines, set!.objects, start).at(-1);
      });

      it(`${chapter.id} anchors every cue on a word its line says`, () => {
        for (const line of chapter.lines) {
          const words = foldLine(line.slovak).split(" ");
          for (const cue of line.act ?? []) {
            if (!cue.on || ["before", "start", "end", "after"].includes(cue.on)) continue;
            expect(words, `${line.id}: on "${cue.on}"`).toContain(foldLine(cue.on));
          }
        }
      });
    }
  }
});
