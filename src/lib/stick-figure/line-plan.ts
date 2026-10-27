import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import {
  gestureDuration,
  type PointAim,
  type PointReach,
  type StickGestureId,
} from "./gestures";
import { gestureForLine } from "./line-gesture";
import {
  MOUTH_FRAME_MS,
  trackPauses,
  trackSpeechSpan,
  type LipTrack,
} from "./mouth-track";
import { linePictures, type StickPictureId } from "./pictures";
import { lineSentences, wordSentences } from "./slovak-text";
import { slovakSyllables, type VowelShape } from "./syllables";

/**
 * What a point aims at: a thing drawn in the backdrop (one `copy` of it,
 * where tento and tamten tell two apart), or what someone holds up.
 */
export type PointTarget =
  | { kind: "thing"; copy?: number; id: string }
  | { kind: "prop"; holder: LessonCharacterId };

/** A word the arm goes out on, and what it points at. */
export interface LinePoint {
  reach?: PointReach;
  target: PointTarget;
  /** Index among the line's words. */
  word: number;
}

export interface LineBeat {
  /** Clip time in ms. */
  at: number;
  gesture: StickGestureId;
  /**
   * A point's target. The stage works out `rise` and `facing` from where
   * everyone stands; the speaker turns that way while the point plays.
   */
  point?: PointAim & { facing?: 1 | -1; target: PointTarget };
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
  /** A picture to pop over the speaker's head as the word naming it is said. */
  pictures?: Array<{ at: number; picture: StickPictureId }>;
  questions: LineSpan[];
  /** Where each sentence is spoken, in clip time. */
  sentences: LineSpan[];
  /** A listener's plan: beats on the speaker's clock, mouth closed. */
  silent?: boolean;
  /** Loudness per frame (0–1), when the clip has one. */
  track?: number[];
  /** Where each word is spoken, in clip time, for captions that follow the voice. */
  words?: LineSpan[];
}

// Speech timing fitted on 120 lesson clips (eleven_v4, speed 0.88): sentence
// starts land a median ~35 ms from the real pause. Silence is the measured
// median before and after the voice.
const NUCLEUS_MS = 150;
const CONSONANT_MS = 30;
const LONG_EXTRA_MS = 40;
const COMMA_MS = 100;
const SENTENCE_GAP_MS = 360;
/** Silence where the clip text says `[pause]`: the median over the podcast's 19 pauses. */
const PAUSE_MS = 1050;
/** An audio tag in clip text: `[pause]` is said as silence, a direction such as `[slowly]` not at all. */
const TAG = /^\[[^\]]*\]$/;
const PAUSE_TAG = /^\[pause\]/i;
const LEAD_MS = 40;
const TAIL_MS = 180;

/** A long sentence gets another talking beat this often, a hand and a tilt of the head in turn. */
const TALK_EVERY_MS = 2600;
const FILLERS: readonly StickGestureId[] = ["tell", "muse"];
/** …unless less than this is left of it. */
const TALK_MIN_LEFT_MS = 900;
/** How far a sentence start may move to sit on a real pause in the track. */
const SNAP_MS = 400;
/** A gesture needs this long to read before the next one cuts in. */
const MIN_BEAT_GAP_MS = 700;
/** The arm starts out this far ahead of the word it points on, so it is up as the word lands. */
const POINT_LEAD_MS = 200;
/** A beat pushed later than this before the voice stops is dropped. */
const LATE_BEAT_MS = 300;

/** What a voice direction before the words looks like: the sigh or chuckle is seen as well as heard. */
const DIRECTED: Record<string, StickGestureId> = {
  chuckles: "chuckle",
  sighs: "sigh",
  yawns: "yawn",
};

function directedGesture(sentence: string): StickGestureId | undefined {
  const tag = /^\[([^\]]+)\]/.exec(sentence.trim())?.[1]?.toLowerCase();
  return tag ? DIRECTED[tag] : undefined;
}

