import { describe, expect, it } from "vitest";

import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import { directScene, type DirectedLine } from "./scene-direction";
import {
  blockingBefore,
  endLine,
  openingBlocking,
  startLine,
  type Blocking,
} from "./stage-blocking";
import {
  markOf,
  stageFrame,
  stageX,
  standing,
  walkOns,
  type StageFrame,
} from "./stage-frame";
import type { StageSetting } from "./stage-setting";
import { TRAM } from "./street";
import { thingCenter } from "./thing-words";

/** A scene on a 600 × 300 px stage, the widest a stage gets at its full height. */
function staged(lines: DirectedLine[], setting: StageSetting) {
  const direction = directScene(lines, setting);
  const stagings = direction.lines.map(({ staging }) => staging);
  const speakers = lines.map(({ characterId }) => characterId);
  const frame = stageFrame(
    direction.cast,
    walkOns(stagings),
    setting,
    direction.things,
    600,
    300,
  );

  return {
    frame,
    stagings,
    before: (index: number) => blockingBefore(index, speakers, stagings, frame),
    start: (state: Blocking, index: number) =>
      startLine(state, stagings[index], speakers[index], frame),
    end: (state: Blocking, index: number) =>
      endLine(state, stagings[index], speakers[index], frame),
  };
}

/** Stage x of the middle of a figure, where it stands in `state`. */
function centre(frame: StageFrame, state: Blocking, id: LessonCharacterId): number {
  const mark = standing(markOf(frame, id), state.offsets[id]);
  return mark.left + mark.width / 2;
}

function isOnStage(frame: StageFrame, state: Blocking, id: LessonCharacterId): boolean {
  const mark = standing(markOf(frame, id), state.offsets[id]);
  return mark.left + mark.width > 0 && mark.left < frame.width;
}

describe("stage blocking", () => {
  it("walks on whoever says hello later, from off their side of the stage", () => {
    const { before, frame, stagings, start } = staged(
      [
        { characterId: "anna", slovak: "Kde je Marek?" },
        { characterId: "marek", slovak: "Ahojte!" },
      ],
      "plaza",
    );
    const opening = openingBlocking(stagings, frame);

    expect(isOnStage(frame, opening, "marek")).toBe(false);
    expect(start(opening, 0)).toMatchObject({
      facings: { marek: -1 },
      offsets: { marek: 0 },
    });
    expect(before(1).offsets.marek).toBe(0);
  });

  it("walks a speaker off once their goodbye ends, not as it starts", () => {
    const { before, end, frame, start } = staged(
      [
        { characterId: "waiter", slovak: "Nech sa páči." },
        { characterId: "alex", slovak: "Ďakujem. Dovidenia!" },
      ],
      "cafe",
    );
    const started = start(before(1), 1);
    const ended = end(started, 1);

    expect(isOnStage(frame, started, "alex")).toBe(true);
    expect(isOnStage(frame, ended, "alex")).toBe(false);
    expect(ended.facings.alex).toBe(-1);
    expect(isOnStage(frame, ended, "waiter")).toBe(true);
  });

  it("walks the one shown something over to stand beside the speaker", () => {
    const { frame, start, stagings } = staged(
      [
        { characterId: "anna", slovak: "Pozri, to sú fotky z leta." },
        { characterId: "alex", slovak: "Kto je ten muž?" },
      ],
      "cafe",
    );
    const opening = openingBlocking(stagings, frame);
    const shown = start(opening, 0);

    expect(
      Math.abs(centre(frame, shown, "alex") - centre(frame, shown, "anna")),
    ).toBeCloseTo(0.8 * frame.figureWidth);
    expect(shown.offsets.anna ?? 0).toBe(0);
  });

  describe("at the tram stop", () => {
    const { before, frame, start } = staged(
      [
        { characterId: "alex", props: [null], slovak: "Máš dáždnik?" },
        { characterId: "anna", slovak: "Mám. Poď sem, pod dáždnik." },
        { characterId: "alex", slovak: "Ďakujem. Kde je zastávka?" },
        { characterId: "anna", slovak: "Tam, pri lavičke. Poďme!" },
        { characterId: "alex", slovak: "Aha, už ide!" },
        { characterId: "anna", slovak: "Konečne! Nastúpme." },
      ],
      "street",
    );
    const middle = (state: Blocking) =>
      (centre(frame, state, "alex") + centre(frame, state, "anna")) / 2;

    it("walks everyone over to the bench on Poďme, facing the way they go", () => {
      const bench = frame.things.find((thing) => thing.id === "lavicka");
      if (!bench) throw new Error("The street has no bench.");
      const benchX = stageX(frame, thingCenter(bench));
      const walked = before(4);

      expect(Math.abs(middle(walked) - benchX)).toBeLessThan(
        Math.abs(middle(before(3)) - benchX),
      );
      expect(walked.facings.alex).toBe(walked.facings.anna);
    });

    it("brings the tram in on už ide, and has it stopped once that line is past", () => {
      expect(start(before(4), 4).tram).toBe("coming");
      expect(before(5).tram).toBe("here");
      expect(before(4).tram).toBe("away");
    });

    it("gets everyone on at the door once Nastúpme ends", () => {
      const door = stageX(frame, { x: TRAM.door, y: 0 });
      const aboard = before(6);

      expect(before(5).aboard).toBe(false);
      expect(aboard.aboard).toBe(true);
      expect(middle(aboard)).toBeCloseTo(door, 0);
    });
  });

  it("moves nobody until the stage has a size", () => {
    const direction = directScene(
      [
        { characterId: "anna", slovak: "Tam, pri lavičke. Poďme!" },
        { characterId: "alex", slovak: "Dobre." },
      ],
      "street",
    );
    const stagings = direction.lines.map(({ staging }) => staging);
    const frame = stageFrame(direction.cast, {}, "street", direction.things, 0, 0);

    expect(blockingBefore(1, ["anna", "alex"], stagings, frame).offsets).toEqual({});
  });
});
