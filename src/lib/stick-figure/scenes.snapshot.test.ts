import { describe, expect, it } from "vitest";

import { lessons } from "$lib/catalog/lessons";
import { sceneMouthTracks } from "$lib/catalog/lessons/audio";
import {
  characterIdForSpeaker,
  listedCharacters,
  type LessonCharacterId,
} from "$lib/catalog/lessons/character-ids";
import { listeningEpisodes } from "$lib/catalog/listening";
import { dialogueSpeakerLabel } from "$lib/components/practice/dialogue-speaker";
import type { DialogueTurn } from "$lib/learning/types";
import { RAIN_AND_TRAM, WEATHER_TODAY } from "./dev-scenes";
import { chapterSettingFor, stageSettingFor } from "./lesson-stage";
import type { LinePlan, LineSpan } from "./line-plan";
import { dayTalks } from "./scene-day";
import { directScene, type DirectedLine } from "./scene-direction";
import type { StageSetting } from "./stage-setting";
import { fits, walkTalk, type Said, type TalkNode } from "./talk";

/**
 * Every scene the player can show, directed and written down, so a change
 * that is meant to only move code shows up here if it moves a figure.
 */

interface Scene {
  lines: DirectedLine[];
  name: string;
  order?: LessonCharacterId[];
  setting: StageSetting;
}

function directedLines(turns: DialogueTurn[], stays?: (turn: DialogueTurn) => boolean) {
  const mouths = sceneMouthTracks(turns);
  return turns.map((turn): DirectedLine => ({
    characterId:
      dialogueSpeakerLabel(turn.speaker) === null
        ? null
        : characterIdForSpeaker(turn.speaker),
    gestures: turn.gestures,
    mouth: mouths[turn.id]?.m,
    props: turn.props,
    slovak: turn.slovak,
    stays: stays?.(turn),
    to: turn.to ? characterIdForSpeaker(turn.to) : undefined,
    vowels: mouths[turn.id]?.v,
  }));
}

const speakers = Object.fromEntries(
  listedCharacters().map((character) => [character.id, character.speakers[0] ?? ""]),
);

/** A talk along the first replies that fit, and along each other reply that fits. */
function talkScenes(): Scene[] {
  return dayTalks().flatMap((talk) => {
    const alex = new Set<string>();
    const turnOf = (
      said: Said & { id: string },
      who: LessonCharacterId,
    ): DialogueTurn => {
      if (who === "alex") alex.add(said.id);
      return { ...said, speaker: speakers[who] };
    };
    const nodes: Array<TalkNode<DialogueTurn>> = talk.nodes.map((node) => ({
      id: node.id,
      says: node.says.map((said) => turnOf(said, talk.who)),
      replies: node.replies?.map((reply) => ({
        line: turnOf(reply.line, "alex"),
        miss: reply.miss && { reaction: reply.miss.reaction, why: reply.miss.why },
        next: reply.next,
      })),
    }));
    const picks = nodes.flatMap((node) =>
      (node.replies ?? []).flatMap((reply, index) =>
        fits(reply) && index > 0 ? [{ [node.id]: index }] : [],
      ),
    );

    return [{}, ...picks].map((pick) => ({
      lines: directedLines(walkTalk(nodes, pick).lines, (turn) => alex.has(turn.id)),
      name: `talk ${talk.id} ${JSON.stringify(pick)}`,
      setting: talk.setting,
    }));
  });
}

const SCENES: Scene[] = [
  ...lessons
    .filter((lesson) => lesson.scene.some((line) => dialogueSpeakerLabel(line.speaker)))
    .map((lesson) => ({
      lines: directedLines(lesson.scene),
      name: `lesson ${lesson.id}`,
      setting: stageSettingFor(lesson.id),
    })),
  ...listeningEpisodes.flatMap((episode) =>
    episode.chapters.map((chapter) => ({
      lines: directedLines(chapter.lines),
      name: `podcast ${chapter.id}`,
      order: episode.speakers.map(characterIdForSpeaker),
      setting: chapterSettingFor(chapter.id),
    })),
  ),
  { lines: directedLines(RAIN_AND_TRAM), name: "dev rain-and-tram", setting: "street" },
  { lines: directedLines(WEATHER_TODAY), name: "dev weather-today", setting: "default" },
  ...talkScenes(),
];

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
      const lines = scene.lines.map((line, index) =>
        compact({
          handed: direction.handed[index],
          held: direction.held[index],
          line: `${line.characterId ?? "-"}: ${line.slovak}`,
          plan: planSummary(direction.plans[index]),
          props: direction.props[index].some(Boolean)
            ? direction.props[index]
            : undefined,
          staging: direction.stagings[index],
        }),
      );

      expect({
        cast: direction.cast,
        lines,
        setting: scene.setting,
        things: direction.things.map(({ id }) => id),
      }).toMatchSnapshot();
    });
  }
});