export function estimateSpeechMs(text: string): number {
  let ms = 0;

  for (const token of text.match(/\[[^\]]*\]|\p{L}+|[,;:–—]/gu) ?? []) {
    if (TAG.test(token)) {
      if (PAUSE_TAG.test(token)) ms += PAUSE_MS;
      continue;
    }
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

/** Every syllable's nucleus time and every word's span from the text alone, and the speech length. */
export function textTimeline(text: string): {
  speechMs: number;
  syllables: TimedSyllable[];
  words: LineSpan[];
} {
  const syllables: TimedSyllable[] = [];
  const words: LineSpan[] = [];
  let ms = 0;
  let pendingPause = 0;

  for (const token of text.match(/\[[^\]]*\]|\p{L}+|[,;:–—]|[.!?…]+/gu) ?? []) {
    if (TAG.test(token)) {
      if (PAUSE_TAG.test(token)) pendingPause = Math.max(pendingPause, PAUSE_MS);
      continue;
    }
    if (!/\p{L}/u.test(token)) {
      pendingPause = Math.max(
        pendingPause,
        /[,;:–—]/.test(token) ? COMMA_MS : SENTENCE_GAP_MS,
      );
      continue;
    }

    let start: number | undefined;
    for (const syllable of slovakSyllables(token)) {
      if (syllables.length > 0) ms += pendingPause;
      pendingPause = 0;
      start ??= ms;

      const onset = CONSONANT_MS * syllable.consonants;
      const length = NUCLEUS_MS + onset + (syllable.long ? LONG_EXTRA_MS : 0);
      syllables.push({ at: ms + onset + (length - onset) * 0.45, vowel: syllable.vowel });
      ms += length;
    }
    words.push({ start: start ?? ms, end: ms });
  }

  return { speechMs: ms, syllables, words };
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
  /** Per-sentence overrides for the gesture picked from the text; gaps stay automatic. */
  gestures?: ReadonlyArray<StickGestureId | undefined>;
  lips?: LipTrack;
  /** Said into a phone: its hello or goodbye is to the caller, not waved to anyone here. */
  phone?: boolean;
  /** Words to point on, from what the scene has to point at. */
  points?: readonly LinePoint[];
  /** The clip's text, when it marks pauses the line does not show (`[pause]`). */
  said?: string;
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
  { gestures, lips, phone, points = [], said, track }: LineClip = {},
): LinePlan {
  const sentences = lineSentences(slovak);
  const saidSentences = said ? lineSentences(said) : [];
  const timed = saidSentences.length === sentences.length ? saidSentences : sentences;
  const gaps = timed.map((sentence, index) =>
    index === 0 ? 0 : PAUSE_TAG.test(sentence) ? PAUSE_MS : SENTENCE_GAP_MS,
  );
  const lengths = timed.map((sentence) =>
    estimateSpeechMs(sentence.replace(PAUSE_TAG, "")),
  );
  const speechMs = [...lengths, ...gaps].reduce((sum, ms) => sum + ms, 0);

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
  const spans: LineSpan[] = [];
  let cursor = 0;

  sentences.forEach((sentence, index) => {
    cursor += gaps[index];
    const estimated = origin + cursor * scale;
    const start =
      index === 0 ? estimated : (nearestPauseEnd(pauses, estimated) ?? estimated);
    const end = origin + (cursor + lengths[index]) * scale;
    const picked =
      gestures?.[index] ??
      (index === 0 ? directedGesture(saidSentences[0] ?? "") : undefined) ??
      gestureForLine(sentence);
    const gesture = phone && picked === "wave" ? "tell" : picked;

    beats.push({ at: start, gesture });

    let filler = FILLERS.indexOf(gesture) === 0 ? 1 : 0;
    for (
      let at = start + Math.max(TALK_EVERY_MS, gestureDuration(gesture));
      end - at >= TALK_MIN_LEFT_MS;
      at += TALK_EVERY_MS
    ) {
      beats.push({ at, gesture: FILLERS[filler] });
      filler = 1 - filler;
    }

    if (sentence.includes("?")) questions.push({ start, end });
    spans.push({ start, end });
    cursor += lengths[index];
  });

  const sentenceOf = wordSentences(slovak);
  const words = fitWords(textTimeline(said ?? slovak).words, sentenceOf, spans);
  for (const { reach, target, word } of points) {
    const said = words[word];
    const sentence = spans[sentenceOf[word] ?? -1];
    if (!said || !sentence) continue;

    beats.push({
      at: Math.max(sentence.start, said.start - POINT_LEAD_MS),
      gesture: "point",
      point: { reach, target },
    });
  }

  beats.sort((a, b) => a.at - b.at);
  const speechEnd = origin + speechMs * scale;
  const pictures = linePictures(slovak).map(({ picture, word }) => ({
    at: words[word]?.start ?? origin,
    picture,
  }));

  return {
    beats: spaceBeats(beats, speechEnd),
    durationMs,
    lips,
    pictures,
    questions,
    sentences: spans,
    track,
    words,
  };
}

