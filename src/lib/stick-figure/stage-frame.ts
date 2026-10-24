import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import { backdropToStage } from "./backdrop-geometry";
import { PLACES, backdropAlign } from "./places";
import { STICK_BOX, type Point } from "./rig";
import { STAGE_PADDING, stageMarks } from "./stage-layout";
import type { StageSetting } from "./stage-setting";
import type { Facing, LineStaging } from "./staging";
import type { SceneThing } from "./thing-words";

/** The stage's bottom padding, where the figures' feet stand. */
export const FLOOR = 12;
/** Centre to centre, in figure widths, when one figure stands beside another to look at something. */
const BESIDE_WIDTHS = 0.8;
/** Figure widths apart when called in under an umbrella: shoulder to shoulder, both under the canopy. */
export const SHELTER_WIDTHS = 0.45;

/** Figure widths each figure stands from its mark. */
export type Offsets = Partial<Record<LessonCharacterId, number>>;

/** Where a figure's box is drawn, in stage px. */
export interface Mark {
  left: number;
  top: number;
  width: number;
}

/** The stage as measured: its size in px, and where each figure's mark is on it. */
export interface StageFrame {
  /** How the backdrop is sliced to fill the stage (`backdropAlign`). */
  align: number;
  cast: readonly LessonCharacterId[];
  /** One figure's width. */
  figureWidth: number;
  height: number;
  /** The left edge of each figure's box, standing on its mark. */
  marks: Partial<Record<LessonCharacterId, number>>;
  /** What a line can take everyone over to. */
  things: readonly SceneThing[];
  width: number;
}

/** Who walks on during the scene, and from which side; they start off it. */
export function walkOns(
  stagings: readonly LineStaging[],
): Partial<Record<LessonCharacterId, Facing>> {
  return Object.fromEntries(
    stagings.flatMap(({ enter }) => (enter ? [[enter.characterId, enter.from]] : [])),
  );
}

/**
 * The frame of a stage `width` × `height` px: the cast in a row around the
 * place's post, or the middle, leaving out who is still to walk on.
 */
export function stageFrame(
  cast: readonly LessonCharacterId[],
  entering: Partial<Record<LessonCharacterId, Facing>>,
  setting: StageSetting,
  things: readonly SceneThing[],
  width: number,
  height: number,
): StageFrame {
  const align = backdropAlign(setting);
  const { post } = PLACES[setting];
  const at =
    post === undefined || !width
      ? undefined
      : backdropToStage({ x: post, y: 0 }, width, height, align).x;
  const { marks, width: figureWidth } = stageMarks(
    cast,
    entering,
    width,
    at,
    height || undefined,
  );

  return { align, cast, figureWidth, height, marks, things, width };
}

/** Stage x of a backdrop point. */
export function stageX(frame: StageFrame, point: Point): number {
  return backdropToStage(point, frame.width, frame.height, frame.align).x;
}

export function markOf(frame: StageFrame, id: LessonCharacterId): Mark {
  const width = frame.figureWidth;
  return {
    left: frame.marks[id] ?? 0,
    top: frame.height - FLOOR - (width * STICK_BOX.height) / STICK_BOX.width,
    width,
  };
}

export function standing(mark: Mark, offset = 0): Mark {
  return { ...mark, left: mark.left + offset * mark.width };
}

/** Figure widths from a figure's mark to where it stands beside `to`, wherever `to` stands in `at`. */
export function beside(
  frame: StageFrame,
  id: LessonCharacterId,
  to: LessonCharacterId,
  toward: Facing,
  at: Offsets,
  widths = BESIDE_WIDTHS,
): number {
  if (!frame.width) return toward * 0.5;

  const mark = markOf(frame, id);
  const gap = (standing(markOf(frame, to), at[to]).left - mark.left) / mark.width;
  const now = at[id] ?? 0;
  // Close enough already, after a walk the two made together, is close enough.
  return Math.abs(gap - now) > widths ? gap - Math.sign(gap - now) * widths : now;
}

/** Figure widths from a figure's mark to just past the stage edge on that side. */
export function offStage(frame: StageFrame, id: LessonCharacterId, side: Facing): number {
  if (!frame.width) return side * 4;

  const mark = markOf(frame, id);
  const distance = side > 0 ? frame.width - mark.left : mark.left + mark.width;
  return side * (distance / mark.width + 0.1);
}

/** Whether a figure stands on the stage, as opposed to off one side of it. */
export function onStage(frame: StageFrame, id: LessonCharacterId, at: Offsets): boolean {
  const mark = standing(markOf(frame, id), at[id]);
  return mark.left + mark.width > 0 && mark.left < frame.width;
}

/**
 * Figure widths everyone on stage moves, keeping their places in the row,
 * to stand centred on stage x `to`, or as near as the stage edge allows.
 */
export function shiftTo(
  frame: StageFrame,
  to: number,
  at: Offsets,
): { by: number; ids: LessonCharacterId[] } {
  const ids = frame.cast.filter((id) => onStage(frame, id, at));
  if (!frame.width || ids.length === 0) return { by: 0, ids };

  const marks = ids.map((id) => standing(markOf(frame, id), at[id]));
  const left = Math.min(...marks.map((mark) => mark.left));
  const right = Math.max(...marks.map((mark) => mark.left + mark.width));
  const shift = to - (left + right) / 2;
  const clamped = Math.min(
    frame.width - STAGE_PADDING - right,
    Math.max(STAGE_PADDING - left, shift),
  );
  return { by: clamped / marks[0].width, ids };
}
