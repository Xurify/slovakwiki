import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import { motionFor, type Motion } from "./act-motions";
import { applyCue, cueActor, type Cue, type World } from "./acts";
import { foldLine } from "./slovak-text";

/** Where a line's voice is on the stage's clock, ms. */
export interface LineTimes {
  /** When the stage started on the line: cues `before` the voice start here. */
  lead: number;
  /** When the voice starts. */
  speech: number;
  /** When it ends. */
  end: number;
  /** When a word of the line is said, by its folded form; undefined if the line has no such word. */
  word(folded: string): number | undefined;
}

export interface ScheduledCue {
  cue: Cue;
  who: LessonCharacterId;
  motion: Motion;
  start: number;
  end: number;
  /** The world as the cue starts, and once it has taken effect. */
  before: World;
  after: World;
}

/** A pause between one person's cues, so they read as two moves. */
const BETWEEN_MS = 120;

/**
 * Put a line's cues on the clock. Each starts on its anchor, or when the
 * one before it by the same person ends; a hand-over waits for both hands
 * to be free. `walkMs` is how long a `go` takes from where the stage has
 * the walker now.
 */
export function scheduleCues(
  cues: readonly Cue[],
  speaker: LessonCharacterId | null,
  world: World,
  times: LineTimes,
  walkMs: (who: LessonCharacterId, to: string) => number,
  /** When each person is done with what they were already doing. */
  busy: Partial<Record<LessonCharacterId, number>> = {},
): ScheduledCue[] {
  const free: Partial<Record<LessonCharacterId, number>> = { ...busy };
  const scheduled: ScheduledCue[] = [];
  let state = world;
  let last: number | undefined;

  for (const cue of cues) {
    const who = cueActor(cue, speaker);
    if (!who) continue;

    const { motion, partner } = motionFor(cue, who, state);
    const anchor = anchorTime(cue.on, times);
    const after = cue.on === undefined ? (last ?? times.speech) : anchor;
    const start = Math.max(
      after ?? times.speech,
      free[who] ?? 0,
      partner ? (free[partner.who] ?? 0) : 0,
    );
    const ms = cue.do === "go" ? walkMs(who, cue.to ?? "") : motion.ms;
    const end = start + ms;

    const next = applyCue(state, who, cue);
    scheduled.push({ cue, who, motion, start, end, before: state, after: next });
    if (partner) {
      scheduled.push({
        cue: { ...cue, who: partner.who, do: "offer" },
        who: partner.who,
        motion: partner.motion,
        start,
        end: start + partner.motion.ms,
        before: state,
        after: next,
      });
      free[partner.who] = start + partner.motion.ms + BETWEEN_MS;
    }
    state = next;
    if (cue.do !== "camera") free[who] = end + BETWEEN_MS;
    last = cue.do === "camera" ? start : end;
  }

  return scheduled;
}

function anchorTime(on: Cue["on"], times: LineTimes): number | undefined {
  switch (on) {
    case undefined:
      return undefined;
    case "before":
      return times.lead;
    case "start":
      return times.speech;
    case "end":
    case "after":
      return times.end;
    default:
      return times.word(foldLine(on)) ?? times.speech;
  }
}

/** How long the cues `before` the voice take: the line's voice waits this long after the stage starts on it. */
export function leadTime(
  cues: readonly Cue[],
  speaker: LessonCharacterId | null,
  world: World,
  walkMs: (who: LessonCharacterId, to: string) => number,
): number {
  const before = cues.slice(0, leadingCount(cues));
  if (before.length === 0) return 0;
  const times: LineTimes = { lead: 0, speech: 0, end: 0, word: () => undefined };
  const scheduled = scheduleCues(before, speaker, world, times, walkMs);
  return Math.max(0, ...scheduled.map(({ end, cue }) => (cue.do === "camera" ? 0 : end)));
}

/** The cues at the head of the list that play before the voice: `before` ones, and any unanchored ones straight after them. */
export function leadingCount(cues: readonly Cue[]): number {
  let count = 0;
  for (const cue of cues) {
    if (cue.on === "before" || (count > 0 && cue.on === undefined)) count += 1;
    else break;
  }
  return count;
}
