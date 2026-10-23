import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { Point } from "./rig";
import {
  beside,
  offStage,
  shiftTo,
  stageX,
  type Offsets,
  type StageFrame,
} from "./stage-frame";
import type { CastFacing, Facing, LineStaging } from "./staging";
import { TRAM, type TramState } from "./street";
import { thingCenter } from "./thing-words";

/** Where everyone stands and which way they face, and where the tram is. */
export interface Blocking {
  /** Everyone has got on the tram, out of the weather. */
  aboard: boolean;
  facings: CastFacing;
  offsets: Offsets;
  tram: TramState;
}

/** Before the first line: everyone on their mark, but whoever walks on later waits off their side. */
export function openingBlocking(
  stagings: readonly LineStaging[],
  frame: StageFrame,
): Blocking {
  const offsets: Offsets = {};
  for (const { enter } of stagings) {
    if (!enter) continue;
    offsets[enter.characterId] = offStage(frame, enter.characterId, enter.from);
  }
  return { aboard: false, facings: {}, offsets, tram: "away" };
}

/** Everyone on stage walks over to stand around backdrop `point`, facing the way they go. */
function walkGroup(
  state: Blocking,
  frame: StageFrame,
  point: Point | undefined,
): Blocking {
  if (!point || !frame.width) return state;

  const { by, ids } = shiftTo(frame, stageX(frame, point), state.offsets);
  if (by === 0) return state;

  const side: Facing = by > 0 ? 1 : -1;
  const facings = { ...state.facings };
  const offsets = { ...state.offsets };
  for (const id of ids) {
    facings[id] = side;
    offsets[id] = (offsets[id] ?? 0) + by;
  }
  return { ...state, facings, offsets };
}

/**
 * As a line starts: everyone turns the way its staging says, the one shown
 * something walks over, someone walks on, everyone walks to where the line
 * takes them, and the tram pulls in.
 */
export function startLine(
  state: Blocking,
  staging: LineStaging,
  speaker: LessonCharacterId | null,
  frame: StageFrame,
): Blocking {
  const facings = { ...state.facings, ...staging.facing };
  const offsets = { ...state.offsets };

  if (staging.approach && speaker) {
    const { characterId, toward } = staging.approach;
    offsets[characterId] = beside(frame, characterId, speaker, toward, state.offsets);
  }
  if (staging.enter) {
    const { characterId, from } = staging.enter;
    facings[characterId] = from === 1 ? -1 : 1;
    offsets[characterId] = 0;
  }

  const thing = frame.things.find((candidate) => candidate.id === staging.goTo);
  return walkGroup(
    { ...state, facings, offsets, tram: staging.arrives ? "coming" : state.tram },
    frame,
    staging.goTo && thing ? thingCenter(thing) : undefined,
  );
}

/** As a line ends: a speaker whose part is over walks off, and everyone gets on the tram. */
export function endLine(
  state: Blocking,
  staging: LineStaging,
  speaker: LessonCharacterId | null,
  frame: StageFrame,
): Blocking {
  let next = state;
  if (staging.exit && speaker) {
    next = {
      ...next,
      facings: { ...next.facings, [speaker]: staging.exit },
      offsets: { ...next.offsets, [speaker]: offStage(frame, speaker, staging.exit) },
    };
  }
  if (staging.boards) {
    next = { ...walkGroup(next, frame, { x: TRAM.door, y: 0 }), aboard: true };
  }
  return next;
}

/**
 * Where everyone is once the lines before `index` have played, with
 * nothing left in motion: a tram that was pulling in has stopped.
 */
export function blockingBefore(
  index: number,
  speakers: ReadonlyArray<LessonCharacterId | null>,
  stagings: readonly LineStaging[],
  frame: StageFrame,
): Blocking {
  let state = openingBlocking(stagings, frame);
  stagings.slice(0, index).forEach((staging, at) => {
    const speaker = speakers[at] ?? null;
    state = endLine(startLine(state, staging, speaker, frame), staging, speaker, frame);
  });

  return { ...state, tram: state.tram === "coming" ? "here" : state.tram };
}
