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

import { AUDIO_VOLUME_CHANGE_EVENT, applyAudioVolume } from "$lib/audio/volume";
import { SFX_CHANGE_EVENT, getStoredSfxPreference } from "$lib/audio/sfx";

let currentAudio: HTMLAudioElement | undefined;
let storyAudio: HTMLAudioElement | undefined;
let storyAudioUnlocked = false;
let playGeneration = 0;
let dwellTimer = 0;
let muteListenerAttached = false;
let pending:
  | {
      generation: number;
      onEnded?: () => void;
      rate: number;
      silentMs?: number;
      src: string;
      startedAt: number;
    }
  | undefined;

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
    if (audioMuted()) stopAll();
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
  if (!dwellTimer) return;
  window.clearTimeout(dwellTimer);
  dwellTimer = 0;
}

function stopAll(): void {
  playGeneration += 1;
  clearDwell();
  pending = undefined;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = undefined;
  }
}

function scheduleEnded(
  generation: number,
  startedAt: number,
  onEnded?: () => void,
  silentMs = 0,
): void {
  if (!onEnded) return;

  clearDwell();
  const dwell = Math.max(MIN_STORY_DWELL_MS, silentMs);
  const wait = Math.max(0, dwell - (Date.now() - startedAt));
  dwellTimer = window.setTimeout(() => {
    dwellTimer = 0;
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
  audio.src = src;
  audio.playbackRate = rate;
  applyAudioVolume(audio);
  currentAudio = audio;
  attachPlayback(audio, generation, startedAt, onEnded, silentMs);

  void audio.play().then(
    () => {
      storyAudioUnlocked = true;
      pending = undefined;
    },
    (reason: unknown) => {
      if (generation !== playGeneration) return;

      const kind = classifyPlayFailure(reason);
      if (kind === "autoplay") {
        pending = { generation, onEnded, rate, silentMs, src, startedAt };
        return;
      }

      if (kind === "abort") return;

      scheduleEnded(generation, startedAt, onEnded, silentMs);
    },
  );
}

/** True when a clip is waiting for a user gesture after autoplay was blocked. */
export function hasPendingStoryAudio(): boolean {
  return Boolean(pending && pending.generation === playGeneration);
}

export function isStoryLineAudioActive(): boolean {
  if (dwellTimer || hasPendingStoryAudio()) return true;
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
  if (!pending || audioMuted()) return;

  const { generation, onEnded, rate, silentMs, src, startedAt } = pending;
  if (generation !== playGeneration) {
    pending = undefined;
    return;
  }

  clearDwell();
  pending = undefined;

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
  const startedAt = Date.now();

  if (!src || audioMuted()) {
    scheduleEnded(generation, startedAt, onEnded, silentMs);
    return;
  }

  tryPlay(src, generation, startedAt, onEnded, playbackRate, silentMs);
}

export function stopStoryLineAudio(): void {
  stopAll();
}
