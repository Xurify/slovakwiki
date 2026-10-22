import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { StickGestureId } from "./gestures";
import { planLine, type LinePlan } from "./line-plan";
import { foldLine } from "./line-gesture";
import { lineSentences, lineWords } from "./line-plan";
import { decodeMouthTrack, decodeVowelTrack } from "./mouth-track";
import {
  gesturesWithProps,
  handOver,
  heldProps,
  lineProps,
  propForSentence,
  type CastProps,
  type StickPropId,
} from "./props";
import {
  SCENE_THINGS,
  linePoints,
  thingNamed,
  type NamedThing,
  type SceneThing,
} from "./scene-things";
import type { StageSetting } from "./stage-setting";
import { stageLine, takesFrom, type LineStaging, type StageLine } from "./staging";

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
  /** Keeps their place after a goodbye: the host of a scene that goes on without the other. */
  stays?: boolean;
  to?: LessonCharacterId;
  /** Aligned vowel per mouth frame, encoded. */
  vowels?: string;
}

/** Everything the stage does with a scene, worked out once from its lines. */
export interface SceneDirection {
  cast: LessonCharacterId[];
  /** What everyone holds once a line that gives something away ends. */
  handed: Array<CastProps | undefined>;
  /** What each figure holds while each line plays. */
  held: CastProps[];
  plans: LinePlan[];
  /** The props each line's sentences bring out. */
  props: Array<Array<StickPropId | undefined>>;
  stagings: LineStaging[];
  things: readonly SceneThing[];
}

/** Who works where, so they stand at the counter end of the stage. */
const STAFF: Partial<Record<StageSetting, readonly LessonCharacterId[]>> = {
  cafe: ["waiter"],
  counter: ["receptionist"],
  // Lucia sells at the market in the podcast, from the stall on the right.
  market: ["lucia"],
  registration: ["receptionist"],
};

/**
 * Everyone on stage in the order they first speak, or in `order` where it
 * names them, so a series keeps its hosts in their places; staff go last,
 * by their counter on the right.
 */
export function castFor(
  lines: readonly DirectedLine[],
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
  const staff = STAFF[setting] ?? [];
  return [
    ...cast.filter((id) => !staff.includes(id)),
    ...cast.filter((id) => staff.includes(id)),
  ];
}

/**
 * The author's props for each sentence, and `null` where the word that
 * would bring one out names something drawn in the scene instead: at home
 * "Je v tej taške." points at the bag on the floor.
 */
function propsBesides(
  line: DirectedLine,
  things: readonly SceneThing[],
): Array<StickPropId | null | undefined> {
  return lineSentences(line.slovak).map((sentence, index) => {
    const authored = line.props?.[index];
    if (authored !== undefined) return authored;

    const drawn = lineWords(sentence).some(
      (word) => propForSentence(word) && thingNamed(foldLine(word), things),
    );
    return drawn ? null : undefined;
  });
}

export function directScene(
  lines: readonly DirectedLine[],
  setting: StageSetting,
  order?: readonly LessonCharacterId[],
): SceneDirection {
  const cast = castFor(lines, setting, order);
  const things = SCENE_THINGS[setting] ?? [];
  const authored = lines.map((line) => propsBesides(line, things));
  const props = lines.map((line, index) => lineProps(line.slovak, authored[index]));
  const stageLines: StageLine[] = lines.map(
    ({ characterId, slovak, stays, to }, index) => ({
      characterId,
      props: authored[index],
      slovak,
      stays,
      to,
    }),
  );
  const stagings = lines.map((_, index) => stageLine(stageLines, index, cast, things));
  const takes = lines.map((_, index) => takesFrom(stageLines, index));
  const held = heldProps(
    lines.map(({ characterId }, index) => ({
      characterId,
      givesTo: stagings[index].gives,
      props: props[index],
      takesFrom: takes[index],
    })),
  );
  const handed = lines.map(({ characterId }, index) => {
    const to = stagings[index].gives;
    return characterId && to ? handOver(held[index], characterId, to) : undefined;
  });

  // What the scene has named so far, which a bare tamten can point back at.
  const named: NamedThing[] = [];
  const plans = lines.map((line, index) => {
    // Reaching for what is handed over comes before anything the words pick.
    const gestures = takes[index]
      ? ["show" as const, ...(line.gestures ?? []).slice(1)]
      : line.gestures;
    const holder = stagings[index]?.looksAt;
    const prop = holder ? held[index][holder] : undefined;
    const points = line.characterId
      ? linePoints(
          line.slovak,
          things,
          holder && prop ? { holder, prop } : undefined,
          named,
        )
      : [];
    for (const { target } of points) {
      if (target.kind === "thing") named.push({ copy: target.copy, id: target.id });
    }

    return planLine(line.slovak, {
      gestures: gesturesWithProps(props[index], gestures),
      lips: line.vowels ? decodeVowelTrack(line.vowels) : undefined,
      points,
      track: line.mouth ? decodeMouthTrack(line.mouth) : undefined,
    });
  });

  return { cast, handed, held, plans, props, stagings, things };
}
