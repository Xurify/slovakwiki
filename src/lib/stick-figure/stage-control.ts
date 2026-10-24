import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { StickGestureId } from "./gestures";
import type { LinePlan } from "./line-plan";
import type { SpeechClock } from "./performance";
import type { DirectedLine } from "./scene-direction";
import type { Facing } from "./staging";

/** The learner's recording of a line, said in its place, with the plan timed to it. */
export interface StageTake {
  plan: LinePlan;
  src: string;
}

/**
 * What a page can ask of the stage (StickStage.svelte): play a line, put
 * everyone where a line finds them, and the silent moments around lines.
 */
export interface StageControl {
  /** Walk `id` on from the `from` edge to their mark. */
  arrive(id: LessonCharacterId, from: Facing): void;
  /** Put every umbrella down: the rain has stopped, or the scene is over. */
  foldUmbrellas(): void;
  /** One silent gesture outside any line. */
  gesture(id: LessonCharacterId, gesture: StickGestureId): void;
  /** Light a thing up for a moment: one copy of it, or all. */
  light(id: string, copy?: number): void;
  /** Everyone where line `index` finds them, without walking there. */
  place(index: number): void;
  /** Act out line `index`; `rate` below 1 slows it, `take` says it in the learner's voice. */
  play(index: number, onDone?: () => void, rate?: number, take?: StageTake): void;
  /** A line said outside the script, voiced, as a talk's answer to a slip. */
  answer(
    id: LessonCharacterId,
    line: Pick<DirectedLine, "mouth" | "said" | "slovak" | "src" | "vowels">,
    rate?: number,
  ): void;
  /** Where the line being said is, on its clip or, with none playing, the wall clock. */
  clock(): SpeechClock | undefined;
  /** Words in a bubble over a figure, for what has no clip. */
  say(id: LessonCharacterId, text: string, ms?: number): void;
  size(): { height: number; width: number };
  stop(): void;
  /** Ms until the speaker of line `index` and the one they speak to stand where they say it. */
  ready(index: number): number;
}
