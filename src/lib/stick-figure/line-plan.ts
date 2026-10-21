import { gestureDuration, type StickGestureId } from "./gestures";
import { gestureForLine } from "./line-gesture";
import {
  MOUTH_FRAME_MS,
  trackPauses,
  trackSpeechSpan,
  type LipTrack,
} from "./mouth-track";
import { slovakSyllables, type VowelShape } from "./syllables";

export interface LineBeat {
  /** Clip time in ms. */
  at: number;
  gesture: StickGestureId;
}

export interface LineSpan {
  end: number;
  start: number;
}

/** What a speaker does over one clip: gestures per sentence, raised brows on questions. */
export interface LinePlan {
  beats: LineBeat[];
  durationMs: number;
  /** Lip shape per frame, when the clip has an aligned vowel track. */
  lips?: LipTrack;
  questions: LineSpan[];
  /** Loudness per frame (0–1), when the clip has one. */
  track?: number[];
}

// Speech timing fitted on 120 lesson clips (eleven_v4, speed 0.88): sentence
// starts land a median ~35 ms from the real pause. Silence is the measured
// median before and after the voice.
const NUCLEUS_MS = 150;
const CONSONANT_MS = 30;
const LONG_EXTRA_MS = 40;
const COMMA_MS = 100;
const SENTENCE_GAP_MS = 360;
const LEAD_MS = 40;
const TAIL_MS = 180;

/** A long sentence gets another talking beat this often. */
const TALK_EVERY_MS = 1800;
/** …unless less than this is left of it. */
const TALK_MIN_LEFT_MS = 900;
/** How far a sentence start may move to sit on a real pause in the track. */
const SNAP_MS = 400;
/** A gesture needs this long to read before the next one cuts in. */
const MIN_BEAT_GAP_MS = 700;
/** A beat pushed later than this before the voice stops is dropped. */
const LATE_BEAT_MS = 300;

export function lineSentences(slovak: string): string[] {
  return (slovak.match(/[^.!?…]+[.!?…]*/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter((sentence) => /\p{L}/u.test(sentence));
}

export function estimateSpeechMs(text: string): number {
  let ms = 0;

  for (const token of text.match(/\p{L}+|[,;:–—]/gu) ?? []) {
    if (!/\p{L}/u.test(token)) {
      ms += COMMA_MS;
      continue;
    }

    for (const syllable of slovakSyllables(token)) {
      ms += NUCLEUS_MS + CONSONANT_MS * syllable.consonants;
      if (syllable.long) ms += LONG_EXTRA_MS;
    }
  }

  return ms;
}

export interface TimedSyllable {
  /** Nucleus time from the start of the speech, ms. */
  at: number;
  vowel: VowelShape;
}

/** Every syllable's nucleus time from the text alone, and the speech length. */
export function textTimeline(text: string): {
  speechMs: number;
  syllables: TimedSyllable[];
} {
  const syllables: TimedSyllable[] = [];
  let ms = 0;
  let pendingPause = 0;

  for (const token of text.match(/\p{L}+|[,;:–—]|[.!?…]+/gu) ?? []) {
    if (!/\p{L}/u.test(token)) {
      pendingPause = Math.max(
        pendingPause,
        /[,;:–—]/.test(token) ? COMMA_MS : SENTENCE_GAP_MS,
      );
      continue;
    }

    for (const syllable of slovakSyllables(token)) {
      if (syllables.length > 0) ms += pendingPause;
      pendingPause = 0;

      const onset = CONSONANT_MS * syllable.consonants;
      const length = NUCLEUS_MS + onset + (syllable.long ? LONG_EXTRA_MS : 0);
      syllables.push({ at: ms + onset + (length - onset) * 0.45, vowel: syllable.vowel });
      ms += length;
    }
  }

  return { speechMs: ms, syllables };
}

function nearestPauseEnd(pauses: LineSpan[], at: number): number | undefined {
  let best: number | undefined;

  for (const pause of pauses) {
    const distance = Math.abs(pause.end - at);
    if (distance <= SNAP_MS && (best === undefined || distance < Math.abs(best - at))) {
      best = pause.end;
    }
  }

  return best;
}

export interface LineClip {
  /** Per-sentence overrides for the gesture picked from the text. */
  gestures?: StickGestureId[];
  lips?: LipTrack;
  /** Loudness per frame (0–1). */
  track?: number[];
}

/**
 * Plan a speaker's line. Without a track, times come from the text estimate
 * and the player stretches them to the real clip length. With one, the
 * estimate is fitted to where the voice sounds and each sentence start moves
 * onto the pause before it.
 */
export function planLine(
  slovak: string,
  { gestures, lips, track }: LineClip = {},
): LinePlan {
  const sentences = lineSentences(slovak);
  const lengths = sentences.map(estimateSpeechMs);
  const speechMs =
    lengths.reduce((sum, length) => sum + length, 0) +
    SENTENCE_GAP_MS * Math.max(0, sentences.length - 1);

  const span = track ? trackSpeechSpan(track) : undefined;
  const pauses = track ? trackPauses(track) : [];
  const origin = span?.start ?? LEAD_MS;
  const scale = span && speechMs > 0 ? (span.end - span.start) / speechMs : 1;
  const durationMs =
    track && track.length > 0
      ? track.length * MOUTH_FRAME_MS
      : LEAD_MS + speechMs + TAIL_MS;

  const beats: LineBeat[] = [];
  const questions: LineSpan[] = [];
  let cursor = 0;

  sentences.forEach((sentence, index) => {
    const estimated = origin + cursor * scale;
    const start =
      index === 0 ? estimated : (nearestPauseEnd(pauses, estimated) ?? estimated);
    const end = origin + (cursor + lengths[index]) * scale;
    const gesture = gestures?.[index] ?? gestureForLine(sentence);

    beats.push({ at: start, gesture });

    for (
      let at = start + Math.max(TALK_EVERY_MS, gestureDuration(gesture));
      end - at >= TALK_MIN_LEFT_MS;
      at += TALK_EVERY_MS
    ) {
      beats.push({ at, gesture: "talk" });
    }

    if (sentence.includes("?")) questions.push({ start, end });
    cursor += lengths[index] + SENTENCE_GAP_MS;
  });

  beats.sort((a, b) => a.at - b.at);
  const speechEnd = origin + speechMs * scale;

  return { beats: spaceBeats(beats, speechEnd), durationMs, lips, questions, track };
}

/**
 * Short sentences would chain gestures faster than they read ("Dobrý deň.
 * Volám sa Anna." in under a second), so each beat waits for the last one.
 */
function spaceBeats(beats: LineBeat[], speechEnd: number): LineBeat[] {
  const spaced: LineBeat[] = [];

  for (const beat of beats) {
    const previous = spaced.at(-1);
    const at = previous ? Math.max(beat.at, previous.at + MIN_BEAT_GAP_MS) : beat.at;
    if (previous && at > speechEnd - LATE_BEAT_MS) continue;

    spaced.push({ ...beat, at });
  }

  return spaced;
}

/** One gesture from the start, for trying gestures without a line. */
export function gesturePlan(gesture: StickGestureId): LinePlan {
  return {
    beats: [{ at: 0, gesture }],
    durationMs: gestureDuration(gesture),
    questions: [],
  };
}
