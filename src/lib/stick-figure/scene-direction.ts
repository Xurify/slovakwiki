import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";
import type { StickGestureId } from "./gestures";
import { planLine, type LinePlan } from "./line-plan";
import { decodeMouthTrack, decodeVowelTrack } from "./mouth-track";
import {
  gesturesWithProps,
  heldProps,
  lineProps,
  type CastProps,
  type StickPropId,
} from "./props";
import { SCENE_THINGS, linePoints, type SceneThing } from "./scene-things";
import { stageLine, takesFrom, type LineStaging, type StageLine } from "./staging";

/** A scene line as the stage needs it. */
export interface DirectedLine {
  /** Null for a line nobody on stage says: a notice, the narrator. */
  characterId: LessonCharacterId | null;
  gestures?: StickGestureId[];
  /** Loudness track of the clip, encoded (`content/audio/mouth.json`). */
  mouth?: string;
  props?: Array<StickPropId | null>;
  slovak: string;
  /** The clip; without one the line runs on its text timing. */
  src?: string;
  to?: LessonCharacterId;
  /** Aligned vowel per mouth frame, encoded. */
  vowels?: string;
}

/** Everything the stage does with a scene, worked out once from its lines. */
export interface SceneDirection {
  cast: LessonCharacterId[];
  /** What each figure holds while each line plays. */
  held: CastProps[];
  plans: LinePlan[];
  /** The props each line's sentences bring out. */
  props: Array<Array<StickPropId | undefined>>;
  stagings: LineStaging[];
  things: readonly SceneThing[];
}

/** Who works where, so they stand at the counter end of the stage. */
const STAFF: Partial<Record<LessonSceneArtId, readonly LessonCharacterId[]>> = {
  cafe: ["waiter"],
  counter: ["receptionist"],
  registration: ["receptionist"],
};

/** Everyone on stage in the order they first speak, staff last, by their counter on the right. */
export function castFor(
  lines: readonly DirectedLine[],
  setting: LessonSceneArtId,
): LessonCharacterId[] {
  const cast = [
    ...new Set(lines.flatMap(({ characterId }) => (characterId ? [characterId] : []))),
  ];
  const staff = STAFF[setting] ?? [];
  return [
    ...cast.filter((id) => !staff.includes(id)),
    ...cast.filter((id) => staff.includes(id)),
  ];
}

export function directScene(
  lines: readonly DirectedLine[],
  setting: LessonSceneArtId,
): SceneDirection {
  const cast = castFor(lines, setting);
  const things = SCENE_THINGS[setting] ?? [];
  const props = lines.map((line) => lineProps(line.slovak, line.props));
  const stageLines: StageLine[] = lines.map(({ characterId, props, slovak, to }) => ({
    characterId,
    props,
    slovak,
    to,
  }));
  const stagings = lines.map((_, index) => stageLine(stageLines, index, cast, things));
  const takes = lines.map((_, index) => takesFrom(stageLines, index));
  const held = heldProps(
    lines.map(({ characterId }, index) => ({
      characterId,
      props: props[index],
      takesFrom: takes[index],
    })),
  );

  const plans = lines.map((line, index) => {
    // Reaching for what is handed over comes before anything the words pick.
    const gestures = takes[index]
      ? ["show" as const, ...(line.gestures ?? []).slice(1)]
      : line.gestures;

    return planLine(line.slovak, {
      gestures: gesturesWithProps(props[index], gestures),
      lips: line.vowels ? decodeVowelTrack(line.vowels) : undefined,
      points: line.characterId
        ? linePoints(line.slovak, things, stagings[index]?.looksAt)
        : [],
      track: line.mouth ? decodeMouthTrack(line.mouth) : undefined,
    });
  });

  return { cast, held, plans, props, stagings, things };
}
