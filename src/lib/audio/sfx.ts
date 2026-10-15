import { getAudioVolume } from "./volume";

export type SfxPreference = "on" | "off";

export type AnswerSfxKind = "correct" | "almost" | "incorrect";

export const SFX_STORAGE_KEY = "slovak.wiki.sfx-preference";
export const SFX_CHANGE_EVENT = "slovak-sfx-change";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

let audioCtx: AudioContext | null = null;

export function isSfxPreference(
  value: string | null | undefined,
): value is SfxPreference {
  return value === "on" || value === "off";
}

export function getStoredSfxPreference(storage?: StorageLike): SfxPreference {
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);

  if (!store) return "on";

  try {
    const stored = store.getItem(SFX_STORAGE_KEY);
    return isSfxPreference(stored) ? stored : "on";
  } catch {
    return "on";
  }
}

export function getInitialSfxPreference(): SfxPreference {
  if (typeof document !== "undefined") {
    const fromDom = document.documentElement.dataset.sfxPreference;
    if (isSfxPreference(fromDom)) return fromDom;
  }

  return getStoredSfxPreference();
}

export function setSfxPreference(preference: SfxPreference, storage?: StorageLike): void {
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);

  if (!store) return;

  try {
    store.setItem(SFX_STORAGE_KEY, preference);
  } catch {
    // Ignore quota / private-mode failures.
  }

  if (typeof document !== "undefined") {
    document.documentElement.dataset.sfxPreference = preference;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SFX_CHANGE_EVENT));
  }
}

export function toggleSfxPreference(preference: SfxPreference): SfxPreference {
  return preference === "on" ? "off" : "on";
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!Ctx) return null;

  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new Ctx();
  }

  return audioCtx;
}

async function ensureRunning(ctx: AudioContext): Promise<boolean> {
  try {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
    return ctx.state === "running";
  } catch {
    return false;
  }
}

export type SfxKind = AnswerSfxKind | "finish";

interface Strike {
  frequency: number;
  /** Seconds after the cue starts. */
  at: number;
  gain: number;
  /** Seconds until the strike has faded out. */
  decay: number;
}

interface Cue {
  /** Lowpass cutoff in Hz — lower reads softer and more muted. */
  brightness: number;
  strikes: Strike[];
}

// Every strike lands within ~250 ms: LessonInteraction starts the spoken
// answer at 250 ms, so later onsets would collide with the voice.
const CUES: Record<SfxKind, Cue> = {
  correct: {
    brightness: 4200,
    strikes: [
      { frequency: 783.99, at: 0, gain: 0.067, decay: 0.35 },
      { frequency: 1046.5, at: 0.085, gain: 0.076, decay: 0.6 },
    ],
  },
  almost: {
    brightness: 3200,
    strikes: [
      { frequency: 659.25, at: 0, gain: 0.055, decay: 0.3 },
      { frequency: 739.99, at: 0.09, gain: 0.05, decay: 0.45 },
    ],
  },
  incorrect: {
    brightness: 1800,
    strikes: [
      { frequency: 440, at: 0, gain: 0.055, decay: 0.3 },
      { frequency: 349.23, at: 0.1, gain: 0.05, decay: 0.5 },
    ],
  },
  finish: {
    brightness: 4200,
    strikes: [
      { frequency: 523.25, at: 0, gain: 0.05, decay: 0.35 },
      { frequency: 659.25, at: 0.08, gain: 0.055, decay: 0.35 },
      { frequency: 783.99, at: 0.16, gain: 0.059, decay: 0.4 },
      { frequency: 1046.5, at: 0.24, gain: 0.071, decay: 0.9 },
    ],
  },
};

// Harmonic overtones that die faster than the fundamental give a soft
// mallet (marimba / kalimba) attack instead of a bare sine beep.
const PARTIALS = [
  { ratio: 1, level: 1, decay: 1 },
  { ratio: 2, level: 0.18, decay: 0.5 },
  { ratio: 4, level: 0.05, decay: 0.2 },
];

const REVERB_SECONDS = 0.7;
const REVERB_WET = 0.16;

const buses = new WeakMap<BaseAudioContext, AudioNode>();

function roomImpulse(ctx: BaseAudioContext): AudioBuffer {
  const length = Math.round(ctx.sampleRate * REVERB_SECONDS);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 4);
    }
  }

  return impulse;
}

function getBus(ctx: BaseAudioContext): AudioNode {
  const existing = buses.get(ctx);
  if (existing) return existing;

  const input = ctx.createGain();
  const reverb = ctx.createConvolver();
  const wet = ctx.createGain();

  reverb.buffer = roomImpulse(ctx);
  wet.gain.value = REVERB_WET;

  input.connect(ctx.destination);
  input.connect(reverb);
  reverb.connect(wet);
  wet.connect(ctx.destination);

  buses.set(ctx, input);
  return input;
}

function strike(
  ctx: BaseAudioContext,
  output: AudioNode,
  { frequency, gain, decay }: Strike,
  start: number,
  volume: number,
): void {
  for (const partial of PARTIALS) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const end = start + decay * partial.decay;

    osc.frequency.setValueAtTime(frequency * partial.ratio, start);

    amp.gain.setValueAtTime(0, start);
    amp.gain.linearRampToValueAtTime(gain * partial.level * volume, start + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(amp);
    amp.connect(output);

    osc.start(start);
    osc.stop(end + 0.02);
  }
}

/** Schedules a cue on any context — the live one, or an OfflineAudioContext. */
export function scheduleSfx(
  ctx: BaseAudioContext,
  kind: SfxKind,
  start = ctx.currentTime,
  volume = getAudioVolume(),
): void {
  if (volume <= 0) return;

  const cue = CUES[kind];
  const filter = ctx.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.value = cue.brightness;
  filter.Q.value = 0.5;
  filter.connect(getBus(ctx));

  for (const note of cue.strikes) {
    strike(ctx, filter, note, start + note.at, volume);
  }
}

function sfxEnabled(): boolean {
  return getStoredSfxPreference() === "on";
}

async function withContext(
  play: (ctx: AudioContext, now: number) => void,
): Promise<void> {
  if (!sfxEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (!(await ensureRunning(ctx))) return;

  play(ctx, ctx.currentTime);
}

export function playCorrectSfx(): void {
  void withContext((ctx, now) => scheduleSfx(ctx, "correct", now));
}

export function playAlmostSfx(): void {
  void withContext((ctx, now) => scheduleSfx(ctx, "almost", now));
}

export function playIncorrectSfx(): void {
  void withContext((ctx, now) => scheduleSfx(ctx, "incorrect", now));
}

export function playFinishSfx(): void {
  void withContext((ctx, now) => scheduleSfx(ctx, "finish", now));
}

export function playAnswerSfx(kind: AnswerSfxKind): void {
  if (kind === "correct") {
    playCorrectSfx();
    return;
  }

  if (kind === "almost") {
    playAlmostSfx();
    return;
  }

  playIncorrectSfx();
}
