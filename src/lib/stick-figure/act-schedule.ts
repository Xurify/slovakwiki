import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import { motionFor, type Motion } from "./act-motions";
import { applyCue, cueActor, type Cue, type SetPlan, type World } from "./acts";
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
  /** The other half of a hand-over: it moves, but the cue it answers is the one that changes the world. */
  partner?: boolean;
}

/** Verbs that move someone across the stage: they take as long as the walk. */
const WALKS = new Set<Cue["do"]>(["go", "enter", "sit"]);

/** A pause between one person's cues, so they read as two moves. */
const BETWEEN_MS = 120;
/** How far into a `skip` the lights are down, for the cues that happen in the dark. */
export const DARK_MS = 1300;

/** How long a walk takes: `go`, `enter` or `sit` by `who`, from where `before` has them. */
export type WalkMs = (who: LessonCharacterId, cue: Cue, before: World) => number;

/**
 * Put a line's cues on the clock. Each starts on its anchor, or when the
 * one before it by the same person ends; a hand-over waits for both hands
 * to be free.
 */
export function scheduleCues(
  cues: readonly Cue[],
  speaker: LessonCharacterId | null,
  world: World,
  times: LineTimes,
  walkMs: WalkMs,
  /** When each person is done with what they were already doing. */
  busy: Partial<Record<LessonCharacterId, number>> = {},
  plan?: SetPlan,
): ScheduledCue[] {
  const free: Partial<Record<LessonCharacterId, number>> = { ...busy };
  const scheduled: ScheduledCue[] = [];
  let state = world;
  let last: number | undefined;
  let dark: number | undefined;

  for (const cue of cues) {
    const who = cueActor(cue, speaker);
    if (!who) continue;

    // In the dark, it is simply so: no motion, no waiting on anyone.
    if (cue.on === "dark") {
      const next = applyCue(state, who, cue, plan);
      const at = dark ?? times.end;
      scheduled.push({
        cue,
        who,
        motion: { ms: 0, keys: [] },
        start: at,
        end: at,
        before: state,
        after: next,
      });
      state = next;
      continue;
    }

    const { motion, partner } = motionFor(cue, who, state);
    const anchor = anchorTime(cue.on, times);
    const after = cue.on === undefined ? (last ?? times.speech) : anchor;
    const start = Math.max(
      after ?? times.speech,
      free[who] ?? 0,
      partner ? (free[partner.who] ?? 0) : 0,
    );
    const ms = WALKS.has(cue.do) ? walkMs(who, cue, state) : motion.ms;
    const end = start + ms;

    const next = applyCue(state, who, cue, plan);
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
        partner: true,
      });
      free[partner.who] = start + partner.motion.ms + BETWEEN_MS;
    }
    state = next;
    if (cue.do === "skip") dark = start + DARK_MS;
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
  walkMs: WalkMs,
  plan?: SetPlan,
): number {
  const before = cues.slice(0, leadingCount(cues));
  if (before.length === 0) return 0;
  const times: LineTimes = { lead: 0, speech: 0, end: 0, word: () => undefined };
  const scheduled = scheduleCues(before, speaker, world, times, walkMs, {}, plan);
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
