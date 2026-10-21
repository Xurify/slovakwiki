import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { StickGestureId } from "./gestures";
import { foldLine } from "./line-gesture";
import { lineSentences } from "./line-plan";

/** 1 faces right (+x), -1 faces left. */
export type Facing = 1 | -1;

export type CastFacing = Partial<Record<LessonCharacterId, Facing>>;

export interface StageLine {
  /** Null when nobody on stage says it: a notice, the narrator. */
  characterId: LessonCharacterId | null;
  slovak: string;
  /** Who it is said to, when that is not the person it replies to. */
  to?: LessonCharacterId;
}

export interface StageReaction {
  characterId: LessonCharacterId;
  gesture: StickGestureId;
  /** The sentence of the line it answers… */
  sentence: number;
  /** …and how far into it: 0 its start, 1 its end. */
  at: number;
}

export interface LineStaging {
  addressee: LessonCharacterId | null;
  /** Where each figure faces while the line plays; figures left out keep theirs. */
  facing: CastFacing;
  /** Silent gestures from the one spoken to. */
  reactions: StageReaction[];
  /** Where the speaker turns once a goodbye ends. */
  exit?: Facing;
}

/** Folded sentence openers the one spoken to nods at. */
const NOD_AT = ["dakujem", "dakujeme", "vdaka", "tesi ma", "prepacte", "prepac"];
const GOODBYES = ["dovidenia", "do videnia", "maj sa", "majte sa", "zbohom", "dobru noc"];

function opensWith(sentence: string, openers: string[]): boolean {
  const folded = foldLine(sentence);
  return openers.some((opener) => folded === opener || folded.startsWith(`${opener} `));
}

function mentions(sentence: string, phrases: string[]): boolean {
  const folded = ` ${foldLine(sentence)} `;
  return phrases.some((phrase) => folded.includes(` ${phrase} `));
}

function toward(
  cast: readonly LessonCharacterId[],
  from: LessonCharacterId,
  to: LessonCharacterId,
): Facing {
  return cast.indexOf(to) > cast.indexOf(from) ? 1 : -1;
}

/** Before anyone speaks, each figure faces the middle of the stage. */
export function restFacing(cast: readonly LessonCharacterId[]): CastFacing {
  return Object.fromEntries(
    cast.map((id, index) => [id, index < cast.length / 2 ? 1 : -1]),
  );
}

/**
 * Who a line is said to: the person it replies to, else the next one to
 * speak. A line's `to` wins, for turns like ordering from a waiter who has
 * not spoken yet.
 */
export function addresseeOf(
  lines: readonly StageLine[],
  index: number,
): LessonCharacterId | null {
  const speaker = lines[index]?.characterId;
  if (!speaker) return null;

  const to = lines[index].to;
  if (to && to !== speaker) return to;

  const other = (line: StageLine) =>
    line.characterId !== null && line.characterId !== speaker;
  const replyTo = lines.slice(0, index).findLast(other);
  const next = lines.slice(index + 1).find(other);
  return replyTo?.characterId ?? next?.characterId ?? null;
}

/**
 * One reaction at most, so a listener answers the line instead of
 * fidgeting: lean in to a question, nod at the answer to their own question,
 * or at thanks and apologies.
 */
function reactionTo(
  lines: readonly StageLine[],
  index: number,
  addressee: LessonCharacterId,
): StageReaction | undefined {
  const sentences = lineSentences(lines[index].slovak);

  const question = sentences.findLastIndex((sentence) => sentence.includes("?"));
  if (question !== -1) {
    return { characterId: addressee, gesture: "lean", sentence: question, at: 0.5 };
  }

  const previous = lines[index - 1];
  if (previous?.characterId === addressee && previous.slovak.trim().endsWith("?")) {
    return {
      characterId: addressee,
      gesture: "nod",
      sentence: sentences.length - 1,
      at: 1,
    };
  }

  const thanks = sentences.findIndex((sentence) => opensWith(sentence, NOD_AT));
  if (thanks !== -1) {
    return { characterId: addressee, gesture: "nod", sentence: thanks, at: 1 };
  }

  return undefined;
}

/**
 * Stage direction for one line: the speaker turns to the one spoken to,
 * everyone else turns to the speaker, and the one spoken to may react. A
 * speaker whose last line is a goodbye turns away when it ends.
 */
export function stageLine(
  lines: readonly StageLine[],
  index: number,
  cast: readonly LessonCharacterId[],
): LineStaging {
  const speaker = lines[index]?.characterId;
  if (!speaker || !cast.includes(speaker)) {
    return { addressee: null, facing: {}, reactions: [] };
  }

  const addressee = addresseeOf(lines, index);
  const onStage = addressee !== null && cast.includes(addressee);
  const facing: CastFacing = {};

  for (const id of cast) {
    if (id !== speaker) facing[id] = toward(cast, id, speaker);
    else if (onStage) facing[id] = toward(cast, id, addressee);
  }

  const reaction = onStage ? reactionTo(lines, index, addressee) : undefined;
  const lastOwnLine = !lines
    .slice(index + 1)
    .some((line) => line.characterId === speaker);
  const goodbye = lineSentences(lines[index].slovak).some((sentence) =>
    mentions(sentence, GOODBYES),
  );
  const turnedTo = facing[speaker];

  return {
    addressee,
    facing,
    reactions: reaction ? [reaction] : [],
    exit: lastOwnLine && goodbye && turnedTo ? (-turnedTo as Facing) : undefined,
  };
}
