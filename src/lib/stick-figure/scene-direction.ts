import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { StickGestureId } from "./gestures";
import { planLine, type LinePlan } from "./line-plan";
import { readLines, type StageLine } from "./line-reading";
import { decodeMouthTrack, decodeVowelTrack } from "./mouth-track";
import {
  gesturesWithProps,
  handOver,
  heldProps,
  type CastProps,
  type StickPropId,
} from "./props";
import { PLACES } from "./places";
import { linePoints, type NamedThing } from "./scene-points";
import type { StageSetting } from "./stage-setting";
import { stageLine, type LineStaging } from "./staging";
import type { SceneThing } from "./thing-words";

export interface DirectedLine extends StageLine {
  gestures?: StickGestureId[];
  /** Loudness track of the clip, encoded (`content/audio/mouth.json`). */
  mouth?: string;
  /** The clip's text, when it marks pauses the line does not show. */
  said?: string;
  /** The clip; without one the line runs on its text timing. */
  src?: string;
  /** Aligned vowel per mouth frame, encoded. */
  vowels?: string;
}

/** What the stage does while one line plays. */
export interface LineDirection {
  /** What everyone holds once the line ends, when it gives something away. */
  handed?: CastProps;
  /** What each figure holds while the line plays. */
  held: CastProps;
  plan: LinePlan;
  /** The prop each sentence brings out. */
  props: Array<StickPropId | undefined>;
  staging: LineStaging;
}

/** Everything the stage does with a scene, worked out once from its lines. */
export interface SceneDirection {
  cast: LessonCharacterId[];
  lines: LineDirection[];
  things: readonly SceneThing[];
}

/**
 * Everyone on stage in the order they first speak, or in `order` where it
 * names them, so a series keeps its hosts in their places; staff go last,
 * by their counter on the right.
 */
export function castFor(
  lines: readonly StageLine[],
  setting: StageSetting,
  order: readonly LessonCharacterId[] = [],
): LessonCharacterId[] {
  const speakers = [
    ...new Set(lines.flatMap(({ characterId }) => (characterId ? [characterId] : []))),
  ];
  const cast = [
    ...order.filter((id) => speakers.includes(id)),
    ...speakers.filter((id) => !order.includes(id)),
  ];
  const staff = PLACES[setting].staff ?? [];
  return [
    ...cast.filter((id) => !staff.includes(id)),
    ...cast.filter((id) => staff.includes(id)),
  ];
}

export function directScene(
  lines: readonly DirectedLine[],
  setting: StageSetting,
  order?: readonly LessonCharacterId[],
): SceneDirection {
  const cast = castFor(lines, setting, order);
  const { atMarks, things } = PLACES[setting];
  const read = readLines(lines, cast, things);
  const held = heldProps(read);
  // What the scene has named so far, which a bare tamten can point back at.
  const named: NamedThing[] = [];

  const directed = read.map((line, index): LineDirection => {
    const { characterId, gives, props, shownBy, slovak, takes } = line;
    const prop = shownBy ? held[index][shownBy] : undefined;
    const points = characterId
      ? linePoints(
          slovak,
          things,
          shownBy && prop ? { holder: shownBy, prop } : undefined,
          named,
        )
      : [];
    for (const { target } of points) {
      if (target.kind === "thing") named.push({ copy: target.copy, id: target.id });
    }

    const staging = stageLine(read, index, cast, things, points);
    const { gestures, mouth, said, vowels } = lines[index];
    return {
      handed:
        characterId && gives ? handOver(held[index], characterId, gives) : undefined,
      held: held[index],
      plan: planLine(slovak, {
        // Reaching for what is handed over comes before anything the words pick.
        gestures: gesturesWithProps(
          props,
          takes ? ["show", ...(gestures ?? []).slice(1)] : gestures,
        ),
        lips: vowels ? decodeVowelTrack(vowels) : undefined,
        points,
        said,
        track: mouth ? decodeMouthTrack(mouth) : undefined,
      }),
      props,
      staging: atMarks ? { ...staging, approach: undefined, goTo: undefined } : staging,
    };
  });

  return { cast, lines: directed, things };
}
