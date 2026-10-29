/**
 * Lesson story line audio — ElevenLabs MP3 only.
 *
 * Never fall back to browser `speechSynthesis` (sk-SK). System voices
 * mispronounce Slovak and recreate the old “bad lesson audio” bug after the
 * Aug 2026 Flash + `languageCode: sk` dictionary fix.
 *
 * If a clip is missing or muted: honor minimum dwell then `onEnded`.
 * If autoplay is blocked: stash the clip and wait for a user gesture
 * (Next / say-choice via `unlockStoryAudio`, any other tap via
 * `primeStoryAudio`) — do not silent-advance.
 *
 * Every line plays through one shared element: iOS Safari unlocks playback
 * per element on a gesture, so a fresh `new Audio()` for each line would be
 * blocked again when the next line autoplays from a timer.
 *
 * Respects the lesson chrome mute toggle (`slovak.wiki.sfx-preference`).
 */

import { playClockFrozen, playClockNow, playClockTimeout } from "$lib/audio/play-clock";
import { AUDIO_VOLUME_CHANGE_EVENT, applyAudioVolume } from "$lib/audio/volume";
import { SFX_CHANGE_EVENT, getStoredSfxPreference } from "$lib/audio/sfx";

let currentAudio: HTMLAudioElement | undefined;
let storyAudio: HTMLAudioElement | undefined;
let storyAudioUnlocked = false;
let playGeneration = 0;
let playAttempt = 0;
let cancelDwell: (() => void) | undefined;
/** The clip was paused by `pauseStoryLineAudio` and is waiting to be played on. */
let pausedMidClip = false;
let muteListenerAttached = false;
/** A clip on its way: what its end, and a play that does not start, need. */
interface Clip {
  generation: number;
  onEnded?: () => void;
  rate: number;
  silentMs?: number;
  src: string;
  startedAt: number;
}

let pending: Clip | undefined;
/** The clip the shared element is playing, or holding for a pause. */
let currentClip: Clip | undefined;

/** 10 ms of 8 kHz silence — enough for a gesture to unlock the shared element. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";

/** Floor so a missing/broken clip cannot blaze through the whole scene. */
const MIN_STORY_DWELL_MS = 1600;

/** Autoplay block vs replace-in-flight vs a real load/decode failure. */
export function classifyPlayFailure(reason: unknown): "abort" | "autoplay" | "error" {
  const name =
    reason && typeof reason === "object" && "name" in reason
      ? String((reason as { name: unknown }).name)
      : "";

  if (name === "NotAllowedError") return "autoplay";
  if (name === "AbortError") return "abort";
  return "error";
}

function audioMuted(): boolean {
  return getStoredSfxPreference() === "off";
}

function ensureMuteListener(): void {
  if (muteListenerAttached || typeof window === "undefined") return;
  muteListenerAttached = true;
  window.addEventListener(SFX_CHANGE_EVENT, () => {
    if (audioMuted()) silenceClip();
  });
  window.addEventListener(AUDIO_VOLUME_CHANGE_EVENT, () => {
    if (currentAudio) applyAudioVolume(currentAudio);
  });
}

function sharedStoryAudio(): HTMLAudioElement {
  storyAudio ??= new Audio();
  storyAudio.preload = "auto";
  return storyAudio;
}

function clearDwell(): void {
  cancelDwell?.();
  cancelDwell = undefined;
}

function stopAll(): void {
  playGeneration += 1;
  clearDwell();
  pending = undefined;
  pausedMidClip = false;
  currentClip = undefined;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = undefined;
  }
}

/**
 * Sound turned off mid-line: the clip falls silent, and its line still ends
 * where the clip would have, so the stage and the segment carry on.
 */
function silenceClip(): void {
  const clip = currentClip;
  // A missing/already muted clip still has a dwell timer. Muting again must not cancel it.
  if (!clip) return;

  const elapsed = playClockNow() - clip.startedAt;
  // The media's seconds left, as play time: a clip at a slower rate takes longer to play them out.
  const left = currentAudio ? currentAudio.duration - currentAudio.currentTime : NaN;
  const remainingMs = Number.isFinite(left) ? Math.max(0, (left * 1000) / clip.rate) : 0;
  stopAll();
  scheduleEnded(
    playGeneration,
    clip.startedAt,
    clip.onEnded,
    Math.max(clip.silentMs ?? 0, elapsed + remainingMs),
  );
}

function scheduleEnded(
  generation: number,
  startedAt: number,
  onEnded?: () => void,
  silentMs = 0,
): void {
  if (generation !== playGeneration || !onEnded) return;

  clearDwell();
  const dwell = Math.max(MIN_STORY_DWELL_MS, silentMs);
  const wait = Math.max(0, dwell - (playClockNow() - startedAt));
  cancelDwell = playClockTimeout(() => {
    cancelDwell = undefined;
    if (generation !== playGeneration) return;
    onEnded();
  }, wait);
}

function attachPlayback(
  audio: HTMLAudioElement,
  generation: number,
  startedAt: number,
  onEnded?: () => void,
  silentMs?: number,
): void {
  audio.onended = () => scheduleEnded(generation, startedAt, onEnded);
  audio.onerror = () => {
    scheduleEnded(generation, startedAt, onEnded, silentMs);
  };
}

/**
 * A play that did not start: a blocked clip waits for a gesture, a broken one
 * ends its line as a missing clip would, so the line never stalls.
 */
