import { gestureDuration, gesturePeak, mouthAt, sampleGesture } from "./gestures";
import type { LinePlan } from "./line-plan";
import { NEUTRAL_LIPS, lipsFromTrack, mouthFromTrack } from "./mouth-track";
import { REST_POSE, easeInOut, lerpPose, type StickPose } from "./pose";

/** Cross-fade into a beat that cuts the previous gesture short. */
const BLEND_MS = 160;
/** Brows rise into a question and settle after it over this long. */
const QUESTION_RAMP_MS = 220;
const QUESTION_BROW = 0.8;
/** Reduced motion: a still, slightly open mouth while the line plays. */
const STILL_MOUTH = 0.3;

/** Where a line's clip is now. `durationMs` is NaN until its metadata loads. */
export interface SpeechClock {
  durationMs: number;
  timeMs: number;
}

export interface PerformanceState {
  beatIndex: number;
  /** Wall time the current beat started; gestures run in real time once cued. */
  beatStartedAt: number;
  blendFrom: StickPose;
}

export interface PerformanceInput {
  /** Wall clock, ms. */
  now: number;
  reducedMotion: boolean;
  /** Position in the clip, ms; null while the clip loads or waits for a tap. */
  speechMs: number | null;
  talking: boolean;
}

export interface PerformanceFrame {
  pose: StickPose;
  /** Nothing left to animate until the next line. */
  settled: boolean;
  state: PerformanceState;
}

export function startPerformance(): PerformanceState {
  return { beatIndex: -1, beatStartedAt: 0, blendFrom: REST_POSE };
}

function bodyAt(plan: LinePlan, state: PerformanceState, now: number): StickPose {
  const beat = plan.beats[state.beatIndex];
  if (!beat) return REST_POSE;

  const elapsed = now - state.beatStartedAt;
  const pose = sampleGesture(beat.gesture, elapsed);
  if (elapsed >= BLEND_MS) return pose;

  return lerpPose(state.blendFrom, pose, easeInOut(elapsed / BLEND_MS));
}

function questionBrow(plan: LinePlan, speechMs: number): number {
  let brow = 0;

  for (const { start, end } of plan.questions) {
    const rise = (speechMs - start) / QUESTION_RAMP_MS;
    const fall = (end + QUESTION_RAMP_MS - speechMs) / QUESTION_RAMP_MS;
    brow = Math.max(brow, Math.min(1, rise, fall));
  }

  return QUESTION_BROW * easeInOut(brow);
}

function mouthAtSpeech(
  plan: LinePlan,
  speechMs: number,
): Pick<StickPose, "mouth" | "mouthWidth" | "round"> {
  const lips = plan.lips ? lipsFromTrack(plan.lips, speechMs) : NEUTRAL_LIPS;
  let mouth = 0;
  if (plan.track) mouth = mouthFromTrack(plan.track, speechMs);
  else if (speechMs < plan.durationMs) mouth = mouthAt(speechMs);

  return { mouth, mouthWidth: lips.width, round: lips.round };
}

/**
 * One frame of a speaker's line. Beats fire when the clip reaches them, so a
 * slow-loading or stalled clip holds the figure instead of running ahead of
 * the voice; the mouth reads the clip position directly.
 */
export function performFrame(
  plan: LinePlan,
  previous: PerformanceState,
  { now, reducedMotion, speechMs, talking }: PerformanceInput,
): PerformanceFrame {
  let state = previous;

  if (talking && speechMs !== null) {
    let next = state.beatIndex;
    while (plan.beats[next + 1] && speechMs >= plan.beats[next + 1].at) next += 1;

    if (next !== state.beatIndex) {
      state = {
        beatIndex: next,
        beatStartedAt: now,
        blendFrom: bodyAt(plan, state, now),
      };
    }
  }

  const beat = plan.beats[state.beatIndex];
  const elapsed = now - state.beatStartedAt;
  const moving =
    beat !== undefined && (talking || elapsed < gestureDuration(beat.gesture));

  let pose: StickPose;
  if (reducedMotion) pose = moving && beat ? gesturePeak(beat.gesture) : REST_POSE;
  else pose = bodyAt(plan, state, now);

  if (talking && speechMs !== null) {
    pose = {
      ...pose,
      brow: Math.max(pose.brow, questionBrow(plan, speechMs)),
      ...(reducedMotion ? { mouth: STILL_MOUTH } : mouthAtSpeech(plan, speechMs)),
    };
  }

  return { pose, settled: !talking && !moving, state };
}
