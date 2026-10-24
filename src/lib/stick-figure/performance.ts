import { gestureDuration, gesturePeak, mouthAt, sampleGesture } from "./gestures";
import type { LineBeat, LinePlan } from "./line-plan";
import { NEUTRAL_LIPS, lipsFromTrack, mouthFromTrack } from "./mouth-track";
import type { StickPictureId } from "./pictures";
import { REST_POSE, easeInOut, lerpPose, type StickPose } from "./pose";

/** Cross-fade into a beat that cuts the previous gesture short. */
const BLEND_MS = 160;
/** Brows rise into a question and settle after it over this long. */
const QUESTION_RAMP_MS = 220;
const QUESTION_BROW = 0.8;
/** Reduced motion: a still, slightly open mouth while the line plays. */
const STILL_MOUTH = 0.3;
/** Long enough to see the picture, short enough not to outstay the line. */
const PICTURE_MS = 1800;

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
  /** The last picture the line called up, and the wall time it goes away. */
  picture?: { id: StickPictureId; until: number };
}

/**
 * Where a line is now in its plan's clip time: the clip position when the
 * plan was fitted to the clip's track, else that position stretched from
 * text timing to the clip's real length. Without a clip, `sinceStart` on
 * the wall clock; null while the clip loads.
 */
export function planTime(
  plan: LinePlan | undefined,
  reading: SpeechClock | undefined,
  sinceStart: number,
): number | null {
  if (!reading) return sinceStart;
  if (!(reading.durationMs > 0)) return null;
  if (plan?.track) return reading.timeMs;
  return reading.timeMs * ((plan?.durationMs ?? reading.durationMs) / reading.durationMs);
}

/** The word being said at `ms`: the last one started, -1 before the first. */
export function wordAt(plan: LinePlan | undefined, ms: number | null): number {
  if (ms === null || !plan?.words) return -1;
  return plan.words.findLastIndex((word) => ms >= word.start);
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
  /** Which way a point in flight turns the figure, when what it points at is behind it. */
  facing?: 1 | -1;
  /** Over the head for a moment once its word is said. */
  picture?: StickPictureId;
  pose: StickPose;
  /** Nothing left to animate until the next line. */
  settled: boolean;
  /** The beat that began on this frame, for the stage to light what it points at. */
  started?: LineBeat;
  state: PerformanceState;
}

/**
 * Start a line from `from`, the pose the last line left the figure in: a nod
 * still in flight eases back to rest instead of snapping there.
 */
export function startPerformance(now = 0, from: StickPose = REST_POSE): PerformanceState {
  return { beatIndex: -1, beatStartedAt: now, blendFrom: from };
}

function bodyAt(plan: LinePlan, state: PerformanceState, now: number): StickPose {
  const beat = plan.beats[state.beatIndex];
  const elapsed = now - state.beatStartedAt;
  const pose = beat ? sampleGesture(beat.gesture, elapsed, beat.point) : REST_POSE;
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
  const moving = beat
    ? talking || elapsed < gestureDuration(beat.gesture)
    : elapsed < BLEND_MS;

  let pose: StickPose;
  if (reducedMotion) {
    pose = moving && beat ? gesturePeak(beat.gesture, beat.point) : REST_POSE;
  } else {
    pose = bodyAt(plan, state, now);
  }

  if (talking && speechMs !== null && !plan.silent) {
    pose = {
      ...pose,
      brow: Math.max(pose.brow, questionBrow(plan, speechMs)),
      ...(reducedMotion ? { mouth: STILL_MOUTH } : mouthAtSpeech(plan, speechMs)),
    };
  }

  const called =
    talking && speechMs !== null && !plan.silent
      ? plan.pictures?.findLast((cue) => speechMs >= cue.at)?.picture
      : undefined;
  if (called && called !== state.picture?.id) {
    state = { ...state, picture: { id: called, until: now + PICTURE_MS } };
  }
  const picture =
    state.picture && now < state.picture.until ? state.picture.id : undefined;
  const facing =
    beat?.point?.facing !== undefined && elapsed < gestureDuration(beat.gesture)
      ? beat.point.facing
      : undefined;

  return {
    facing,
    picture,
    pose,
    settled: !talking && !moving && !picture,
    started: state.beatIndex !== previous.beatIndex ? beat : undefined,
    state,
  };
}