function playFailed(clip: Clip, reason: unknown): void {
  if (clip.generation !== playGeneration) return;

  const kind = classifyPlayFailure(reason);
  if (kind === "autoplay") {
    pending = clip;
    return;
  }

  if (kind === "abort") return;

  scheduleEnded(clip.generation, clip.startedAt, clip.onEnded, clip.silentMs);
}

function startPlayback(audio: HTMLAudioElement, clip: Clip): void {
  const attempt = ++playAttempt;
  const current = () => clip.generation === playGeneration && attempt === playAttempt;
  void audio.play().then(
    () => {
      if (!current()) return;
      storyAudioUnlocked = true;
      pending = undefined;
    },
    (reason: unknown) => {
      if (current()) playFailed(clip, reason);
    },
  );
}

function tryPlay(
  src: string,
  generation: number,
  startedAt: number,
  onEnded?: () => void,
  rate = 1,
  silentMs?: number,
): void {
  if (audioMuted()) {
    scheduleEnded(generation, startedAt, onEnded, silentMs);
    return;
  }

  const audio = sharedStoryAudio();
  const clip: Clip = { generation, onEnded, rate, silentMs, src, startedAt };
  audio.src = src;
  audio.playbackRate = rate;
  applyAudioVolume(audio);
  currentAudio = audio;
  currentClip = clip;
  attachPlayback(audio, generation, startedAt, onEnded, silentMs);

  startPlayback(audio, clip);
}

/** True when a clip is waiting for a user gesture after autoplay was blocked. */
export function hasPendingStoryAudio(): boolean {
  return Boolean(pending && pending.generation === playGeneration);
}

export function isStoryLineAudioActive(): boolean {
  if (cancelDwell || hasPendingStoryAudio()) return true;
  return Boolean(currentAudio && !currentAudio.paused);
}

export interface StoryAudioClock {
  /** NaN until the clip's metadata loads. */
  durationMs: number;
  timeMs: number;
}

/**
 * Position of the line now playing, so visuals follow the real playback
 * (it can start late, stall, or wait for a tap). Undefined when the line
 * has no clip to play: muted or missing.
 */
export function storyAudioClock(): StoryAudioClock | undefined {
  if (!currentAudio) return undefined;
  return {
    durationMs: currentAudio.duration * 1000,
    timeMs: currentAudio.currentTime * 1000,
  };
}

/**
 * Call from a user gesture (Listen / Next / say-choice) so autoplay-blocked
 * lines can play the real ElevenLabs MP3.
 */
export function unlockStoryAudio(): void {
  // A pause holds a waiting clip back too: it plays when the pause ends.
  if (!pending || audioMuted() || playClockFrozen()) return;

  const clip = pending;
  const { generation, onEnded, rate, silentMs, src, startedAt } = clip;
  if (generation !== playGeneration) {
    pending = undefined;
    return;
  }

  clearDwell();
  pending = undefined;
  pausedMidClip = false;

  // Retrying a blocked Resume must not assign src again: that rewinds the clip.
  if (currentAudio && currentClip === clip) {
    startPlayback(currentAudio, clip);
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = undefined;
  }

  playGeneration += 1;
  tryPlay(src, playGeneration, startedAt, onEnded, rate, silentMs);
}

export function primeStoryAudio(): void {
  if (typeof window === "undefined" || audioMuted()) return;

  if (hasPendingStoryAudio()) {
    unlockStoryAudio();
    return;
  }

  if (storyAudioUnlocked || currentAudio) return;

  const audio = sharedStoryAudio();
  audio.onended = null;
  audio.onerror = null;
  audio.src = SILENT_WAV;
  void audio.play().then(
    () => {
      storyAudioUnlocked = true;
    },
    () => {},
  );
}

export interface PlayStoryLineOptions {
  /** Fires when playback finishes (honors a minimum on-screen dwell). */
  onEnded?: () => void;
  playbackRate?: number;
  /**
   * How long the line lasts when nothing plays (muted, missing or broken
   * clip), so figures acting it out get to its end; the dwell floor otherwise.
   */
  silentMs?: number;
}

/** Play a lesson line; replaces any in-flight story audio. MP3 only — no TTS. */
export function playStoryLineAudio(
  src: string | undefined,
  _text: string,
  options: PlayStoryLineOptions = {},
): void {
  if (typeof window === "undefined") return;

  ensureMuteListener();

  const { onEnded, playbackRate = 1, silentMs } = options;
  stopAll();
  const generation = playGeneration;
  const startedAt = playClockNow();

  if (!src || audioMuted()) {
    scheduleEnded(generation, startedAt, onEnded, silentMs);
    return;
  }

  tryPlay(src, generation, startedAt, onEnded, playbackRate, silentMs);
}

export function stopStoryLineAudio(): void {
  stopAll();
}

/**
 * Hold the clip where it is, for a pause. Its dwell waits on the play clock,
 * which the pause freezes too, so the clip and the stage stop together.
 */
export function pauseStoryLineAudio(): void {
  if (!currentAudio || currentAudio.paused) return;
  playAttempt += 1;
  currentAudio.pause();
  pausedMidClip = true;
}

/** Play on from where `pauseStoryLineAudio` held the clip. */
export function resumeStoryLineAudio(): void {
  // A clip the browser held back for a tap plays now: resuming is a tap.
  if (hasPendingStoryAudio()) {
    unlockStoryAudio();
    return;
  }
  if (!pausedMidClip) return;
  pausedMidClip = false;
  if (!currentAudio || !currentClip || currentAudio.ended) return;

  // Pressing Resume is a gesture, so the browser lets the clip play on.
  startPlayback(currentAudio, currentClip);
}
