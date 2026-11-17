import { describe, expect, it } from "vitest";
import { lessons } from "$lib/catalog/lessons";
import { cueEntrances, isActed } from "./acts";
import { checkCues } from "./episode-checks";
import { PLACES } from "./places";
import { directScene } from "./scene-direction";
import { lessonScene } from "./scene-sources";
import { unseenScreens } from "./screens";
import { stageFrame, walkOns } from "./stage-frame";

const scenes = lessons.flatMap((lesson) => {
  const scene = lessonScene(lesson);
  return scene ? [{ lesson, scene }] : [];
});

describe("lesson scenes", () => {
  it.each(scenes)("$lesson.id shows what is on a phone or camera", ({ scene }) => {
    const direction = directScene(scene.lines, scene.setting, scene.order);
    const unseen = unseenScreens(scene.lines, direction, scene.world).map(
      ({ index, message }) => `${scene.lines[index].slovak}: ${message}`,
    );
    expect(unseen).toEqual([]);
  });

  it.each(scenes.filter(({ scene }) => isActed(scene.lines)))(
    "$lesson.id acts out cues that can happen",
    ({ lesson, scene }) => {
      const direction = directScene(scene.lines, scene.setting, scene.order);
      const set = PLACES[scene.setting].set;
      const entrances = {
        ...walkOns(direction.lines.map((line) => line.staging)),
        ...cueEntrances(scene.lines, set),
      };
      const frame = stageFrame(
        direction.cast,
        entrances,
        scene.setting,
        direction.things,
        960,
        480,
      );
      const errors = checkCues(
        { id: lesson.id, lines: lesson.scene },
        scene.lines,
        set,
        frame,
        scene.world,
      )
        .filter((finding) => finding.level === "error")
        .map(({ line, message }) => `${line}: ${message}`);
      expect(errors).toEqual([]);
    },
  );
});
