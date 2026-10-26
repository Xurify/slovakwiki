import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { Point } from "./rig";
import {
  SHELTER_WIDTHS,
  beside,
  offStage,
  onSeat,
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
  /** Who sits, on which of the frame's seats. */
  seated: Partial<Record<LessonCharacterId, number>>;
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
  return { aboard: false, facings: {}, offsets, seated: {}, tram: "away" };
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
  for (const id of ids.filter((id) => state.seated[id] === undefined)) {
    facings[id] = side;
    offsets[id] = (offsets[id] ?? 0) + by;
  }
  return { ...state, facings, offsets };
}

/** Everyone the line sits down walks to the free chair nearest them and turns the way it faces; whoever it gets up stands where they are. */
function seat(state: Blocking, staging: LineStaging, frame: StageFrame): Blocking {
  if (!staging.sit && !staging.stand) return state;

  const seated = { ...state.seated };
  const offsets = { ...state.offsets };
  const facings = { ...state.facings };
  for (const id of staging.stand ?? []) delete seated[id];

  for (const id of staging.sit ?? []) {
    if (seated[id] !== undefined || !frame.width) continue;
    const taken = new Set(Object.values(seated));
    const free = frame.seats.flatMap((chair, index) =>
      taken.has(index) ? [] : [{ index, chair }],
    );
    const here = offsets[id] ?? 0;
    const nearest = free.sort(
      (a, b) =>
        Math.abs(onSeat(frame, id, a.chair.x) - here) -
        Math.abs(onSeat(frame, id, b.chair.x) - here),
    )[0];
    if (!nearest) continue;
    seated[id] = nearest.index;
    offsets[id] = onSeat(frame, id, nearest.chair.x);
  }
  return { ...state, facings, offsets, seated };
}

/** Someone sitting faces the way their chair does, whoever talks: they turn their head, not the chair. */
export function seatedFacings(seated: Blocking["seated"], frame: StageFrame): CastFacing {
  return Object.fromEntries(
    Object.entries(seated).flatMap(([id, index]) => {
      const chair = index === undefined ? undefined : frame.seats[index];
      return chair ? [[id, chair.facing]] : [];
    }),
  );
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

  const seated = { ...state.seated };
  if (staging.approach && speaker) {
    const { characterId, close, toward } = staging.approach;
    delete seated[characterId];
    offsets[characterId] = beside(
      frame,
      characterId,
      speaker,
      toward,
      state.offsets,
      close ? SHELTER_WIDTHS : undefined,
    );
  }
  if (staging.enter) {
    const { characterId, from } = staging.enter;
    facings[characterId] = from === 1 ? -1 : 1;
    offsets[characterId] = 0;
  }
  if (staging.returns) {
    const { characterId, from, to } = staging.returns;
    const facing: Facing = from === 1 ? -1 : 1;
    facings[characterId] = facing;
    offsets[characterId] = beside(frame, characterId, to, facing, state.offsets);
  }

  const thing = frame.things.find((candidate) => candidate.id === staging.goTo);
  const next = seat(
    walkGroup(
      {
        ...state,
        facings,
        offsets,
        seated,
        tram: staging.arrives ? "coming" : state.tram,
      },
      frame,
      staging.goTo && thing ? thingCenter(thing) : undefined,
    ),
    staging,
    frame,
  );
  return { ...next, facings: { ...next.facings, ...seatedFacings(next.seated, frame) } };
}

/** As a line ends: a speaker whose part is over walks off, the dog runs after a throw, and everyone gets on the tram. */
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
  if (staging.throws) {
    const { fetcher, side } = staging.throws;
    next = {
      ...next,
      facings: { ...next.facings, [fetcher]: side },
      offsets: { ...next.offsets, [fetcher]: offStage(frame, fetcher, side) },
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