/**
 * Each word's span in clip time: its place in its sentence, laid over where
 * the sentence is spoken. A sentence start sits on the real pause before it,
 * so a long `[pause]` in the clip does not leave the words after it early.
 */
function fitWords(
  words: readonly LineSpan[],
  sentenceOf: readonly number[],
  sentences: readonly LineSpan[],
): LineSpan[] {
  return words.map((word, index) => {
    const sentence = sentences[sentenceOf[index] ?? -1];
    if (!sentence) return word;

    const own = words.filter((_, other) => sentenceOf[other] === sentenceOf[index]);
    const from = own[0].start;
    const length = own[own.length - 1].end - from;
    const at = (ms: number) =>
      sentence.start +
      (length > 0 ? ((ms - from) / length) * (sentence.end - sentence.start) : 0);

    return { end: at(word.end), start: at(word.start) };
  });
}

/**
 * Short sentences would chain gestures faster than they read ("Dobrý deň.
 * Volám sa Anna." in under a second), so each beat waits for the last one.
 * A point belongs on its word: it takes over from a beat that has not had
 * time to read, and talking beats leave it alone until it is done.
 */
function spaceBeats(beats: LineBeat[], speechEnd: number): LineBeat[] {
  const spaced: LineBeat[] = [];

  for (const beat of beats) {
    let previous = spaced.at(-1);
    if (
      beat.point &&
      previous &&
      !previous.point &&
      beat.at - previous.at < MIN_BEAT_GAP_MS
    ) {
      spaced.pop();
      previous = spaced.at(-1);
    }
    if (
      FILLERS.includes(beat.gesture) &&
      previous?.point &&
      beat.at - previous.at < gestureDuration("point")
    ) {
      continue;
    }

    const at = previous ? Math.max(beat.at, previous.at + MIN_BEAT_GAP_MS) : beat.at;
    if (previous && at > speechEnd - LATE_BEAT_MS) continue;

    spaced.push({ ...beat, at });
  }

  return spaced;
}

/**
 * One gesture from the start, mouth shut: a listener glancing at what is
 * pointed at, or a gesture tried without a line. It may run while someone
 * else's clip plays, so it must not move its mouth to that voice.
 */
export function gesturePlan(gesture: StickGestureId): LinePlan {
  return {
    beats: [{ at: 0, gesture }],
    durationMs: gestureDuration(gesture),
    questions: [],
    sentences: [],
    silent: true,
  };
}

/**
 * A listener's one silent gesture at `at` in the speaker's line. It keeps the
 * speaker's length and track because the player maps clip time through them,
 * so the beat lands on the same word for both figures.
 */
export function reactionPlan(
  speaker: LinePlan,
  gesture: StickGestureId,
  at: number,
): LinePlan {
  return {
    beats: [{ at, gesture }],
    durationMs: speaker.durationMs,
    questions: [],
    sentences: [],
    silent: true,
    track: speaker.track,
  };
}
