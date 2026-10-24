import { describe, expect, it } from "vitest";

import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { LinePlan, LineSpan } from "./line-plan";
import { directScene, type DirectedLine } from "./scene-direction";
import { sceneGroups } from "./scene-sources";
import type { StageSetting } from "./stage-setting";
import { fits, walkTalk } from "./talk";

/**
 * Every scene the player can show, directed and written down, so a change
 * that is meant to only move code shows up here if it moves a figure.
 */

interface Directed {
  lines: readonly DirectedLine[];
  name: string;
  order?: LessonCharacterId[];
  setting: StageSetting;
}

const SOURCES: Record<string, string> = {
  "From the lessons": "lesson",
  "From the podcast": "podcast",
  Prototype: "dev",
};

/** Each scene once, and a talk along each reply that fits besides the first. */
const SCENES: Directed[] = sceneGroups().flatMap((group) =>
  group.scenes.flatMap((scene) => {
    const source = scene.talk ? "talk" : SOURCES[group.label];
    const name = `${source} ${scene.id.replace(/^dev\//, "")}`;
    if (!scene.talk) return [{ ...scene, name }];

    const { nodes } = scene.talk;
    const picks = nodes.flatMap((node) =>
      (node.replies ?? []).flatMap((reply, index) =>
        fits(reply) && index > 0 ? [{ [node.id]: index }] : [],
      ),
    );
    return [{}, ...picks].map((pick) => ({
      lines: walkTalk(nodes, pick).lines,
      name: `${name} ${JSON.stringify(pick)}`,
      setting: scene.setting,
    }));
  }),
);

const ms = (value: number) => Math.round(value);
const spans = (list: readonly LineSpan[] = []) =>
  list.map(({ end, start }) => `${ms(start)}-${ms(end)}`).join(" ");

function planSummary(plan: LinePlan) {
  return {
    beats: plan.beats.map(({ at, gesture, point }) => {
      if (!point) return `${ms(at)} ${gesture}`;
      const { target } = point;
      const to =
        target.kind === "thing"
          ? `${target.id}${target.copy === undefined ? "" : `#${target.copy}`}`
          : `${target.holder}'s prop`;
      return `${ms(at)} ${gesture} → ${to}${point.reach ? ` (${point.reach})` : ""}`;
    }),
    ms: ms(plan.durationMs),
    pictures: plan.pictures?.map(({ at, picture }) => `${ms(at)} ${picture}`),
    questions: spans(plan.questions) || undefined,
    sentences: spans(plan.sentences),
    words: spans(plan.words),
  };
}

/** Drops what is empty, so the snapshot says only what happens. */
function compact(value: unknown): unknown {
  if (Array.isArray(value)) {
    const items = value.map(compact);
    return items.length === 0 ? undefined : items;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compact(item)] as const)
      .filter(([, item]) => item !== undefined);
    return entries.length === 0 ? undefined : Object.fromEntries(entries);
  }
  return value;
}

describe("every scene, directed", () => {
  it("has scenes from each source", () => {
    const sources = new Set(SCENES.map(({ name }) => name.split(" ")[0]));
    expect([...sources]).toEqual(["lesson", "podcast", "dev", "talk"]);
  });

  for (const scene of SCENES) {
    it(scene.name, () => {
      const direction = directScene(scene.lines, scene.setting, scene.order);
      const lines = scene.lines.map((line, index) => {
        const { handed, held, plan, props, staging } = direction.lines[index];
        return compact({
          handed,
          held,
          line: `${line.characterId ?? "-"}: ${line.slovak}`,
          plan: planSummary(plan),
          props: props.some(Boolean) ? props : undefined,
          staging,
        });
      });

      expect({
        cast: direction.cast,
        lines,
        setting: scene.setting,
        things: direction.things.map(({ id }) => id),
      }).toMatchSnapshot();
    });
  }
});
